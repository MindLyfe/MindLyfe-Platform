import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User, UserStatus } from '../entities/user.entity';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto, VerifyEmailDto, ChangePasswordDto } from './dto/auth.dto';
import { EmailService } from '../shared/services/email.service';
import { SessionService } from './session/session.service';
import { EventService, EventType } from '../shared/events/event.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/user.service';
import { RedisService } from '../shared/services/redis.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface AuthMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) {}

  // Generate access token for a user
  private generateAccessToken(user: { id: string; email: string; role: string }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });
  }

  // User registration
  async register(registerDto: RegisterDto, metadata?: AuthMetadata) {
    const { email } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Registration attempt with existing email: ${email}`);
      throw new ConflictException('User with this email already exists');
    }

    // Create verification token
    const verificationToken = uuidv4();

    // Create new user
    const user = await this.userService.createUser({
      ...registerDto,
      verificationToken,
      status: UserStatus.PENDING,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken);
      this.logger.log(`Verification email sent to ${user.email}`);
      
      // Emit event
      this.eventService.emit(
        EventType.USER_CREATED,
        { userId: user.id, email: user.email },
        { 
          userId: user.id,
          metadata
        }
      );
      
      // Also emit email event
      this.eventService.emit(
        EventType.EMAIL_VERIFICATION_SENT,
        { userId: user.id, email: user.email },
        { 
          userId: user.id,
          metadata
        }
      );
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${user.email}`, error);
      // Don't throw error to client, but log it
    }

    // After user is created successfully, send welcome notification
    await this.sendWelcomeNotification(user);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  // Email verification
  async verifyEmail(verifyEmailDto: VerifyEmailDto, metadata?: AuthMetadata) {
    const user = await this.userService.findByResetToken(verifyEmailDto.token);

    if (!user) {
      this.logger.warn(`Invalid verification token: ${verifyEmailDto.token}`);
      throw new NotFoundException('Invalid verification token');
    }

    // In a real implementation, update user status in database
    // Here we'll just log it
    this.logger.log(`User ${user.id} email verified`);
    
    // Emit event
    this.eventService.emit(
      EventType.EMAIL_VERIFICATION_COMPLETED,
      { userId: user.id },
      { 
        userId: user.id,
        metadata
      }
    );

    return {
      message: 'Email verification successful. You can now log in.',
    };
  }

  // User login
  async login(loginDto: LoginDto, metadata?: AuthMetadata) {
    const { email, password } = loginDto;
    
    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login attempt with non-existent email: ${email}`);
      this.eventService.emit(
        EventType.AUTH_LOGIN_FAILED,
        { email: email, reason: 'User not found' },
        { metadata }
      );
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for user: ${user.id}`);
      this.eventService.emit(
        EventType.AUTH_LOGIN_FAILED,
        { userId: user.id, email: user.email, reason: 'Invalid password' },
        { 
          userId: user.id,
          metadata
        }
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      this.logger.warn(`Login attempt with unverified email: ${user.email}`);
      throw new UnauthorizedException('Email not verified. Please check your email for verification instructions.');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`Login attempt with inactive account: ${user.id}`);
      throw new UnauthorizedException('Account is not active');
    }

    // If MFA is enabled, return MFA required response
    if (user.twoFactorEnabled) {
      this.logger.debug(`MFA required for user: ${user.id}`);
      
      return {
        message: 'MFA verification required',
        requiresMfa: true,
        userId: user.id,
        tempToken: this.jwtService.sign(
          { sub: user.id, mfa: 'required' },
          { expiresIn: '5m' }
        ),
      };
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Calculate expiry time for refresh token
    const refreshExpiresInMs = this.parseTimeToMs(this.configService.get('jwt.refreshExpiresIn', '7d'));
    const expiresAt = new Date(Date.now() + refreshExpiresInMs);
    
    // Create a session record
    const session = await this.sessionService.createSession(
      user.id,
      refreshToken,
      metadata?.ipAddress,
      metadata?.userAgent,
      metadata?.deviceInfo
    );
    
    // Update user's last login
    await this.userService.updateLastLogin(user.id);
    
    // Emit login success event
    this.eventService.emit(
      EventType.AUTH_LOGIN_SUCCESS,
      { userId: user.id, sessionId: session.id },
      { 
        userId: user.id,
        metadata
      }
    );

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }

  // Refresh token
  async refreshToken(refreshTokenDto: RefreshTokenDto, metadata?: AuthMetadata) {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret', 'mindlyf-refresh-secret'),
      });
      
      // Get user
      const user = await this.userService.findById(decoded.sub);
      
      // Generate new access token
      const accessToken = this.generateAccessToken(user);
      
      // Calculate expiry time for new refresh token
      const refreshExpiresInMs = this.parseTimeToMs(this.configService.get('jwt.refreshExpiresIn', '7d'));
      const expiresAt = new Date(Date.now() + refreshExpiresInMs);
      
      // Create new session with new token
      const session = await this.sessionService.createSession(
        user.id,
        refreshTokenDto.refreshToken,
        metadata?.ipAddress,
        metadata?.userAgent,
        metadata?.deviceInfo
      );
      
      // Emit token refreshed event
      this.eventService.emit(
        EventType.TOKEN_REFRESHED,
        { 
          userId: user.id, 
          oldSessionId: session.id,
          newSessionId: session.id
        },
        { 
          userId: user.id,
          metadata
        }
      );

      return {
        accessToken,
        refreshToken: refreshTokenDto.refreshToken,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.warn('Token refresh failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Change password
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto, metadata?: AuthMetadata) {
    // Check if passwords match
    if (changePasswordDto.newPassword !== changePasswordDto.newPasswordConfirmation) {
      throw new BadRequestException('New passwords do not match');
    }

    // Find user with password for validation
    const user = await this.userService.findByIdInternal(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password || '');
    if (!isPasswordValid) {
      this.logger.warn(`Invalid current password attempt for user: ${userId}`);
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    await this.userService.updatePassword(userId, changePasswordDto.newPassword);
    
    // Revoke all sessions for security
    await this.sessionService.revokeAllUserSessions(
      userId,
      'Password changed'
    );
    
    // Emit password changed event
    this.eventService.emit(
      EventType.AUTH_PASSWORD_CHANGED,
      { userId },
      { 
        userId,
        metadata
      }
    );

    return {
      message: 'Password changed successfully. Please log in again with your new password.',
    };
  }

  // Forgot password (request reset)
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto, metadata?: AuthMetadata) {
    const { email } = forgotPasswordDto;
    
    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal user existence but log the attempt
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return { message: 'If your email is registered, you will receive password reset instructions.' };
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24 hours
    
    // Update user with reset token
    await this.userService.updateResetToken(user.id, resetToken, expiresAt);
    
    // In a real app, send password reset email
    this.logger.log(`Password reset email would be sent to ${email} with token ${resetToken}`);
    
    return { message: 'If your email is registered, you will receive password reset instructions.' };
  }

  // Reset password
  async resetPassword(resetPasswordDto: ResetPasswordDto, metadata?: AuthMetadata) {
    const { token, password } = resetPasswordDto;
    
    // Find user by reset token
    const user = await this.userService.findByResetToken(token);
    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }
    
    // Check if token is expired
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }
    
    // Update password and clear reset token
    await this.userService.updatePassword(user.id, password);
    
    return { message: 'Password has been reset successfully. You can now log in with your new password.' };
  }

  // Logout
  async logout(userId: string, sessionId?: string, metadata?: AuthMetadata) {
    // Find user
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (sessionId) {
      // Revoke specific session
      await this.sessionService.revokeSession(sessionId, 'User logout');
    } else {
      // Revoke all sessions
      await this.sessionService.revokeAllUserSessions(userId, 'User logout');
    }
    
    // Emit logout event
    this.eventService.emit(
      EventType.AUTH_LOGOUT,
      { userId, sessionId },
      { 
        userId,
        metadata
      }
    );

    return {
      message: 'Logged out successfully',
    };
  }

  // Validate user for JWT strategy
  async validateUserById(userId: string): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }
    return user;
  }
  
  // Helper to parse time strings like '7d' to milliseconds
  private parseTimeToMs(timeString: string): number {
    const unit = timeString.charAt(timeString.length - 1);
    const value = parseInt(timeString.substring(0, timeString.length - 1), 10);
    
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000; // Default to 7 days if parsing fails
    }
  }

  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret', 'mindlyf-refresh-secret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
    });
  }

  async validateServiceToken(
    serviceName: string,
    token: string,
    requestingService: string,
  ): Promise<boolean> {
    // Get the expected service token from configuration
    const expectedToken = this.configService.get<string>(`services.${serviceName}.token`);
    
    if (!expectedToken || token !== expectedToken) {
      return false;
    }

    // Log service-to-service communication
    this.logger.debug(
      `Service token validation: ${requestingService} validating token for ${serviceName}`,
    );

    return true;
  }

  async revokeToken(token: string): Promise<void> {
    try {
      // Verify the token to get its payload
      const payload = this.jwtService.verify(token);
      
      // Add token to blacklist with expiration matching token's expiration
      const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await this.redisService.set(
          `blacklist:${token}`,
          'revoked',
          expiresIn,
        );
      }

      // If it's a refresh token, also invalidate the session
      if (payload.type === 'refresh') {
        await this.sessionService.invalidateSession(payload.sessionId);
      }

      this.logger.debug(`Token revoked: ${token.substring(0, 10)}...`);
    } catch (error) {
      this.logger.error(`Error revoking token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
    return !!isBlacklisted;
  }

  /**
   * Send welcome notification to newly registered user
   */
  async sendWelcomeNotification(user: { id: string; email: string; firstName: string; lastName: string }): Promise<void> {
    try {
      // Get notification service URL from config
      const notificationServiceUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL');
      
      if (!notificationServiceUrl) {
        this.logger.warn('Notification service URL not configured, skipping welcome notification');
        return;
      }
      
      // Get service token for auth between services
      const serviceToken = await this.generateServiceToken();
      
      // Send notification request
      await firstValueFrom(
        this.httpService.post(
          `${notificationServiceUrl}/api/notification`,
          {
            userId: user.id,
            type: 'ACCOUNT',
            title: 'Welcome to MindLyf',
            message: `Welcome to MindLyf, ${user.firstName}! We're excited to have you join our community.`,
            metadata: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              loginUrl: this.configService.get<string>('FRONTEND_URL'),
              year: new Date().getFullYear(),
              unsubscribeUrl: `${this.configService.get<string>('FRONTEND_URL')}/unsubscribe`,
              privacyUrl: `${this.configService.get<string>('FRONTEND_URL')}/privacy`,
              termsUrl: `${this.configService.get<string>('FRONTEND_URL')}/terms`,
            },
            channels: ['EMAIL', 'IN_APP'],
          },
          {
            headers: {
              Authorization: `Bearer ${serviceToken}`,
            },
          }
        )
      );
      
      this.logger.log(`Welcome notification sent to user: ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome notification: ${error.message}`, error.stack);
      // Don't throw, we don't want to fail registration if notification fails
    }
  }

  /**
   * Generate a service-to-service token for authentication between microservices
   */
  async generateServiceToken(): Promise<string> {
    // Implementation would depend on how service-to-service auth is handled
    // This is just a placeholder implementation
    const payload = {
      service: 'auth-service',
      sub: 'system',
      role: 'service',
    };
    
    // Use a service-specific secret and shorter expiration for service tokens
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SERVICE_SECRET'),
      expiresIn: '5m',
    });
  }
}
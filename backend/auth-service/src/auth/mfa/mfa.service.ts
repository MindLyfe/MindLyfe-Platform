import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../../entities/user.entity';
import { SessionService } from '../session/session.service';
import { EventService, EventType } from '../../shared/events/event.service';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly eventService: EventService,
  ) {}

  // Generate a new MFA secret for a user
  async generateMfaSecret(userId: string, metadata?: { ipAddress?: string; userAgent?: string }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('mfa.issuer', 'MindLyf')}:${user.email}`,
      issuer: this.configService.get('mfa.issuer', 'MindLyf'),
    });

    // Save the secret to the user record
    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);
    
    this.logger.log(`Generated MFA secret for user: ${userId}`);

    // Generate QR code
    const otpAuthUrl = secret.otpauth_url;
    const qrCode = await QRCode.toDataURL(otpAuthUrl);
    
    // Event emission
    this.eventService.emit(
      EventType.MFA_ENABLED,
      { userId, step: 'secret_generated' },
      { 
        userId,
        metadata
      }
    );

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  // Verify MFA code and enable MFA for user
  async verifyAndEnableMfa(userId: string, token: string, metadata?: { ipAddress?: string; userAgent?: string }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorSecret) {
      this.logger.warn(`MFA verification attempted without generated secret: ${userId}`);
      throw new BadRequestException('MFA secret not generated');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: this.configService.get('mfa.window', 1),
    });

    if (!verified) {
      this.logger.warn(`Failed MFA verification for user: ${userId}`);
      
      this.eventService.emit(
        EventType.MFA_VERIFICATION_FAILED,
        { userId, attemptType: 'enable_mfa' },
        { 
          userId,
          metadata
        }
      );
      
      throw new UnauthorizedException('Invalid MFA token');
    }

    // Enable MFA
    user.twoFactorEnabled = true;
    await this.userRepository.save(user);
    
    this.logger.log(`MFA enabled for user: ${userId}`);
    
    // Revoke all sessions for security
    await this.sessionService.revokeAllUserSessions(
      userId,
      'MFA enabled'
    );
    
    // Event emission
    this.eventService.emit(
      EventType.MFA_ENABLED,
      { userId, step: 'completed' },
      { 
        userId,
        metadata
      }
    );

    return {
      message: 'Two-factor authentication has been enabled. Please log in again.',
    };
  }

  // Disable MFA for user (requires password confirmation)
  async disableMfa(userId: string, password: string, metadata?: { ipAddress?: string; userAgent?: string }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for MFA disable: ${userId}`);
      throw new UnauthorizedException('Invalid password');
    }

    // Disable MFA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.userRepository.save(user);
    
    this.logger.log(`MFA disabled for user: ${userId}`);
    
    // Revoke all sessions for security
    await this.sessionService.revokeAllUserSessions(
      userId,
      'MFA disabled'
    );
    
    // Event emission
    this.eventService.emit(
      EventType.MFA_DISABLED,
      { userId },
      { 
        userId,
        metadata
      }
    );

    return {
      message: 'Two-factor authentication has been disabled. Please log in again.',
    };
  }

  // Verify MFA token for login
  async verifyMfaToken(userId: string, token: string, metadata?: { ipAddress?: string; userAgent?: string; deviceInfo?: string }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      this.logger.warn(`MFA verification attempted for user without MFA: ${userId}`);
      throw new BadRequestException('MFA is not enabled for this user');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: this.configService.get('mfa.window', 1),
    });

    if (!verified) {
      this.logger.warn(`Failed MFA login verification for user: ${userId}`);
      
      this.eventService.emit(
        EventType.MFA_VERIFICATION_FAILED,
        { userId, attemptType: 'login' },
        { 
          userId,
          metadata
        }
      );
      
      throw new UnauthorizedException('Invalid MFA token');
    }

    // Generate access token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    // Calculate expiry time for refresh token
    const refreshExpiresInMs = this.parseTimeToMs(this.configService.get('jwt.refreshExpiresIn', '7d'));
    const expiresAt = new Date(Date.now() + refreshExpiresInMs);
    
    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: this.configService.get('jwt.refreshExpiresIn') },
    );
    
    // Create a session record
    const session = await this.sessionService.createSession(
      user.id,
      refreshToken,
      metadata?.ipAddress,
      metadata?.userAgent,
      metadata?.deviceInfo
    );

    // Update user's last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);
    
    this.logger.log(`Successful MFA verification for user: ${userId}`);
    
    // Event emission
    this.eventService.emit(
      EventType.MFA_VERIFICATION_SUCCESS,
      { userId, sessionId: session.id },
      { 
        userId,
        metadata
      }
    );
    
    // Also emit login success event
    this.eventService.emit(
      EventType.AUTH_LOGIN_SUCCESS,
      { userId, sessionId: session.id, withMfa: true },
      { 
        userId,
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

  async generateTotpSecret(email: string): Promise<{ secret: string; otpauthUrl: string }> {
    // In a real app, use a proper TOTP library
    const secret = 'ABCDEFGHIJKLMNOP'; // Just a mock value
    const otpauthUrl = `otpauth://totp/MindLyf:${email}?secret=${secret}&issuer=MindLyf`;
    
    this.logger.debug(`Generated TOTP secret for ${email}`);
    
    return { secret, otpauthUrl };
  }

  async verifyTotpToken(userSecret: string, token: string): Promise<boolean> {
    // Simplified mock implementation
    // In development mode, we'll accept 123456 as a valid token
    const isDev = this.configService.get('environment') === 'development';
    
    if (isDev && token === '123456') {
      this.logger.debug('Development mode: Accepting mock token 123456');
      return true;
    }
    
    // In a real app, verify the token against the user's secret
    this.logger.debug('Verifying TOTP token');
    
    return false;
  }
}
import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User, UserStatus } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Generate authentication tokens (access + refresh)
  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: this.configService.get('jwt.refreshExpiresIn') },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // User registration
  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Create new user
    const user = this.userRepository.create({
      ...registerDto,
      verificationToken,
      status: UserStatus.PENDING,
    });

    await this.userRepository.save(user);

    // TODO: Send verification email
    // this.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  // Email verification
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { verificationToken: verifyEmailDto.token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    // Update user
    user.verificationToken = null;
    user.emailVerified = true;
    user.status = UserStatus.ACTIVE;

    await this.userRepository.save(user);

    return {
      message: 'Email verification successful. You can now log in.',
    };
  }

  // User login
  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified. Please check your email for verification instructions.');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token to database
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      ...tokens,
    };
  }

  // Refresh token
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      
      // Check if user exists and token matches
      const user = await this.userRepository.findOne({
        where: { 
          id: payload.sub,
          refreshToken: refreshTokenDto.refreshToken,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in database
      user.refreshToken = tokens.refreshToken;
      await this.userRepository.save(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Change password
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Check if passwords match
    if (changePasswordDto.newPassword !== changePasswordDto.newPasswordConfirmation) {
      throw new BadRequestException('New passwords do not match');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(changePasswordDto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  // Forgot password (request reset)
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal that user doesn't exist for security reasons
      return {
        message: 'If your email is in our system, you will receive a password reset link shortly',
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 24); // Token valid for 24 hours

    // Save token and expiry
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await this.userRepository.save(user);

    // TODO: Send password reset email
    // this.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'If your email is in our system, you will receive a password reset link shortly',
    };
  }

  // Reset password
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Check if passwords match
    if (resetPasswordDto.password !== resetPasswordDto.passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user with valid token
    const user = await this.userRepository.findOne({
      where: { 
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Update password and clear token
    user.password = resetPasswordDto.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);

    return {
      message: 'Password has been reset successfully',
    };
  }

  // Logout
  async logout(userId: string) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Clear refresh token
    user.refreshToken = null;
    await this.userRepository.save(user);

    return {
      message: 'Logged out successfully',
    };
  }

  // Validate user for JWT strategy
  async validateUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, status: UserStatus.ACTIVE },
    });

    if (!user) {
      return null;
    }

    const { password, refreshToken, ...result } = user;
    return result;
  }
} 
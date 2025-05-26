import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isDev: boolean;
  private readonly frontendUrl: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.isDev = configService.get('environment') === 'development';
    this.frontendUrl = configService.get('frontend.url');
    this.fromEmail = configService.get('email.from');
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    
    if (this.isDev) {
      this.logger.debug(`[DEV MODE] Sending verification email to ${email}`);
      this.logger.debug(`Verification URL: ${verificationUrl}`);
      return;
    }
    
    // In production, integrate with actual email provider
    this.logger.log(`Sending verification email to ${email}`);
    // Implementation would go here
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    
    if (this.isDev) {
      this.logger.debug(`[DEV MODE] Sending password reset email to ${email}`);
      this.logger.debug(`Reset URL: ${resetUrl}`);
      return;
    }
    
    // In production, integrate with actual email provider
    this.logger.log(`Sending password reset email to ${email}`);
    // Implementation would go here
  }

  async sendLoginNotificationEmail(email: string, ipAddress: string, userAgent: string): Promise<void> {
    if (this.isDev) {
      this.logger.debug(`[DEV MODE] Sending login notification to ${email}`);
      this.logger.debug(`Login details: IP=${ipAddress}, UA=${userAgent}`);
      return;
    }
    
    // In production, integrate with actual email provider
    this.logger.log(`Sending login notification to ${email}`);
    // Implementation would go here
  }
} 
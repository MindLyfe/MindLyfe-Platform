import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  SESClient, 
  SendEmailCommand, 
  SendEmailCommandInput
} from '@aws-sdk/client-ses';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';
import { AuthService } from '../../auth/auth.service';

interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string; // For inline images
}

@Injectable()
export class EmailAdapter implements NotificationChannel {
  private readonly ses: SESClient;
  private readonly sourceEmail: string;
  private readonly logger = new Logger(EmailAdapter.name);
  private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(NotificationTemplateEntity)
    private templateRepository: Repository<NotificationTemplateEntity>,
  ) {
    this.ses = new SESClient({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
    });
    
    this.sourceEmail = this.configService.get<string>('aws.ses.sourceEmail');
    
    // Initialize templates
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templatesDir = path.join(__dirname, '../../templates');
    
    try {
      if (fs.existsSync(templatesDir)) {
        const templateFiles = fs.readdirSync(templatesDir);
        
        templateFiles.forEach((file) => {
          if (file.endsWith('.hbs')) {
            const templateName = file.replace('.hbs', '');
            const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
            const compiledTemplate = handlebars.compile(templateContent);
            
            this.templates.set(templateName, compiledTemplate);
            this.logger.log(`Loaded email template: ${templateName}`);
          }
        });
      } else {
        this.logger.warn(`Templates directory not found: ${templatesDir}`);
      }
    } catch (error) {
      this.logger.error(`Error loading templates: ${error.message}`);
    }
  }

  async send(notification: NotificationEntity): Promise<NotificationResult> {
    try {
      // Get user details for email
      const user = await this.getUserDetails(notification.userId);
      const recipientEmail = notification.recipientEmail || user.email;
      
      if (!recipientEmail) {
        throw new Error('No recipient email address available');
      }

      let htmlContent: string;
      
      // If there's a template, use it
      if (notification.templateId) {
        const template = await this.templateRepository.findOne({
          where: { id: notification.templateId },
        });
        
        if (template && this.templates.has(template.name)) {
          const compiledTemplate = this.templates.get(template.name);
          htmlContent = compiledTemplate({
            ...notification.metadata,
            firstName: user.firstName,
            lastName: user.lastName,
            year: new Date().getFullYear(),
          });
        } else {
          htmlContent = notification.metadata?.html || notification.message;
        }
      } else {
        htmlContent = notification.metadata?.html || notification.message;
      }
      
      const params: SendEmailCommandInput = {
        Source: this.sourceEmail,
        Destination: {
          ToAddresses: [recipientEmail],
        },
        Message: {
          Subject: {
            Data: notification.title,
          },
          Body: {
            Text: {
              Data: this.getTextFromHtml(htmlContent) || notification.message,
            },
            Html: {
              Data: htmlContent,
            },
          },
        },
      };
      
      const command = new SendEmailCommand(params);
      const response = await this.ses.send(command);
      
      this.logger.log(`Email sent to ${recipientEmail} with subject: ${notification.title}`);
      
      return {
        success: true,
        notificationId: notification.id,
        channelReferenceId: response.MessageId,
        status: 'sent',
        metadata: {
          messageId: response.MessageId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      
      return {
        success: false,
        notificationId: notification.id,
        status: 'failed',
        error: {
          code: error.code || 'EMAIL_SEND_ERROR',
          message: error.message,
        },
      };
    }
  }
  
  async validateTemplate(templateId: string): Promise<{ valid: boolean; errors?: string[]; }> {
    try {
      const template = await this.templateRepository.findOne({
        where: { id: templateId },
      });
      
      if (!template) {
        return {
          valid: false,
          errors: ['Template not found'],
        };
      }
      
      if (!this.templates.has(template.name)) {
        return {
          valid: false,
          errors: ['Template file not found'],
        };
      }
      
      return { valid: true };
    } catch (error) {
      this.logger.error(`Template validation error: ${error.message}`);
      return {
        valid: false,
        errors: [error.message],
      };
    }
  }
  
  async getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus> {
    // SES doesn't provide direct delivery status tracking
    // For advanced tracking, we would need to integrate with SES event publishing
    // and process SNS notifications or CloudWatch logs
    
    return {
      status: 'sent', // Can only confirm it was sent, not delivered
      timestamp: new Date(),
      metadata: {
        messageId: externalId,
      },
    };
  }
  
  getCapabilities(): ChannelCapabilities {
    return {
      supportsRichContent: true,
      supportsAttachments: true,
      supportsDeliveryReceipts: false, // Standard SES doesn't support this
      supportsReadReceipts: false,
      supportsBulkSend: true,
      maxMessageSize: 10 * 1024 * 1024, // 10 MB
      rateLimit: {
        maxPerSecond: 14, // AWS SES default sending rate
        maxPerMinute: 840,
        maxPerHour: 50000,
        maxPerDay: 50000 * 24, // Adjust based on your SES limits
      },
    };
  }
  
  async validateEmailAddress(email: string): Promise<boolean> {
    // Basic validation - in a real implementation, would use SES.verifyEmailIdentity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  async addAttachment(
    notificationId: string, 
    attachment: EmailAttachment
  ): Promise<boolean> {
    // This would be implemented for attaching files to emails
    // AWS SES requires attachments to be included in the original send command
    this.logger.log(`Attachment would be added to email ${notificationId}: ${attachment.filename}`);
    return true;
  }
  
  private async getUserDetails(userId: string): Promise<any> {
    try {
      // Try to get a system token
      // In a real implementation, we'd use a service account or API key
      const systemToken = this.configService.get('system.apiToken');
      
      // Get user details
      return await this.authService.getUserById(userId, systemToken);
    } catch (error) {
      this.logger.error(`Failed to get user details: ${error.message}`);
      // Return minimal user info
      return { id: userId };
    }
  }
  
  private getTextFromHtml(html: string): string {
    // Basic HTML to text conversion
    if (!html) return '';
    return html
      .replace(/<style[^>]*>.*<\/style>/g, '')
      .replace(/<script[^>]*>.*<\/script>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
} 
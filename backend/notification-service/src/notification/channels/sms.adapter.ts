import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Twilio } from 'twilio';

import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class SmsAdapter implements NotificationChannel {
  private readonly twilioClient: Twilio;
  private readonly fromPhoneNumber: string;
  private readonly logger = new Logger(SmsAdapter.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(NotificationTemplateEntity)
    private templateRepository: Repository<NotificationTemplateEntity>,
  ) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.fromPhoneNumber = this.configService.get<string>('twilio.phoneNumber');
    
    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not found. SMS functionality will be limited.');
    }
  }

  async send(notification: NotificationEntity): Promise<NotificationResult> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio client not initialized');
      }
      
      // Get user details for phone number
      const user = await this.getUserDetails(notification.userId);
      const phoneNumber = notification.metadata?.phoneNumber || user.phoneNumber;
      
      if (!phoneNumber) {
        throw new Error('No recipient phone number available');
      }

      // Prepare message text
      let messageText = notification.message;
      
      // If there's a template, use it
      if (notification.templateId) {
        const template = await this.templateRepository.findOne({
          where: { id: notification.templateId },
        });
        
        if (template) {
          // In real implementation, we would use the template to format the message
          // For now, we'll just use the raw message
          messageText = this.formatSmsTemplate(
            template.content, 
            {
              ...notification.metadata,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          );
        }
      }
      
      // Ensure message is within SMS length limits
      messageText = this.truncateMessage(messageText);
      
      // Send SMS via Twilio
      const response = await this.twilioClient.messages.create({
        body: messageText,
        from: this.fromPhoneNumber,
        to: phoneNumber,
      });
      
      this.logger.log(`SMS sent to ${phoneNumber} with ID: ${response.sid}`);
      
      return {
        success: true,
        notificationId: notification.id,
        channelReferenceId: response.sid,
        status: 'sent',
        metadata: {
          messageId: response.sid,
          timestamp: new Date().toISOString(),
          segments: this.estimateSegmentCount(messageText),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      
      return {
        success: false,
        notificationId: notification.id,
        status: 'failed',
        error: {
          code: error.code || 'SMS_SEND_ERROR',
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
      
      // Check if the template is valid for SMS (e.g., not too long)
      const errors = [];
      if (template.content.length > 1600) {
        errors.push('Template exceeds maximum SMS length');
      }
      
      return { 
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error(`Template validation error: ${error.message}`);
      return {
        valid: false,
        errors: [error.message],
      };
    }
  }
  
  async getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio client not initialized');
      }
      
      // Fetch message status from Twilio
      const message = await this.twilioClient.messages(externalId).fetch();
      
      // Map Twilio status to our status
      let status: 'sent' | 'delivered' | 'read' | 'clicked' | 'failed';
      switch (message.status) {
        case 'delivered':
          status = 'delivered';
          break;
        case 'sent':
          status = 'sent';
          break;
        case 'failed':
        case 'undelivered':
          status = 'failed';
          break;
        default:
          status = 'sent';
      }
      
      return {
        status,
        timestamp: new Date(),
        metadata: {
          twilioStatus: message.status,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get delivery status: ${error.message}`);
      return {
        status: 'failed',
        timestamp: new Date(),
        error: {
          code: error.code || 'STATUS_FETCH_ERROR',
          message: error.message,
        },
      };
    }
  }
  
  getCapabilities(): ChannelCapabilities {
    return {
      supportsRichContent: false,
      supportsAttachments: false,
      supportsDeliveryReceipts: true,
      supportsReadReceipts: false,
      supportsBulkSend: true,
      maxMessageSize: 1600, // Characters for multi-part SMS
      rateLimit: {
        maxPerSecond: 1,
        maxPerMinute: 60,
        maxPerHour: 3600,
        maxPerDay: 86400, // Adjust based on your Twilio plan
      },
    };
  }
  
  estimateSegmentCount(message: string): number {
    // GSM-7 encoding: 160 chars per segment
    // Unicode: 70 chars per segment
    const hasUnicode = /[^\u0000-\u007F]/.test(message);
    const charsPerSegment = hasUnicode ? 70 : 160;
    
    // Account for character deductions in multi-segment messages
    if (message.length <= charsPerSegment) {
      return 1;
    } else {
      const effectiveCharsPerSegment = hasUnicode ? 67 : 153; // Reduced for multi-part
      return Math.ceil(message.length / effectiveCharsPerSegment);
    }
  }
  
  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        // Basic validation if Twilio is not available
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
      }
      
      // Use Twilio's lookup service for validation
      const lookup = await this.twilioClient.lookups.v1
        .phoneNumbers(phoneNumber)
        .fetch();
      
      return !!lookup.phoneNumber;
    } catch (error) {
      this.logger.error(`Phone validation error: ${error.message}`);
      return false;
    }
  }
  
  private async getUserDetails(userId: string): Promise<any> {
    try {
      // Try to get a system token
      const systemToken = this.configService.get('system.apiToken');
      
      // Get user details
      return await this.authService.getUserById(userId, systemToken);
    } catch (error) {
      this.logger.error(`Failed to get user details: ${error.message}`);
      // Return minimal user info
      return { id: userId };
    }
  }
  
  private formatSmsTemplate(template: string, data: Record<string, any>): string {
    // Simple template substitution
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }
  
  private truncateMessage(message: string): string {
    // Truncate to max SMS length if needed
    const MAX_LENGTH = 1600; // Maximum for multi-part SMS
    if (message.length <= MAX_LENGTH) {
      return message;
    }
    
    return message.substring(0, MAX_LENGTH - 3) + '...';
  }
} 
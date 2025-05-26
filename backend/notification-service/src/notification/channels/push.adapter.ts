import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';

import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';
import { AuthService } from '../../auth/auth.service';

interface DeviceToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  lastUsed: Date;
  active: boolean;
}

@Injectable()
export class PushAdapter implements NotificationChannel {
  private readonly logger = new Logger(PushAdapter.name);
  private initialized = false;
  private readonly deviceTokens: Map<string, DeviceToken[]> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(NotificationTemplateEntity)
    private templateRepository: Repository<NotificationTemplateEntity>,
  ) {
    this.initFirebaseAdmin();
  }

  private initFirebaseAdmin(): void {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        const projectId = this.configService.get<string>('firebase.projectId');
        const privateKey = this.configService.get<string>('firebase.privateKey')?.replace(/\\n/g, '\n');
        const clientEmail = this.configService.get<string>('firebase.clientEmail');
        
        if (!projectId || !privateKey || !clientEmail) {
          this.logger.warn('Firebase credentials not complete. Push notification functionality will be limited.');
          return;
        }
        
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        });
        
        this.initialized = true;
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.initialized = true;
        this.logger.log('Firebase Admin SDK already initialized');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
    }
  }

  async send(notification: NotificationEntity): Promise<NotificationResult> {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }
      
      // Get user device tokens
      const deviceTokens = await this.getDeviceTokensForUser(notification.userId);
      
      if (!deviceTokens || deviceTokens.length === 0) {
        throw new Error('No device tokens available for user');
      }

      // Prepare notification data
      const pushNotification: admin.messaging.MulticastMessage = {
        tokens: deviceTokens.map(dt => dt.token),
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...notification.metadata,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
        webpush: {
          notification: {
            icon: this.configService.get('app.logoUrl'),
          },
          fcmOptions: {
            link: `${this.configService.get('app.url')}/notifications/${notification.id}`,
          },
        },
      };
      
      // Send the push notification
      const response = await admin.messaging().sendMulticast(pushNotification);
      
      this.logger.log(
        `Push notification sent with success count: ${response.successCount}/${deviceTokens.length}`
      );
      
      if (response.failureCount > 0) {
        // Log failures and possibly remove invalid tokens
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`Failed to send to token: ${deviceTokens[idx].token}, error: ${resp.error}`);
            failedTokens.push(deviceTokens[idx].token);
            
            // If token is invalid, remove it
            if (resp.error?.code === 'messaging/invalid-registration-token' ||
                resp.error?.code === 'messaging/registration-token-not-registered') {
              this.deactivateDeviceToken(notification.userId, deviceTokens[idx].token);
            }
          }
        });
      }
      
      return {
        success: response.successCount > 0,
        notificationId: notification.id,
        channelReferenceId: response.responses.find(r => r.success)?.messageId,
        status: response.successCount > 0 ? 'sent' : 'failed',
        metadata: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      
      return {
        success: false,
        notificationId: notification.id,
        status: 'failed',
        error: {
          code: error.code || 'PUSH_SEND_ERROR',
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
      
      // Check if the template is valid for push notifications
      const errors = [];
      if (template.content.length > 4000) {
        errors.push('Template exceeds maximum payload size');
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
    // FCM doesn't provide direct delivery status tracking
    // In a real implementation, we'd need to implement app-side callbacks
    
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
      supportsAttachments: false,
      supportsDeliveryReceipts: false,
      supportsReadReceipts: false,
      supportsBulkSend: true,
      maxMessageSize: 4000, // FCM payload size limit
      rateLimit: {
        maxPerSecond: 1000,
        maxPerMinute: 60000,
        maxPerHour: 600000,
        maxPerDay: 10000000, // Adjust based on your FCM quotas
      },
    };
  }
  
  async registerDevice(
    userId: string, 
    deviceToken: string, 
    platform: 'ios' | 'android' | 'web'
  ): Promise<boolean> {
    try {
      // In a real implementation, we would store this in a database
      // For now, we'll use an in-memory map
      if (!this.deviceTokens.has(userId)) {
        this.deviceTokens.set(userId, []);
      }
      
      const userTokens = this.deviceTokens.get(userId);
      const existingToken = userTokens.find(t => t.token === deviceToken);
      
      if (existingToken) {
        // Update existing token
        existingToken.platform = platform;
        existingToken.lastUsed = new Date();
        existingToken.active = true;
      } else {
        // Add new token
        userTokens.push({
          userId,
          token: deviceToken,
          platform,
          lastUsed: new Date(),
          active: true,
        });
      }
      
      this.logger.log(`Device registered for user ${userId} on ${platform} platform`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to register device: ${error.message}`);
      return false;
    }
  }
  
  async unregisterDevice(deviceToken: string): Promise<boolean> {
    try {
      // Find and deactivate the token
      for (const [userId, tokens] of this.deviceTokens.entries()) {
        const tokenIndex = tokens.findIndex(t => t.token === deviceToken);
        if (tokenIndex >= 0) {
          tokens[tokenIndex].active = false;
          this.logger.log(`Device unregistered: ${deviceToken}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Failed to unregister device: ${error.message}`);
      return false;
    }
  }
  
  async sendToTopic(
    topic: string, 
    notification: Omit<NotificationEntity, 'userId'>
  ): Promise<NotificationResult> {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }
      
      // Prepare message to topic
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...notification.metadata,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };
      
      // Send the message
      const response = await admin.messaging().send(message);
      
      this.logger.log(`Push notification sent to topic ${topic} with ID: ${response}`);
      
      return {
        success: true,
        notificationId: notification.id,
        channelReferenceId: response,
        status: 'sent',
        metadata: {
          topic,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to send topic notification: ${error.message}`);
      
      return {
        success: false,
        notificationId: notification.id,
        status: 'failed',
        error: {
          code: error.code || 'TOPIC_SEND_ERROR',
          message: error.message,
        },
      };
    }
  }
  
  private async getDeviceTokensForUser(userId: string): Promise<DeviceToken[]> {
    // In a real implementation, we would fetch from a database
    // For now, if we don't have tokens yet, create a dummy one for testing
    if (!this.deviceTokens.has(userId)) {
      // This is just for demo purposes - in real implementation we'd return empty array
      this.deviceTokens.set(userId, [{
        userId,
        token: 'dummy-token-for-testing',
        platform: 'android',
        lastUsed: new Date(),
        active: true,
      }]);
    }
    
    return this.deviceTokens.get(userId).filter(t => t.active);
  }
  
  private deactivateDeviceToken(userId: string, token: string): void {
    const userTokens = this.deviceTokens.get(userId);
    if (userTokens) {
      const tokenObj = userTokens.find(t => t.token === token);
      if (tokenObj) {
        tokenObj.active = false;
        this.logger.log(`Deactivated invalid token for user ${userId}`);
      }
    }
  }
  
  private async getUserDetails(userId: string): Promise<any> {
    try {
      const systemToken = this.configService.get('system.apiToken');
      return await this.authService.getUserById(userId, systemToken);
    } catch (error) {
      this.logger.error(`Failed to get user details: ${error.message}`);
      return { id: userId };
    }
  }
} 
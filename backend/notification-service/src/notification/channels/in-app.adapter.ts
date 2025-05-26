import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';

@Injectable()
export class InAppAdapter implements NotificationChannel {
  private readonly logger = new Logger(InAppAdapter.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(NotificationTemplateEntity)
    private templateRepository: Repository<NotificationTemplateEntity>,
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
  ) {}

  async send(notification: NotificationEntity): Promise<NotificationResult> {
    try {
      // For in-app notifications, we're just saving it to the database
      // and potentially emitting a WebSocket event
      
      // Update the notification with in-app specific properties
      notification.status = 'sent';
      notification.sentAt = new Date();
      
      // Save the updated notification
      await this.notificationRepository.save(notification);
      
      // Emit WebSocket event if configured
      await this.emitWebSocketEvent(notification);
      
      this.logger.log(`In-app notification saved for user ${notification.userId}`);
      
      return {
        success: true,
        notificationId: notification.id,
        channelReferenceId: notification.id, // Same as the notification ID for in-app
        status: 'sent',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to save in-app notification: ${error.message}`);
      
      return {
        success: false,
        notificationId: notification.id,
        status: 'failed',
        error: {
          code: error.code || 'IN_APP_SAVE_ERROR',
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
      
      // In-app templates are generally flexible, so minimal validation needed
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
    try {
      // Fetch the notification to check its read status
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });
      
      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }
      
      // Determine status based on read flag
      let status: 'sent' | 'delivered' | 'read' | 'clicked' | 'failed';
      if (notification.isRead) {
        status = 'read';
      } else {
        status = 'delivered'; // For in-app, we consider it delivered once saved
      }
      
      return {
        status,
        timestamp: notification.isRead ? notification.readAt : notification.sentAt,
        metadata: {
          isRead: notification.isRead,
          readAt: notification.readAt,
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
      supportsRichContent: true,
      supportsAttachments: true,
      supportsDeliveryReceipts: true,
      supportsReadReceipts: true,
      supportsBulkSend: true,
      maxMessageSize: 100 * 1024, // 100 KB
      rateLimit: {
        maxPerSecond: 100,
        maxPerMinute: 6000,
        maxPerHour: 360000,
        maxPerDay: 8640000, // Very high limits as it's internal
      },
    };
  }
  
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.notificationRepository.count({
        where: {
          userId,
          isRead: false,
        },
      });
      
      return count;
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      return 0;
    }
  }
  
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await this.notificationRepository.update(
        {
          userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );
      
      this.logger.log(`Marked all notifications as read for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to mark all as read: ${error.message}`);
      return false;
    }
  }
  
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const result = await this.notificationRepository.delete(notificationId);
      
      if (result.affected > 0) {
        this.logger.log(`Deleted notification ${notificationId}`);
        return true;
      } else {
        this.logger.warn(`Notification not found for deletion: ${notificationId}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`);
      return false;
    }
  }
  
  private async emitWebSocketEvent(notification: NotificationEntity): Promise<void> {
    // This would be implemented to emit a WebSocket event
    // In a real implementation, we would integrate with a WebSocket service
    // For now, we'll just log a message
    this.logger.log(`WebSocket event would be emitted for user ${notification.userId}`);
  }
} 
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  channelReferenceId?: string; // External reference ID from the channel provider
  status: 'sent' | 'failed';
  error?: {
    code: string;
    message: string;
  };
  metadata?: Record<string, any>;
}

export interface DeliveryStatus {
  status: 'sent' | 'delivered' | 'read' | 'clicked' | 'failed';
  timestamp: Date;
  error?: {
    code: string;
    message: string;
  };
  metadata?: Record<string, any>;
}

export interface ChannelCapabilities {
  supportsRichContent: boolean;
  supportsAttachments: boolean;
  supportsDeliveryReceipts: boolean;
  supportsReadReceipts: boolean;
  supportsBulkSend: boolean;
  maxMessageSize: number; // In bytes or characters
  rateLimit: {
    maxPerSecond: number;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
}

export interface NotificationChannel {
  // Send a notification through this channel
  send(notification: NotificationEntity): Promise<NotificationResult>;
  
  // Validate a template for this channel
  validateTemplate(templateId: string): Promise<{
    valid: boolean;
    errors?: string[];
  }>;
  
  // Get delivery status from the channel provider
  getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus>;
  
  // Get channel-specific capabilities
  getCapabilities(): ChannelCapabilities;
} 
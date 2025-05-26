import { NotificationEntity } from '../entities/notification.entity';
export interface NotificationResult {
    success: boolean;
    notificationId: string;
    channelReferenceId?: string;
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
    maxMessageSize: number;
    rateLimit: {
        maxPerSecond: number;
        maxPerMinute: number;
        maxPerHour: number;
        maxPerDay: number;
    };
}
export interface NotificationChannel {
    send(notification: NotificationEntity): Promise<NotificationResult>;
    validateTemplate(templateId: string): Promise<{
        valid: boolean;
        errors?: string[];
    }>;
    getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus>;
    getCapabilities(): ChannelCapabilities;
}

import { NotificationTemplateEntity } from './notification-template.entity';
import { NotificationChannelEntity } from './notification-channel.entity';
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed"
}
export declare enum NotificationType {
    ACCOUNT = "account",
    SYSTEM = "system",
    THERAPY = "therapy",
    COMMUNITY = "community",
    CHAT = "chat",
    MARKETING = "marketing"
}
export declare class NotificationEntity {
    id: string;
    userId: string;
    recipientEmail: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata: Record<string, any>;
    status: NotificationStatus;
    errorMessage: string;
    template: NotificationTemplateEntity;
    templateId: string;
    channel: NotificationChannelEntity;
    channelId: string;
    isRead: boolean;
    readAt: Date;
    createdAt: Date;
    updatedAt: Date;
    scheduledAt: Date;
    sentAt: Date;
}

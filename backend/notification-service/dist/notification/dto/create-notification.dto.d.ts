import { NotificationType } from '../entities/notification.entity';
import { ChannelType } from '../entities/notification-channel.entity';
export declare class CreateNotificationDto {
    userId: string;
    recipientEmail?: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    templateId?: string;
    channels?: ChannelType[];
    scheduledAt?: string;
}

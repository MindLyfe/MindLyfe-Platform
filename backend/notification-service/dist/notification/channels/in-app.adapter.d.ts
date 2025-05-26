import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';
export declare class InAppAdapter implements NotificationChannel {
    private readonly configService;
    private templateRepository;
    private notificationRepository;
    private readonly logger;
    constructor(configService: ConfigService, templateRepository: Repository<NotificationTemplateEntity>, notificationRepository: Repository<NotificationEntity>);
    send(notification: NotificationEntity): Promise<NotificationResult>;
    validateTemplate(templateId: string): Promise<{
        valid: boolean;
        errors?: string[];
    }>;
    getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus>;
    getCapabilities(): ChannelCapabilities;
    getUnreadCount(userId: string): Promise<number>;
    markAllAsRead(userId: string): Promise<boolean>;
    deleteNotification(notificationId: string): Promise<boolean>;
    private emitWebSocketEvent;
}

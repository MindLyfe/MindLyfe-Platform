import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';
import { AuthService } from '../../auth/auth.service';
export declare class PushAdapter implements NotificationChannel {
    private readonly configService;
    private readonly authService;
    private templateRepository;
    private readonly logger;
    private initialized;
    private readonly deviceTokens;
    constructor(configService: ConfigService, authService: AuthService, templateRepository: Repository<NotificationTemplateEntity>);
    private initFirebaseAdmin;
    send(notification: NotificationEntity): Promise<NotificationResult>;
    validateTemplate(templateId: string): Promise<{
        valid: boolean;
        errors?: string[];
    }>;
    getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus>;
    getCapabilities(): ChannelCapabilities;
    registerDevice(userId: string, deviceToken: string, platform: 'ios' | 'android' | 'web'): Promise<boolean>;
    unregisterDevice(deviceToken: string): Promise<boolean>;
    sendToTopic(topic: string, notification: Omit<NotificationEntity, 'userId'>): Promise<NotificationResult>;
    private getDeviceTokensForUser;
    private deactivateDeviceToken;
    private getUserDetails;
}

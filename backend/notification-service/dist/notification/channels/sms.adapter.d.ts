import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';
import { AuthService } from '../../auth/auth.service';
export declare class SmsAdapter implements NotificationChannel {
    private readonly configService;
    private readonly authService;
    private templateRepository;
    private readonly twilioClient;
    private readonly fromPhoneNumber;
    private readonly logger;
    constructor(configService: ConfigService, authService: AuthService, templateRepository: Repository<NotificationTemplateEntity>);
    send(notification: NotificationEntity): Promise<NotificationResult>;
    validateTemplate(templateId: string): Promise<{
        valid: boolean;
        errors?: string[];
    }>;
    getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus>;
    getCapabilities(): ChannelCapabilities;
    estimateSegmentCount(message: string): number;
    validatePhoneNumber(phoneNumber: string): Promise<boolean>;
    private getUserDetails;
    private formatSmsTemplate;
    private truncateMessage;
}

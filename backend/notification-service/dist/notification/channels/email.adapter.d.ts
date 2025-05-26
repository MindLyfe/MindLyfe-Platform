import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/notification-template.entity';
import { NotificationChannel, NotificationResult, DeliveryStatus, ChannelCapabilities } from './notification-channel.interface';
import { AuthService } from '../../auth/auth.service';
interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType: string;
    disposition?: 'attachment' | 'inline';
    contentId?: string;
}
export declare class EmailAdapter implements NotificationChannel {
    private readonly configService;
    private readonly authService;
    private templateRepository;
    private readonly ses;
    private readonly sourceEmail;
    private readonly logger;
    private readonly templates;
    constructor(configService: ConfigService, authService: AuthService, templateRepository: Repository<NotificationTemplateEntity>);
    private loadTemplates;
    send(notification: NotificationEntity): Promise<NotificationResult>;
    validateTemplate(templateId: string): Promise<{
        valid: boolean;
        errors?: string[];
    }>;
    getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus>;
    getCapabilities(): ChannelCapabilities;
    validateEmailAddress(email: string): Promise<boolean>;
    addAttachment(notificationId: string, attachment: EmailAttachment): Promise<boolean>;
    private getUserDetails;
    private getTextFromHtml;
}
export {};

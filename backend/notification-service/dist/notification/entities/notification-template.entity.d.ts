import { NotificationEntity } from './notification.entity';
export declare enum TemplateType {
    EMAIL = "email",
    PUSH = "push",
    SMS = "sms",
    IN_APP = "in_app"
}
export declare class NotificationTemplateEntity {
    id: string;
    name: string;
    description: string;
    type: TemplateType;
    subject: string;
    content: string;
    metadata: Record<string, any>;
    awsTemplateId: string;
    notifications: NotificationEntity[];
    createdAt: Date;
    updatedAt: Date;
}

import { NotificationEntity } from './notification.entity';
export declare enum ChannelType {
    EMAIL = "email",
    PUSH = "push",
    SMS = "sms",
    IN_APP = "in_app",
    WEBHOOK = "webhook"
}
export declare class NotificationChannelEntity {
    id: string;
    name: string;
    description: string;
    type: ChannelType;
    isActive: boolean;
    config: Record<string, any>;
    notifications: NotificationEntity[];
    createdAt: Date;
    updatedAt: Date;
}

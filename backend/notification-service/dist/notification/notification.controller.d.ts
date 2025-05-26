import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationEntity, NotificationType } from './entities/notification.entity';
import { JwtUser } from '../auth/interfaces/user.interface';
declare class UpdateUserStatusDto {
    isOnline: boolean;
}
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(createNotificationDto: CreateNotificationDto): Promise<NotificationEntity>;
    findMy(user: JwtUser, page?: number, limit?: number, type?: NotificationType, read?: boolean): Promise<{
        notifications: NotificationEntity[];
        total: number;
    }>;
    findForUser(userId: string, page?: number, limit?: number, type?: NotificationType, read?: boolean): Promise<{
        notifications: NotificationEntity[];
        total: number;
    }>;
    findOne(id: string): Promise<NotificationEntity>;
    markAsRead(id: string, user: JwtUser): Promise<NotificationEntity>;
    remove(id: string, user: JwtUser): Promise<void>;
    sendNotification(id: string): Promise<NotificationEntity>;
    updateUserStatus(user: JwtUser, updateUserStatusDto: UpdateUserStatusDto): Promise<{
        success: boolean;
    }>;
    markAllAsRead(user: JwtUser): Promise<{
        success: boolean;
    }>;
}
export {};

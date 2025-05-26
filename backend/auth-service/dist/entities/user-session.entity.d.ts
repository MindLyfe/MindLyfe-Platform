import { User } from './user.entity';
export declare class UserSession {
    id: string;
    userId: string;
    user: User;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    lastUsedAt: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    revokedReason?: string;
    status: string;
    endedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

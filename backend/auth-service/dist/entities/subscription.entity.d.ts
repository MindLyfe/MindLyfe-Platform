import { User } from './user.entity';
export declare enum SubscriptionType {
    MONTHLY = "monthly",
    ORGANIZATION = "organization",
    CREDIT = "credit"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    PENDING = "pending"
}
export declare class Subscription {
    id: string;
    userId: string;
    user: User;
    type: SubscriptionType;
    status: SubscriptionStatus;
    amount: number;
    sessionsIncluded: number;
    sessionsUsed: number;
    creditsAvailable: number;
    startDate?: Date;
    endDate?: Date;
    lastSessionDate?: Date;
    autoRenew: boolean;
    paymentReference?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    get remainingSessions(): number;
    get totalAvailableSessions(): number;
    get isExpired(): boolean;
    get canBookSession(): boolean;
}

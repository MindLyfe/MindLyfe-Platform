import { User } from './user.entity';
import { Subscription } from './subscription.entity';
import { Organization } from './organization.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    MOBILE_MONEY = "mobile_money",
    BANK_TRANSFER = "bank_transfer",
    CREDIT_CARD = "credit_card",
    CASH = "cash"
}
export declare enum PaymentType {
    SUBSCRIPTION = "subscription",
    CREDIT_PURCHASE = "credit_purchase",
    ORGANIZATION_PAYMENT = "organization_payment",
    SESSION_PAYMENT = "session_payment"
}
export declare class Payment {
    id: string;
    userId: string;
    user: User;
    subscriptionId?: string;
    subscription?: Subscription;
    organizationId?: string;
    organization?: Organization;
    type: PaymentType;
    status: PaymentStatus;
    method: PaymentMethod;
    amount: number;
    currency: string;
    reference: string;
    externalReference?: string;
    phoneNumber?: string;
    description?: string;
    metadata?: any;
    paidAt?: Date;
    expiresAt?: Date;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
    get isCompleted(): boolean;
    get isPending(): boolean;
    get hasFailed(): boolean;
    get isExpired(): boolean;
}

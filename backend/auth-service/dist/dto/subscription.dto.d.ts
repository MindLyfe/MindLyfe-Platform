import { SubscriptionType } from '../entities/subscription.entity';
import { PaymentMethod } from '../entities/payment.entity';
export declare class CreateSubscriptionRequestDto {
    type: SubscriptionType;
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
}
export declare class PurchaseCreditsRequestDto {
    credits: number;
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
}
export declare class SubscriptionStatusResponseDto {
    hasActiveSubscription: boolean;
    totalAvailableSessions: number;
    canBookSession: boolean;
    nextAvailableBookingDate?: Date;
    subscriptions: any[];
}
export declare class SubscriptionPlanResponseDto {
    type: SubscriptionType;
    name: string;
    price: number;
    sessions: number;
    duration: number;
    description: string;
}

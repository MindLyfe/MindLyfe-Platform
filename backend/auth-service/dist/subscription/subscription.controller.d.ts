import { SubscriptionService, CreateSubscriptionDto, PurchaseCreditsDto } from './subscription.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getAvailablePlans(req: any): Promise<import("./subscription.service").SubscriptionPlan[]>;
    getUserSubscriptionStatus(req: any): Promise<{
        hasActiveSubscription: boolean;
        subscriptions: import("../entities/subscription.entity").Subscription[];
        totalAvailableSessions: number;
        canBookSession: boolean;
    }>;
    createSubscription(req: any, createDto: Omit<CreateSubscriptionDto, 'userId'>): Promise<{
        subscription: import("../entities/subscription.entity").Subscription;
        payment: import("../entities/payment.entity").Payment;
    }>;
    purchaseCredits(req: any, purchaseDto: Omit<PurchaseCreditsDto, 'userId'>): Promise<{
        subscription: import("../entities/subscription.entity").Subscription;
        payment: import("../entities/payment.entity").Payment;
    }>;
    confirmPayment(paymentId: string): Promise<import("../entities/subscription.entity").Subscription>;
    validateUserCanBookSession(userId: string): Promise<{
        canBook: boolean;
        reason?: string;
        availableSessions: number;
        nextAvailableDate?: Date;
    }>;
    consumeSession(userId: string): Promise<{
        subscriptionId: string;
        paidFromSubscription: boolean;
        paidFromCredit: boolean;
    }>;
}

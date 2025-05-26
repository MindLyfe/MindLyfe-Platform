import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Subscription, SubscriptionType } from '../entities/subscription.entity';
import { Organization } from '../entities/organization.entity';
import { Payment } from '../entities/payment.entity';
export interface SubscriptionPlan {
    type: SubscriptionType;
    name: string;
    price: number;
    sessions: number;
    duration: number;
    description: string;
}
export interface CreateSubscriptionDto {
    userId: string;
    type: SubscriptionType;
    paymentMethod: string;
    phoneNumber?: string;
}
export interface PurchaseCreditsDto {
    userId: string;
    credits: number;
    paymentMethod: string;
    phoneNumber?: string;
}
export declare class SubscriptionService {
    private userRepository;
    private subscriptionRepository;
    private organizationRepository;
    private paymentRepository;
    private dataSource;
    private readonly PLANS;
    constructor(userRepository: Repository<User>, subscriptionRepository: Repository<Subscription>, organizationRepository: Repository<Organization>, paymentRepository: Repository<Payment>, dataSource: DataSource);
    getAvailablePlans(userId: string): Promise<SubscriptionPlan[]>;
    createSubscription(createDto: CreateSubscriptionDto): Promise<{
        subscription: Subscription;
        payment: Payment;
    }>;
    purchaseCredits(purchaseDto: PurchaseCreditsDto): Promise<{
        subscription: Subscription;
        payment: Payment;
    }>;
    getUserSubscriptionStatus(userId: string): Promise<{
        hasActiveSubscription: boolean;
        subscriptions: Subscription[];
        totalAvailableSessions: number;
        canBookSession: boolean;
    }>;
    confirmPayment(paymentId: string): Promise<Subscription>;
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
    private validateSubscriptionType;
    private generatePaymentReference;
}

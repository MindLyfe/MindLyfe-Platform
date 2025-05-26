import { Repository, DataSource } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { Payment } from '../entities/payment.entity';
export interface CreateOrganizationDto {
    name: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    maxUsers: number;
    adminUserId: string;
}
export interface AddUserToOrganizationDto {
    organizationId: string;
    userEmail: string;
    adminUserId: string;
}
export interface OrganizationSubscriptionDto {
    organizationId: string;
    paymentMethod: string;
    phoneNumber?: string;
    adminUserId: string;
}
export declare class OrganizationService {
    private organizationRepository;
    private userRepository;
    private subscriptionRepository;
    private paymentRepository;
    private dataSource;
    constructor(organizationRepository: Repository<Organization>, userRepository: Repository<User>, subscriptionRepository: Repository<Subscription>, paymentRepository: Repository<Payment>, dataSource: DataSource);
    createOrganization(createDto: CreateOrganizationDto): Promise<Organization>;
    createOrganizationSubscription(subscriptionDto: OrganizationSubscriptionDto): Promise<{
        payment: Payment;
    }>;
    confirmOrganizationPayment(paymentId: string): Promise<Organization>;
    addUserToOrganization(addUserDto: AddUserToOrganizationDto): Promise<User>;
    removeUserFromOrganization(organizationId: string, userId: string, adminUserId: string): Promise<void>;
    getOrganizationDetails(organizationId: string): Promise<{
        organization: Organization;
        users: User[];
        subscriptionStatus: {
            isActive: boolean;
            totalCost: number;
            remainingDays: number;
        };
    }>;
    getUserOrganization(userId: string): Promise<{
        organization: Organization | null;
        userRole: string;
        subscriptionStatus?: {
            isActive: boolean;
            totalCost: number;
            remainingDays: number;
        };
    }>;
    private generatePaymentReference;
}

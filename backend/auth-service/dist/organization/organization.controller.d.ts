import { OrganizationService, CreateOrganizationDto, AddUserToOrganizationDto, OrganizationSubscriptionDto } from './organization.service';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    createOrganization(req: any, createDto: Omit<CreateOrganizationDto, 'adminUserId'>): Promise<import("../entities/organization.entity").Organization>;
    createOrganizationSubscription(req: any, organizationId: string, subscriptionDto: Omit<OrganizationSubscriptionDto, 'organizationId' | 'adminUserId'>): Promise<{
        payment: import("../entities/payment.entity").Payment;
    }>;
    confirmOrganizationPayment(paymentId: string): Promise<import("../entities/organization.entity").Organization>;
    addUserToOrganization(req: any, organizationId: string, addUserDto: Omit<AddUserToOrganizationDto, 'organizationId' | 'adminUserId'>): Promise<import("../entities/user.entity").User>;
    removeUserFromOrganization(req: any, organizationId: string, userId: string): Promise<void>;
    getOrganizationDetails(organizationId: string): Promise<{
        organization: import("../entities/organization.entity").Organization;
        users: import("../entities/user.entity").User[];
        subscriptionStatus: {
            isActive: boolean;
            totalCost: number;
            remainingDays: number;
        };
    }>;
    getMyOrganization(req: any): Promise<{
        organization: import("../entities/organization.entity").Organization | null;
        userRole: string;
        subscriptionStatus?: {
            isActive: boolean;
            totalCost: number;
            remainingDays: number;
        };
    }>;
}

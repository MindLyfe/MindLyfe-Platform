import { PaymentMethod } from '../entities/payment.entity';
export declare class CreateOrganizationRequestDto {
    name: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    maxUsers: number;
}
export declare class OrganizationSubscriptionRequestDto {
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
}
export declare class AddUserToOrganizationRequestDto {
    userEmail: string;
}
export declare class OrganizationDetailsResponseDto {
    organization: any;
    users: any[];
    subscriptionStatus: {
        isActive: boolean;
        totalCost: number;
        remainingDays: number;
    };
}

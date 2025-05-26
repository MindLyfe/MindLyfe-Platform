import { User } from './user.entity';
export declare enum OrganizationStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    INACTIVE = "inactive"
}
export declare class Organization {
    id: string;
    name: string;
    description?: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    status: OrganizationStatus;
    maxUsers: number;
    currentUsers: number;
    pricePerUser: number;
    sessionsPerUser: number;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    isActive: boolean;
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}

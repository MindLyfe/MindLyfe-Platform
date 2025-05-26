export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    THERAPIST = "therapist",
    ORGANIZATION_ADMIN = "organization_admin"
}
export declare enum UserStatus {
    PENDING = "pending",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    INACTIVE = "inactive"
}
export declare enum UserType {
    INDIVIDUAL = "individual",
    ORGANIZATION_MEMBER = "organization_member",
    MINOR = "minor"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: UserRole;
    status: UserStatus;
    userType: UserType;
    emailVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    lastLogin?: Date;
    organizationId?: string;
    organization?: any;
    dateOfBirth?: Date;
    isMinor: boolean;
    guardianEmail?: string;
    guardianPhone?: string;
    subscriptions: any[];
    therapySessions: any[];
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    checkMinorStatus(): void;
    comparePassword(password: string): Promise<boolean>;
    get fullName(): string;
    get isOrganizationMember(): boolean;
    get canAccessTherapy(): boolean;
}

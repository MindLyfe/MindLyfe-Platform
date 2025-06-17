export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    guardianEmail?: string;
    guardianPhone?: string;
}
export declare class TherapistRegisterDto extends RegisterDto {
    licenseNumber: string;
    specialization: string[];
    credentials?: string[];
    hourlyRate?: number;
}
export declare class OrganizationUserDto {
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    phoneNumber?: string;
}
export declare class SupportTeamUserDto extends RegisterDto {
    department: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
    passwordConfirmation: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
}

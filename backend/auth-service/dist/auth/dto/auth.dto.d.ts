export declare enum PreferredLanguage {
    ENGLISH = "en",
    SPANISH = "es",
    FRENCH = "fr",
    GERMAN = "de",
    ITALIAN = "it",
    PORTUGUESE = "pt",
    CHINESE = "zh",
    JAPANESE = "ja",
    KOREAN = "ko",
    ARABIC = "ar"
}
export declare enum CommunicationPreference {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    ALL = "all",
    NONE = "none"
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    preferredLanguage?: PreferredLanguage;
    communicationPreference?: CommunicationPreference;
    timezone?: string;
    agreeToTerms?: boolean;
    agreeToPrivacy?: boolean;
    marketingOptIn?: boolean;
}
export declare class TherapistRegisterDto extends RegisterDto {
    licenseNumber: string;
    specialization: string[];
    credentials?: string[];
    hourlyRate?: number;
    professionalBio?: string;
    education?: string;
    yearsOfExperience?: number;
    languagesSpoken?: string[];
    licenseState?: string;
    licenseExpirationDate?: string;
}
export declare class OrganizationUserDto {
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    phoneNumber?: string;
    jobTitle?: string;
    department?: string;
}
export declare class SupportTeamUserDto extends RegisterDto {
    department: string;
    jobTitle?: string;
    supportLanguages?: string[];
    supportChannels?: string[];
}
export declare class LoginDto {
    email: string;
    password: string;
    deviceType?: string;
    rememberMe?: boolean;
}
export declare class RefreshTokenDto {
    refreshToken: string;
    deviceType?: string;
}
export declare class ForgotPasswordDto {
    email: string;
    redirectUrl?: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
    passwordConfirmation: string;
}
export declare class VerifyEmailDto {
    token: string;
    redirectUrl?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
}

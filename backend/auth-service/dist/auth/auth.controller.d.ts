import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    register(registerDto: RegisterDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
        userId: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
        requiresMfa: boolean;
        userId: string;
        tempToken: string;
        email?: undefined;
        firstName?: undefined;
        lastName?: undefined;
        role?: undefined;
        accessToken?: undefined;
        refreshToken?: undefined;
        sessionId?: undefined;
    } | {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../entities/user.entity").UserRole;
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        message?: undefined;
        requiresMfa?: undefined;
        tempToken?: undefined;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto, userAgent: string, ipAddress: string): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
    }>;
    logout(req: any, sessionId: string, userAgent: string, ipAddress: string): Promise<{
        message: string;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    validateToken(body: {
        token: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
            status: import("../entities/user.entity").UserStatus;
            emailVerified: boolean;
            twoFactorEnabled: boolean;
        };
    }>;
    validateServiceToken(body: {
        serviceName: string;
        token: string;
    }, requestingService: string): Promise<{
        valid: boolean;
    }>;
    revokeToken(body: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    getUserInfo(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../entities/user.entity").UserRole;
            status: import("../entities/user.entity").UserStatus;
            emailVerified: boolean;
            twoFactorEnabled: boolean;
        };
    }>;
    getUserSubscriptionStatus(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../entities/user.entity").UserRole;
        };
        subscription: {
            hasActiveSubscription: boolean;
            subscriptions: any[];
            userType: string;
            organizationId: any;
            canMakePayments: boolean;
        };
    }>;
    handlePaymentNotification(userId: string, notification: {
        type: 'payment_succeeded' | 'payment_failed' | 'subscription_created' | 'subscription_canceled';
        paymentId?: string;
        subscriptionId?: string;
        amount?: number;
        currency?: string;
        gateway?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        message: string;
        userId: string;
        type: "payment_succeeded" | "payment_failed" | "subscription_created" | "subscription_canceled";
        processed: boolean;
    }>;
    validatePaymentAccess(body: {
        userId: string;
        paymentType: string;
        amount: number;
    }): Promise<{
        canMakePayment: boolean;
        reason: string;
        userId?: undefined;
        paymentType?: undefined;
        amount?: undefined;
    } | {
        canMakePayment: boolean;
        userId: string;
        paymentType: string;
        amount: number;
        reason?: undefined;
    }>;
}

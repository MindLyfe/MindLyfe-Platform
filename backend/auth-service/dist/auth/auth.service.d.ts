import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../entities/user.entity';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto, VerifyEmailDto, ChangePasswordDto, TherapistRegisterDto, OrganizationUserDto, SupportTeamUserDto } from './dto/auth.dto';
import { SessionService } from './session/session.service';
import { EventService } from '../shared/events/event.service';
import { UserService, SafeUser } from '../user/user.service';
import { RedisService } from '../shared/services/redis.service';
import { HttpService } from '@nestjs/axios';
import { Therapist } from '../entities/therapist.entity';
interface AuthMetadata {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly httpService;
    private readonly sessionService;
    private readonly eventService;
    private readonly userService;
    private readonly redisService;
    private readonly therapistRepository;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, httpService: HttpService, sessionService: SessionService, eventService: EventService, userService: UserService, redisService: RedisService, therapistRepository: Repository<Therapist>);
    private generateAccessToken;
    register(registerDto: RegisterDto, metadata?: AuthMetadata): Promise<{
        message: string;
        userId: string;
        isMinor: boolean;
    }>;
    registerTherapist(therapistDto: TherapistRegisterDto, metadata?: AuthMetadata): Promise<{
        message: string;
        userId: string;
        therapistId: string;
    }>;
    registerOrganizationUser(orgUserDto: OrganizationUserDto, adminUserId: string, metadata?: AuthMetadata): Promise<{
        message: string;
        userId: string;
    }>;
    registerSupportTeam(supportDto: SupportTeamUserDto, adminUserId: string, metadata?: AuthMetadata): Promise<{
        message: string;
        userId: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto, metadata?: AuthMetadata): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto, metadata?: AuthMetadata): Promise<{
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
        role: UserRole;
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        message?: undefined;
        requiresMfa?: undefined;
        tempToken?: undefined;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto, metadata?: AuthMetadata): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto, metadata?: AuthMetadata): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, metadata?: AuthMetadata): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto, metadata?: AuthMetadata): Promise<{
        message: string;
    }>;
    logout(userId: string, sessionId?: string, metadata?: AuthMetadata): Promise<{
        message: string;
    }>;
    validateUserById(userId: string): Promise<SafeUser | null>;
    private parseTimeToMs;
    private generateRefreshToken;
    validateServiceToken(serviceName: string, token: string, requestingService: string): Promise<boolean>;
    revokeToken(token: string): Promise<void>;
    isTokenRevoked(token: string): Promise<boolean>;
    sendWelcomeNotification(user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }): Promise<void>;
    generateServiceToken(): Promise<string>;
    getUserSubscriptionStatus(userId: string): Promise<any>;
    handlePaymentNotification(userId: string, notification: any): Promise<any>;
    validatePaymentAccess(userId: string, paymentType: string, amount: number): Promise<boolean>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    private handleSubscriptionCreated;
    private handleSubscriptionCanceled;
    private sendNotificationRequest;
}
export {};

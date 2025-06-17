"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../entities/user.entity");
const session_service_1 = require("./session/session.service");
const event_service_1 = require("../shared/events/event.service");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const user_service_1 = require("../user/user.service");
const redis_service_1 = require("../shared/services/redis.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const therapist_entity_1 = require("../entities/therapist.entity");
let AuthService = AuthService_1 = class AuthService {
    jwtService;
    configService;
    httpService;
    sessionService;
    eventService;
    userService;
    redisService;
    therapistRepository;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(jwtService, configService, httpService, sessionService, eventService, userService, redisService, therapistRepository) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.httpService = httpService;
        this.sessionService = sessionService;
        this.eventService = eventService;
        this.userService = userService;
        this.redisService = redisService;
        this.therapistRepository = therapistRepository;
    }
    generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload, {
            expiresIn: this.configService.get('jwt.expiresIn'),
        });
    }
    async register(registerDto, metadata) {
        const { email, dateOfBirth, guardianEmail, guardianPhone } = registerDto;
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            this.logger.warn(`Registration attempt with existing email: ${email}`);
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                if (!guardianEmail || !guardianPhone) {
                    throw new common_1.BadRequestException('Guardian email and phone are required for users under 18');
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(guardianEmail)) {
                    throw new common_1.BadRequestException('Invalid guardian email format');
                }
                this.logger.log(`Minor registration detected for user ${email}, age: ${age}`);
            }
        }
        const verificationToken = (0, uuid_1.v4)();
        const userData = {
            ...registerDto,
            verificationToken,
            status: user_entity_1.UserStatus.PENDING,
            role: user_entity_1.UserRole.USER,
            userType: user_entity_1.UserType.INDIVIDUAL,
        };
        const userDataForCreation = { ...userData };
        if (userDataForCreation.dateOfBirth) {
            userDataForCreation.dateOfBirth = new Date(userDataForCreation.dateOfBirth);
        }
        const user = await this.userService.createUser(userDataForCreation);
        try {
            await this.sendNotificationRequest('auth/verification-email', {
                userId: user.id,
                email: user.email,
                token: verificationToken,
                firstName: user.firstName,
                lastName: user.lastName
            });
            this.logger.log(`Verification email sent to ${user.email}`);
            if (user.isMinor && guardianEmail) {
                try {
                    await this.sendNotificationRequest('auth/guardian-notification', {
                        guardianEmail,
                        userName: `${user.firstName} ${user.lastName}`,
                        userEmail: user.email,
                        userId: user.id
                    });
                    this.logger.log(`Guardian notification sent to ${guardianEmail}`);
                }
                catch (error) {
                    this.logger.error(`Failed to send guardian notification to ${guardianEmail}`, error);
                }
            }
            this.eventService.emit(event_service_1.EventType.USER_CREATED, {
                userId: user.id,
                email: user.email,
                isMinor: user.isMinor,
                userType: user.userType
            }, {
                userId: user.id,
                metadata
            });
            this.eventService.emit(event_service_1.EventType.EMAIL_VERIFICATION_SENT, { userId: user.id, email: user.email }, {
                userId: user.id,
                metadata
            });
        }
        catch (error) {
            this.logger.error(`Failed to send verification email to ${user.email}`, error);
        }
        await this.sendWelcomeNotification(user);
        const message = user.isMinor
            ? 'Registration successful. Please check your email to verify your account. A notification has been sent to your guardian.'
            : 'Registration successful. Please check your email to verify your account.';
        return {
            message,
            userId: user.id,
            isMinor: user.isMinor,
        };
    }
    async registerTherapist(therapistDto, metadata) {
        const { email, licenseNumber, specialization, credentials, hourlyRate, ...userDto } = therapistDto;
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            this.logger.warn(`Therapist registration attempt with existing email: ${email}`);
            throw new common_1.ConflictException('User with this email already exists');
        }
        const existingTherapist = await this.therapistRepository.findOne({
            where: { licenseNumber }
        });
        if (existingTherapist) {
            this.logger.warn(`Therapist registration attempt with existing license: ${licenseNumber}`);
            throw new common_1.ConflictException('Therapist with this license number already exists');
        }
        const verificationToken = (0, uuid_1.v4)();
        const userData = {
            ...userDto,
            email,
            verificationToken,
            status: user_entity_1.UserStatus.PENDING,
            role: user_entity_1.UserRole.THERAPIST,
            userType: user_entity_1.UserType.INDIVIDUAL,
        };
        const userDataForCreation = { ...userData };
        if (userDataForCreation.dateOfBirth) {
            userDataForCreation.dateOfBirth = new Date(userDataForCreation.dateOfBirth);
        }
        const user = await this.userService.createUser(userDataForCreation);
        const therapist = this.therapistRepository.create({
            userId: user.id,
            licenseNumber,
            licenseState: 'PENDING',
            specialization: Array.isArray(specialization) ? specialization.join(', ') : specialization,
            credentials: credentials ? {
                education: [],
                certifications: credentials,
                experience: ''
            } : undefined,
            hourlyRate: hourlyRate || 0,
            status: therapist_entity_1.TherapistStatus.PENDING_VERIFICATION,
            isAcceptingNewClients: false,
        });
        await this.therapistRepository.save(therapist);
        try {
            await this.sendNotificationRequest('auth/verification-email', {
                userId: user.id,
                email: user.email,
                token: verificationToken,
                firstName: user.firstName,
                lastName: user.lastName
            });
            this.logger.log(`Therapist verification email sent to ${user.email}`);
            this.eventService.emit(event_service_1.EventType.USER_CREATED, { userId: user.id, email: user.email, role: user_entity_1.UserRole.THERAPIST }, { userId: user.id, metadata });
            this.eventService.emit(event_service_1.EventType.EMAIL_VERIFICATION_SENT, { userId: user.id, email: user.email }, { userId: user.id, metadata });
        }
        catch (error) {
            this.logger.error(`Failed to send therapist verification email to ${user.email}`, error);
        }
        return {
            message: 'Therapist registration successful. Please check your email to verify your account and await license verification.',
            userId: user.id,
            therapistId: therapist.id,
        };
    }
    async registerOrganizationUser(orgUserDto, adminUserId, metadata) {
        const { email, organizationId, ...userDto } = orgUserDto;
        const adminUser = await this.userService.findById(adminUserId);
        if (!adminUser || (adminUser.role !== user_entity_1.UserRole.ADMIN && adminUser.organizationId !== organizationId)) {
            throw new common_1.UnauthorizedException('Insufficient permissions to add organization users');
        }
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            this.logger.warn(`Organization user registration attempt with existing email: ${email}`);
            throw new common_1.ConflictException('User with this email already exists');
        }
        const verificationToken = (0, uuid_1.v4)();
        const userData = {
            ...userDto,
            email,
            verificationToken,
            status: user_entity_1.UserStatus.ACTIVE,
            role: user_entity_1.UserRole.USER,
            userType: user_entity_1.UserType.ORGANIZATION_MEMBER,
            organizationId,
        };
        const userDataForCreation = { ...userData };
        if (userDataForCreation.dateOfBirth) {
            userDataForCreation.dateOfBirth = new Date(userDataForCreation.dateOfBirth);
        }
        const user = await this.userService.createUser(userDataForCreation);
        try {
            await this.sendNotificationRequest('auth/verification-email', {
                userId: user.id,
                email: user.email,
                token: verificationToken,
                firstName: user.firstName,
                lastName: user.lastName
            });
            this.logger.log(`Organization user welcome email sent to ${user.email}`);
            this.eventService.emit(event_service_1.EventType.USER_CREATED, { userId: user.id, email: user.email, organizationId }, { userId: user.id, metadata });
        }
        catch (error) {
            this.logger.error(`Failed to send organization user welcome email to ${user.email}`, error);
        }
        return {
            message: 'Organization user created successfully.',
            userId: user.id,
        };
    }
    async registerSupportTeam(supportDto, adminUserId, metadata) {
        const { email, department, ...userDto } = supportDto;
        const adminUser = await this.userService.findById(adminUserId);
        if (!adminUser || adminUser.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.UnauthorizedException('Only administrators can add support team members');
        }
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            this.logger.warn(`Support team registration attempt with existing email: ${email}`);
            throw new common_1.ConflictException('User with this email already exists');
        }
        const verificationToken = (0, uuid_1.v4)();
        const userData = {
            ...userDto,
            email,
            verificationToken,
            status: user_entity_1.UserStatus.ACTIVE,
            role: user_entity_1.UserRole.ADMIN,
            userType: user_entity_1.UserType.INDIVIDUAL,
        };
        const userDataForCreation = { ...userData };
        if (userDataForCreation.dateOfBirth) {
            userDataForCreation.dateOfBirth = new Date(userDataForCreation.dateOfBirth);
        }
        const user = await this.userService.createUser(userDataForCreation);
        try {
            await this.sendNotificationRequest('auth/verification-email', {
                userId: user.id,
                email: user.email,
                token: verificationToken,
                firstName: user.firstName,
                lastName: user.lastName
            });
            this.logger.log(`Support team welcome email sent to ${user.email}`);
            this.eventService.emit(event_service_1.EventType.USER_CREATED, { userId: user.id, email: user.email, role: user_entity_1.UserRole.ADMIN, department }, { userId: user.id, metadata });
        }
        catch (error) {
            this.logger.error(`Failed to send support team welcome email to ${user.email}`, error);
        }
        return {
            message: 'Support team member created successfully.',
            userId: user.id,
        };
    }
    async verifyEmail(verifyEmailDto, metadata) {
        const user = await this.userService.findByResetToken(verifyEmailDto.token);
        if (!user) {
            this.logger.warn(`Invalid verification token: ${verifyEmailDto.token}`);
            throw new common_1.NotFoundException('Invalid verification token');
        }
        this.logger.log(`User ${user.id} email verified`);
        this.eventService.emit(event_service_1.EventType.EMAIL_VERIFICATION_COMPLETED, { userId: user.id }, {
            userId: user.id,
            metadata
        });
        return {
            message: 'Email verification successful. You can now log in.',
        };
    }
    async login(loginDto, metadata) {
        const { email, password } = loginDto;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            this.logger.warn(`Login attempt with non-existent email: ${email}`);
            this.eventService.emit(event_service_1.EventType.AUTH_LOGIN_FAILED, { email: email, reason: 'User not found' }, { metadata });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password || '');
        if (!isPasswordValid) {
            this.logger.warn(`Failed login attempt for user: ${user.id}`);
            this.eventService.emit(event_service_1.EventType.AUTH_LOGIN_FAILED, { userId: user.id, email: user.email, reason: 'Invalid password' }, {
                userId: user.id,
                metadata
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.emailVerified) {
            this.logger.warn(`Login attempt with unverified email: ${user.email}`);
            throw new common_1.UnauthorizedException('Email not verified. Please check your email for verification instructions.');
        }
        if (user.status !== user_entity_1.UserStatus.ACTIVE) {
            this.logger.warn(`Login attempt with inactive account: ${user.id}`);
            throw new common_1.UnauthorizedException('Account is not active');
        }
        if (user.twoFactorEnabled) {
            this.logger.debug(`MFA required for user: ${user.id}`);
            return {
                message: 'MFA verification required',
                requiresMfa: true,
                userId: user.id,
                tempToken: this.jwtService.sign({ sub: user.id, mfa: 'required' }, { expiresIn: '5m' }),
            };
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const refreshExpiresInMs = this.parseTimeToMs(this.configService.get('jwt.refreshExpiresIn', '7d'));
        const expiresAt = new Date(Date.now() + refreshExpiresInMs);
        const session = await this.sessionService.createSession(user.id, refreshToken, metadata?.ipAddress, metadata?.userAgent, metadata?.deviceInfo);
        await this.userService.updateLastLogin(user.id);
        this.eventService.emit(event_service_1.EventType.AUTH_LOGIN_SUCCESS, { userId: user.id, sessionId: session.id }, {
            userId: user.id,
            metadata
        });
        return {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            accessToken,
            refreshToken,
            sessionId: session.id,
        };
    }
    async refreshToken(refreshTokenDto, metadata) {
        try {
            const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.get('jwt.refreshSecret', 'mindlyf-refresh-secret'),
            });
            const user = await this.userService.findById(decoded.sub);
            const accessToken = this.generateAccessToken(user);
            const refreshExpiresInMs = this.parseTimeToMs(this.configService.get('jwt.refreshExpiresIn', '7d'));
            const expiresAt = new Date(Date.now() + refreshExpiresInMs);
            const session = await this.sessionService.createSession(user.id, refreshTokenDto.refreshToken, metadata?.ipAddress, metadata?.userAgent, metadata?.deviceInfo);
            this.eventService.emit(event_service_1.EventType.TOKEN_REFRESHED, {
                userId: user.id,
                oldSessionId: session.id,
                newSessionId: session.id
            }, {
                userId: user.id,
                metadata
            });
            return {
                accessToken,
                refreshToken: refreshTokenDto.refreshToken,
                sessionId: session.id,
            };
        }
        catch (error) {
            this.logger.warn('Token refresh failed', error);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async changePassword(userId, changePasswordDto, metadata) {
        if (changePasswordDto.newPassword !== changePasswordDto.newPasswordConfirmation) {
            throw new common_1.BadRequestException('New passwords do not match');
        }
        const user = await this.userService.findByIdInternal(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password || '');
        if (!isPasswordValid) {
            this.logger.warn(`Invalid current password attempt for user: ${userId}`);
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        await this.userService.updatePassword(userId, changePasswordDto.newPassword);
        await this.sessionService.revokeAllUserSessions(userId, 'Password changed');
        this.eventService.emit(event_service_1.EventType.AUTH_PASSWORD_CHANGED, { userId }, {
            userId,
            metadata
        });
        return {
            message: 'Password changed successfully. Please log in again with your new password.',
        };
    }
    async forgotPassword(forgotPasswordDto, metadata) {
        const { email } = forgotPasswordDto;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            this.logger.warn(`Password reset requested for non-existent email: ${email}`);
            return { message: 'If your email is registered, you will receive password reset instructions.' };
        }
        const resetToken = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await this.userService.updateResetToken(user.id, resetToken, expiresAt);
        this.logger.log(`Password reset email would be sent to ${email} with token ${resetToken}`);
        return { message: 'If your email is registered, you will receive password reset instructions.' };
    }
    async resetPassword(resetPasswordDto, metadata) {
        const { token, password } = resetPasswordDto;
        const user = await this.userService.findByResetToken(token);
        if (!user) {
            throw new common_1.NotFoundException('Invalid or expired reset token');
        }
        if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
            throw new common_1.UnauthorizedException('Reset token has expired');
        }
        await this.userService.updatePassword(user.id, password);
        return { message: 'Password has been reset successfully. You can now log in with your new password.' };
    }
    async logout(userId, sessionId, metadata) {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (sessionId) {
            await this.sessionService.revokeSession(sessionId, 'User logout');
        }
        else {
            await this.sessionService.revokeAllUserSessions(userId, 'User logout');
        }
        this.eventService.emit(event_service_1.EventType.AUTH_LOGOUT, { userId, sessionId }, {
            userId,
            metadata
        });
        return {
            message: 'Logged out successfully',
        };
    }
    async validateUserById(userId) {
        try {
            const user = await this.userService.findById(userId);
            if (!user || user.status !== user_entity_1.UserStatus.ACTIVE) {
                return null;
            }
            return user;
        }
        catch (error) {
            return null;
        }
    }
    parseTimeToMs(timeString) {
        const unit = timeString.charAt(timeString.length - 1);
        const value = parseInt(timeString.substring(0, timeString.length - 1), 10);
        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 7 * 24 * 60 * 60 * 1000;
        }
    }
    generateRefreshToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload, {
            secret: this.configService.get('jwt.refreshSecret', 'mindlyf-refresh-secret'),
            expiresIn: this.configService.get('jwt.refreshExpiresIn', '7d'),
        });
    }
    async validateServiceToken(serviceName, token, requestingService) {
        const expectedToken = this.configService.get(`services.${serviceName}.token`);
        if (!expectedToken || token !== expectedToken) {
            return false;
        }
        this.logger.debug(`Service token validation: ${requestingService} validating token for ${serviceName}`);
        return true;
    }
    async revokeToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
            if (expiresIn > 0) {
                await this.redisService.set(`blacklist:${token}`, 'revoked', expiresIn);
            }
            if (payload.type === 'refresh') {
                await this.sessionService.invalidateSession(payload.sessionId);
            }
            this.logger.debug(`Token revoked: ${token.substring(0, 10)}...`);
        }
        catch (error) {
            this.logger.error(`Error revoking token: ${error.message}`);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async isTokenRevoked(token) {
        const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
        return !!isBlacklisted;
    }
    async sendWelcomeNotification(user) {
        try {
            const notificationServiceUrl = this.configService.get('NOTIFICATION_SERVICE_URL');
            if (!notificationServiceUrl) {
                this.logger.warn('Notification service URL not configured, skipping welcome notification');
                return;
            }
            const serviceToken = await this.generateServiceToken();
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${notificationServiceUrl}/api/notification`, {
                userId: user.id,
                type: 'ACCOUNT',
                title: 'Welcome to MindLyf',
                message: `Welcome to MindLyf, ${user.firstName}! We're excited to have you join our community.`,
                metadata: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    loginUrl: this.configService.get('FRONTEND_URL'),
                    year: new Date().getFullYear(),
                    unsubscribeUrl: `${this.configService.get('FRONTEND_URL')}/unsubscribe`,
                    privacyUrl: `${this.configService.get('FRONTEND_URL')}/privacy`,
                    termsUrl: `${this.configService.get('FRONTEND_URL')}/terms`,
                },
                channels: ['EMAIL', 'IN_APP'],
            }, {
                headers: {
                    Authorization: `Bearer ${serviceToken}`,
                },
            }));
            this.logger.log(`Welcome notification sent to user: ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome notification: ${error.message}`, error.stack);
        }
    }
    async generateServiceToken() {
        const payload = {
            service: 'auth-service',
            sub: 'system',
            role: 'service',
        };
        return this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SERVICE_SECRET'),
            expiresIn: '5m',
        });
    }
    async getUserSubscriptionStatus(userId) {
        const user = await this.userService.findById(userId);
        if (!user) {
            return null;
        }
        const activeSubscriptions = user.subscriptions?.filter(sub => sub.status === 'active' &&
            (!sub.endDate || new Date(sub.endDate) > new Date())) || [];
        return {
            hasActiveSubscription: activeSubscriptions.length > 0,
            subscriptions: activeSubscriptions,
            userType: user.userType,
            organizationId: user.organizationId,
            canMakePayments: user.status === user_entity_1.UserStatus.ACTIVE && user.emailVerified,
        };
    }
    async handlePaymentNotification(userId, notification) {
        const user = await this.validateUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        this.logger.log(`Payment notification for user ${userId}: ${notification.type}`);
        switch (notification.type) {
            case 'payment_succeeded':
                await this.handlePaymentSuccess(userId, notification);
                break;
            case 'payment_failed':
                await this.handlePaymentFailure(userId, notification);
                break;
            case 'subscription_created':
                await this.handleSubscriptionCreated(userId, notification);
                break;
            case 'subscription_canceled':
                await this.handleSubscriptionCanceled(userId, notification);
                break;
        }
        return { success: true, message: 'Payment notification processed' };
    }
    async validatePaymentAccess(userId, paymentType, amount) {
        const user = await this.userService.findById(userId);
        if (!user) {
            return false;
        }
        if (user.status !== user_entity_1.UserStatus.ACTIVE || !user.emailVerified) {
            return false;
        }
        if (user.isMinor && amount > 50000) {
            return false;
        }
        if (user.organizationId && paymentType === 'subscription') {
            return false;
        }
        return true;
    }
    async handlePaymentSuccess(userId, notification) {
        this.logger.log(`Payment succeeded for user ${userId}: ${notification.paymentId}`);
    }
    async handlePaymentFailure(userId, notification) {
        this.logger.log(`Payment failed for user ${userId}: ${notification.paymentId}`);
    }
    async handleSubscriptionCreated(userId, notification) {
        this.logger.log(`Subscription created for user ${userId}: ${notification.subscriptionId}`);
    }
    async handleSubscriptionCanceled(userId, notification) {
        this.logger.log(`Subscription canceled for user ${userId}: ${notification.subscriptionId}`);
    }
    async sendNotificationRequest(endpoint, data) {
        try {
            const notificationServiceUrl = this.configService.get('NOTIFICATION_SERVICE_URL');
            if (!notificationServiceUrl) {
                this.logger.warn('Notification service URL not configured, skipping notification');
                return;
            }
            const serviceToken = await this.generateServiceToken();
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${notificationServiceUrl}/api/${endpoint}`, data, {
                headers: {
                    Authorization: `Bearer ${serviceToken}`,
                },
            }));
            this.logger.log(`Notification sent to ${endpoint}`);
        }
        catch (error) {
            this.logger.error(`Failed to send notification to ${endpoint}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(7, (0, typeorm_1.InjectRepository)(therapist_entity_1.Therapist)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        axios_1.HttpService,
        session_service_1.SessionService,
        event_service_1.EventService,
        user_service_1.UserService,
        redis_service_1.RedisService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../entities/user.entity");
const email_service_1 = require("../shared/services/email.service");
const session_service_1 = require("./session/session.service");
const event_service_1 = require("../shared/events/event.service");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const user_service_1 = require("../user/user.service");
const redis_service_1 = require("../shared/services/redis.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, configService, emailService, sessionService, eventService, userService, redisService, httpService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.sessionService = sessionService;
        this.eventService = eventService;
        this.userService = userService;
        this.redisService = redisService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(AuthService_1.name);
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
        const { email } = registerDto;
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            this.logger.warn(`Registration attempt with existing email: ${email}`);
            throw new common_1.ConflictException('User with this email already exists');
        }
        const verificationToken = (0, uuid_1.v4)();
        const user = await this.userService.createUser(Object.assign(Object.assign({}, registerDto), { verificationToken, status: user_entity_1.UserStatus.PENDING }));
        try {
            await this.emailService.sendVerificationEmail(user.email, verificationToken);
            this.logger.log(`Verification email sent to ${user.email}`);
            this.eventService.emit(event_service_1.EventType.USER_CREATED, { userId: user.id, email: user.email }, {
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
        return {
            message: 'Registration successful. Please check your email to verify your account.',
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
        const session = await this.sessionService.createSession(user.id, refreshToken, metadata === null || metadata === void 0 ? void 0 : metadata.ipAddress, metadata === null || metadata === void 0 ? void 0 : metadata.userAgent, metadata === null || metadata === void 0 ? void 0 : metadata.deviceInfo);
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
            const session = await this.sessionService.createSession(user.id, refreshTokenDto.refreshToken, metadata === null || metadata === void 0 ? void 0 : metadata.ipAddress, metadata === null || metadata === void 0 ? void 0 : metadata.userAgent, metadata === null || metadata === void 0 ? void 0 : metadata.deviceInfo);
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
        var _a;
        const user = await this.userService.findById(userId);
        if (!user) {
            return null;
        }
        const activeSubscriptions = ((_a = user.subscriptions) === null || _a === void 0 ? void 0 : _a.filter(sub => sub.status === 'active' &&
            (!sub.endDate || new Date(sub.endDate) > new Date()))) || [];
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService,
        session_service_1.SessionService,
        event_service_1.EventService,
        user_service_1.UserService,
        redis_service_1.RedisService,
        axios_1.HttpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
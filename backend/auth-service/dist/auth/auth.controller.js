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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const throttler_1 = require("@nestjs/throttler");
const service_token_guard_1 = require("./guards/service-token.guard");
const jwt_1 = require("@nestjs/jwt");
const roles_decorator_1 = require("./decorators/roles.decorator");
const roles_guard_1 = require("./guards/roles.guard");
const user_entity_1 = require("../entities/user.entity");
let AuthController = class AuthController {
    authService;
    jwtService;
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    async register(registerDto, userAgent, ipAddress) {
        return this.authService.register(registerDto, { ipAddress, userAgent });
    }
    async registerTherapist(therapistDto, clientIp, userAgent) {
        const metadata = { clientIp, userAgent };
        return this.authService.registerTherapist(therapistDto, metadata);
    }
    async registerOrganizationUser(orgUserDto, clientIp, userAgent) {
        const metadata = { clientIp, userAgent };
        const adminUserId = 'admin-user-id';
        return this.authService.registerOrganizationUser(orgUserDto, adminUserId, metadata);
    }
    async registerSupportTeam(supportDto, clientIp, userAgent) {
        const metadata = { clientIp, userAgent };
        const adminUserId = 'admin-user-id';
        return this.authService.registerSupportTeam(supportDto, adminUserId, metadata);
    }
    async verifyEmail(verifyEmailDto, userAgent, ipAddress) {
        return this.authService.verifyEmail(verifyEmailDto, { ipAddress, userAgent });
    }
    async login(loginDto, userAgent, ipAddress) {
        return this.authService.login(loginDto, {
            ipAddress,
            userAgent,
            deviceInfo: userAgent
        });
    }
    async refreshToken(refreshTokenDto, userAgent, ipAddress) {
        return this.authService.refreshToken(refreshTokenDto, { ipAddress, userAgent });
    }
    async logout(req, sessionId, userAgent, ipAddress) {
        return this.authService.logout(req.user.sub, sessionId, { ipAddress, userAgent });
    }
    async changePassword(req, changePasswordDto, userAgent, ipAddress) {
        return this.authService.changePassword(req.user.sub, changePasswordDto, { ipAddress, userAgent });
    }
    async forgotPassword(forgotPasswordDto, userAgent, ipAddress) {
        return this.authService.forgotPassword(forgotPasswordDto, { ipAddress, userAgent });
    }
    async resetPassword(resetPasswordDto, userAgent, ipAddress) {
        return this.authService.resetPassword(resetPasswordDto, { ipAddress, userAgent });
    }
    async getProfile(req) {
        return req.user;
    }
    async validateToken(body) {
        try {
            const payload = this.jwtService.verify(body.token);
            const user = await this.authService.validateUserById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async validateServiceToken(body, requestingService) {
        const isValid = await this.authService.validateServiceToken(body.serviceName, body.token, requestingService);
        return { valid: isValid };
    }
    async revokeToken(body) {
        await this.authService.revokeToken(body.token);
        return { message: 'Token revoked successfully' };
    }
    async getUserInfo(userId) {
        const user = await this.authService.validateUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                emailVerified: user.emailVerified,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        };
    }
    async getUserSubscriptionStatus(userId) {
        const user = await this.authService.validateUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            subscription: {
                hasActiveSubscription: false,
                subscriptions: [],
                userType: 'individual',
                organizationId: null,
                canMakePayments: true
            }
        };
    }
    async handlePaymentNotification(userId, notification) {
        console.log(`Payment notification received for user ${userId}:`, notification);
        return {
            message: 'Payment notification received',
            userId,
            type: notification.type,
            processed: true
        };
    }
    async validatePaymentAccess(body) {
        const user = await this.authService.validateUserById(body.userId);
        if (!user) {
            return { canMakePayment: false, reason: 'User not found' };
        }
        if (!user.emailVerified) {
            return { canMakePayment: false, reason: 'Email not verified' };
        }
        if (user.status !== 'active') {
            return { canMakePayment: false, reason: 'Account not active' };
        }
        return {
            canMakePayment: true,
            userId: body.userId,
            paymentType: body.paymentType,
            amount: body.amount
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Register a new user',
        description: 'Creates a new user account in the system. An email verification link will be sent to the provided email address.'
    }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.RegisterDto,
        description: 'User registration data including email, password, and personal details'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User successfully created',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Registration successful. Please check your email to verify your account.' },
                userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input - Validation errors in the registration data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists with this email address' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('user-agent')),
    __param(2, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('register/therapist'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new therapist' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.TherapistRegisterDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Therapist registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Therapist already exists' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-forwarded-for')),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.TherapistRegisterDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerTherapist", null);
__decorate([
    (0, common_1.Post)('register/organization-user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZATION_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new organization user (Admin only)' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.OrganizationUserDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Organization user registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-forwarded-for')),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.OrganizationUserDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerOrganizationUser", null);
__decorate([
    (0, common_1.Post)('register/support-team'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new support team member (Admin only)' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.SupportTeamUserDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Support team member registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-forwarded-for')),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SupportTeamUserDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerSupportTeam", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify email with token',
        description: 'Verifies a user\'s email address using the token sent to their email. This step is required to activate the account.'
    }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.VerifyEmailDto,
        description: 'The verification token that was sent to the user\'s email'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Email successfully verified',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Email verification successful. You can now log in.' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invalid verification token or token expired' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('user-agent')),
    __param(2, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyEmailDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'User login',
        description: 'Authenticates a user and provides JWT access and refresh tokens. If MFA is enabled, an MFA verification step will be required.'
    }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.LoginDto,
        description: 'User credentials (email and password)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' },
                email: { type: 'string', example: 'user@mindlyf.com' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                role: { type: 'string', example: 'user' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                sessionId: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'MFA verification required',
        schema: {
            type: 'object',
            properties: {
                requiresMfa: { type: 'boolean', example: true },
                message: { type: 'string', example: 'MFA verification required' },
                userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' },
                tempToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials or account not verified' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('user-agent')),
    __param(2, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh JWT token',
        description: 'Gets a new access token using a valid refresh token. This allows extending the user\'s session without requiring re-authentication.'
    }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.RefreshTokenDto,
        description: 'The refresh token obtained during login or previous refresh'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                sessionId: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token or token expired' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('user-agent')),
    __param(2, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout user',
        description: 'Invalidates the user\'s current session, or optionally all sessions. This revokes the refresh token(s).'
    }),
    (0, swagger_1.ApiHeader)({
        name: 'x-session-id',
        description: 'Optional session ID to specify which session to terminate. If not provided, all sessions will be terminated.',
        required: false
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logout successful',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Logged out successfully' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    (0, swagger_1.ApiProduces)('application/json'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-session-id')),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Change user password',
        description: 'Allows an authenticated user to change their password. Requires the current password for verification and invalidates all sessions.'
    }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.ChangePasswordDto,
        description: 'Contains current password for verification and the new password'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password successfully changed',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password changed successfully. Please log in again with your new password.' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input - New passwords don\'t match or validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized or incorrect current password' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Request password reset',
        description: 'Initiates the password reset process by sending a reset link to the user\'s email'
    }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.ForgotPasswordDto,
        description: 'Email address for the account that needs password reset'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset email sent',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'If your email is registered, you will receive password reset instructions.' }
            }
        }
    }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('user-agent')),
    __param(2, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password with token',
        description: 'Completes the password reset process using the token sent to the user\'s email'
    }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.ResetPasswordDto,
        description: 'Reset token from email and new password'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password successfully reset',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password has been reset successfully. You can now log in with your new password.' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token, token expired, or passwords do not match' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('user-agent')),
    __param(2, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user profile',
        description: 'Returns the profile information of the currently authenticated user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current user profile',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' },
                email: { type: 'string', example: 'user@mindlyf.com' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                role: { type: 'string', example: 'user' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    (0, swagger_1.ApiProduces)('application/json'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('validate-token'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a JWT token' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Token is valid and user information is returned',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Token is invalid or expired',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Service-Name',
        description: 'Name of the service making the request',
        required: true,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Post)('validate-service-token'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a service-to-service token' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Service token is valid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Service token is invalid',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Service-Name',
        description: 'Name of the service making the request',
        required: true,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('X-Service-Name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateServiceToken", null);
__decorate([
    (0, common_1.Post)('revoke-token'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a JWT token' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Token has been revoked',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Invalid service token',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Service-Name',
        description: 'Name of the service making the request',
        required: true,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeToken", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get user information (service-to-service)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User information retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'User not found',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Service-Name',
        description: 'Name of the service making the request',
        required: true,
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserInfo", null);
__decorate([
    (0, common_1.Get)('users/:userId/subscription-status'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get user subscription status (Service-to-Service)' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Service-Name', description: 'Name of the requesting service' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID to get subscription status for' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User subscription status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        role: { type: 'string' }
                    }
                },
                subscription: {
                    type: 'object',
                    properties: {
                        hasActiveSubscription: { type: 'boolean' },
                        subscriptions: { type: 'array' },
                        userType: { type: 'string' },
                        organizationId: { type: 'string', nullable: true },
                        canMakePayments: { type: 'boolean' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserSubscriptionStatus", null);
__decorate([
    (0, common_1.Post)('users/:userId/payment-notification'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Receive payment notifications from payment service (Service-to-Service)' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Service-Name', description: 'Name of the requesting service (should be payment-service)' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID for the payment notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment notification processed successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handlePaymentNotification", null);
__decorate([
    (0, common_1.Post)('validate-payment-access'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Validate if user can make payments (Service-to-Service)' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Service-Name', description: 'Name of the requesting service (should be payment-service)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment access validation result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validatePaymentAccess", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
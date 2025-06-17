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
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const public_decorator_1 = require("./decorators/public.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async registerTherapist(registerDto) {
        return this.authService.registerTherapist(registerDto);
    }
    async registerOrganizationUser(registerDto) {
        return this.authService.registerOrganizationUser(registerDto);
    }
    async registerSupportTeam(registerDto) {
        return this.authService.registerSupportTeam(registerDto);
    }
    async refreshToken(refreshDto) {
        return this.authService.refreshToken(refreshDto);
    }
    async forgotPassword(forgotDto) {
        return this.authService.forgotPassword(forgotDto);
    }
    async resetPassword(resetDto) {
        return this.authService.resetPassword(resetDto);
    }
    async verifyEmail(verifyDto) {
        return this.authService.verifyEmail(verifyDto);
    }
    async getProfile(req) {
        return this.authService.getProfile(req.user.userId);
    }
    async changePassword(req, changePasswordDto) {
        return this.authService.changePassword(req.user.userId, changePasswordDto);
    }
    async logout(req) {
        return this.authService.logout(req.user.userId);
    }
    async revokeToken(revokeDto) {
        return this.authService.revokeToken(revokeDto);
    }
    async validateToken(req) {
        return this.authService.validateToken(req.user);
    }
    async validateServiceToken(tokenDto) {
        return this.authService.validateServiceToken(tokenDto);
    }
    async validatePaymentAccess(req, paymentDto) {
        return this.authService.validatePaymentAccess(req.user.userId, paymentDto);
    }
};
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User login', description: 'Authenticate user with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user', description: 'Register adult user (18+) or minor user (<18) with guardian information' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register/therapist'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new therapist', description: 'Register therapist with license verification' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Therapist successfully registered' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerTherapist", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register/organization-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Register organization user', description: 'Register user for healthcare organization' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Organization user successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerOrganizationUser", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register/support-team'),
    (0, swagger_1.ApiOperation)({ summary: 'Register support team member', description: 'Register support team user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Support team user successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerSupportTeam", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh JWT token', description: 'Get new access token using refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset', description: 'Send password reset email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token', description: 'Reset password using token from email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password successfully reset' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token or password' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email address', description: 'Verify email using token from email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email successfully verified' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid verification token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile', description: 'Get authenticated user information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password', description: 'Change password for authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password successfully changed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid current password' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User logout', description: 'Logout user and invalidate tokens' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully logged out' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('revoke-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke refresh token', description: 'Revoke specific refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token successfully revoked' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeToken", null);
__decorate([
    (0, common_1.Post)('validate-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate JWT token', description: 'Validate if JWT token is valid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token is valid' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid token' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Post)('validate-service-token'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate service token', description: 'Validate service-to-service token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service token is valid' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid service token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateServiceToken", null);
__decorate([
    (0, common_1.Post)('validate-payment-access'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate payment access', description: 'Check if user has payment access' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment access validated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validatePaymentAccess", null);
AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
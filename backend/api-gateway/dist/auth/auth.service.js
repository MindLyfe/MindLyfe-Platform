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
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, httpService, configService) {
        this.jwtService = jwtService;
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.authServiceUrl = this.configService.get('services.auth.url');
    }
    async validateUserById(userId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/api/users/${userId}`).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Failed to validate user: ${error.message}`);
                return Promise.reject(new common_1.UnauthorizedException('Invalid user'));
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error validating user: ${error.message}`);
            return null;
        }
    }
    async login(loginDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/login`, loginDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Login failed: ${error.message}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Login error: ${error.message}`);
            throw error;
        }
    }
    async register(registerDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/register`, registerDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Registration failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Registration error: ${error.message}`);
            throw error;
        }
    }
    async registerTherapist(registerDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/register/therapist`, registerDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Therapist registration failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Therapist registration error: ${error.message}`);
            throw error;
        }
    }
    async registerOrganizationUser(registerDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/register/organization-user`, registerDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Organization user registration failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Organization user registration error: ${error.message}`);
            throw error;
        }
    }
    async registerSupportTeam(registerDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/register/support-team`, registerDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Support team registration failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Support team registration error: ${error.message}`);
            throw error;
        }
    }
    async refreshToken(refreshDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/refresh-token`, refreshDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Token refresh failed: ${error.message}`);
                throw new common_1.UnauthorizedException('Invalid refresh token');
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Token refresh error: ${error.message}`);
            throw error;
        }
    }
    async forgotPassword(forgotDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/forgot-password`, forgotDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Forgot password failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Forgot password error: ${error.message}`);
            throw error;
        }
    }
    async resetPassword(resetDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/reset-password`, resetDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Reset password failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Reset password error: ${error.message}`);
            throw error;
        }
    }
    async verifyEmail(verifyDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/verify-email`, verifyDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Email verification failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Email verification error: ${error.message}`);
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/api/auth/me`, {
                headers: { 'x-user-id': userId }
            }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Get profile failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Get profile error: ${error.message}`);
            throw error;
        }
    }
    async changePassword(userId, changePasswordDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.authServiceUrl}/api/auth/change-password`, changePasswordDto, {
                headers: { 'x-user-id': userId }
            }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Change password failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Change password error: ${error.message}`);
            throw error;
        }
    }
    async logout(userId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/logout`, {}, {
                headers: { 'x-user-id': userId }
            }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Logout failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Logout error: ${error.message}`);
            throw error;
        }
    }
    async revokeToken(revokeDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/revoke-token`, revokeDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Revoke token failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Revoke token error: ${error.message}`);
            throw error;
        }
    }
    async validateToken(user) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/validate-token`, { user }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Validate token failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Validate token error: ${error.message}`);
            throw error;
        }
    }
    async validateServiceToken(tokenDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/validate-service-token`, tokenDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Validate service token failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Validate service token error: ${error.message}`);
            throw error;
        }
    }
    async validatePaymentAccess(userId, paymentDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/validate-payment-access`, paymentDto, {
                headers: { 'x-user-id': userId }
            }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Validate payment access failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Validate payment access error: ${error.message}`);
            throw error;
        }
    }
};
AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        axios_1.HttpService,
        config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
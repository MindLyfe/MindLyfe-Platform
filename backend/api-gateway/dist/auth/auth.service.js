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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/users/${userId}`).pipe((0, rxjs_1.catchError)((error) => {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto).pipe((0, rxjs_1.catchError)((error) => {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/auth/register`, registerDto).pipe((0, rxjs_1.catchError)((error) => {
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
    async refreshToken(token) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/auth/refresh-token`, { token }).pipe((0, rxjs_1.catchError)((error) => {
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
    async forgotPassword(email) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/auth/forgot-password`, { email }).pipe((0, rxjs_1.catchError)((error) => {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/auth/reset-password`, resetDto).pipe((0, rxjs_1.catchError)((error) => {
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
};
AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        axios_1.HttpService,
        config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
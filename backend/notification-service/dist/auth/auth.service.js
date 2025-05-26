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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const rxjs_1 = require("rxjs");
let AuthService = class AuthService {
    constructor(httpService, jwtService, configService) {
        this.httpService = httpService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authServiceUrl = this.configService.get('services.authServiceUrl');
    }
    async validateToken(payload) {
        var _a;
        if (!payload || !payload.sub) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        try {
            const decodedToken = this.jwtService.verify(payload.raw || payload, { secret: this.configService.get('jwt.secret') });
            const user = {
                id: decodedToken.sub || decodedToken.id,
                email: decodedToken.email,
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName,
                role: decodedToken.role,
                roles: decodedToken.roles || [decodedToken.role],
                token: payload.raw,
            };
            return user;
        }
        catch (error) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/api/auth/validate-token`, {
                    token: payload.raw || payload,
                }));
                if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.user) {
                    return Object.assign(Object.assign({}, response.data.user), { token: payload.raw });
                }
                throw new common_1.UnauthorizedException('Token validation failed');
            }
            catch (httpError) {
                console.error('Token validation error:', httpError.message);
                throw new common_1.UnauthorizedException('Invalid token or auth service unavailable');
            }
        }
    }
    async getUserById(userId, token) {
        var _a;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/api/auth/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }));
            if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.user) {
                return response.data.user;
            }
            throw new common_1.UnauthorizedException('User not found');
        }
        catch (error) {
            console.error('Get user error:', error.message);
            throw new common_1.UnauthorizedException('Unable to get user information');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
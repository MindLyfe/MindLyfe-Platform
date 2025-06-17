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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let UserService = UserService_1 = class UserService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(UserService_1.name);
        this.authServiceUrl = this.configService.get('services.auth.url');
    }
    async getAllUsers() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/api/users`).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Get all users failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Get all users error: ${error.message}`);
            throw error;
        }
    }
    async getUserById(id) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/api/users/${id}`).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Get user by ID failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Get user by ID error: ${error.message}`);
            throw error;
        }
    }
    async updateUser(id, updateDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.authServiceUrl}/api/users/${id}`, updateDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Update user failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Update user error: ${error.message}`);
            throw error;
        }
    }
    async deleteUser(id) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(`${this.authServiceUrl}/api/users/${id}`).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Delete user failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Delete user error: ${error.message}`);
            throw error;
        }
    }
    async updateUserPassword(id, passwordDto) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.authServiceUrl}/api/users/${id}/password`, passwordDto).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Update user password failed: ${error.message}`);
                throw error;
            })));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Update user password error: ${error.message}`);
            throw error;
        }
    }
};
UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
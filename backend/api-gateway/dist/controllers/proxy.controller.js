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
var ProxyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyController = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("../services/proxy.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let ProxyController = ProxyController_1 = class ProxyController {
    constructor(proxyService) {
        this.proxyService = proxyService;
        this.logger = new common_1.Logger(ProxyController_1.name);
    }
    async proxyAuth(req, res) {
        return this.proxyToService('auth', req, res);
    }
    async proxyAi(req, res) {
        return this.proxyToService('ai', req, res);
    }
    async proxyJournal(req, res) {
        return this.proxyToService('journal', req, res);
    }
    async proxyRecommender(req, res) {
        return this.proxyToService('recommender', req, res);
    }
    async proxyLyfbot(req, res) {
        return this.proxyToService('lyfbot', req, res);
    }
    async proxyChat(req, res) {
        return this.proxyToService('chat', req, res);
    }
    async proxyTeletherapy(req, res) {
        return this.proxyToService('teletherapy', req, res);
    }
    async proxyCommunity(req, res) {
        return this.proxyToService('community', req, res);
    }
    async proxyNotification(req, res) {
        return this.proxyToService('notification', req, res);
    }
    async proxyUser(req, res) {
        return this.proxyToService('user', req, res);
    }
    async proxyToService(serviceName, req, res) {
        try {
            const path = req.url;
            const method = req.method;
            const body = req.body;
            const headers = Object.assign({}, req.headers);
            const params = req.query;
            delete headers.host;
            delete headers.connection;
            delete headers['content-length'];
            this.logger.log(`Proxying ${method} ${path} to ${serviceName} service`);
            const response = await this.proxyService.forwardRequest(serviceName, path, method, body, headers, params);
            Object.keys(response.headers).forEach(key => {
                if (key.toLowerCase() !== 'transfer-encoding' &&
                    key.toLowerCase() !== 'connection' &&
                    key.toLowerCase() !== 'content-encoding') {
                    res.setHeader(key, response.headers[key]);
                }
            });
            res.status(response.status).json(response.data);
        }
        catch (error) {
            this.logger.error(`Error proxying to ${serviceName}:`, error.message);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Service temporarily unavailable',
                service: serviceName,
            });
        }
    }
};
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.All)('auth/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyAuth", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('ai/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyAi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('journal/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyJournal", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('recommender/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyRecommender", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('lyfbot/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyLyfbot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('chat/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyChat", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('teletherapy/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyTeletherapy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('community/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyCommunity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('notifications/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyNotification", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.All)('users/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyUser", null);
ProxyController = ProxyController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], ProxyController);
exports.ProxyController = ProxyController;
//# sourceMappingURL=proxy.controller.js.map
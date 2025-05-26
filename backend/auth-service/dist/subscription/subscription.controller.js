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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const service_token_guard_1 = require("../auth/guards/service-token.guard");
const subscription_service_1 = require("./subscription.service");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getAvailablePlans(req) {
        return await this.subscriptionService.getAvailablePlans(req.user.id);
    }
    async getUserSubscriptionStatus(req) {
        return await this.subscriptionService.getUserSubscriptionStatus(req.user.id);
    }
    async createSubscription(req, createDto) {
        const fullDto = Object.assign(Object.assign({}, createDto), { userId: req.user.id });
        return await this.subscriptionService.createSubscription(fullDto);
    }
    async purchaseCredits(req, purchaseDto) {
        if (purchaseDto.credits <= 0 || purchaseDto.credits > 20) {
            throw new common_1.BadRequestException('Credits must be between 1 and 20');
        }
        const fullDto = Object.assign(Object.assign({}, purchaseDto), { userId: req.user.id });
        return await this.subscriptionService.purchaseCredits(fullDto);
    }
    async confirmPayment(paymentId) {
        return await this.subscriptionService.confirmPayment(paymentId);
    }
    async validateUserCanBookSession(userId) {
        return await this.subscriptionService.validateUserCanBookSession(userId);
    }
    async consumeSession(userId) {
        return await this.subscriptionService.consumeSession(userId);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available subscription plans for user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available plans retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getAvailablePlans", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user subscription status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription status retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUserSubscriptionStatus", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subscription' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subscription created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid subscription data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Post)('credits/purchase'),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase session credits' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Credits purchased successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid purchase data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "purchaseCredits", null);
__decorate([
    (0, common_1.Post)('payment/:paymentId/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm payment and activate subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed and subscription activated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Get)('validate-booking/:userId'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Validate if user can book a session (for teletherapy service)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking validation result' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "validateUserCanBookSession", null);
__decorate([
    (0, common_1.Post)('consume-session/:userId'),
    (0, common_1.UseGuards)(service_token_guard_1.ServiceTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Consume a session from user subscription (for teletherapy service)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session consumed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'No sessions available' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "consumeSession", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map
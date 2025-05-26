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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const organization_service_1 = require("./organization.service");
let OrganizationController = class OrganizationController {
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    async createOrganization(req, createDto) {
        const fullDto = Object.assign(Object.assign({}, createDto), { adminUserId: req.user.id });
        return await this.organizationService.createOrganization(fullDto);
    }
    async createOrganizationSubscription(req, organizationId, subscriptionDto) {
        const fullDto = Object.assign(Object.assign({}, subscriptionDto), { organizationId, adminUserId: req.user.id });
        return await this.organizationService.createOrganizationSubscription(fullDto);
    }
    async confirmOrganizationPayment(paymentId) {
        return await this.organizationService.confirmOrganizationPayment(paymentId);
    }
    async addUserToOrganization(req, organizationId, addUserDto) {
        const fullDto = Object.assign(Object.assign({}, addUserDto), { organizationId, adminUserId: req.user.id });
        return await this.organizationService.addUserToOrganization(fullDto);
    }
    async removeUserFromOrganization(req, organizationId, userId) {
        return await this.organizationService.removeUserFromOrganization(organizationId, userId, req.user.id);
    }
    async getOrganizationDetails(organizationId) {
        return await this.organizationService.getOrganizationDetails(organizationId);
    }
    async getMyOrganization(req) {
        return await this.organizationService.getUserOrganization(req.user.id);
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new organization' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Organization created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid organization data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createOrganization", null);
__decorate([
    (0, common_1.Post)(':organizationId/subscription'),
    (0, swagger_1.ApiOperation)({ summary: 'Create organization subscription payment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subscription payment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only organization admins can create subscriptions' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('organizationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createOrganizationSubscription", null);
__decorate([
    (0, common_1.Post)('payment/:paymentId/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm organization payment and activate subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed and organization activated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "confirmOrganizationPayment", null);
__decorate([
    (0, common_1.Post)(':organizationId/users/add'),
    (0, swagger_1.ApiOperation)({ summary: 'Add user to organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User added to organization successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only organization admins can add users' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('organizationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "addUserToOrganization", null);
__decorate([
    (0, common_1.Delete)(':organizationId/users/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove user from organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User removed from organization successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only organization admins can remove users' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('organizationId')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "removeUserFromOrganization", null);
__decorate([
    (0, common_1.Get)(':organizationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Organization details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Organization not found' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getOrganizationDetails", null);
__decorate([
    (0, common_1.Get)('my/organization'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user organization details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User organization details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User is not part of any organization' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getMyOrganization", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, swagger_1.ApiTags)('Organizations'),
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map
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
exports.FollowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const follows_service_1 = require("./follows.service");
const dto_1 = require("./dto");
let FollowsController = class FollowsController {
    constructor(followsService) {
        this.followsService = followsService;
    }
    async follow(dto, req) {
        return this.followsService.follow(dto, req.user);
    }
    async unfollow(userId, req) {
        return this.followsService.unfollow(userId, req.user);
    }
    async listFollows(query, req) {
        return this.followsService.listFollows(query, req.user);
    }
    async getFollowStats(req) {
        return this.followsService.getFollowStats(req.user);
    }
    async checkChatEligibility(dto, req) {
        return this.followsService.checkChatEligibility(dto, req.user);
    }
    async getChatEligibleUsers(req) {
        return this.followsService.getChatEligibleUsers(req.user);
    }
    async updateFollowSettings(followId, dto, req) {
        return this.followsService.updateFollowSettings(followId, dto, req.user);
    }
};
exports.FollowsController = FollowsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Follow a user (anonymous community context)',
        description: 'Follow another user. When both users follow each other, mutual follow is established and chat access is granted.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Successfully followed user' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request (already following, self-follow, etc.)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateFollowDto, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "follow", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Unfollow a user',
        description: 'Remove follow relationship. If this was a mutual follow, chat access will be revoked.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully unfollowed user' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Follow relationship not found' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "unfollow", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List follow relationships',
        description: 'Get list of followers, following, or mutual follows with anonymized user information.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of follow relationships' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FollowListQueryDto, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "listFollows", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get follow statistics',
        description: 'Get counts of followers, following, mutual follows, and chat-eligible users.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Follow statistics' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowStats", null);
__decorate([
    (0, common_1.Post)('check-chat-eligibility'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if you can chat with a specific user',
        description: 'Verify if mutual follow relationship exists and chat access is granted.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat eligibility status' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ChatEligibilityDto, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "checkChatEligibility", null);
__decorate([
    (0, common_1.Get)('chat-partners'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all chat-eligible users',
        description: 'List all users you have mutual follows with and can chat with. This provides the bridge to chat service.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of chat partners' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getChatEligibleUsers", null);
__decorate([
    (0, common_1.Patch)(':followId/settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update follow privacy settings',
        description: 'Update privacy settings for a follow relationship (notifications, chat permissions, etc.).'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Follow relationship not found' }),
    __param(0, (0, common_1.Param)('followId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateFollowDto, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "updateFollowSettings", null);
exports.FollowsController = FollowsController = __decorate([
    (0, swagger_1.ApiTags)('Follows'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('follows'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [follows_service_1.FollowsService])
], FollowsController);
//# sourceMappingURL=follows.controller.js.map
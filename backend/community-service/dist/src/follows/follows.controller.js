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
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const follows_service_1 = require("./follows.service");
const create_follow_dto_1 = require("./dto/create-follow.dto");
let FollowsController = class FollowsController {
    constructor(followsService) {
        this.followsService = followsService;
    }
    async createFollow(createFollowDto, user) {
        return this.followsService.createFollow(createFollowDto, user.id);
    }
    async removeFollow(id, user) {
        await this.followsService.removeFollow(id, user.id);
        return { success: true };
    }
    async getFollowers(user) {
        return this.followsService.getFollowers(user.id);
    }
    async getFollowing(user) {
        return this.followsService.getFollowing(user.id);
    }
    async blockFollow(id, user) {
        await this.followsService.blockFollow(id, user.id);
        return { success: true };
    }
    async checkFollows(followerId, followedId, checkBothDirections) {
        return this.followsService.checkFollows(followerId, followedId, checkBothDirections === true);
    }
};
exports.FollowsController = FollowsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Follow a user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully followed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_follow_dto_1.CreateFollowDto, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "createFollow", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Unfollow a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User successfully unfollowed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Follow relationship not found' }),
    (0, roles_decorator_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "removeFollow", null);
__decorate([
    (0, common_1.Get)('followers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get users following the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of followers returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)('following'),
    (0, swagger_1.ApiOperation)({ summary: 'Get users that the current user follows' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of followed users returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Post)('block/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Block a user from following' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User successfully blocked' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "blockFollow", null);
__decorate([
    (0, common_1.Get)('check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a follow relationship exists' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Follow check result returned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiQuery)({ name: 'followerId', required: true, description: 'ID of the potential follower' }),
    (0, swagger_1.ApiQuery)({ name: 'followedId', required: true, description: 'ID of the potentially followed user' }),
    (0, swagger_1.ApiQuery)({ name: 'checkBothDirections', required: false, type: Boolean, description: 'Whether to check both directions' }),
    (0, roles_decorator_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Query)('followerId')),
    __param(1, (0, common_1.Query)('followedId')),
    __param(2, (0, common_1.Query)('checkBothDirections')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "checkFollows", null);
exports.FollowsController = FollowsController = __decorate([
    (0, swagger_1.ApiTags)('follows'),
    (0, common_1.Controller)('follows'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [follows_service_1.FollowsService])
], FollowsController);
//# sourceMappingURL=follows.controller.js.map
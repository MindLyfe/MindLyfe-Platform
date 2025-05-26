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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const follow_entity_1 = require("./entities/follow.entity");
const auth_client_1 = require("@mindlyf/shared/auth-client");
let FollowsService = class FollowsService {
    constructor(followRepository, authClient) {
        this.followRepository = followRepository;
        this.authClient = authClient;
    }
    async createFollow(createFollowDto, currentUserId) {
        await this.authClient.validateUser(currentUserId);
        await this.authClient.validateUser(createFollowDto.followedId);
        if (currentUserId === createFollowDto.followedId) {
            throw new common_1.BadRequestException('You cannot follow yourself');
        }
        const existingFollow = await this.followRepository.findOne({
            where: {
                followerId: currentUserId,
                followedId: createFollowDto.followedId,
            },
        });
        if (existingFollow) {
            if (existingFollow.isBlocked) {
                throw new common_1.ForbiddenException('You are blocked from following this user');
            }
            if (existingFollow.deletedAt) {
                await this.followRepository.restore(existingFollow.id);
                return this.followRepository.findOne({ where: { id: existingFollow.id } });
            }
            throw new common_1.BadRequestException('You are already following this user');
        }
        const follow = this.followRepository.create({
            followerId: currentUserId,
            followedId: createFollowDto.followedId,
            isAccepted: true,
            metadata: createFollowDto.metadata || {},
        });
        return this.followRepository.save(follow);
    }
    async removeFollow(followedId, currentUserId) {
        const follow = await this.followRepository.findOne({
            where: {
                followerId: currentUserId,
                followedId: followedId,
            },
        });
        if (!follow) {
            throw new common_1.NotFoundException('Follow relationship not found');
        }
        await this.followRepository.softDelete(follow.id);
    }
    async getFollowers(userId) {
        return this.followRepository.find({
            where: {
                followedId: userId,
                isAccepted: true,
                isBlocked: false,
            },
            relations: ['follower'],
        });
    }
    async getFollowing(userId) {
        return this.followRepository.find({
            where: {
                followerId: userId,
                isAccepted: true,
                isBlocked: false,
            },
            relations: ['followed'],
        });
    }
    async blockFollow(followerId, currentUserId) {
        const follow = await this.followRepository.findOne({
            where: {
                followerId: followerId,
                followedId: currentUserId,
            },
        });
        if (!follow) {
            const blockedFollow = this.followRepository.create({
                followerId: followerId,
                followedId: currentUserId,
                isBlocked: true,
                isAccepted: false,
            });
            await this.followRepository.save(blockedFollow);
            return;
        }
        follow.isBlocked = true;
        follow.isAccepted = false;
        await this.followRepository.save(follow);
    }
    async checkFollows(followerId, followedId, checkBothDirections = false) {
        const directFollow = await this.followRepository.findOne({
            where: {
                followerId: followerId,
                followedId: followedId,
                isAccepted: true,
                isBlocked: false,
            },
        });
        if (directFollow) {
            return { follows: true };
        }
        if (checkBothDirections) {
            const reverseFollow = await this.followRepository.findOne({
                where: {
                    followerId: followedId,
                    followedId: followerId,
                    isAccepted: true,
                    isBlocked: false,
                },
            });
            if (reverseFollow) {
                return { follows: true };
            }
        }
        return { follows: false };
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof auth_client_1.AuthClientService !== "undefined" && auth_client_1.AuthClientService) === "function" ? _a : Object])
], FollowsService);
//# sourceMappingURL=follows.service.js.map
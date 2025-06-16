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
var FollowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const follow_entity_1 = require("./entities/follow.entity");
const user_entity_1 = require("../users/entities/user.entity");
const anonymity_service_1 = require("../common/services/anonymity.service");
const user_mapping_service_1 = require("../common/services/user-mapping.service");
const community_gateway_1 = require("../community.gateway");
let FollowsService = FollowsService_1 = class FollowsService {
    constructor(followRepo, userRepo, anonymityService, userMappingService, gateway) {
        this.followRepo = followRepo;
        this.userRepo = userRepo;
        this.anonymityService = anonymityService;
        this.userMappingService = userMappingService;
        this.gateway = gateway;
        this.logger = new common_1.Logger(FollowsService_1.name);
    }
    async follow(dto, followerUser) {
        try {
            const followerEntity = await this.userRepo.findOne({
                where: { authId: followerUser.id }
            });
            if (!followerEntity) {
                throw new common_1.BadRequestException('Follower user not found');
            }
            const validation = await this.userMappingService.validateFollowTarget(dto.followingId, followerUser.id);
            if (!validation.isValid) {
                throw new common_1.BadRequestException(validation.reason);
            }
            const followingUserId = validation.targetUserId;
            const followingEntity = await this.userRepo.findOne({
                where: { id: followingUserId }
            });
            if (!followingEntity) {
                throw new common_1.NotFoundException('User to follow not found');
            }
            if (followerEntity.id === followingEntity.id) {
                throw new common_1.BadRequestException('Cannot follow yourself');
            }
            const existingFollow = await this.followRepo.findOne({
                where: {
                    followerId: followerEntity.id,
                    followingId: followingEntity.id,
                    status: follow_entity_1.FollowStatus.ACTIVE
                }
            });
            if (existingFollow) {
                throw new common_1.BadRequestException('Already following this user');
            }
            const follow = this.followRepo.create({
                followerId: followerEntity.id,
                followingId: followingEntity.id,
                status: follow_entity_1.FollowStatus.ACTIVE,
                privacySettings: {
                    allowChatInvitation: true,
                    notifyOnFollow: true,
                    notifyOnMutualFollow: true,
                    allowRealNameInChat: true,
                },
                metadata: {
                    followSource: dto.followSource,
                    sourceContentId: dto.sourceContentId,
                    mutualInterests: dto.mutualInterests,
                }
            });
            const savedFollow = await this.followRepo.save(follow);
            const reverseFollow = await this.followRepo.findOne({
                where: {
                    followerId: followingEntity.id,
                    followingId: followerEntity.id,
                    status: follow_entity_1.FollowStatus.ACTIVE
                }
            });
            let isMutualFollow = false;
            if (reverseFollow) {
                await this.followRepo.update({ id: savedFollow.id }, {
                    isMutualFollow: true,
                    mutualFollowEstablishedAt: new Date(),
                    chatAccessGranted: true,
                    chatAccessGrantedAt: new Date()
                });
                await this.followRepo.update({ id: reverseFollow.id }, {
                    isMutualFollow: true,
                    mutualFollowEstablishedAt: new Date(),
                    chatAccessGranted: true,
                    chatAccessGrantedAt: new Date()
                });
                isMutualFollow = true;
                this.gateway.emitEvent('mutualFollowEstablished', {
                    user1Id: followerEntity.id,
                    user2Id: followingEntity.id,
                    chatAccessGranted: true
                });
                this.logger.log(`Mutual follow established between users ${followerEntity.id} and ${followingEntity.id}`);
            }
            const followerAnonymous = this.anonymityService.generateAnonymousIdentity(followerEntity.authId);
            const followingAnonymous = this.anonymityService.generateAnonymousIdentity(followingEntity.authId);
            this.gateway.emitEvent('userFollowed', {
                followerId: followerAnonymous.id,
                followerName: followerAnonymous.displayName,
                followingId: followingAnonymous.id,
                followingName: followingAnonymous.displayName,
                isMutualFollow
            });
            return {
                id: savedFollow.id,
                follower: {
                    id: followerAnonymous.id,
                    displayName: followerAnonymous.displayName,
                    avatarColor: followerAnonymous.avatarColor
                },
                following: {
                    id: followingAnonymous.id,
                    displayName: followingAnonymous.displayName,
                    avatarColor: followingAnonymous.avatarColor
                },
                isMutualFollow,
                chatAccessGranted: savedFollow.chatAccessGranted,
                createdAt: savedFollow.createdAt
            };
        }
        catch (error) {
            this.logger.error(`Failed to create follow: ${error.message}`, error.stack);
            throw error;
        }
    }
    async unfollow(followingAnonymousId, followerUser) {
        try {
            const followerEntity = await this.userRepo.findOne({
                where: { authId: followerUser.id }
            });
            if (!followerEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const followingUserId = await this.userMappingService.anonymousIdToRealUserId(followingAnonymousId);
            const follow = await this.followRepo.findOne({
                where: {
                    followerId: followerEntity.id,
                    followingId: followingUserId,
                    status: follow_entity_1.FollowStatus.ACTIVE
                }
            });
            if (!follow) {
                throw new common_1.NotFoundException('Follow relationship not found');
            }
            if (follow.isMutualFollow) {
                await this.followRepo.update({
                    followerId: followingUserId,
                    followingId: followerEntity.id
                }, {
                    isMutualFollow: false,
                    chatAccessGranted: false,
                    mutualFollowEstablishedAt: null,
                    chatAccessGrantedAt: null
                });
                this.gateway.emitEvent('mutualFollowBroken', {
                    user1Id: followerEntity.id,
                    user2Id: followingUserId,
                    chatAccessRevoked: true
                });
            }
            await this.followRepo.remove(follow);
            this.gateway.emitEvent('userUnfollowed', {
                followerId: followerEntity.id,
                followingId: followingUserId
            });
            this.logger.log(`User ${followerEntity.id} unfollowed ${followingUserId}`);
        }
        catch (error) {
            this.logger.error(`Failed to unfollow: ${error.message}`, error.stack);
            throw error;
        }
    }
    async listFollows(query, user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const page = Math.max(1, parseInt(query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
            const skip = (page - 1) * limit;
            let queryBuilder = this.followRepo.createQueryBuilder('follow')
                .leftJoinAndSelect('follow.follower', 'follower')
                .leftJoinAndSelect('follow.following', 'following')
                .where('follow.status = :status', { status: query.status || follow_entity_1.FollowStatus.ACTIVE });
            switch (query.type) {
                case 'followers':
                    queryBuilder = queryBuilder.andWhere('follow.followingId = :userId', { userId: userEntity.id });
                    break;
                case 'following':
                    queryBuilder = queryBuilder.andWhere('follow.followerId = :userId', { userId: userEntity.id });
                    break;
                case 'mutual':
                    queryBuilder = queryBuilder.andWhere('(follow.followerId = :userId OR follow.followingId = :userId) AND follow.isMutualFollow = true', { userId: userEntity.id });
                    break;
                default:
                    queryBuilder = queryBuilder.andWhere('(follow.followerId = :userId OR follow.followingId = :userId)', { userId: userEntity.id });
            }
            queryBuilder = queryBuilder
                .orderBy('follow.createdAt', 'DESC')
                .skip(skip)
                .take(limit);
            const [follows, total] = await queryBuilder.getManyAndCount();
            const anonymizedFollows = follows.map(follow => {
                const followerAnonymous = this.anonymityService.generateAnonymousIdentity(follow.follower.authId);
                const followingAnonymous = this.anonymityService.generateAnonymousIdentity(follow.following.authId);
                return {
                    id: follow.id,
                    follower: {
                        id: followerAnonymous.id,
                        displayName: followerAnonymous.displayName,
                        avatarColor: followerAnonymous.avatarColor,
                        role: follow.follower.role,
                        isVerifiedTherapist: follow.follower.isVerifiedTherapist
                    },
                    following: {
                        id: followingAnonymous.id,
                        displayName: followingAnonymous.displayName,
                        avatarColor: followingAnonymous.avatarColor,
                        role: follow.following.role,
                        isVerifiedTherapist: follow.following.isVerifiedTherapist
                    },
                    isMutualFollow: follow.isMutualFollow,
                    chatAccessGranted: follow.chatAccessGranted,
                    createdAt: follow.createdAt,
                    mutualFollowEstablishedAt: follow.mutualFollowEstablishedAt
                };
            });
            return {
                items: anonymizedFollows,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to list follows: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getFollowStats(user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const [followersCount, followingCount, mutualFollowsCount] = await Promise.all([
                this.followRepo.count({
                    where: {
                        followingId: userEntity.id,
                        status: follow_entity_1.FollowStatus.ACTIVE
                    }
                }),
                this.followRepo.count({
                    where: {
                        followerId: userEntity.id,
                        status: follow_entity_1.FollowStatus.ACTIVE
                    }
                }),
                this.followRepo.count({
                    where: [
                        { followerId: userEntity.id, isMutualFollow: true, status: follow_entity_1.FollowStatus.ACTIVE },
                        { followingId: userEntity.id, isMutualFollow: true, status: follow_entity_1.FollowStatus.ACTIVE }
                    ]
                })
            ]);
            return {
                followersCount,
                followingCount,
                mutualFollowsCount: Math.floor(mutualFollowsCount / 2),
                chatEligibleUsersCount: Math.floor(mutualFollowsCount / 2)
            };
        }
        catch (error) {
            this.logger.error(`Failed to get follow stats: ${error.message}`, error.stack);
            throw error;
        }
    }
    async checkChatEligibility(dto, user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const targetUserId = await this.userMappingService.anonymousIdToRealUserId(dto.userId);
            const mutualFollow = await this.followRepo.findOne({
                where: [
                    {
                        followerId: userEntity.id,
                        followingId: targetUserId,
                        isMutualFollow: true,
                        chatAccessGranted: true,
                        status: follow_entity_1.FollowStatus.ACTIVE
                    },
                    {
                        followerId: targetUserId,
                        followingId: userEntity.id,
                        isMutualFollow: true,
                        chatAccessGranted: true,
                        status: follow_entity_1.FollowStatus.ACTIVE
                    }
                ],
                relations: ['follower', 'following']
            });
            const canChat = !!mutualFollow;
            let chatPartner = null;
            if (canChat && mutualFollow) {
                const partnerId = mutualFollow.followerId === userEntity.id
                    ? mutualFollow.followingId
                    : mutualFollow.followerId;
                const partnerEntity = mutualFollow.followerId === userEntity.id
                    ? mutualFollow.following
                    : mutualFollow.follower;
                const partnerAnonymous = this.anonymityService.generateAnonymousIdentity(partnerEntity.authId);
                chatPartner = {
                    anonymousId: partnerAnonymous.id,
                    displayName: partnerAnonymous.displayName,
                    avatarColor: partnerAnonymous.avatarColor,
                    role: partnerEntity.role,
                    isVerifiedTherapist: partnerEntity.isVerifiedTherapist,
                    realUserId: partnerId,
                    allowRealNameInChat: mutualFollow.privacySettings?.allowRealNameInChat ?? true
                };
            }
            return {
                canChat,
                chatPartner,
                mutualFollowEstablishedAt: mutualFollow?.mutualFollowEstablishedAt,
                chatAccessGrantedAt: mutualFollow?.chatAccessGrantedAt
            };
        }
        catch (error) {
            this.logger.error(`Failed to check chat eligibility: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getChatEligibleUsers(user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const mutualFollows = await this.followRepo.find({
                where: [
                    {
                        followerId: userEntity.id,
                        isMutualFollow: true,
                        chatAccessGranted: true,
                        status: follow_entity_1.FollowStatus.ACTIVE
                    },
                    {
                        followingId: userEntity.id,
                        isMutualFollow: true,
                        chatAccessGranted: true,
                        status: follow_entity_1.FollowStatus.ACTIVE
                    }
                ],
                relations: ['follower', 'following'],
                order: { mutualFollowEstablishedAt: 'DESC' }
            });
            const chatPartners = new Map();
            for (const follow of mutualFollows) {
                const partnerId = follow.followerId === userEntity.id
                    ? follow.followingId
                    : follow.followerId;
                if (!chatPartners.has(partnerId)) {
                    const partnerEntity = follow.followerId === userEntity.id
                        ? follow.following
                        : follow.follower;
                    const partnerAnonymous = this.anonymityService.generateAnonymousIdentity(partnerEntity.authId);
                    chatPartners.set(partnerId, {
                        anonymousId: partnerAnonymous.id,
                        displayName: partnerAnonymous.displayName,
                        avatarColor: partnerAnonymous.avatarColor,
                        role: partnerEntity.role,
                        isVerifiedTherapist: partnerEntity.isVerifiedTherapist,
                        mutualFollowEstablishedAt: follow.mutualFollowEstablishedAt,
                        chatAccessGrantedAt: follow.chatAccessGrantedAt,
                        lastActiveAt: partnerEntity.lastActiveAt,
                        realUserId: partnerId,
                        allowRealNameInChat: follow.privacySettings?.allowRealNameInChat ?? true
                    });
                }
            }
            return {
                chatPartners: Array.from(chatPartners.values()),
                totalCount: chatPartners.size
            };
        }
        catch (error) {
            this.logger.error(`Failed to get chat eligible users: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateFollowSettings(followId, dto, user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const follow = await this.followRepo.findOne({
                where: {
                    id: followId,
                    followerId: userEntity.id
                }
            });
            if (!follow) {
                throw new common_1.NotFoundException('Follow relationship not found');
            }
            const updatedPrivacySettings = {
                ...follow.privacySettings,
                ...(dto.allowChatInvitation !== undefined && { allowChatInvitation: dto.allowChatInvitation }),
                ...(dto.notifyOnFollow !== undefined && { notifyOnFollow: dto.notifyOnFollow }),
                ...(dto.notifyOnMutualFollow !== undefined && { notifyOnMutualFollow: dto.notifyOnMutualFollow }),
                ...(dto.allowRealNameInChat !== undefined && { allowRealNameInChat: dto.allowRealNameInChat })
            };
            await this.followRepo.update(followId, {
                status: dto.status || follow.status,
                privacySettings: updatedPrivacySettings
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to update follow settings: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = FollowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        anonymity_service_1.AnonymityService,
        user_mapping_service_1.UserMappingService,
        community_gateway_1.CommunityGateway])
], FollowsService);
//# sourceMappingURL=follows.service.js.map
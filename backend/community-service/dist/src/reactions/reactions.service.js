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
var ReactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reaction_entity_1 = require("./entities/reaction.entity");
const post_entity_1 = require("../posts/entities/post.entity");
const comment_entity_1 = require("../comments/entities/comment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const anonymity_service_1 = require("../common/services/anonymity.service");
const community_gateway_1 = require("../community.gateway");
let ReactionsService = ReactionsService_1 = class ReactionsService {
    constructor(reactionRepo, postRepo, commentRepo, userRepo, anonymityService, gateway) {
        this.reactionRepo = reactionRepo;
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.userRepo = userRepo;
        this.anonymityService = anonymityService;
        this.gateway = gateway;
        this.logger = new common_1.Logger(ReactionsService_1.name);
    }
    async add(dto, user) {
        try {
            if (!dto.postId && !dto.commentId) {
                throw new common_1.BadRequestException('Must provide either postId or commentId');
            }
            if (dto.postId && dto.commentId) {
                throw new common_1.BadRequestException('Cannot react to both post and comment simultaneously');
            }
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            if (dto.postId) {
                const post = await this.postRepo.findOne({ where: { id: dto.postId } });
                if (!post) {
                    throw new common_1.NotFoundException('Post not found');
                }
                if (post.privacySettings && !post.privacySettings.allowReactions) {
                    throw new common_1.BadRequestException('Reactions are not allowed on this post');
                }
            }
            if (dto.commentId) {
                const comment = await this.commentRepo.findOne({ where: { id: dto.commentId } });
                if (!comment) {
                    throw new common_1.NotFoundException('Comment not found');
                }
                if (comment.privacySettings && !comment.privacySettings.allowReactions) {
                    throw new common_1.BadRequestException('Reactions are not allowed on this comment');
                }
            }
            const existingReaction = await this.reactionRepo.findOne({
                where: {
                    userId: userEntity.id,
                    postId: dto.postId || null,
                    commentId: dto.commentId || null,
                    type: dto.type
                }
            });
            if (existingReaction) {
                throw new common_1.BadRequestException('You have already reacted with this reaction type');
            }
            const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.id, 'reaction');
            const reactionData = {
                userId: userEntity.id,
                postId: dto.postId || null,
                commentId: dto.commentId || null,
                type: dto.type,
                isAnonymous: true,
                pseudonym: anonymousIdentity.displayName
            };
            const reaction = this.reactionRepo.create(reactionData);
            const savedReaction = await this.reactionRepo.save(reaction);
            const reactionWithRelations = await this.reactionRepo.findOne({
                where: { id: savedReaction.id },
                relations: ['user']
            });
            const anonymizedReaction = this.anonymityService.anonymizeContentResponse(reactionWithRelations, anonymousIdentity);
            this.gateway.emitEvent('reactionAdded', {
                id: savedReaction.id,
                postId: savedReaction.postId,
                commentId: savedReaction.commentId,
                type: savedReaction.type,
                authorName: anonymousIdentity.displayName,
                isAnonymous: true
            });
            this.logger.log(`Anonymous reaction added: ${savedReaction.id} by ${anonymousIdentity.displayName}`);
            return anonymizedReaction;
        }
        catch (error) {
            this.logger.error(`Failed to add reaction: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(dto, user) {
        try {
            if (!dto.postId && !dto.commentId) {
                throw new common_1.BadRequestException('Must provide either postId or commentId');
            }
            if (dto.postId && dto.commentId) {
                throw new common_1.BadRequestException('Cannot specify both post and comment');
            }
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const existingReaction = await this.reactionRepo.findOne({
                where: {
                    userId: userEntity.id,
                    postId: dto.postId || null,
                    commentId: dto.commentId || null,
                    type: dto.type
                }
            });
            if (!existingReaction) {
                throw new common_1.NotFoundException('Reaction not found');
            }
            await this.reactionRepo.remove(existingReaction);
            this.gateway.emitEvent('reactionRemoved', {
                postId: existingReaction.postId,
                commentId: existingReaction.commentId,
                type: existingReaction.type,
                userId: userEntity.id
            });
            this.logger.log(`Reaction removed: ${existingReaction.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove reaction: ${error.message}`, error.stack);
            throw error;
        }
    }
    async list(query, user) {
        try {
            const where = {};
            if (query.postId) {
                where.postId = query.postId;
            }
            if (query.commentId) {
                where.commentId = query.commentId;
            }
            if (query.type && Object.values(reaction_entity_1.ReactionType).includes(query.type)) {
                where.type = query.type;
            }
            if (query.aggregate === 'true' || query.aggregate === true) {
                const reactions = await this.reactionRepo.find({
                    where,
                    relations: ['user']
                });
                const counts = reactions.reduce((acc, reaction) => {
                    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
                    return acc;
                }, {});
                let userReactions = {};
                if (user) {
                    const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
                    if (userEntity) {
                        userReactions = reactions
                            .filter(r => r.userId === userEntity.id)
                            .reduce((acc, r) => {
                            acc[r.type] = true;
                            return acc;
                        }, {});
                    }
                }
                return {
                    counts,
                    userReactions,
                    total: reactions.length
                };
            }
            const page = Math.max(1, parseInt(query.page) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
            const skip = (page - 1) * limit;
            const [reactions, total] = await this.reactionRepo.findAndCount({
                where,
                relations: ['user'],
                take: limit,
                skip,
                order: { createdAt: 'DESC' }
            });
            const anonymizedReactions = reactions.map(reaction => {
                const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(reaction.user.authId, 'reaction');
                return this.anonymityService.anonymizeContentResponse(reaction, anonymousIdentity);
            });
            return {
                items: anonymizedReactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to list reactions: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStatistics(query) {
        try {
            if (!query.postId && !query.commentId) {
                throw new common_1.BadRequestException('Must provide either postId or commentId');
            }
            const where = {};
            if (query.postId)
                where.postId = query.postId;
            if (query.commentId)
                where.commentId = query.commentId;
            const reactions = await this.reactionRepo.find({ where });
            const statistics = {
                total: reactions.length,
                byType: reactions.reduce((acc, reaction) => {
                    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
                    return acc;
                }, {}),
                mostPopular: null,
                approximateUniqueReactors: new Set(reactions.map(r => r.userId)).size
            };
            if (Object.keys(statistics.byType).length > 0) {
                statistics.mostPopular = Object.entries(statistics.byType)
                    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
            }
            return statistics;
        }
        catch (error) {
            this.logger.error(`Failed to get reaction statistics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getUserReactions(user, query) {
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
            const where = { userId: userEntity.id };
            if (query.type && Object.values(reaction_entity_1.ReactionType).includes(query.type)) {
                where.type = query.type;
            }
            const [reactions, total] = await this.reactionRepo.findAndCount({
                where,
                relations: ['post', 'comment'],
                take: limit,
                skip,
                order: { createdAt: 'DESC' }
            });
            const anonymizedReactions = reactions.map(reaction => {
                const result = {
                    id: reaction.id,
                    type: reaction.type,
                    createdAt: reaction.createdAt,
                    isAnonymous: reaction.isAnonymous
                };
                if (reaction.post) {
                    const postAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(reaction.post.author?.authId, 'post');
                    result['post'] = this.anonymityService.anonymizeContentResponse(reaction.post, postAnonymousIdentity);
                }
                if (reaction.comment) {
                    const commentAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(reaction.comment.author?.authId, 'comment');
                    result['comment'] = this.anonymityService.anonymizeContentResponse(reaction.comment, commentAnonymousIdentity);
                }
                return result;
            });
            return {
                items: anonymizedReactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get user reactions: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReactionsService = ReactionsService;
exports.ReactionsService = ReactionsService = ReactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reaction_entity_1.Reaction)),
    __param(1, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(2, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        anonymity_service_1.AnonymityService,
        community_gateway_1.CommunityGateway])
], ReactionsService);
//# sourceMappingURL=reactions.service.js.map
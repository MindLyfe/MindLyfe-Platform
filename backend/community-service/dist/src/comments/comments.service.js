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
var CommentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./entities/comment.entity");
const post_entity_1 = require("../posts/entities/post.entity");
const user_entity_1 = require("../users/entities/user.entity");
const anonymity_service_1 = require("../common/services/anonymity.service");
const privacy_service_1 = require("../common/services/privacy.service");
const moderation_service_1 = require("../common/services/moderation.service");
const community_gateway_1 = require("../community.gateway");
let CommentsService = CommentsService_1 = class CommentsService {
    constructor(commentRepo, postRepo, userRepo, anonymityService, privacyService, moderationService, gateway) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.anonymityService = anonymityService;
        this.privacyService = privacyService;
        this.moderationService = moderationService;
        this.gateway = gateway;
        this.logger = new common_1.Logger(CommentsService_1.name);
    }
    async create(dto, user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const post = await this.postRepo.findOne({
                where: { id: dto.postId },
                relations: ['author']
            });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            if (post.privacySettings && !post.privacySettings.allowComments) {
                throw new common_1.ForbiddenException('Comments are not allowed on this post');
            }
            let parentComment = null;
            if (dto.parentId) {
                parentComment = await this.commentRepo.findOne({
                    where: { id: dto.parentId, postId: dto.postId }
                });
                if (!parentComment) {
                    throw new common_1.NotFoundException('Parent comment not found');
                }
            }
            const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.id, 'comment');
            const commentData = {
                ...dto,
                authorId: userEntity.id,
                isAnonymous: true,
                pseudonym: anonymousIdentity.displayName,
                status: comment_entity_1.CommentStatus.ACTIVE,
                privacySettings: {
                    allowReplies: true,
                    allowReactions: true,
                    notifyOnReply: true,
                    notifyOnReaction: true,
                    notifyOnReport: false
                }
            };
            commentData.content = this.privacyService.sanitizeContent(commentData.content);
            const comment = this.commentRepo.create(commentData);
            const savedComment = await this.commentRepo.save(comment);
            await this.userRepo.update(userEntity.id, {
                commentCount: userEntity.commentCount + 1,
                lastActiveAt: new Date()
            });
            const commentWithRelations = await this.commentRepo.findOne({
                where: { id: savedComment.id },
                relations: ['author', 'post', 'parent']
            });
            const anonymizedComment = this.anonymityService.anonymizeContentResponse(commentWithRelations, anonymousIdentity);
            this.gateway.emitEvent('commentCreated', {
                id: savedComment.id,
                postId: savedComment.postId,
                authorName: anonymousIdentity.displayName,
                parentId: savedComment.parentId,
                isAnonymous: true
            });
            this.logger.log(`Anonymous comment created: ${savedComment.id} by ${anonymousIdentity.displayName}`);
            return anonymizedComment;
        }
        catch (error) {
            this.logger.error(`Failed to create comment: ${error.message}`, error.stack);
            throw error;
        }
    }
    async list(query, user) {
        try {
            if (!query.postId) {
                throw new common_1.BadRequestException('postId is required');
            }
            const page = Math.max(1, parseInt(query.page) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
            const skip = (page - 1) * limit;
            const queryBuilder = this.commentRepo.createQueryBuilder('comment')
                .leftJoinAndSelect('comment.author', 'author')
                .leftJoinAndSelect('comment.parent', 'parent')
                .leftJoinAndSelect('comment.replies', 'replies')
                .where('comment.postId = :postId', { postId: query.postId })
                .andWhere('comment.status = :status', { status: comment_entity_1.CommentStatus.ACTIVE });
            queryBuilder.orderBy('comment.createdAt', 'ASC');
            if (query.rootOnly !== 'false') {
                queryBuilder.andWhere('comment.parentId IS NULL');
            }
            queryBuilder.skip(skip).take(limit);
            const [comments, total] = await queryBuilder.getManyAndCount();
            const anonymizedComments = comments.map(comment => {
                const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(comment.author.authId, 'comment');
                const anonymized = this.anonymityService.anonymizeContentResponse(comment, anonymousIdentity);
                if (anonymized.replies) {
                    anonymized.replies = anonymized.replies.map(reply => {
                        const replyAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(reply.author?.authId, 'comment');
                        return this.anonymityService.anonymizeContentResponse(reply, replyAnonymousIdentity);
                    });
                }
                return anonymized;
            });
            return {
                items: anonymizedComments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to list comments: ${error.message}`, error.stack);
            throw error;
        }
    }
    async get(id, user) {
        try {
            const comment = await this.commentRepo.findOne({
                where: { id },
                relations: ['author', 'post', 'parent', 'replies', 'reactions']
            });
            if (!comment) {
                throw new common_1.NotFoundException('Comment not found');
            }
            if (comment.status !== comment_entity_1.CommentStatus.ACTIVE) {
                throw new common_1.NotFoundException('Comment not found');
            }
            const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(comment.author.authId, 'comment');
            const anonymizedComment = this.anonymityService.anonymizeContentResponse(comment, anonymousIdentity);
            if (anonymizedComment.replies) {
                anonymizedComment.replies = anonymizedComment.replies.map(reply => {
                    const replyAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(reply.author?.authId, 'comment');
                    return this.anonymityService.anonymizeContentResponse(reply, replyAnonymousIdentity);
                });
            }
            if (anonymizedComment.reactions) {
                anonymizedComment.reactions = anonymizedComment.reactions.map(reaction => {
                    const reactionAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(reaction.user?.authId, 'reaction');
                    return this.anonymityService.anonymizeContentResponse(reaction, reactionAnonymousIdentity);
                });
            }
            return anonymizedComment;
        }
        catch (error) {
            this.logger.error(`Failed to get comment ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(id, dto, user) {
        try {
            const comment = await this.commentRepo.findOne({
                where: { id },
                relations: ['author']
            });
            if (!comment) {
                throw new common_1.NotFoundException('Comment not found');
            }
            const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
            const isAuthor = comment.author.authId === user.id;
            const isModerator = userEntity?.role === user_entity_1.UserRole.MODERATOR || userEntity?.role === user_entity_1.UserRole.ADMIN;
            if (!isAuthor && !isModerator) {
                throw new common_1.ForbiddenException('You can only update your own comments');
            }
            if (dto.content) {
                dto.content = this.privacyService.sanitizeContent(dto.content);
            }
            await this.commentRepo.update(id, {
                ...dto,
                isAnonymous: true,
                updatedAt: new Date()
            });
            const updatedComment = await this.get(id, user);
            this.gateway.emitEvent('commentUpdated', {
                id: comment.id,
                postId: comment.postId,
                authorName: updatedComment.author.displayName
            });
            this.logger.log(`Comment updated: ${id}`);
            return updatedComment;
        }
        catch (error) {
            this.logger.error(`Failed to update comment ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async delete(id, user) {
        try {
            const comment = await this.commentRepo.findOne({
                where: { id },
                relations: ['author']
            });
            if (!comment) {
                throw new common_1.NotFoundException('Comment not found');
            }
            const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
            const isAuthor = comment.author.authId === user.id;
            const isModerator = userEntity?.role === user_entity_1.UserRole.MODERATOR || userEntity?.role === user_entity_1.UserRole.ADMIN;
            if (!isAuthor && !isModerator) {
                throw new common_1.ForbiddenException('You can only delete your own comments');
            }
            await this.commentRepo.update(id, {
                status: comment_entity_1.CommentStatus.REMOVED,
                updatedAt: new Date()
            });
            if (isAuthor) {
                await this.userRepo.update(comment.author.id, {
                    commentCount: Math.max(0, comment.author.commentCount - 1)
                });
            }
            this.gateway.emitEvent('commentDeleted', {
                id: comment.id,
                postId: comment.postId,
                authorName: comment.pseudonym || 'Anonymous User'
            });
            this.logger.log(`Comment deleted: ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete comment ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async report(id, dto, user) {
        try {
            const comment = await this.commentRepo.findOne({ where: { id } });
            if (!comment) {
                throw new common_1.NotFoundException('Comment not found');
            }
            await this.moderationService.reportComment(id, user.id, dto.reason);
            this.gateway.emitEvent('contentReported', {
                type: 'comment',
                id: comment.id,
                postId: comment.postId,
                reason: dto.reason
            });
            this.logger.log(`Comment reported: ${id} by user ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to report comment ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async moderate(id, dto, user) {
        try {
            const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
            if (!userEntity || (userEntity.role !== user_entity_1.UserRole.MODERATOR && userEntity.role !== user_entity_1.UserRole.ADMIN)) {
                throw new common_1.ForbiddenException('Only moderators and admins can moderate comments');
            }
            const comment = await this.commentRepo.findOne({ where: { id } });
            if (!comment) {
                throw new common_1.NotFoundException('Comment not found');
            }
            await this.commentRepo.update(id, {
                status: dto.status,
                lastModeratedAt: new Date(),
                lastModeratedBy: userEntity.id
            });
            await this.moderationService.reviewContent(id, 'comment', userEntity.id, dto.status === comment_entity_1.CommentStatus.ACTIVE ? 'approve' : 'remove', dto.notes || 'Moderated via API');
            const updatedComment = await this.get(id, user);
            this.gateway.emitEvent('contentModerated', {
                type: 'comment',
                id: comment.id,
                postId: comment.postId,
                status: dto.status,
                moderatorId: userEntity.id
            });
            this.logger.log(`Comment moderated: ${id} status: ${dto.status}`);
            return updatedComment;
        }
        catch (error) {
            this.logger.error(`Failed to moderate comment ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getThread(id, user) {
        try {
            const rootComment = await this.commentRepo.findOne({
                where: { id },
                relations: ['author']
            });
            if (!rootComment) {
                throw new common_1.NotFoundException('Comment not found');
            }
            const allReplies = await this.commentRepo.find({
                where: { parentId: id },
                relations: ['author', 'replies'],
                order: { createdAt: 'ASC' }
            });
            const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(rootComment.author.authId, 'comment');
            const anonymizedRoot = this.anonymityService.anonymizeContentResponse(rootComment, anonymousIdentity);
            const anonymizedReplies = allReplies.map(reply => {
                const replyAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(reply.author.authId, 'comment');
                return this.anonymityService.anonymizeContentResponse(reply, replyAnonymousIdentity);
            });
            return {
                rootComment: anonymizedRoot,
                replies: anonymizedReplies,
                totalReplies: anonymizedReplies.length
            };
        }
        catch (error) {
            this.logger.error(`Failed to get comment thread ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = CommentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        anonymity_service_1.AnonymityService,
        privacy_service_1.PrivacyService,
        moderation_service_1.ModerationService,
        community_gateway_1.CommunityGateway])
], CommentsService);
//# sourceMappingURL=comments.service.js.map
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
var PostsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("./entities/post.entity");
const user_entity_1 = require("../users/entities/user.entity");
const anonymity_service_1 = require("../common/services/anonymity.service");
const privacy_service_1 = require("../common/services/privacy.service");
const moderation_service_1 = require("../common/services/moderation.service");
const community_gateway_1 = require("../community.gateway");
const notification_service_1 = require("../common/services/notification.service");
let PostsService = PostsService_1 = class PostsService {
    constructor(postRepo, userRepo, anonymityService, privacyService, moderationService, gateway, notificationService) {
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.anonymityService = anonymityService;
        this.privacyService = privacyService;
        this.moderationService = moderationService;
        this.gateway = gateway;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(PostsService_1.name);
    }
    async create(dto, user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.id, 'post');
            const postData = {
                ...dto,
                authorId: userEntity.id,
                isAnonymous: true,
                pseudonym: anonymousIdentity.displayName,
                status: post_entity_1.PostStatus.PUBLISHED,
                visibility: dto.visibility || post_entity_1.PostVisibility.PUBLIC,
                privacySettings: {
                    allowComments: true,
                    allowReactions: true,
                    allowSharing: false,
                    notifyOnComment: true,
                    notifyOnReaction: true,
                    notifyOnReport: false
                }
            };
            postData.content = this.privacyService.sanitizeContent(postData.content);
            const post = this.postRepo.create(postData);
            const savedPost = await this.postRepo.save(post);
            await this.userRepo.update(userEntity.id, {
                postCount: userEntity.postCount + 1,
                lastActiveAt: new Date()
            });
            const postWithRelations = await this.postRepo.findOne({
                where: { id: savedPost.id },
                relations: ['author']
            });
            const anonymizedPost = this.anonymityService.anonymizeContentResponse(postWithRelations, anonymousIdentity);
            try {
                const followers = await this.getFollowersForNotification(userEntity.id);
                if (followers.length > 0) {
                    await this.notificationService.notifyFollowersAboutNewPost(userEntity.id, anonymousIdentity.displayName, savedPost.id, savedPost.title || 'New Post', savedPost.content, savedPost.category || 'general', followers.map(f => f.id));
                }
            }
            catch (error) {
                this.logger.warn(`Failed to send follower notifications for post ${savedPost.id}: ${error.message}`);
            }
            this.gateway.emitEvent('postCreated', {
                id: savedPost.id,
                authorName: anonymousIdentity.displayName,
                title: savedPost.title,
                visibility: savedPost.visibility,
                isAnonymous: true
            });
            this.logger.log(`Anonymous post created: ${savedPost.id} by ${anonymousIdentity.displayName}`);
            return anonymizedPost;
        }
        catch (error) {
            this.logger.error(`Failed to create post: ${error.message}`, error.stack);
            throw error;
        }
    }
    async list(query, user) {
        try {
            const page = Math.max(1, parseInt(query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
            const skip = (page - 1) * limit;
            const queryBuilder = this.postRepo.createQueryBuilder('post')
                .leftJoinAndSelect('post.author', 'author')
                .where('post.status = :status', { status: post_entity_1.PostStatus.PUBLISHED });
            if (user) {
                const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
                if (userEntity?.role === user_entity_1.UserRole.THERAPIST || userEntity?.isVerifiedTherapist) {
                    queryBuilder.andWhere('post.visibility IN (:...visibilities)', {
                        visibilities: [post_entity_1.PostVisibility.PUBLIC, post_entity_1.PostVisibility.ANONYMOUS, post_entity_1.PostVisibility.THERAPISTS_ONLY]
                    });
                }
                else {
                    queryBuilder.andWhere('post.visibility IN (:...visibilities)', {
                        visibilities: [post_entity_1.PostVisibility.PUBLIC, post_entity_1.PostVisibility.ANONYMOUS]
                    });
                }
            }
            else {
                queryBuilder.andWhere('post.visibility = :visibility', { visibility: post_entity_1.PostVisibility.PUBLIC });
            }
            if (query.tags && Array.isArray(query.tags)) {
                queryBuilder.andWhere('post.tags && :tags', { tags: query.tags });
            }
            if (query.search) {
                queryBuilder.andWhere('(LOWER(post.title) LIKE LOWER(:search) OR LOWER(post.content) LIKE LOWER(:search))', { search: `%${query.search}%` });
            }
            const orderBy = query.orderBy || 'createdAt';
            const orderDirection = query.orderDirection === 'ASC' ? 'ASC' : 'DESC';
            queryBuilder.orderBy(`post.${orderBy}`, orderDirection);
            queryBuilder.skip(skip).take(limit);
            const [posts, total] = await queryBuilder.getManyAndCount();
            const anonymizedPosts = posts.map(post => {
                const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(post.author.authId, 'post');
                return this.anonymityService.anonymizeContentResponse(post, anonymousIdentity);
            });
            return {
                items: anonymizedPosts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to list posts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async get(id, user) {
        try {
            const post = await this.postRepo.findOne({
                where: { id },
                relations: ['author', 'comments', 'reactions']
            });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            if (!this.canUserViewPost(post, user)) {
                throw new common_1.ForbiddenException('You do not have permission to view this post');
            }
            await this.postRepo.update(id, {
                viewCount: post.viewCount + 1
            });
            const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(post.author.authId, 'post');
            const anonymizedPost = this.anonymityService.anonymizeContentResponse(post, anonymousIdentity);
            if (anonymizedPost.comments) {
                anonymizedPost.comments = anonymizedPost.comments.map(comment => {
                    const commentAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(comment.author?.authId, 'comment');
                    return this.anonymityService.anonymizeContentResponse(comment, commentAnonymousIdentity);
                });
            }
            if (anonymizedPost.reactions) {
                anonymizedPost.reactions = anonymizedPost.reactions.map(reaction => {
                    const reactionAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(reaction.user?.authId, 'reaction');
                    return this.anonymityService.anonymizeContentResponse(reaction, reactionAnonymousIdentity);
                });
            }
            return anonymizedPost;
        }
        catch (error) {
            this.logger.error(`Failed to get post ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(id, dto, user) {
        try {
            const post = await this.postRepo.findOne({
                where: { id },
                relations: ['author']
            });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
            const isAuthor = post.author.authId === user.id;
            const isModerator = userEntity?.role === user_entity_1.UserRole.MODERATOR || userEntity?.role === user_entity_1.UserRole.ADMIN;
            if (!isAuthor && !isModerator) {
                throw new common_1.ForbiddenException('You can only update your own posts');
            }
            if (dto.content) {
                dto.content = this.privacyService.sanitizeContent(dto.content);
            }
            await this.postRepo.update(id, {
                ...dto,
                isAnonymous: true,
                updatedAt: new Date()
            });
            const updatedPost = await this.get(id, user);
            this.gateway.emitEvent('postUpdated', {
                id: post.id,
                authorName: updatedPost.author.displayName,
                title: updatedPost.title
            });
            this.logger.log(`Post updated: ${id}`);
            return updatedPost;
        }
        catch (error) {
            this.logger.error(`Failed to update post ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async delete(id, user) {
        try {
            const post = await this.postRepo.findOne({
                where: { id },
                relations: ['author']
            });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
            const isAuthor = post.author.authId === user.id;
            const isModerator = userEntity?.role === user_entity_1.UserRole.MODERATOR || userEntity?.role === user_entity_1.UserRole.ADMIN;
            if (!isAuthor && !isModerator) {
                throw new common_1.ForbiddenException('You can only delete your own posts');
            }
            await this.postRepo.update(id, {
                status: post_entity_1.PostStatus.REMOVED,
                updatedAt: new Date()
            });
            if (isAuthor) {
                await this.userRepo.update(post.author.id, {
                    postCount: Math.max(0, post.author.postCount - 1)
                });
            }
            this.gateway.emitEvent('postDeleted', {
                id: post.id,
                authorName: post.pseudonym || 'Anonymous User'
            });
            this.logger.log(`Post deleted: ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete post ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async report(postId, dto, user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            const post = await this.postRepo.findOne({ where: { id: postId } });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            await this.moderationService.reportPost(postId, userEntity.id, dto.reason);
            try {
                const moderators = await this.userRepo.find({
                    where: { role: user_entity_1.UserRole.MODERATOR }
                });
                if (moderators.length > 0) {
                    await this.notificationService.notifyModeratorsAboutReport('post', postId, dto.reason, userEntity.id, (post.reportCount || 0) + 1, moderators.map(m => m.id));
                }
            }
            catch (error) {
                this.logger.warn(`Failed to send moderator notifications for post report ${postId}: ${error.message}`);
            }
            this.logger.log(`Post ${postId} reported by user ${userEntity.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to report post: ${error.message}`, error.stack);
            throw error;
        }
    }
    async moderate(postId, dto, user) {
        try {
            const userEntity = await this.userRepo.findOne({
                where: { authId: user.id }
            });
            if (!userEntity) {
                throw new common_1.BadRequestException('User not found');
            }
            if (![user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MODERATOR].includes(userEntity.role)) {
                throw new common_1.ForbiddenException('Only admins and moderators can moderate posts');
            }
            const post = await this.postRepo.findOne({
                where: { id: postId },
                relations: ['author']
            });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            const actionMap = {
                'approve': 'approve',
                'remove': 'remove',
                'warn': 'warn',
                'reject': 'remove',
                'hide': 'remove',
                'flag': 'warn',
                'suspend': 'warn',
                'ban': 'remove'
            };
            const mappedAction = actionMap[dto.action] || 'warn';
            await this.moderationService.reviewContent(postId, 'post', userEntity.id, mappedAction, dto.notes);
            try {
                const notificationActionMap = {
                    'approve': 'approved',
                    'remove': 'removed',
                    'warn': 'warned',
                    'reject': 'removed',
                    'hide': 'removed',
                    'flag': 'warned',
                    'suspend': 'warned',
                    'ban': 'removed'
                };
                const notificationAction = notificationActionMap[dto.action] || 'warned';
                await this.notificationService.notifyContentModerated(post.authorId, notificationAction, 'post', postId, dto.notes, userEntity.id);
            }
            catch (error) {
                this.logger.warn(`Failed to send moderation notification for post ${postId}: ${error.message}`);
            }
            this.gateway.emitEvent('postModerated', {
                id: postId,
                action: dto.action,
                moderatedBy: userEntity.id
            });
            this.logger.log(`Post ${postId} moderated by ${userEntity.id} with action: ${dto.action}`);
            return { message: 'Post moderated successfully' };
        }
        catch (error) {
            this.logger.error(`Failed to moderate post: ${error.message}`, error.stack);
            throw error;
        }
    }
    canUserViewPost(post, user) {
        switch (post.visibility) {
            case post_entity_1.PostVisibility.PUBLIC:
            case post_entity_1.PostVisibility.ANONYMOUS:
                return true;
            case post_entity_1.PostVisibility.THERAPISTS_ONLY:
                if (!user)
                    return false;
                return user.role === user_entity_1.UserRole.THERAPIST || user.isVerifiedTherapist;
            case post_entity_1.PostVisibility.PRIVATE:
                if (!user)
                    return false;
                return post.author.authId === user.id;
            default:
                return false;
        }
    }
    async getFollowersForNotification(userId) {
        try {
            return [];
        }
        catch (error) {
            this.logger.warn(`Failed to get followers for user ${userId}: ${error.message}`);
            return [];
        }
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = PostsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        anonymity_service_1.AnonymityService,
        privacy_service_1.PrivacyService,
        moderation_service_1.ModerationService,
        community_gateway_1.CommunityGateway,
        notification_service_1.CommunityNotificationService])
], PostsService);
//# sourceMappingURL=posts.service.js.map
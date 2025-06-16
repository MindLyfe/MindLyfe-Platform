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
var ModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const post_entity_1 = require("../../posts/entities/post.entity");
const comment_entity_1 = require("../../comments/entities/comment.entity");
const reaction_entity_1 = require("../../reactions/entities/reaction.entity");
const privacy_service_1 = require("./privacy.service");
let ModerationService = ModerationService_1 = class ModerationService {
    constructor(configService, privacyService, userRepository, postRepository, commentRepository, reactionRepository) {
        this.configService = configService;
        this.privacyService = privacyService;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reactionRepository = reactionRepository;
        this.logger = new common_1.Logger(ModerationService_1.name);
    }
    async reportPost(postId, reporterId, reason) {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            throw new Error('Post not found');
        }
        post.reportCount += 1;
        if (!post.moderationNotes) {
            post.moderationNotes = {
                reportedBy: [],
                reviewNotes: [],
                actionTaken: null,
                actionTakenBy: null,
                actionTakenAt: null,
            };
        }
        post.moderationNotes.reportedBy.push(reporterId);
        const maxReports = this.configService.get('moderation.maxReportsBeforeReview');
        if (post.reportCount >= maxReports) {
            post.status = post_entity_1.PostStatus.UNDER_REVIEW;
            this.logger.warn(`Post ${postId} has been flagged for review due to ${post.reportCount} reports`);
        }
        await this.postRepository.save(post);
        await this.notifyModerators('post', postId, reason);
    }
    async reportComment(commentId, reporterId, reason) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        comment.reportCount += 1;
        if (!comment.moderationNotes) {
            comment.moderationNotes = {
                reportedBy: [],
                reviewNotes: [],
                actionTaken: null,
                actionTakenBy: null,
                actionTakenAt: null,
            };
        }
        comment.moderationNotes.reportedBy.push(reporterId);
        const maxReports = this.configService.get('moderation.maxReportsBeforeReview');
        if (comment.reportCount >= maxReports) {
            comment.status = comment_entity_1.CommentStatus.UNDER_REVIEW;
            this.logger.warn(`Comment ${commentId} has been flagged for review due to ${comment.reportCount} reports`);
        }
        await this.commentRepository.save(comment);
        await this.notifyModerators('comment', commentId, reason);
    }
    async reviewContent(contentId, contentType, moderatorId, action, notes) {
        if (contentType === 'post') {
            const post = await this.postRepository.findOne({ where: { id: contentId } });
            if (!post) {
                throw new Error('Post not found');
            }
            if (!post.moderationNotes) {
                post.moderationNotes = {
                    reportedBy: [],
                    reviewNotes: [],
                    actionTaken: null,
                    actionTakenBy: null,
                    actionTakenAt: null,
                };
            }
            post.moderationNotes.reviewNotes.push(notes);
            post.moderationNotes.actionTaken = action;
            post.moderationNotes.actionTakenBy = moderatorId;
            post.moderationNotes.actionTakenAt = new Date();
            switch (action) {
                case 'approve':
                    post.status = post_entity_1.PostStatus.PUBLISHED;
                    post.reportCount = 0;
                    break;
                case 'remove':
                    post.status = post_entity_1.PostStatus.REMOVED;
                    break;
                case 'warn':
                    post.status = post_entity_1.PostStatus.PUBLISHED;
                    break;
            }
            await this.postRepository.save(post);
            await this.notifyContentAuthor(post, action, notes);
        }
        else {
            const comment = await this.commentRepository.findOne({ where: { id: contentId } });
            if (!comment) {
                throw new Error('Comment not found');
            }
            if (!comment.moderationNotes) {
                comment.moderationNotes = {
                    reportedBy: [],
                    reviewNotes: [],
                    actionTaken: null,
                    actionTakenBy: null,
                    actionTakenAt: null,
                };
            }
            comment.moderationNotes.reviewNotes.push(notes);
            comment.moderationNotes.actionTaken = action;
            comment.moderationNotes.actionTakenBy = moderatorId;
            comment.moderationNotes.actionTakenAt = new Date();
            switch (action) {
                case 'approve':
                    comment.status = comment_entity_1.CommentStatus.ACTIVE;
                    comment.reportCount = 0;
                    break;
                case 'remove':
                    comment.status = comment_entity_1.CommentStatus.REMOVED;
                    break;
                case 'warn':
                    comment.status = comment_entity_1.CommentStatus.ACTIVE;
                    break;
            }
            await this.commentRepository.save(comment);
            await this.notifyContentAuthor(comment, action, notes);
        }
    }
    async checkUserModeration(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.reportCount >= this.configService.get('moderation.maxReportsBeforeReview')) {
            user.status = user_entity_1.UserStatus.SUSPENDED;
            this.logger.warn(`User ${userId} has been suspended due to high report count`);
            await this.userRepository.save(user);
        }
    }
    async notifyModerators(contentType, contentId, reason) {
        this.logger.log(`Moderators notified about reported ${contentType} ${contentId}: ${reason}`);
    }
    async notifyContentAuthor(content, action, notes) {
        this.logger.log(`Author of ${content.id} notified about moderation action: ${action}`);
    }
    async checkContentSensitivity(content) {
        return {
            isSensitive: false,
            confidence: 0,
            categories: [],
        };
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = ModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(4, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(5, (0, typeorm_1.InjectRepository)(reaction_entity_1.Reaction)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        privacy_service_1.PrivacyService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map
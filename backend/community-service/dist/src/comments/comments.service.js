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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./entities/comment.entity");
const auth_client_1 = require("@mindlyf/shared/auth-client");
const community_gateway_1 = require("../community.gateway");
let CommentsService = class CommentsService {
    constructor(commentRepo, authClient, gateway) {
        this.commentRepo = commentRepo;
        this.authClient = authClient;
        this.gateway = gateway;
    }
    async create(dto, user) {
        const comment = this.commentRepo.create({
            ...dto,
            userId: user.id,
            isAnonymous: dto.isAnonymous ?? false,
            status: comment_entity_1.CommentStatus.PENDING,
        });
        await this.commentRepo.save(comment);
        this.gateway.emitEvent('commentCreated', { commentId: comment.id, postId: comment.postId, isAnonymous: comment.isAnonymous });
        return comment;
    }
    async list(query, user) {
        const where = { status: comment_entity_1.CommentStatus.APPROVED };
        if (query.postId)
            where.postId = query.postId;
        if (user) {
            where.userId = user.id;
        }
        const options = { where, order: { createdAt: 'ASC' }, take: 100 };
        return this.commentRepo.find(options);
    }
    async get(id, user) {
        const comment = await this.commentRepo.findOne({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.status !== comment_entity_1.CommentStatus.APPROVED && comment.userId !== user?.id && !user?.roles?.includes('admin')) {
            throw new common_1.ForbiddenException('Not allowed to view this comment');
        }
        return comment;
    }
    async update(id, dto, user) {
        const comment = await this.commentRepo.findOne({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.userId !== user.id && !user?.roles?.includes('admin')) {
            throw new common_1.ForbiddenException('Not allowed to update this comment');
        }
        Object.assign(comment, dto);
        await this.commentRepo.save(comment);
        this.gateway.emitEvent('commentUpdated', { commentId: comment.id });
        return comment;
    }
    async delete(id, user) {
        const comment = await this.commentRepo.findOne({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.userId !== user.id && !user?.roles?.includes('admin')) {
            throw new common_1.ForbiddenException('Not allowed to delete this comment');
        }
        await this.commentRepo.softDelete(id);
        this.gateway.emitEvent('commentDeleted', { commentId: id });
        return { success: true };
    }
    async report(id, dto, user) {
        const comment = await this.commentRepo.findOne({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        this.gateway.emitEvent('commentReported', { commentId: id, reason: dto.reason, reporterId: user.id });
        return { success: true };
    }
    async moderate(id, dto, user) {
        if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
            throw new common_1.ForbiddenException('Only moderators or admins can moderate comments');
        }
        const comment = await this.commentRepo.findOne({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        comment.status = dto.status;
        if (dto.notes)
            comment.moderationNotes = dto.notes;
        await this.commentRepo.save(comment);
        this.gateway.emitEvent('commentModerated', { commentId: id, status: dto.status });
        return comment;
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof auth_client_1.AuthClientService !== "undefined" && auth_client_1.AuthClientService) === "function" ? _a : Object, community_gateway_1.CommunityGateway])
], CommentsService);
//# sourceMappingURL=comments.service.js.map
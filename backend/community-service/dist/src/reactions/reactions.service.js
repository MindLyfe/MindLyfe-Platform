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
exports.ReactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reaction_entity_1 = require("./entities/reaction.entity");
const auth_client_1 = require("@mindlyf/shared/auth-client");
const community_gateway_1 = require("../community.gateway");
let ReactionsService = class ReactionsService {
    constructor(reactionRepo, authClient, gateway) {
        this.reactionRepo = reactionRepo;
        this.authClient = authClient;
        this.gateway = gateway;
    }
    async add(dto, user) {
        if (!dto.postId && !dto.commentId) {
            throw new common_1.BadRequestException('Must provide either postId or commentId');
        }
        if (dto.postId && dto.commentId) {
            throw new common_1.BadRequestException('Cannot react to both post and comment simultaneously');
        }
        const existingReaction = await this.reactionRepo.findOne({
            where: {
                userId: user.id,
                postId: dto.postId || null,
                commentId: dto.commentId || null,
                type: dto.type
            }
        });
        if (existingReaction) {
            throw new common_1.BadRequestException('You have already reacted with this reaction type');
        }
        const reaction = this.reactionRepo.create({
            userId: user.id,
            postId: dto.postId || null,
            commentId: dto.commentId || null,
            type: dto.type,
            isAnonymous: dto.isAnonymous ?? false
        });
        await this.reactionRepo.save(reaction);
        this.gateway.emitEvent('reactionAdded', {
            id: reaction.id,
            postId: reaction.postId,
            commentId: reaction.commentId,
            type: reaction.type,
            isAnonymous: reaction.isAnonymous
        });
        return reaction;
    }
    async remove(dto, user) {
        if (!dto.postId && !dto.commentId) {
            throw new common_1.BadRequestException('Must provide either postId or commentId');
        }
        if (dto.postId && dto.commentId) {
            throw new common_1.BadRequestException('Cannot specify both post and comment simultaneously');
        }
        const reaction = await this.reactionRepo.findOne({
            where: {
                userId: user.id,
                postId: dto.postId || null,
                commentId: dto.commentId || null,
                type: dto.type
            }
        });
        if (!reaction) {
            throw new common_1.NotFoundException('Reaction not found');
        }
        const reactionDetails = {
            id: reaction.id,
            postId: reaction.postId,
            commentId: reaction.commentId,
            type: reaction.type
        };
        await this.reactionRepo.remove(reaction);
        this.gateway.emitEvent('reactionRemoved', reactionDetails);
        return { success: true };
    }
    async list(query, user) {
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
        if (query.aggregate === 'true') {
            const reactions = await this.reactionRepo.find({ where });
            const counts = reactions.reduce((acc, reaction) => {
                acc[reaction.type] = (acc[reaction.type] || 0) + 1;
                return acc;
            }, {});
            const userReactions = user ? reactions
                .filter(r => r.userId === user.id)
                .reduce((acc, r) => {
                acc[r.type] = true;
                return acc;
            }, {}) : {};
            return { counts, userReactions };
        }
        const take = Math.min(parseInt(query.limit) || 20, 100);
        const skip = parseInt(query.offset) || 0;
        const options = {
            where,
            take,
            skip,
            order: { createdAt: 'DESC' }
        };
        const [reactions, total] = await this.reactionRepo.findAndCount(options);
        return {
            items: reactions,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
            pageCount: Math.ceil(total / take)
        };
    }
};
exports.ReactionsService = ReactionsService;
exports.ReactionsService = ReactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reaction_entity_1.Reaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof auth_client_1.AuthClientService !== "undefined" && auth_client_1.AuthClientService) === "function" ? _a : Object, community_gateway_1.CommunityGateway])
], ReactionsService);
//# sourceMappingURL=reactions.service.js.map
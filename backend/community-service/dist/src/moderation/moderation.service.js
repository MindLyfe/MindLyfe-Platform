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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const community_gateway_1 = require("../community.gateway");
let ModerationService = class ModerationService {
    constructor(gateway) {
        this.gateway = gateway;
    }
    async report(dto, user) {
        this.gateway.emitEvent('contentReported', {
            contentId: dto.contentId,
            contentType: dto.contentType,
            reason: dto.reason,
            reporterId: user.id,
        });
        return { success: true };
    }
    async review(id, dto, user) {
        if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
            throw new common_1.ForbiddenException('Only moderators or admins can review content');
        }
        this.gateway.emitEvent('contentReviewed', {
            contentId: id,
            action: dto.action,
            notes: dto.notes,
            reviewerId: user.id,
        });
        return { success: true };
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [community_gateway_1.CommunityGateway])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map
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
exports.Follow = exports.FollowStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var FollowStatus;
(function (FollowStatus) {
    FollowStatus["ACTIVE"] = "active";
    FollowStatus["MUTED"] = "muted";
    FollowStatus["BLOCKED"] = "blocked";
})(FollowStatus || (exports.FollowStatus = FollowStatus = {}));
let Follow = class Follow extends base_entity_1.BaseEntity {
};
exports.Follow = Follow;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Follow.prototype, "followerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'followerId' }),
    __metadata("design:type", user_entity_1.User)
], Follow.prototype, "follower", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Follow.prototype, "followingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'followingId' }),
    __metadata("design:type", user_entity_1.User)
], Follow.prototype, "following", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FollowStatus,
        default: FollowStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Follow.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Follow.prototype, "isMutualFollow", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], Follow.prototype, "mutualFollowEstablishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Follow.prototype, "chatAccessGranted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], Follow.prototype, "chatAccessGrantedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Follow.prototype, "privacySettings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Follow.prototype, "metadata", void 0);
exports.Follow = Follow = __decorate([
    (0, typeorm_1.Entity)('follows'),
    (0, typeorm_1.Unique)(['followerId', 'followingId']),
    (0, typeorm_1.Index)(['followerId', 'status']),
    (0, typeorm_1.Index)(['followingId', 'status'])
], Follow);
//# sourceMappingURL=follow.entity.js.map
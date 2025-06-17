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
exports.NotificationEntity = exports.NotificationType = exports.NotificationStatus = void 0;
const typeorm_1 = require("typeorm");
const notification_template_entity_1 = require("./notification-template.entity");
const notification_channel_entity_1 = require("./notification-channel.entity");
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["READ"] = "read";
    NotificationStatus["FAILED"] = "failed";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ACCOUNT"] = "account";
    NotificationType["SYSTEM"] = "system";
    NotificationType["THERAPY"] = "therapy";
    NotificationType["COMMUNITY"] = "community";
    NotificationType["CHAT"] = "chat";
    NotificationType["MARKETING"] = "marketing";
    NotificationType["PAYMENT"] = "payment";
    NotificationType["SUBSCRIPTION"] = "subscription";
    NotificationType["SUPPORT"] = "support";
    NotificationType["SUPPORT_SHIFT"] = "support_shift";
    NotificationType["SUPPORT_REQUEST"] = "support_request";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let NotificationEntity = class NotificationEntity {
};
exports.NotificationEntity = NotificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "recipientEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_template_entity_1.NotificationTemplateEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'templateId' }),
    __metadata("design:type", notification_template_entity_1.NotificationTemplateEntity)
], NotificationEntity.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_channel_entity_1.NotificationChannelEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'channelId' }),
    __metadata("design:type", notification_channel_entity_1.NotificationChannelEntity)
], NotificationEntity.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "channelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationEntity.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "sentAt", void 0);
exports.NotificationEntity = NotificationEntity = __decorate([
    (0, typeorm_1.Entity)('notifications')
], NotificationEntity);
//# sourceMappingURL=notification.entity.js.map
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
exports.NotificationChannelEntity = exports.ChannelType = void 0;
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
var ChannelType;
(function (ChannelType) {
    ChannelType["EMAIL"] = "email";
    ChannelType["PUSH"] = "push";
    ChannelType["SMS"] = "sms";
    ChannelType["IN_APP"] = "in_app";
    ChannelType["WEBHOOK"] = "webhook";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
let NotificationChannelEntity = class NotificationChannelEntity {
};
exports.NotificationChannelEntity = NotificationChannelEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationChannelEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationChannelEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationChannelEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ChannelType }),
    __metadata("design:type", String)
], NotificationChannelEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationChannelEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Object)
], NotificationChannelEntity.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.NotificationEntity, notification => notification.channel),
    __metadata("design:type", Array)
], NotificationChannelEntity.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationChannelEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationChannelEntity.prototype, "updatedAt", void 0);
exports.NotificationChannelEntity = NotificationChannelEntity = __decorate([
    (0, typeorm_1.Entity)('notification_channels')
], NotificationChannelEntity);
//# sourceMappingURL=notification-channel.entity.js.map
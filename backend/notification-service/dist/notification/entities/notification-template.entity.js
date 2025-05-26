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
exports.NotificationTemplateEntity = exports.TemplateType = void 0;
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
var TemplateType;
(function (TemplateType) {
    TemplateType["EMAIL"] = "email";
    TemplateType["PUSH"] = "push";
    TemplateType["SMS"] = "sms";
    TemplateType["IN_APP"] = "in_app";
})(TemplateType || (exports.TemplateType = TemplateType = {}));
let NotificationTemplateEntity = class NotificationTemplateEntity {
};
exports.NotificationTemplateEntity = NotificationTemplateEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationTemplateEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationTemplateEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationTemplateEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TemplateType }),
    __metadata("design:type", String)
], NotificationTemplateEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationTemplateEntity.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], NotificationTemplateEntity.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Object)
], NotificationTemplateEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationTemplateEntity.prototype, "awsTemplateId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.NotificationEntity, notification => notification.template),
    __metadata("design:type", Array)
], NotificationTemplateEntity.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationTemplateEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationTemplateEntity.prototype, "updatedAt", void 0);
exports.NotificationTemplateEntity = NotificationTemplateEntity = __decorate([
    (0, typeorm_1.Entity)('notification_templates')
], NotificationTemplateEntity);
//# sourceMappingURL=notification-template.entity.js.map
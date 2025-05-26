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
exports.ChatRoom = exports.PrivacyLevel = exports.RoomStatus = exports.RoomType = void 0;
const typeorm_1 = require("typeorm");
const chat_message_entity_1 = require("./chat-message.entity");
var RoomType;
(function (RoomType) {
    RoomType["DIRECT"] = "direct";
    RoomType["GROUP"] = "group";
    RoomType["SUPPORT"] = "support";
    RoomType["THERAPY"] = "therapy";
})(RoomType = exports.RoomType || (exports.RoomType = {}));
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["ACTIVE"] = "active";
    RoomStatus["ARCHIVED"] = "archived";
    RoomStatus["HIDDEN"] = "hidden";
    RoomStatus["MODERATED"] = "moderated";
})(RoomStatus = exports.RoomStatus || (exports.RoomStatus = {}));
var PrivacyLevel;
(function (PrivacyLevel) {
    PrivacyLevel["PUBLIC"] = "public";
    PrivacyLevel["PRIVATE"] = "private";
    PrivacyLevel["ENCRYPTED"] = "encrypted";
})(PrivacyLevel = exports.PrivacyLevel || (exports.PrivacyLevel = {}));
let ChatRoom = class ChatRoom {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatRoom.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ChatRoom.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChatRoom.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], ChatRoom.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RoomStatus,
        default: RoomStatus.ACTIVE
    }),
    __metadata("design:type", String)
], ChatRoom.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RoomType,
        default: RoomType.DIRECT
    }),
    __metadata("design:type", String)
], ChatRoom.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PrivacyLevel,
        default: PrivacyLevel.PRIVATE
    }),
    __metadata("design:type", String)
], ChatRoom.prototype, "privacyLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChatRoom.prototype, "isModerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ChatRoom.prototype, "moderatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ChatRoom.prototype, "moderatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChatRoom.prototype, "isEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ChatRoom.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ChatRoom.prototype, "lastMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ChatRoom.prototype, "lastMessageAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ChatRoom.prototype, "lastMessagePreview", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ChatRoom.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ChatRoom.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], ChatRoom.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessage, message => message.room),
    __metadata("design:type", Array)
], ChatRoom.prototype, "messages", void 0);
ChatRoom = __decorate([
    (0, typeorm_1.Entity)('chat_rooms'),
    (0, typeorm_1.Index)(['status', 'type']),
    (0, typeorm_1.Index)(['participants'])
], ChatRoom);
exports.ChatRoom = ChatRoom;
//# sourceMappingURL=chat-room.entity.js.map
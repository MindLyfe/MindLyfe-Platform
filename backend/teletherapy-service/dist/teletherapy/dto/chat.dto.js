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
exports.ChatAttachmentDto = exports.ModerationActionDto = exports.ChatHistoryDto = exports.UpdateChatSettingsDto = exports.ChatSettingsDto = exports.ChatMessageDto = exports.MessageStatus = exports.MessageType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["SYSTEM"] = "system";
    MessageType["PRIVATE"] = "private";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
})(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
class ChatMessageDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message type', enum: MessageType }),
    (0, class_validator_1.IsEnum)(MessageType),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient ID for private messages', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message attachments', type: [String], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ChatMessageDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional message metadata', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ChatMessageDto.prototype, "metadata", void 0);
exports.ChatMessageDto = ChatMessageDto;
class ChatSettingsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to allow private chat between participants' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChatSettingsDto.prototype, "allowPrivateChat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to allow file sharing in chat' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChatSettingsDto.prototype, "allowFileSharing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to enable chat moderation' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChatSettingsDto.prototype, "moderationEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to automatically archive old messages' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChatSettingsDto.prototype, "autoArchive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of days after which to archive messages' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ChatSettingsDto.prototype, "archiveAfterDays", void 0);
exports.ChatSettingsDto = ChatSettingsDto;
class UpdateChatSettingsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated chat settings', type: ChatSettingsDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ChatSettingsDto),
    __metadata("design:type", ChatSettingsDto)
], UpdateChatSettingsDto.prototype, "settings", void 0);
exports.UpdateChatSettingsDto = UpdateChatSettingsDto;
class ChatHistoryDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date for chat history' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ChatHistoryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date for chat history' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ChatHistoryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message type filter', enum: MessageType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MessageType),
    __metadata("design:type", String)
], ChatHistoryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID filter', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ChatHistoryDto.prototype, "userId", void 0);
exports.ChatHistoryDto = ChatHistoryDto;
class ModerationActionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message ID to moderate' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ModerationActionDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to take', enum: ['delete', 'warn', 'mute'] }),
    (0, class_validator_1.IsEnum)(['delete', 'warn', 'mute']),
    __metadata("design:type", String)
], ModerationActionDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for moderation', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ModerationActionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration of mute in minutes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ModerationActionDto.prototype, "muteDuration", void 0);
exports.ModerationActionDto = ModerationActionDto;
class ChatAttachmentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatAttachmentDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatAttachmentDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ChatAttachmentDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File content as base64 string' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatAttachmentDto.prototype, "content", void 0);
exports.ChatAttachmentDto = ChatAttachmentDto;
//# sourceMappingURL=chat.dto.js.map
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
exports.ModerateRoomDto = exports.ReportMessageDto = exports.ModerateMessageDto = exports.ModerationAction = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ModerationAction;
(function (ModerationAction) {
    ModerationAction["HIDE"] = "hide";
    ModerationAction["DELETE"] = "delete";
    ModerationAction["WARNING"] = "warning";
    ModerationAction["BLOCK_USER"] = "block_user";
})(ModerationAction = exports.ModerationAction || (exports.ModerationAction = {}));
class ModerateMessageDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ID of the message to moderate',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModerateMessageDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The moderation action to perform',
        enum: ModerationAction,
        example: ModerationAction.HIDE,
    }),
    (0, class_validator_1.IsEnum)(ModerationAction),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModerateMessageDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The reason for moderation',
        example: 'Violation of community guidelines',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ModerateMessageDto.prototype, "reason", void 0);
exports.ModerateMessageDto = ModerateMessageDto;
class ReportMessageDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ID of the message to report',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReportMessageDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The reason for reporting',
        example: 'Inappropriate content',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReportMessageDto.prototype, "reason", void 0);
exports.ReportMessageDto = ReportMessageDto;
class ModerateRoomDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ID of the room to moderate',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModerateRoomDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The moderation action to perform',
        enum: ModerationAction,
        example: ModerationAction.HIDE,
    }),
    (0, class_validator_1.IsEnum)(ModerationAction),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModerateRoomDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The reason for moderation',
        example: 'Room violates community guidelines',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ModerateRoomDto.prototype, "reason", void 0);
exports.ModerateRoomDto = ModerateRoomDto;
//# sourceMappingURL=moderation.dto.js.map
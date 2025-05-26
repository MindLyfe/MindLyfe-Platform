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
exports.ManageBreakoutRoomsDto = exports.UpdateParticipantRoleDto = exports.RemoveParticipantsDto = exports.AddParticipantsDto = exports.ParticipantRole = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["HOST"] = "host";
    ParticipantRole["CO_HOST"] = "co_host";
    ParticipantRole["PARTICIPANT"] = "participant";
    ParticipantRole["OBSERVER"] = "observer";
})(ParticipantRole = exports.ParticipantRole || (exports.ParticipantRole = {}));
class AddParticipantsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User IDs to add as participants',
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AddParticipantsDto.prototype, "userIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email addresses to invite as participants',
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEmail)({}, { each: true }),
    __metadata("design:type", Array)
], AddParticipantsDto.prototype, "emails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role to assign to the participants',
        enum: ParticipantRole,
        default: ParticipantRole.PARTICIPANT,
    }),
    (0, class_validator_1.IsEnum)(ParticipantRole),
    __metadata("design:type", String)
], AddParticipantsDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom message to include in the invitation',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddParticipantsDto.prototype, "invitationMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to send email notifications',
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AddParticipantsDto.prototype, "sendNotifications", void 0);
exports.AddParticipantsDto = AddParticipantsDto;
class RemoveParticipantsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User IDs to remove from the session',
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], RemoveParticipantsDto.prototype, "userIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for removal',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RemoveParticipantsDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to send email notifications',
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RemoveParticipantsDto.prototype, "sendNotifications", void 0);
exports.RemoveParticipantsDto = RemoveParticipantsDto;
class UpdateParticipantRoleDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID of the participant',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateParticipantRoleDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New role for the participant',
        enum: ParticipantRole,
    }),
    (0, class_validator_1.IsEnum)(ParticipantRole),
    __metadata("design:type", String)
], UpdateParticipantRoleDto.prototype, "role", void 0);
exports.UpdateParticipantRoleDto = UpdateParticipantRoleDto;
class ManageBreakoutRoomsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Breakout room configuration',
        type: 'object',
        example: {
            rooms: [
                {
                    name: 'Group A',
                    participants: ['user1', 'user2'],
                },
                {
                    name: 'Group B',
                    participants: ['user3', 'user4'],
                },
            ],
        },
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ManageBreakoutRoomsDto.prototype, "rooms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Duration of breakout rooms in minutes',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManageBreakoutRoomsDto.prototype, "duration", void 0);
exports.ManageBreakoutRoomsDto = ManageBreakoutRoomsDto;
//# sourceMappingURL=manage-participants.dto.js.map
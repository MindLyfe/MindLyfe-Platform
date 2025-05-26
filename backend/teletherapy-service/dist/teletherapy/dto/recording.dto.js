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
exports.RecordingPlaybackDto = exports.UpdateRecordingDto = exports.StartRecordingDto = exports.RecordingAccessControlDto = exports.RecordingChapterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RecordingChapterDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chapter title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordingChapterDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time in seconds' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordingChapterDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time in seconds' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordingChapterDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chapter description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordingChapterDto.prototype, "description", void 0);
exports.RecordingChapterDto = RecordingChapterDto;
class RecordingAccessControlDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of user IDs allowed to access the recording' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], RecordingAccessControlDto.prototype, "allowedUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Password protection for the recording', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordingAccessControlDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration date for the recording access', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], RecordingAccessControlDto.prototype, "expiresAt", void 0);
exports.RecordingAccessControlDto = RecordingAccessControlDto;
class StartRecordingDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to record audio', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], StartRecordingDto.prototype, "recordAudio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to record video', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], StartRecordingDto.prototype, "recordVideo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording quality', enum: ['high', 'medium', 'low'], default: 'medium' }),
    (0, class_validator_1.IsEnum)(['high', 'medium', 'low']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartRecordingDto.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording format', enum: ['mp4', 'webm'], default: 'mp4' }),
    (0, class_validator_1.IsEnum)(['mp4', 'webm']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartRecordingDto.prototype, "format", void 0);
exports.StartRecordingDto = StartRecordingDto;
class UpdateRecordingDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording chapters', type: [RecordingChapterDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecordingChapterDto),
    __metadata("design:type", Array)
], UpdateRecordingDto.prototype, "chapters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access control settings', type: RecordingAccessControlDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RecordingAccessControlDto),
    __metadata("design:type", RecordingAccessControlDto)
], UpdateRecordingDto.prototype, "accessControl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording thumbnail URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecordingDto.prototype, "thumbnailUrl", void 0);
exports.UpdateRecordingDto = UpdateRecordingDto;
class RecordingPlaybackDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordingPlaybackDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording duration in seconds' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordingPlaybackDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording format' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordingPlaybackDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recording chapters', type: [RecordingChapterDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecordingChapterDto),
    __metadata("design:type", Array)
], RecordingPlaybackDto.prototype, "chapters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access control settings', type: RecordingAccessControlDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RecordingAccessControlDto),
    __metadata("design:type", RecordingAccessControlDto)
], RecordingPlaybackDto.prototype, "accessControl", void 0);
exports.RecordingPlaybackDto = RecordingPlaybackDto;
//# sourceMappingURL=recording.dto.js.map
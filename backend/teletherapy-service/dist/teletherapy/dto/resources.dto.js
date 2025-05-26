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
exports.ResourceSearchDto = exports.UpdateResourceDto = exports.ResourceLinkDto = exports.UploadFileDto = exports.FileMetadataDto = exports.FileAccessControlDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FileAccessControlDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of user IDs allowed to access the file' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], FileAccessControlDto.prototype, "allowedUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Password protection for the file', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileAccessControlDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration date for the file access', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], FileAccessControlDto.prototype, "expiresAt", void 0);
exports.FileAccessControlDto = FileAccessControlDto;
class FileMetadataDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thumbnail URL for the file', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in seconds for media files', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileMetadataDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of pages for documents', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileMetadataDto.prototype, "pages", void 0);
exports.FileMetadataDto = FileMetadataDto;
class UploadFileDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UploadFileDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File content as base64 string' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File category' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File tags', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UploadFileDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access control settings', type: FileAccessControlDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FileAccessControlDto),
    __metadata("design:type", FileAccessControlDto)
], UploadFileDto.prototype, "accessControl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File metadata', type: FileMetadataDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FileMetadataDto),
    __metadata("design:type", FileMetadataDto)
], UploadFileDto.prototype, "metadata", void 0);
exports.UploadFileDto = UploadFileDto;
class ResourceLinkDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Link title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceLinkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Link URL' }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ResourceLinkDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Link description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceLinkDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Link category' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceLinkDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Link tags', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ResourceLinkDto.prototype, "tags", void 0);
exports.ResourceLinkDto = ResourceLinkDto;
class UpdateResourceDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateResourceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource category', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateResourceDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource tags', type: [String], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateResourceDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access control settings', type: FileAccessControlDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FileAccessControlDto),
    __metadata("design:type", FileAccessControlDto)
], UpdateResourceDto.prototype, "accessControl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource metadata', type: FileMetadataDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FileMetadataDto),
    __metadata("design:type", FileMetadataDto)
], UpdateResourceDto.prototype, "metadata", void 0);
exports.UpdateResourceDto = UpdateResourceDto;
class ResourceSearchDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search query', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceSearchDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource category', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceSearchDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource tags', type: [String], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ResourceSearchDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource type', enum: ['file', 'link'], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['file', 'link']),
    __metadata("design:type", String)
], ResourceSearchDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date for resource creation', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ResourceSearchDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date for resource creation', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ResourceSearchDto.prototype, "endDate", void 0);
exports.ResourceSearchDto = ResourceSearchDto;
//# sourceMappingURL=resources.dto.js.map
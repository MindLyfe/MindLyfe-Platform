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
exports.AnalyticsExportDto = exports.ReportGenerationDto = exports.TechnicalMetricsDto = exports.FeedbackMetricsDto = exports.EngagementMetricsDto = exports.AttendanceMetricsDto = exports.AnalyticsFilterDto = exports.AnalyticsDateRangeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AnalyticsDateRangeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date for analytics' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], AnalyticsDateRangeDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date for analytics' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], AnalyticsDateRangeDto.prototype, "endDate", void 0);
exports.AnalyticsDateRangeDto = AnalyticsDateRangeDto;
class AnalyticsFilterDto extends AnalyticsDateRangeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Therapist ID filter', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AnalyticsFilterDto.prototype, "therapistId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session category filter', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyticsFilterDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session type filter', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyticsFilterDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session focus filter', type: [String], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AnalyticsFilterDto.prototype, "focus", void 0);
exports.AnalyticsFilterDto = AnalyticsFilterDto;
class AttendanceMetricsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of sessions' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceMetricsDto.prototype, "totalSessions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of participants invited' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceMetricsDto.prototype, "totalInvited", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of participants who attended' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceMetricsDto.prototype, "totalAttended", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average attendance rate' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceMetricsDto.prototype, "averageAttendanceRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of late joins' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceMetricsDto.prototype, "lateJoins", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of early leaves' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceMetricsDto.prototype, "earlyLeaves", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average session duration in minutes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceMetricsDto.prototype, "averageDuration", void 0);
exports.AttendanceMetricsDto = AttendanceMetricsDto;
class EngagementMetricsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of chat messages' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EngagementMetricsDto.prototype, "totalChatMessages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of reactions' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EngagementMetricsDto.prototype, "totalReactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of resource downloads' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EngagementMetricsDto.prototype, "totalResourceDownloads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average participation score' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EngagementMetricsDto.prototype, "averageParticipationScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active participants percentage' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EngagementMetricsDto.prototype, "activeParticipantsPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Breakout room usage statistics' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EngagementMetricsDto.prototype, "breakoutRoomStats", void 0);
exports.EngagementMetricsDto = EngagementMetricsDto;
class FeedbackMetricsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average session rating' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FeedbackMetricsDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of ratings' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FeedbackMetricsDto.prototype, "totalRatings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rating distribution' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FeedbackMetricsDto.prototype, "ratingDistribution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average sentiment score' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FeedbackMetricsDto.prototype, "sentimentScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Common feedback topics' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FeedbackMetricsDto.prototype, "commonTopics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Feedback trends over time' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FeedbackMetricsDto.prototype, "trends", void 0);
exports.FeedbackMetricsDto = FeedbackMetricsDto;
class TechnicalMetricsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average connection quality score' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TechnicalMetricsDto.prototype, "averageConnectionQuality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of disconnections' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TechnicalMetricsDto.prototype, "totalDisconnections", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device type distribution' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TechnicalMetricsDto.prototype, "deviceTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Browser type distribution' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TechnicalMetricsDto.prototype, "browserTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average bandwidth usage' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TechnicalMetricsDto.prototype, "averageBandwidthUsage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Technical issues by type' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TechnicalMetricsDto.prototype, "technicalIssues", void 0);
exports.TechnicalMetricsDto = TechnicalMetricsDto;
class ReportGenerationDto extends AnalyticsFilterDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report type', enum: ['summary', 'detailed', 'custom'] }),
    (0, class_validator_1.IsEnum)(['summary', 'detailed', 'custom']),
    __metadata("design:type", String)
], ReportGenerationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metrics to include', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReportGenerationDto.prototype, "metrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Format', enum: ['pdf', 'csv', 'excel'] }),
    (0, class_validator_1.IsEnum)(['pdf', 'csv', 'excel']),
    __metadata("design:type", String)
], ReportGenerationDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Include charts and graphs', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ReportGenerationDto.prototype, "includeCharts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom report template', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportGenerationDto.prototype, "template", void 0);
exports.ReportGenerationDto = ReportGenerationDto;
class AnalyticsExportDto extends AnalyticsFilterDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Export format', enum: ['json', 'csv', 'excel'] }),
    (0, class_validator_1.IsEnum)(['json', 'csv', 'excel']),
    __metadata("design:type", String)
], AnalyticsExportDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Include raw data', default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AnalyticsExportDto.prototype, "includeRawData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Compress export file', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AnalyticsExportDto.prototype, "compress", void 0);
exports.AnalyticsExportDto = AnalyticsExportDto;
//# sourceMappingURL=analytics.dto.js.map
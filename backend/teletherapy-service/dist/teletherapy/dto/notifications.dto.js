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
exports.NotificationHistoryDto = exports.SendNotificationDto = exports.QuietHoursDto = exports.CustomRuleDto = exports.ChannelPreferenceDto = exports.ReminderSettingsDto = exports.NotificationSettingsDto = exports.NotificationTemplateDto = exports.NotificationType = exports.NotificationChannel = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["IN_APP"] = "in_app";
})(NotificationChannel = exports.NotificationChannel || (exports.NotificationChannel = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["SESSION_REMINDER"] = "session_reminder";
    NotificationType["SESSION_CANCELLED"] = "session_cancelled";
    NotificationType["SESSION_RESCHEDULED"] = "session_rescheduled";
    NotificationType["PAYMENT_RECEIVED"] = "payment_received";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["RECORDING_AVAILABLE"] = "recording_available";
    NotificationType["FEEDBACK_REQUEST"] = "feedback_request";
    NotificationType["PARTICIPANT_JOINED"] = "participant_joined";
    NotificationType["PARTICIPANT_LEFT"] = "participant_left";
    NotificationType["BREAKOUT_ROOM_INVITATION"] = "breakout_room_invitation";
    NotificationType["RESOURCE_SHARED"] = "resource_shared";
    NotificationType["CUSTOM"] = "custom";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
class NotificationTemplateDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template type', enum: NotificationType }),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], NotificationTemplateDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template subject' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template body' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationTemplateDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available channels', enum: NotificationChannel, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(NotificationChannel, { each: true }),
    __metadata("design:type", Array)
], NotificationTemplateDto.prototype, "channels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template variables', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], NotificationTemplateDto.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether template is active', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], NotificationTemplateDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template metadata', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], NotificationTemplateDto.prototype, "metadata", void 0);
exports.NotificationTemplateDto = NotificationTemplateDto;
class NotificationSettingsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session reminder settings' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReminderSettingsDto),
    __metadata("design:type", ReminderSettingsDto)
], NotificationSettingsDto.prototype, "reminders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel preferences', type: [ChannelPreferenceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChannelPreferenceDto),
    __metadata("design:type", Array)
], NotificationSettingsDto.prototype, "channelPreferences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom notification rules', type: [CustomRuleDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CustomRuleDto),
    __metadata("design:type", Array)
], NotificationSettingsDto.prototype, "customRules", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiet hours settings', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => QuietHoursDto),
    __metadata("design:type", QuietHoursDto)
], NotificationSettingsDto.prototype, "quietHours", void 0);
exports.NotificationSettingsDto = NotificationSettingsDto;
class ReminderSettingsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to send session reminders' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReminderSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minutes before session to send reminder' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReminderSettingsDto.prototype, "reminderMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to send follow-up reminders' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ReminderSettingsDto.prototype, "sendFollowUp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Follow-up reminder minutes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReminderSettingsDto.prototype, "followUpMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum number of reminders' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReminderSettingsDto.prototype, "maxReminders", void 0);
exports.ReminderSettingsDto = ReminderSettingsDto;
class ChannelPreferenceDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification channel', enum: NotificationChannel }),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], ChannelPreferenceDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether channel is enabled' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChannelPreferenceDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel-specific settings', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ChannelPreferenceDto.prototype, "settings", void 0);
exports.ChannelPreferenceDto = ChannelPreferenceDto;
class CustomRuleDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification type', enum: NotificationType }),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], CustomRuleDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channels to use', enum: NotificationChannel, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(NotificationChannel, { each: true }),
    __metadata("design:type", Array)
], CustomRuleDto.prototype, "channels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether rule is active' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CustomRuleDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule conditions', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CustomRuleDto.prototype, "conditions", void 0);
exports.CustomRuleDto = CustomRuleDto;
class QuietHoursDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time (24-hour format)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuietHoursDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time (24-hour format)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuietHoursDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days of week (0-6, where 0 is Sunday)' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], QuietHoursDto.prototype, "daysOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to respect quiet hours' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QuietHoursDto.prototype, "enabled", void 0);
exports.QuietHoursDto = QuietHoursDto;
class SendNotificationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient email' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification type', enum: NotificationType }),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification channels', enum: NotificationChannel, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(NotificationChannel, { each: true }),
    __metadata("design:type", Array)
], SendNotificationDto.prototype, "channels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template variables', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendNotificationDto.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom content', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "customContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Priority level', enum: ['high', 'normal', 'low'], default: 'normal' }),
    (0, class_validator_1.IsEnum)(['high', 'normal', 'low']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Scheduled send time', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SendNotificationDto.prototype, "scheduledFor", void 0);
exports.SendNotificationDto = SendNotificationDto;
class NotificationHistoryDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], NotificationHistoryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], NotificationHistoryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification type filter', enum: NotificationType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], NotificationHistoryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel filter', enum: NotificationChannel, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], NotificationHistoryDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient email filter', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], NotificationHistoryDto.prototype, "recipientEmail", void 0);
exports.NotificationHistoryDto = NotificationHistoryDto;
//# sourceMappingURL=notifications.dto.js.map
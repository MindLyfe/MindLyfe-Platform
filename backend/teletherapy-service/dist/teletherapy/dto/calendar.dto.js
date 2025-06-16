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
exports.CalendarSyncStatusDto = exports.CalendarConflictDto = exports.CalendarEventDto = exports.CalendarSyncDto = exports.CalendarExceptionDto = exports.CalendarReminderDto = exports.CalendarAvailabilityDto = exports.CalendarEventStatus = exports.CalendarProvider = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var CalendarProvider;
(function (CalendarProvider) {
    CalendarProvider["GOOGLE"] = "google";
    CalendarProvider["OUTLOOK"] = "outlook";
    CalendarProvider["ICAL"] = "ical";
})(CalendarProvider = exports.CalendarProvider || (exports.CalendarProvider = {}));
var CalendarEventStatus;
(function (CalendarEventStatus) {
    CalendarEventStatus["CONFIRMED"] = "confirmed";
    CalendarEventStatus["TENTATIVE"] = "tentative";
    CalendarEventStatus["CANCELLED"] = "cancelled";
})(CalendarEventStatus = exports.CalendarEventStatus || (exports.CalendarEventStatus = {}));
class CalendarAvailabilityDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time (24-hour format)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarAvailabilityDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time (24-hour format)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarAvailabilityDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days of week (0-6, where 0 is Sunday)' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CalendarAvailabilityDto.prototype, "daysOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timezone', example: 'America/New_York' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarAvailabilityDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buffer time before sessions in minutes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarAvailabilityDto.prototype, "bufferBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buffer time after sessions in minutes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarAvailabilityDto.prototype, "bufferAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum sessions per day', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarAvailabilityDto.prototype, "maxSessionsPerDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum notice period in hours', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarAvailabilityDto.prototype, "minNoticeHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum advance booking in days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarAvailabilityDto.prototype, "maxAdvanceDays", void 0);
exports.CalendarAvailabilityDto = CalendarAvailabilityDto;
class CalendarReminderDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reminder type', enum: ['email', 'popup', 'sms'] }),
    (0, class_validator_1.IsEnum)(['email', 'popup', 'sms']),
    __metadata("design:type", String)
], CalendarReminderDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minutes before event' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarReminderDto.prototype, "minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether reminder is enabled' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalendarReminderDto.prototype, "enabled", void 0);
exports.CalendarReminderDto = CalendarReminderDto;
class CalendarExceptionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Exception date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CalendarExceptionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the date is available' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalendarExceptionDto.prototype, "available", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for exception', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarExceptionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alternative availability', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CalendarAvailabilityDto),
    __metadata("design:type", CalendarAvailabilityDto)
], CalendarExceptionDto.prototype, "alternativeAvailability", void 0);
exports.CalendarExceptionDto = CalendarExceptionDto;
class CalendarSyncDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calendar provider', enum: CalendarProvider }),
    (0, class_validator_1.IsEnum)(CalendarProvider),
    __metadata("design:type", String)
], CalendarSyncDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Provider-specific credentials' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CalendarSyncDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calendar ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarSyncDto.prototype, "calendarId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to sync in both directions' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalendarSyncDto.prototype, "twoWaySync", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sync frequency in minutes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarSyncDto.prototype, "syncFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to sync past events' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CalendarSyncDto.prototype, "syncPastEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum days to sync in the future' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CalendarSyncDto.prototype, "maxFutureDays", void 0);
exports.CalendarSyncDto = CalendarSyncDto;
class CalendarEventDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event ID in the calendar system' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarEventDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CalendarEventDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarEventDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarEventDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CalendarEventDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CalendarEventDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event status', enum: CalendarEventStatus }),
    (0, class_validator_1.IsEnum)(CalendarEventStatus),
    __metadata("design:type", String)
], CalendarEventDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location or meeting link' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarEventDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendees', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CalendarEventDto.prototype, "attendees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reminders', type: [CalendarReminderDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CalendarReminderDto),
    __metadata("design:type", Array)
], CalendarEventDto.prototype, "reminders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recurrence rule', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarEventDto.prototype, "recurrenceRule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event metadata', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CalendarEventDto.prototype, "metadata", void 0);
exports.CalendarEventDto = CalendarEventDto;
class CalendarConflictDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conflicting event ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarConflictDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conflicting session ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CalendarConflictDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time of conflict' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CalendarConflictDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time of conflict' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CalendarConflictDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conflict type', enum: ['overlap', 'adjacent', 'buffer'] }),
    (0, class_validator_1.IsEnum)(['overlap', 'adjacent', 'buffer']),
    __metadata("design:type", String)
], CalendarConflictDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conflict resolution', enum: ['reschedule', 'cancel', 'ignore'] }),
    (0, class_validator_1.IsEnum)(['reschedule', 'cancel', 'ignore']),
    __metadata("design:type", String)
], CalendarConflictDto.prototype, "resolution", void 0);
exports.CalendarConflictDto = CalendarConflictDto;
class CalendarSyncStatusDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last sync time' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CalendarSyncStatusDto.prototype, "lastSyncedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sync status', enum: ['success', 'failed', 'in_progress'] }),
    (0, class_validator_1.IsEnum)(['success', 'failed', 'in_progress']),
    __metadata("design:type", String)
], CalendarSyncStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of events synced' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarSyncStatusDto.prototype, "eventsSynced", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of conflicts detected' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalendarSyncStatusDto.prototype, "conflictsDetected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if sync failed', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarSyncStatusDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Next sync time' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CalendarSyncStatusDto.prototype, "nextSyncAt", void 0);
exports.CalendarSyncStatusDto = CalendarSyncStatusDto;
//# sourceMappingURL=calendar.dto.js.map
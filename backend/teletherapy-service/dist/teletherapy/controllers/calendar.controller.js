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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const calendar_service_1 = require("../services/calendar.service");
const calendar_dto_1 = require("../dto/calendar.dto");
let CalendarController = class CalendarController {
    constructor(calendarService) {
        this.calendarService = calendarService;
    }
    async setAvailability(req, availability) {
        await this.calendarService.setAvailability(req.user.id, availability);
    }
    async addException(req, exception) {
        await this.calendarService.addException(req.user.id, exception);
    }
    async syncCalendar(req, syncSettings) {
        return this.calendarService.syncCalendar(req.user.id, syncSettings);
    }
    async createCalendarEvent(sessionId) {
        return this.calendarService.createCalendarEvent(sessionId);
    }
    async checkAvailability(req, startTimeStr, endTimeStr, excludeSessionId) {
        const startTime = new Date(startTimeStr);
        const endTime = new Date(endTimeStr);
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('Start time must be before end time');
        }
        return this.calendarService.checkAvailability(req.user.id, startTime, endTime, excludeSessionId);
    }
    async getSyncStatus(req) {
        const user = req.user;
        if (!user.metadata?.calendarSyncStatus) {
            return {
                lastSyncedAt: null,
                status: 'failed',
                eventsSynced: 0,
                conflictsDetected: 0,
                error: 'No sync status available',
                nextSyncAt: null,
            };
        }
        return user.metadata.calendarSyncStatus;
    }
};
__decorate([
    (0, common_1.Put)('availability'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Set therapist availability' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability settings updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid availability settings' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calendar_dto_1.CalendarAvailabilityDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "setAvailability", null);
__decorate([
    (0, common_1.Post)('exceptions'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Add availability exception' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Exception added successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid exception data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calendar_dto_1.CalendarExceptionDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "addException", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync calendar with external provider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar sync status',
        type: calendar_dto_1.CalendarSyncStatusDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid sync settings' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calendar_dto_1.CalendarSyncDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "syncCalendar", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/event'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create calendar event for session' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Calendar event created successfully',
        type: calendar_dto_1.CalendarEventDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or calendar settings' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "createCalendarEvent", null);
__decorate([
    (0, common_1.Get)('availability/check'),
    (0, roles_decorator_1.Roles)('therapist', 'admin', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Check availability for a time slot' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability check result',
        schema: {
            type: 'object',
            properties: {
                available: { type: 'boolean' },
                conflicts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            eventId: { type: 'string' },
                            sessionId: { type: 'string' },
                            startTime: { type: 'string', format: 'date-time' },
                            endTime: { type: 'string', format: 'date-time' },
                            type: { type: 'string', enum: ['overlap', 'adjacent', 'buffer'] },
                            resolution: { type: 'string', enum: ['pending', 'reschedule', 'cancel', 'ignore'] },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid time parameters' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __param(3, (0, common_1.Query)('excludeSessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Get)('sync/status'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calendar sync status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current sync status',
        type: calendar_dto_1.CalendarSyncStatusDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getSyncStatus", null);
CalendarController = __decorate([
    (0, swagger_1.ApiTags)('Calendar'),
    (0, common_1.Controller)('calendar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
exports.CalendarController = CalendarController;
//# sourceMappingURL=calendar.controller.js.map
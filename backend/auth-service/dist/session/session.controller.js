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
exports.TherapySessionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const session_service_1 = require("./session.service");
const session_dto_1 = require("../dto/session.dto");
let TherapySessionController = class TherapySessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    async bookSession(req, createDto) {
        return await this.sessionService.createSession(req.user.id, createDto);
    }
    async getMySessions(req, limit) {
        return await this.sessionService.getUserSessions(req.user.id, limit);
    }
    async getTherapistSchedule(req, date) {
        const scheduleDate = date ? new Date(date) : new Date();
        return await this.sessionService.getTherapistSessions(req.user.id, scheduleDate);
    }
    async updateSession(req, sessionId, updateDto) {
        return await this.sessionService.updateSession(sessionId, req.user.id, updateDto);
    }
    async cancelSession(req, sessionId, reason) {
        return await this.sessionService.cancelSession(sessionId, req.user.id, reason);
    }
    async startSession(req, sessionId) {
        return await this.sessionService.startSession(sessionId, req.user.id);
    }
    async completeSession(req, sessionId, notes) {
        return await this.sessionService.completeSession(sessionId, req.user.id, notes);
    }
    async getAvailableTherapists() {
        return { message: 'Feature to be implemented with therapist availability system' };
    }
    async getAvailableSlots(therapistId, date) {
        return {
            message: 'Feature to be implemented with therapist scheduling system',
            therapistId,
            date: date || new Date().toISOString().split('T')[0]
        };
    }
};
exports.TherapySessionController = TherapySessionController;
__decorate([
    (0, common_1.Post)('book'),
    (0, swagger_1.ApiOperation)({ summary: 'Book a new therapy session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session booked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot book session - no available sessions or weekly limit reached' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "bookSession", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user sessions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User sessions retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "getMySessions", null);
__decorate([
    (0, common_1.Get)('therapist/schedule'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('therapist'),
    (0, swagger_1.ApiOperation)({ summary: 'Get therapist schedule for a specific date' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Therapist schedule retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, type: String }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "getTherapistSchedule", null);
__decorate([
    (0, common_1.Put)(':sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update session details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, session_dto_1.UpdateSessionDto]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "updateSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a scheduled session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Session cannot be cancelled' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "cancelSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/start'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('therapist'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a therapy session (Therapist only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Session cannot be started' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/complete'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('therapist'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a therapy session (Therapist only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Session cannot be completed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "completeSession", null);
__decorate([
    (0, common_1.Get)('available-therapists'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of available therapists' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available therapists retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "getAvailableTherapists", null);
__decorate([
    (0, common_1.Get)('available-slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available time slots for booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available slots retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'therapistId', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, type: String }),
    __param(0, (0, common_1.Query)('therapistId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TherapySessionController.prototype, "getAvailableSlots", null);
exports.TherapySessionController = TherapySessionController = __decorate([
    (0, swagger_1.ApiTags)('Therapy Sessions'),
    (0, common_1.Controller)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [session_service_1.TherapySessionService])
], TherapySessionController);
//# sourceMappingURL=session.controller.js.map
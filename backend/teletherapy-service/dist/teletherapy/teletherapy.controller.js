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
exports.TeletherapyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const teletherapy_service_1 = require("./teletherapy.service");
const create_session_dto_1 = require("./dto/create-session.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const therapy_session_entity_1 = require("./entities/therapy-session.entity");
const update_session_notes_dto_1 = require("./dto/update-session-notes.dto");
const update_session_status_dto_1 = require("./dto/update-session-status.dto");
const cancel_session_dto_1 = require("./dto/cancel-session.dto");
const manage_participants_dto_1 = require("./dto/manage-participants.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let TeletherapyController = class TeletherapyController {
    constructor(teletherapyService) {
        this.teletherapyService = teletherapyService;
    }
    async healthCheck() {
        return {
            status: 'ok',
            service: 'teletherapy-service',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: 'connected',
            mediasoup: 'initialized'
        };
    }
    async createSession(createSessionDto, req) {
        return this.teletherapyService.createSession(createSessionDto, req.user);
    }
    async getSession(id, req) {
        return this.teletherapyService.getSessionById(id, req.user);
    }
    async getUpcomingSessions(req) {
        return this.teletherapyService.getUpcomingSessions(req.user);
    }
    async getSessionsByDateRange(startDate, endDate, req) {
        return this.teletherapyService.getSessionsByDateRange(new Date(startDate), new Date(endDate), req.user);
    }
    async updateSessionStatus(id, updateStatusDto, req) {
        return this.teletherapyService.updateSessionStatus(id, updateStatusDto.status, req.user);
    }
    async updateSessionNotes(id, updateNotesDto, req) {
        return this.teletherapyService.updateSessionNotes(id, updateNotesDto, req.user);
    }
    async cancelSession(id, cancelSessionDto, req) {
        return this.teletherapyService.cancelSession(id, req.user, cancelSessionDto.reason);
    }
    async addParticipants(id, addParticipantsDto, req) {
        return this.teletherapyService.addParticipants(id, addParticipantsDto, req.user);
    }
    async removeParticipants(id, removeParticipantsDto, req) {
        return this.teletherapyService.removeParticipants(id, removeParticipantsDto, req.user);
    }
    async updateParticipantRole(id, updateRoleDto, req) {
        return this.teletherapyService.updateParticipantRole(id, updateRoleDto, req.user);
    }
    async manageBreakoutRooms(id, breakoutRoomsDto, req) {
        return this.teletherapyService.manageBreakoutRooms(id, breakoutRoomsDto, req.user);
    }
    async joinSession(id, req) {
        return this.teletherapyService.joinSession(id, req.user);
    }
    async leaveSession(id, req) {
        return this.teletherapyService.leaveSession(id, req.user);
    }
    async getGroupSessions(req, category, focus) {
        return this.teletherapyService.getUpcomingSessions(req.user);
    }
    async getIndividualSessions(req, category) {
        return this.teletherapyService.getUpcomingSessions(req.user);
    }
    async createChatRoomForSession(id, user) {
        try {
            const session = await this.teletherapyService.getSessionById(id, user);
            if (user.id !== session.therapistId && user.role !== 'admin') {
                throw new common_1.HttpException('Only the session therapist or admin can create chat rooms', common_1.HttpStatus.FORBIDDEN);
            }
            await this.teletherapyService.createChatRoomForSession(id, user);
            return {
                success: true,
                message: 'Chat room created successfully for the therapy session'
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Failed to create chat room', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async checkTherapistClientRelationship(therapistId, clientId, user) {
        if (user.id !== therapistId &&
            user.id !== clientId &&
            user.role !== 'admin') {
            throw new common_1.ForbiddenException('You don\'t have permission to check this relationship');
        }
        return {
            hasRelationship: await this.teletherapyService.checkTherapistClientRelationship(therapistId, clientId)
        };
    }
};
__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('sessions'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new therapy session' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The session has been successfully created.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session data or scheduling conflict.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_session_dto_1.CreateSessionDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('sessions/:id'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific therapy session by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The session has been successfully retrieved.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "getSession", null);
__decorate([
    (0, common_1.Get)('sessions/upcoming'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming therapy sessions for the authenticated user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of upcoming sessions.',
        type: [therapy_session_entity_1.TherapySession],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "getUpcomingSessions", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get therapy sessions within a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, type: Date }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of sessions within the specified date range.',
        type: [therapy_session_entity_1.TherapySession],
    }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "getSessionsByDateRange", null);
__decorate([
    (0, common_1.Patch)('sessions/:id/status'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update the status of a therapy session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The session status has been successfully updated.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_session_status_dto_1.UpdateSessionStatusDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "updateSessionStatus", null);
__decorate([
    (0, common_1.Patch)('sessions/:id/notes'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update session notes' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The session notes have been successfully updated.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_session_notes_dto_1.UpdateSessionNotesDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "updateSessionNotes", null);
__decorate([
    (0, common_1.Post)('sessions/:id/cancel'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a therapy session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The session has been successfully cancelled.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot cancel a session that has already started.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_session_dto_1.CancelSessionDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "cancelSession", null);
__decorate([
    (0, common_1.Post)('sessions/:id/participants'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Add participants to a therapy session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Participants have been successfully added to the session.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid participant data or session limit reached.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_participants_dto_1.AddParticipantsDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "addParticipants", null);
__decorate([
    (0, common_1.Delete)('sessions/:id/participants'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove participants from a therapy session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Participants have been successfully removed from the session.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_participants_dto_1.RemoveParticipantsDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "removeParticipants", null);
__decorate([
    (0, common_1.Patch)('sessions/:id/participants/role'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a participant\'s role in the session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Participant role has been successfully updated.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_participants_dto_1.UpdateParticipantRoleDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "updateParticipantRole", null);
__decorate([
    (0, common_1.Post)('sessions/:id/breakout-rooms'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Manage breakout rooms for a group session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Breakout rooms have been successfully configured.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session type for breakout rooms.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_participants_dto_1.ManageBreakoutRoomsDto, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "manageBreakoutRooms", null);
__decorate([
    (0, common_1.Post)('sessions/:id/join'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Join a therapy session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully joined the session.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Session is not available for joining or limit reached.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "joinSession", null);
__decorate([
    (0, common_1.Post)('sessions/:id/leave'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a therapy session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully left the session.',
        type: therapy_session_entity_1.TherapySession,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "leaveSession", null);
__decorate([
    (0, common_1.Get)('sessions/group'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get group therapy sessions' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: ['group', 'workshop', 'support_group'] }),
    (0, swagger_1.ApiQuery)({ name: 'focus', required: false, isArray: true }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of group therapy sessions.',
        type: [therapy_session_entity_1.TherapySession],
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('focus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "getGroupSessions", null);
__decorate([
    (0, common_1.Get)('sessions/individual'),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get individual therapy sessions' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: ['individual', 'couples', 'family'] }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of individual therapy sessions.',
        type: [therapy_session_entity_1.TherapySession],
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "getIndividualSessions", null);
__decorate([
    (0, common_1.Post)(':id/create-chat-room'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a chat room for a therapy session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Chat room created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - not a therapist or admin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "createChatRoomForSession", null);
__decorate([
    (0, common_1.Get)('sessions/relationship'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a therapist and client have a session relationship' }),
    (0, swagger_1.ApiQuery)({ name: 'therapistId', required: true, description: 'The therapist ID' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: true, description: 'The client ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relationship check result' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)('client', 'therapist', 'admin'),
    __param(0, (0, common_1.Query)('therapistId')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TeletherapyController.prototype, "checkTherapistClientRelationship", null);
TeletherapyController = __decorate([
    (0, swagger_1.ApiTags)('teletherapy'),
    (0, common_1.Controller)('teletherapy'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [teletherapy_service_1.TeletherapyService])
], TeletherapyController);
exports.TeletherapyController = TeletherapyController;
//# sourceMappingURL=teletherapy.controller.js.map
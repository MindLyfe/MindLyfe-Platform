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
exports.VideoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const video_service_1 = require("../services/video.service");
let VideoController = class VideoController {
    constructor(videoService) {
        this.videoService = videoService;
    }
    async initializeSession(sessionId, options) {
        return this.videoService.initializeSession(sessionId, options);
    }
    async joinSession(req, sessionId, role = 'participant') {
        return this.videoService.joinSession(sessionId, req.user.id, role);
    }
    async leaveSession(req, sessionId) {
        await this.videoService.leaveSession(sessionId, req.user.id);
    }
    async admitFromWaitingRoom(req, sessionId, participantId) {
        return this.videoService.admitFromWaitingRoom(sessionId, participantId, req.user.id);
    }
    async createBreakoutRooms(sessionId, rooms) {
        return this.videoService.createBreakoutRooms(sessionId, rooms);
    }
    async joinBreakoutRoom(req, sessionId, roomId) {
        return this.videoService.joinBreakoutRoom(sessionId, roomId, req.user.id);
    }
    async endBreakoutRooms(sessionId) {
        await this.videoService.endBreakoutRooms(sessionId);
    }
    async sendChatMessage(req, sessionId, message) {
        return this.videoService.sendChatMessage(sessionId, {
            sessionId,
            senderId: req.user.id,
            senderName: `${req.user.firstName} ${req.user.lastName}`,
            ...message,
        });
    }
    async getChatHistory(sessionId, startTimeStr, endTimeStr, limitStr, offsetStr) {
        const options = {};
        if (startTimeStr) {
            options.startTime = new Date(startTimeStr);
            if (isNaN(options.startTime.getTime())) {
                throw new common_1.BadRequestException('Invalid start time format');
            }
        }
        if (endTimeStr) {
            options.endTime = new Date(endTimeStr);
            if (isNaN(options.endTime.getTime())) {
                throw new common_1.BadRequestException('Invalid end time format');
            }
        }
        if (limitStr) {
            options.limit = parseInt(limitStr, 10);
            if (isNaN(options.limit)) {
                throw new common_1.BadRequestException('Invalid limit value');
            }
        }
        if (offsetStr) {
            options.offset = parseInt(offsetStr, 10);
            if (isNaN(options.offset)) {
                throw new common_1.BadRequestException('Invalid offset value');
            }
        }
        return this.videoService.getChatHistory(sessionId, options);
    }
    async startRecording(sessionId) {
        await this.videoService.startRecording(sessionId);
    }
    async stopRecording(sessionId) {
        await this.videoService.stopRecording(sessionId);
    }
    async getParticipants(sessionId) {
        const sessionData = await this.videoService['activeSessions'].get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        return this.videoService.getRoomParticipants(sessionData.roomSid);
    }
    async disconnectParticipant(sessionId, participantSid) {
        const sessionData = await this.videoService['activeSessions'].get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        await this.videoService.disconnectParticipant(sessionId, participantSid);
    }
    async endSession(sessionId) {
        await this.videoService.endSession(sessionId);
    }
};
__decorate([
    (0, common_1.Post)('sessions/:sessionId/initialize'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize video session' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Video session initialized successfully',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                roomName: { type: 'string' },
                meetingLink: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or options' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "initializeSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/join'),
    (0, roles_decorator_1.Roles)('therapist', 'admin', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Join video session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Joined session successfully',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                roomName: { type: 'string' },
                isInWaitingRoom: { type: 'boolean' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or role' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "joinSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/leave'),
    (0, roles_decorator_1.Roles)('therapist', 'admin', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave video session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Left session successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "leaveSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/waiting-room/admit'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Admit participant from waiting room' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Participant admitted successfully',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                roomName: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or participant' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)('participantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "admitFromWaitingRoom", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/breakout-rooms'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create breakout rooms' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Breakout rooms created successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    participants: { type: 'array', items: { type: 'string' } },
                    hostId: { type: 'string' },
                    startTime: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or room configuration' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)('rooms')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "createBreakoutRooms", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/breakout-rooms/:roomId/join'),
    (0, roles_decorator_1.Roles)('therapist', 'admin', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Join breakout room' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Joined breakout room successfully',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                roomName: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or room' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "joinBreakoutRoom", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/breakout-rooms/end'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'End all breakout rooms' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Breakout rooms ended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "endBreakoutRooms", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/chat'),
    (0, roles_decorator_1.Roles)('therapist', 'admin', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Send chat message' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Message sent successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                sessionId: { type: 'string' },
                senderId: { type: 'string' },
                senderName: { type: 'string' },
                content: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                type: { type: 'string', enum: ['text', 'file', 'system'] },
                metadata: {
                    type: 'object',
                    properties: {
                        fileUrl: { type: 'string' },
                        fileName: { type: 'string' },
                        fileSize: { type: 'number' },
                        fileType: { type: 'string' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or message' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "sendChatMessage", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/chat'),
    (0, roles_decorator_1.Roles)('therapist', 'admin', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Get chat history' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Chat history retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    sessionId: { type: 'string' },
                    senderId: { type: 'string' },
                    senderName: { type: 'string' },
                    content: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    type: { type: 'string', enum: ['text', 'file', 'system'] },
                    metadata: {
                        type: 'object',
                        properties: {
                            fileUrl: { type: 'string' },
                            fileName: { type: 'string' },
                            fileSize: { type: 'number' },
                            fileType: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or parameters' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "getChatHistory", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/recording/start'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Start session recording' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recording started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or recording settings' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "startRecording", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/recording/stop'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Stop session recording' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recording stopped successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or no active recording' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "stopRecording", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/participants'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get session participants' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Participants retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    sid: { type: 'string' },
                    identity: { type: 'string' },
                    status: { type: 'string' },
                    startTime: { type: 'string', format: 'date-time' },
                    duration: { type: 'number' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "getParticipants", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/participants/:participantSid/disconnect'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect participant from session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Participant disconnected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or participant' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Param)('participantSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "disconnectParticipant", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/end'),
    (0, roles_decorator_1.Roles)('therapist', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'End video session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session ended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "endSession", null);
VideoController = __decorate([
    (0, swagger_1.ApiTags)('Video'),
    (0, common_1.Controller)('video'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [video_service_1.VideoService])
], VideoController);
exports.VideoController = VideoController;
//# sourceMappingURL=video.controller.js.map
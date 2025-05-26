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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const video_service_1 = require("../services/video.service");
const media_session_entity_1 = require("../entities/media-session.entity");
const media_session_repository_1 = require("../repositories/media-session.repository");
const swagger_2 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MediaSessionOptionsDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Enable session recording', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MediaSessionOptionsDto.prototype, "recording", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Enable chat functionality', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MediaSessionOptionsDto.prototype, "chat", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Enable screen sharing', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MediaSessionOptionsDto.prototype, "screenSharing", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Maximum number of participants', required: false, minimum: 2, maximum: 50 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MediaSessionOptionsDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Enable waiting room', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MediaSessionOptionsDto.prototype, "waitingRoom", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Enable breakout rooms', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MediaSessionOptionsDto.prototype, "breakoutRooms", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Video/audio codec settings', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CodecOptionsDto),
    __metadata("design:type", CodecOptionsDto)
], MediaSessionOptionsDto.prototype, "codec", void 0);
class CodecOptionsDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({ enum: ['VP8', 'VP9', 'H264'], required: false }),
    (0, class_validator_1.IsEnum)(['VP8', 'VP9', 'H264']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CodecOptionsDto.prototype, "video", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ enum: ['opus'], required: false }),
    (0, class_validator_1.IsEnum)(['opus']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CodecOptionsDto.prototype, "audio", void 0);
class CreateMediaSessionDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({
        enum: media_session_entity_1.MediaSessionType,
        description: 'Type of media session (teletherapy or chat)',
        example: 'TELETHERAPY',
    }),
    (0, class_validator_1.IsEnum)(media_session_entity_1.MediaSessionType),
    __metadata("design:type", String)
], CreateMediaSessionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'ID of the context (therapy session or chat room)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMediaSessionDto.prototype, "contextId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Options for the media session',
        type: MediaSessionOptionsDto,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MediaSessionOptionsDto),
    __metadata("design:type", MediaSessionOptionsDto)
], CreateMediaSessionDto.prototype, "options", void 0);
class JoinMediaSessionDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Role of the participant (host or participant)',
        enum: ['host', 'participant'],
        example: 'participant',
    }),
    (0, class_validator_1.IsEnum)(['host', 'participant']),
    __metadata("design:type", String)
], JoinMediaSessionDto.prototype, "role", void 0);
class CreateBreakoutRoomDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Name of the breakout room',
        example: 'Group Discussion 1',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreakoutRoomDto.prototype, "name", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'ID of the host user',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreakoutRoomDto.prototype, "hostId", void 0);
class AdmitFromWaitingRoomDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'ID of the participant to admit',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitFromWaitingRoomDto.prototype, "participantId", void 0);
let MediaController = class MediaController {
    constructor(videoService, mediaSessionRepository) {
        this.videoService = videoService;
        this.mediaSessionRepository = mediaSessionRepository;
    }
    async createSession(req, createSessionDto) {
        const session = await this.videoService.createSession({
            type: createSessionDto.type,
            contextId: createSessionDto.contextId,
            startedBy: req.user.id,
            ...createSessionDto.options,
        });
        return {
            status: 'success',
            data: session,
        };
    }
    async joinSession(req, sessionId, joinSessionDto) {
        const result = await this.videoService.joinSession(sessionId, req.user.id, joinSessionDto.role);
        return {
            status: 'success',
            data: result,
        };
    }
    async leaveSession(req, sessionId) {
        await this.videoService.leaveSession(sessionId, req.user.id);
        return {
            status: 'success',
            message: 'Successfully left the session',
        };
    }
    async getSession(sessionId) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        return {
            status: 'success',
            data: session,
        };
    }
    async getActiveSessionByContext(type, contextId) {
        const session = await this.mediaSessionRepository.findActiveByContext(type, contextId);
        if (!session) {
            throw new common_1.NotFoundException('No active media session found for this context');
        }
        return {
            status: 'success',
            data: session,
        };
    }
    async getUserActiveSessions(req) {
        const sessions = await this.mediaSessionRepository.findByParticipant(req.user.id);
        return {
            status: 'success',
            data: sessions,
        };
    }
    async startRecording(req, sessionId) {
        await this.videoService.startRecording(sessionId);
        return {
            status: 'success',
            message: 'Recording started successfully',
        };
    }
    async stopRecording(req, sessionId) {
        await this.videoService.stopRecording(sessionId);
        return {
            status: 'success',
            message: 'Recording stopped successfully',
        };
    }
    async getSessionParticipants(sessionId) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        return {
            status: 'success',
            data: session.participants,
        };
    }
    async sendChatMessage(req, sessionId, message) {
        const chatMessage = await this.videoService.sendChatMessage(sessionId, {
            senderId: req.user.id,
            content: message.content,
            type: message.type || 'text',
            metadata: message.metadata,
        });
        return {
            status: 'success',
            data: chatMessage,
        };
    }
    async getChatHistory(sessionId, query) {
        const messages = await this.videoService.getChatHistory(sessionId, {
            startTime: query.startTime ? new Date(query.startTime) : undefined,
            endTime: query.endTime ? new Date(query.endTime) : undefined,
            limit: query.limit,
            offset: query.offset,
        });
        return {
            status: 'success',
            data: messages,
        };
    }
    async createBreakoutRooms(req, sessionId, rooms) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        if (session.startedBy !== req.user.id) {
            throw new common_1.ForbiddenException('Only the host can create breakout rooms');
        }
        const breakoutRooms = await this.videoService.createBreakoutRooms(sessionId, rooms);
        return {
            status: 'success',
            data: breakoutRooms,
        };
    }
    async joinBreakoutRoom(req, sessionId, roomId) {
        const result = await this.videoService.joinBreakoutRoom(sessionId, roomId, req.user.id);
        return {
            status: 'success',
            data: result,
        };
    }
    async endBreakoutRooms(req, sessionId) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        if (session.startedBy !== req.user.id) {
            throw new common_1.ForbiddenException('Only the host can end breakout rooms');
        }
        await this.videoService.endBreakoutRooms(sessionId);
        return {
            status: 'success',
            message: 'Breakout rooms ended successfully',
        };
    }
    async getWaitingRoomParticipants(req, sessionId) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        if (session.startedBy !== req.user.id) {
            throw new common_1.ForbiddenException('Only the host can view the waiting room');
        }
        const participants = await this.videoService.getWaitingRoomParticipants(sessionId);
        return {
            status: 'success',
            data: participants,
        };
    }
    async admitFromWaitingRoom(req, sessionId, admitDto) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        if (session.startedBy !== req.user.id) {
            throw new common_1.ForbiddenException('Only the host can admit participants');
        }
        const result = await this.videoService.admitFromWaitingRoom(sessionId, admitDto.participantId, req.user.id);
        return {
            status: 'success',
            data: result,
        };
    }
    async rejectFromWaitingRoom(req, sessionId, rejectDto) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        if (session.startedBy !== req.user.id) {
            throw new common_1.ForbiddenException('Only the host can reject participants');
        }
        await this.videoService.rejectFromWaitingRoom(sessionId, rejectDto.participantId);
        return {
            status: 'success',
            message: 'Participant rejected successfully',
        };
    }
    async updateSessionSettings(req, sessionId, settings) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        if (session.startedBy !== req.user.id) {
            throw new common_1.ForbiddenException('Only the host can update session settings');
        }
        await this.videoService.updateSessionSettings(sessionId, settings);
        return {
            status: 'success',
            message: 'Session settings updated successfully',
        };
    }
    async getSessionStats(req, sessionId) {
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Media session not found');
        }
        if (!session.participants.some(p => p.id === req.user.id)) {
            throw new common_1.ForbiddenException('Not authorized to view session statistics');
        }
        const stats = await this.videoService.getSessionStats(sessionId);
        return {
            status: 'success',
            data: stats,
        };
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new media session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Media session created successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateMediaSessionDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Join an existing media session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully joined the media session',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, JoinMediaSessionDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "joinSession", null);
__decorate([
    (0, common_1.Delete)(':sessionId/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a media session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully left the media session',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "leaveSession", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get media session details' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Media session details retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getSession", null);
__decorate([
    (0, common_1.Get)('context/:type/:contextId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active media session for a context' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Active media session retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('contextId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getActiveSessionByContext", null);
__decorate([
    (0, common_1.Get)('user/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user\'s active media sessions' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Active media sessions retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getUserActiveSessions", null);
__decorate([
    (0, common_1.Post)(':sessionId/recording/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start recording a media session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Recording started successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "startRecording", null);
__decorate([
    (0, common_1.Post)(':sessionId/recording/stop'),
    (0, swagger_1.ApiOperation)({ summary: 'Stop recording a media session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Recording stopped successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "stopRecording", null);
__decorate([
    (0, common_1.Get)(':sessionId/participants'),
    (0, swagger_1.ApiOperation)({ summary: 'Get session participants' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Session participants retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getSessionParticipants", null);
__decorate([
    (0, common_1.Post)(':sessionId/chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a chat message in the session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Chat message sent successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "sendChatMessage", null);
__decorate([
    (0, common_1.Get)(':sessionId/chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Get session chat history' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Chat history retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getChatHistory", null);
__decorate([
    (0, common_1.Post)(':sessionId/breakout-rooms'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create breakout rooms',
        description: 'Create multiple breakout rooms for a media session. Only the host can create breakout rooms.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Breakout rooms created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Only the host can create breakout rooms',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "createBreakoutRooms", null);
__decorate([
    (0, common_1.Post)(':sessionId/breakout-rooms/:roomId/join'),
    (0, swagger_1.ApiOperation)({
        summary: 'Join a breakout room',
        description: 'Join a specific breakout room in the media session.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully joined the breakout room',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "joinBreakoutRoom", null);
__decorate([
    (0, common_1.Post)(':sessionId/breakout-rooms/end'),
    (0, swagger_1.ApiOperation)({
        summary: 'End all breakout rooms',
        description: 'End all breakout rooms and return participants to the main session. Only the host can end breakout rooms.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Breakout rooms ended successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "endBreakoutRooms", null);
__decorate([
    (0, common_1.Get)(':sessionId/waiting-room'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get waiting room participants',
        description: 'Get list of participants in the waiting room. Only the host can view the waiting room.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Waiting room participants retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getWaitingRoomParticipants", null);
__decorate([
    (0, common_1.Post)(':sessionId/waiting-room/admit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admit participant from waiting room',
        description: 'Admit a participant from the waiting room to the main session. Only the host can admit participants.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Participant admitted successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AdmitFromWaitingRoomDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "admitFromWaitingRoom", null);
__decorate([
    (0, common_1.Post)(':sessionId/waiting-room/reject'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reject participant from waiting room',
        description: 'Reject a participant from the waiting room. Only the host can reject participants.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Participant rejected successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AdmitFromWaitingRoomDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "rejectFromWaitingRoom", null);
__decorate([
    (0, common_1.Patch)(':sessionId/settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update session settings',
        description: 'Update media session settings. Only the host can update settings.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Session settings updated successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "updateSessionSettings", null);
__decorate([
    (0, common_1.Get)(':sessionId/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get session statistics',
        description: 'Get detailed statistics about the media session.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Session statistics retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getSessionStats", null);
MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media Sessions'),
    (0, common_1.Controller)('media-sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [video_service_1.VideoService,
        media_session_repository_1.MediaSessionRepository])
], MediaController);
exports.MediaController = MediaController;
//# sourceMappingURL=media.controller.js.map
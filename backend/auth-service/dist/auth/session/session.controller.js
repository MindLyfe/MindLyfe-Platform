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
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const session_service_1 = require("./session.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const user_entity_1 = require("../../entities/user.entity");
let SessionController = class SessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    async getUserSessions(req) {
        return this.sessionService.getUserActiveSessions(req.user.sub);
    }
    async revokeSession(req, sessionId) {
        const session = await this.sessionService.findSessionByToken(sessionId);
        if (!session) {
            return;
        }
        if (session.userId !== req.user.sub) {
            throw new common_1.ForbiddenException('You can only revoke your own sessions');
        }
        await this.sessionService.revokeSession(sessionId, 'User initiated revocation');
    }
    async revokeAllSessions(req) {
        const currentSessionId = req.headers['x-session-id'];
        await this.sessionService.revokeAllUserSessions(req.user.sub, 'User initiated revocation of all sessions', currentSessionId);
    }
    async getUserSessionsByAdmin(userId) {
        return this.sessionService.getUserActiveSessions(userId);
    }
    async revokeAllSessionsByAdmin(userId) {
        await this.sessionService.revokeAllUserSessions(userId, 'Admin initiated revocation');
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user\'s active sessions',
        description: 'Returns a list of all active sessions for the currently authenticated user. This includes details like device, IP address, and last activity.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the user\'s active sessions',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' },
                    ipAddress: { type: 'string', example: '192.168.1.1' },
                    userAgent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    deviceInfo: { type: 'string', example: 'Windows 10, Chrome 91.0.4472.124' },
                    lastUsedAt: { type: 'string', format: 'date-time', example: '2025-05-18T12:34:56.789Z' },
                    createdAt: { type: 'string', format: 'date-time', example: '2025-05-15T09:23:45.678Z' },
                    expiresAt: { type: 'string', format: 'date-time', example: '2025-05-25T09:23:45.678Z' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getUserSessions", null);
__decorate([
    (0, common_1.Delete)('me/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke a specific session for the current user',
        description: 'Terminates a specific session identified by sessionId. This will immediately invalidate the associated refresh token.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'The ID of the session to revoke',
        type: 'string',
        example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t'
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Session revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Session belongs to another user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke all sessions for the current user except the current one',
        description: 'Terminates all sessions for the user except the one making this request. This is useful for logging out from other devices.'
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'All other sessions revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "revokeAllSessions", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active sessions for a specific user (admin only)',
        description: 'Returns a list of all active sessions for a specified user. This endpoint is restricted to administrators.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'The ID of the user whose sessions to retrieve',
        type: 'string',
        example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the user\'s active sessions',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' },
                    ipAddress: { type: 'string', example: '192.168.1.1' },
                    userAgent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    deviceInfo: { type: 'string', example: 'Windows 10, Chrome 91.0.4472.124' },
                    lastUsedAt: { type: 'string', format: 'date-time', example: '2025-05-18T12:34:56.789Z' },
                    createdAt: { type: 'string', format: 'date-time', example: '2025-05-15T09:23:45.678Z' },
                    expiresAt: { type: 'string', format: 'date-time', example: '2025-05-25T09:23:45.678Z' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires admin role' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getUserSessionsByAdmin", null);
__decorate([
    (0, common_1.Delete)('user/:userId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke all sessions for a specific user (admin only)',
        description: 'Terminates all sessions for a specified user. This endpoint is restricted to administrators.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'The ID of the user whose sessions to revoke',
        type: 'string',
        example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a'
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'All sessions for the user revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires admin role' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "revokeAllSessionsByAdmin", null);
exports.SessionController = SessionController = __decorate([
    (0, swagger_1.ApiTags)('sessions'),
    (0, common_1.Controller)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map
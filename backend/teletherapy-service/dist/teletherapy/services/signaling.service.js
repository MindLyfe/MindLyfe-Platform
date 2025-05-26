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
var SignalingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalingService = void 0;
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const media_session_repository_1 = require("../repositories/media-session.repository");
let SignalingService = SignalingService_1 = class SignalingService {
    constructor(jwtService, mediaSessionRepository) {
        this.jwtService = jwtService;
        this.mediaSessionRepository = mediaSessionRepository;
        this.logger = new common_1.Logger(SignalingService_1.name);
        this.connectedClients = new Map();
        this.sessionRooms = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            this.connectedClients.set(userId, client);
            const activeSessions = await this.mediaSessionRepository.findByParticipant(userId);
            for (const session of activeSessions) {
                await this.joinSessionRoom(client, session.id);
            }
            this.logger.log(`Client connected: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const userId = this.getUserIdFromSocket(client);
        if (userId) {
            this.connectedClients.delete(userId);
            this.logger.log(`Client disconnected: ${userId}`);
        }
    }
    getUserIdFromSocket(client) {
        for (const [userId, socket] of this.connectedClients.entries()) {
            if (socket === client) {
                return userId;
            }
        }
        return null;
    }
    async joinSessionRoom(client, sessionId) {
        const room = `session:${sessionId}`;
        await client.join(room);
        if (!this.sessionRooms.has(room)) {
            this.sessionRooms.set(room, new Set());
        }
        this.sessionRooms.get(room).add(client.id);
    }
    async leaveSessionRoom(client, sessionId) {
        const room = `session:${sessionId}`;
        await client.leave(room);
        const roomClients = this.sessionRooms.get(room);
        if (roomClients) {
            roomClients.delete(client.id);
            if (roomClients.size === 0) {
                this.sessionRooms.delete(room);
            }
        }
    }
    async handleJoinSession(client, data) {
        const { sessionId, userId } = data;
        const session = await this.mediaSessionRepository.findById(sessionId);
        if (!session) {
            client.emit('error', { message: 'Session not found' });
            return;
        }
        await this.joinSessionRoom(client, sessionId);
        client.to(`session:${sessionId}`).emit('peer-joined', { userId });
    }
    async handleLeaveSession(client, data) {
        const { sessionId, userId } = data;
        await this.leaveSessionRoom(client, sessionId);
        client.to(`session:${sessionId}`).emit('peer-left', { userId });
    }
    async handleOffer(client, message) {
        const { sessionId, userId, data } = message;
        const targetClient = this.connectedClients.get(data.targetUserId);
        if (targetClient) {
            targetClient.emit('offer', {
                sessionId,
                userId,
                data: data.offer,
            });
        }
    }
    async handleAnswer(client, message) {
        const { sessionId, userId, data } = message;
        const targetClient = this.connectedClients.get(data.targetUserId);
        if (targetClient) {
            targetClient.emit('answer', {
                sessionId,
                userId,
                data: data.answer,
            });
        }
    }
    async handleIceCandidate(client, message) {
        const { sessionId, userId, data } = message;
        const targetClient = this.connectedClients.get(data.targetUserId);
        if (targetClient) {
            targetClient.emit('ice-candidate', {
                sessionId,
                userId,
                data: data.candidate,
            });
        }
    }
    async handleMediaStatus(client, message) {
        const { sessionId, userId, data } = message;
        client.to(`session:${sessionId}`).emit('peer-media-status', {
            userId,
            data: {
                videoEnabled: data.videoEnabled,
                audioEnabled: data.audioEnabled,
                screenSharing: data.screenSharing,
            },
        });
    }
    async handleChatMessage(client, message) {
        const { sessionId, userId, data } = message;
        client.to(`session:${sessionId}`).emit('chat-message', {
            userId,
            data: {
                message: data.message,
                timestamp: new Date(),
            },
        });
    }
    async handleRaiseHand(client, message) {
        const { sessionId, userId } = message;
        client.to(`session:${sessionId}`).emit('peer-raised-hand', { userId });
    }
    async handleRecordingStatus(client, message) {
        const { sessionId, data } = message;
        client.to(`session:${sessionId}`).emit('recording-status-update', {
            status: data.status,
            startedBy: data.startedBy,
            timestamp: new Date(),
        });
    }
    broadcastToSession(sessionId, event, data) {
        this.server.to(`session:${sessionId}`).emit(event, data);
    }
    broadcastToUser(userId, event, data) {
        const client = this.connectedClients.get(userId);
        if (client) {
            client.emit(event, data);
        }
    }
};
__decorate([
    (0, common_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SignalingService.prototype, "server", void 0);
__decorate([
    (0, common_1.SubscribeMessage)('join-session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleJoinSession", null);
__decorate([
    (0, common_1.SubscribeMessage)('leave-session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleLeaveSession", null);
__decorate([
    (0, common_1.SubscribeMessage)('offer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleOffer", null);
__decorate([
    (0, common_1.SubscribeMessage)('answer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleAnswer", null);
__decorate([
    (0, common_1.SubscribeMessage)('ice-candidate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleIceCandidate", null);
__decorate([
    (0, common_1.SubscribeMessage)('media-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleMediaStatus", null);
__decorate([
    (0, common_1.SubscribeMessage)('chat-message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleChatMessage", null);
__decorate([
    (0, common_1.SubscribeMessage)('raise-hand'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleRaiseHand", null);
__decorate([
    (0, common_1.SubscribeMessage)('recording-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingService.prototype, "handleRecordingStatus", null);
SignalingService = SignalingService_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, common_1.WebSocketGateway)({
        namespace: 'signaling',
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        media_session_repository_1.MediaSessionRepository])
], SignalingService);
exports.SignalingService = SignalingService;
//# sourceMappingURL=signaling.service.js.map
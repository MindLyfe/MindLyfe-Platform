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
var VideoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
const therapy_session_entity_2 = require("../entities/therapy-session.entity");
const storage_service_1 = require("./storage.service");
const notification_service_1 = require("./notification.service");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const redis_service_1 = require("../services/redis.service");
const mediasoup_service_1 = require("./mediasoup.service");
const signaling_service_1 = require("./signaling.service");
const recording_service_1 = require("./recording.service");
const crypto = require("crypto");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const media_session_repository_1 = require("../repositories/media-session.repository");
const media_session_entity_1 = require("../entities/media-session.entity");
let VideoService = VideoService_1 = class VideoService {
    constructor(sessionRepository, redisService, mediasoupService, signalingService, recordingService, storageService, notificationService, configService, httpService, mediaSessionRepository) {
        this.sessionRepository = sessionRepository;
        this.redisService = redisService;
        this.mediasoupService = mediasoupService;
        this.signalingService = signalingService;
        this.recordingService = recordingService;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.configService = configService;
        this.httpService = httpService;
        this.mediaSessionRepository = mediaSessionRepository;
        this.logger = new common_1.Logger(VideoService_1.name);
        this.activeSessions = new Map();
        this.breakoutRooms = new Map();
        this.waitingRoom = new Map();
        this.chatMessages = new Map();
    }
    async validateUser(userId) {
        try {
            const authServiceUrl = this.configService.get('services.authServiceUrl');
            const response = await this.httpService.get(`${authServiceUrl}/api/auth/users/${userId}`).toPromise();
            return response.status === 200;
        }
        catch (error) {
            this.logger.error(`Failed to validate user ${userId}: ${error.message}`);
            return false;
        }
    }
    async onModuleInit() {
        await this.mediasoupService.initializeWorker();
        await this.initializeMediasoup();
        this.initializeWebSocketHandlers();
    }
    async initializeMediasoup() {
        this.worker = this.mediasoupService.getWorker();
        if (!this.worker) {
            throw new Error('MediaSoup worker not initialized');
        }
        this.logger.log('Mediasoup worker initialized from MediaSoupService');
    }
    initializeWebSocketHandlers() {
        this.server.on('connection', (socket) => {
            this.logger.log(`Client connected: ${socket.id}`);
            socket.on('join-session', async (data) => {
                try {
                    const { token, routerRtpCapabilities } = await this.handleJoinSession(data.sessionId, data.userId, data.role);
                    socket.emit('join-session-success', { token, routerRtpCapabilities });
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            socket.on('produce', async (data) => {
                try {
                    const producer = await this.handleProduce(data);
                    socket.emit('produce-success', { producerId: producer.id });
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            socket.on('consume', async (data) => {
                try {
                    const { consumer, params } = await this.handleConsume(data);
                    socket.emit('consume-success', { consumerId: consumer.id, params });
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            socket.on('disconnect', () => {
                this.logger.log(`Client disconnected: ${socket.id}`);
                this.handleDisconnect(socket.id);
            });
        });
    }
    async createSession(options) {
        try {
            const mediaSession = new media_session_entity_1.MediaSession();
            mediaSession.type = options.type;
            mediaSession.contextId = options.contextId;
            mediaSession.startedBy = options.startedBy;
            mediaSession.status = media_session_entity_1.MediaSessionStatus.PENDING;
            mediaSession.metadata = options.options || {};
            mediaSession.participants = [];
            const savedSession = await this.mediaSessionRepository.save(mediaSession);
            await this.initializeSession(savedSession.id, options.options);
            return savedSession;
        }
        catch (error) {
            this.logger.error(`Error creating session: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create session');
        }
    }
    async getWaitingRoomParticipants(sessionId) {
        try {
            const waitingRoomKey = `waiting_room:${sessionId}`;
            const participants = await this.redisService.smembers(waitingRoomKey);
            return participants || [];
        }
        catch (error) {
            this.logger.error(`Error getting waiting room participants: ${error.message}`);
            return [];
        }
    }
    async rejectFromWaitingRoom(sessionId, participantId) {
        try {
            const waitingRoomKey = `waiting_room:${sessionId}`;
            await this.redisService.srem(waitingRoomKey, participantId);
            this.server.to(`user:${participantId}`).emit('waiting-room-rejected', { sessionId });
            this.logger.log(`Participant ${participantId} rejected from waiting room for session ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Error rejecting participant from waiting room: ${error.message}`);
            throw new common_1.BadRequestException('Failed to reject participant');
        }
    }
    async updateSessionSettings(sessionId, settings) {
        try {
            const session = await this.mediaSessionRepository.findOne({ where: { id: sessionId } });
            if (!session) {
                throw new common_1.NotFoundException('Session not found');
            }
            session.metadata = { ...session.metadata, ...settings };
            await this.mediaSessionRepository.save(session);
            this.server.to(`session:${sessionId}`).emit('session-settings-updated', settings);
            this.logger.log(`Session settings updated for session ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Error updating session settings: ${error.message}`);
            throw new common_1.BadRequestException('Failed to update session settings');
        }
    }
    async getSessionStats(sessionId) {
        try {
            const sessionData = this.activeSessions.get(sessionId);
            if (!sessionData) {
                throw new common_1.NotFoundException('Session not found');
            }
            const participants = Array.from(sessionData.participants.keys());
            const stats = {
                sessionId,
                participantCount: participants.length,
                participants,
                startTime: sessionData.startTime,
                duration: sessionData.startTime ? Date.now() - sessionData.startTime.getTime() : 0,
                breakoutRooms: this.breakoutRooms.get(sessionId)?.length || 0,
                recording: sessionData.recordings?.length > 0 || false,
            };
            return stats;
        }
        catch (error) {
            this.logger.error(`Error getting session stats: ${error.message}`);
            throw new common_1.BadRequestException('Failed to get session stats');
        }
    }
    async initializeSession(sessionId, options = {}) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
            relations: ['therapist', 'client', 'participants'],
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.status !== therapy_session_entity_2.SessionStatus.SCHEDULED) {
            throw new common_1.BadRequestException('Session is not in scheduled status');
        }
        const router = await this.worker.createRouter({
            mediaCodecs: [
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': options.startBitrate || 1000,
                    },
                },
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
            ],
        });
        this.activeSessions.set(sessionId, {
            router,
            transports: new Map(),
            producers: new Map(),
            consumers: new Map(),
            options,
            participants: new Set(),
            recordings: [],
            startTime: new Date(),
            metadata: {},
        });
        const token = this.generateToken(sessionId, session.therapistId, 'host');
        await this.sessionRepository.update(sessionId, {
            metadata: {
                ...session.metadata,
                video: {
                    routerId: router.id,
                    options: options,
                    status: 'initialized',
                },
            },
        });
        return {
            token,
            routerRtpCapabilities: router.rtpCapabilities,
        };
    }
    async handleJoinSession(sessionId, userId, role) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
            relations: ['therapist', 'client', 'participants'],
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const isValidUser = await this.validateUser(userId);
        if (!isValidUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!this.isUserAuthorized(session, userId)) {
            throw new common_1.BadRequestException('User is not authorized to join this session');
        }
        if (sessionData.options.enableWaitingRoom && role === 'participant') {
            const waitingRoom = this.waitingRoom.get(sessionId) || [];
            if (!waitingRoom.includes(userId)) {
                waitingRoom.push(userId);
                this.waitingRoom.set(sessionId, waitingRoom);
                await this.notificationService.sendNotification({
                    type: 'WAITING_ROOM_JOIN',
                    recipientId: session.therapistId,
                    channels: ['in-app', 'email'],
                    variables: {
                        title: 'New Participant in Waiting Room',
                        message: `User ${userId} is waiting to join the session`,
                        sessionId,
                        participantId: userId,
                    },
                });
                return {
                    token: this.generateToken(sessionId, userId, 'waiting_room'),
                    routerRtpCapabilities: sessionData.router.rtpCapabilities,
                };
            }
        }
        const transport = await sessionData.router.createWebRtcTransport({
            listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate: sessionData.options.startBitrate || 1000,
        });
        sessionData.transports.set(userId, transport);
        sessionData.participants.add(userId);
        return {
            token: this.generateToken(sessionId, userId, role),
            routerRtpCapabilities: sessionData.router.rtpCapabilities,
        };
    }
    async handleProduce(data) {
        const sessionData = this.activeSessions.get(data.sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const transport = sessionData.transports.get(data.userId);
        if (!transport) {
            throw new common_1.BadRequestException('Transport not found');
        }
        const producer = await transport.produce({
            kind: data.kind,
            rtpParameters: data.rtpParameters,
            appData: data.appData,
        });
        sessionData.producers.set(producer.id, producer);
        this.server.to(data.sessionId).emit('new-producer', {
            producerId: producer.id,
            kind: producer.kind,
            userId: data.userId,
        });
        return producer;
    }
    async handleConsume(data) {
        const sessionData = this.activeSessions.get(data.sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const transport = sessionData.transports.get(data.userId);
        if (!transport) {
            throw new common_1.BadRequestException('Transport not found');
        }
        const producer = sessionData.producers.get(data.producerId);
        if (!producer) {
            throw new common_1.BadRequestException('Producer not found');
        }
        if (!sessionData.router.canConsume({
            producerId: producer.id,
            rtpCapabilities: data.rtpCapabilities,
        })) {
            throw new common_1.BadRequestException('Cannot consume this producer');
        }
        const consumer = await transport.consume({
            producerId: producer.id,
            rtpCapabilities: data.rtpCapabilities,
            paused: true,
        });
        sessionData.consumers.set(consumer.id, consumer);
        setTimeout(() => consumer.resume(), 1000);
        return {
            consumer,
            params: {
                id: consumer.id,
                producerId: producer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                type: consumer.type,
                producerPaused: consumer.producerPaused,
            },
        };
    }
    handleDisconnect(socketId) {
        for (const [sessionId, sessionData] of this.activeSessions.entries()) {
            sessionData.transports.delete(socketId);
            sessionData.participants.delete(socketId);
            const producerIds = Array.from(sessionData.producers.keys())
                .filter(id => id.startsWith(socketId));
            producerIds.forEach(id => sessionData.producers.delete(id));
            const consumerIds = Array.from(sessionData.consumers.keys())
                .filter(id => id.startsWith(socketId));
            consumerIds.forEach(id => sessionData.consumers.delete(id));
            if (sessionData.participants.size === 0) {
                this.endSession(sessionId);
            }
        }
    }
    generateToken(sessionId, userId, role) {
        const payload = {
            sessionId,
            userId,
            role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        };
        return crypto
            .createHmac('sha256', process.env.JWT_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');
    }
    async joinSession(sessionId, userId, role) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
            relations: ['therapist', 'client', 'participants'],
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const isValidUser = await this.validateUser(userId);
        if (!isValidUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const isAuthorized = this.isUserAuthorized(session, userId);
        if (!isAuthorized) {
            throw new common_1.BadRequestException('User is not authorized to join this session');
        }
        if (sessionData.options.enableWaitingRoom && role === 'participant') {
            const waitingRoom = this.waitingRoom.get(sessionId) || [];
            if (!waitingRoom.includes(userId)) {
                waitingRoom.push(userId);
                this.waitingRoom.set(sessionId, waitingRoom);
                await this.notificationService.sendNotification({
                    type: 'WAITING_ROOM_JOIN',
                    recipientId: session.therapistId,
                    channels: ['in-app', 'email'],
                    variables: {
                        title: 'New Participant in Waiting Room',
                        message: `User ${userId} is waiting to join the session`,
                        sessionId,
                        participantId: userId,
                    },
                });
                return {
                    token: this.generateToken(sessionId, userId, 'waiting_room'),
                    roomName: sessionId,
                    isInWaitingRoom: true,
                };
            }
        }
        const token = this.generateToken(sessionId, userId, role);
        sessionData.participants.add(userId);
        this.activeSessions.set(sessionId, sessionData);
        return {
            token,
            roomName: sessionId,
            isInWaitingRoom: false,
        };
    }
    async leaveSession(sessionId, userId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        sessionData.participants.delete(userId);
        const waitingRoom = this.waitingRoom.get(sessionId) || [];
        const waitingRoomIndex = waitingRoom.indexOf(userId);
        if (waitingRoomIndex !== -1) {
            waitingRoom.splice(waitingRoomIndex, 1);
            this.waitingRoom.set(sessionId, waitingRoom);
        }
        const breakoutRooms = this.breakoutRooms.get(sessionId) || [];
        for (const room of breakoutRooms) {
            const participantIndex = room.participants.indexOf(userId);
            if (participantIndex !== -1) {
                room.participants.splice(participantIndex, 1);
            }
        }
        if (sessionData.participants.size === 0) {
            await this.endSession(sessionId);
        }
    }
    async admitFromWaitingRoom(sessionId, participantId, admittedBy) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const waitingRoom = this.waitingRoom.get(sessionId) || [];
        const waitingRoomIndex = waitingRoom.indexOf(participantId);
        if (waitingRoomIndex === -1) {
            throw new common_1.BadRequestException('Participant is not in waiting room');
        }
        waitingRoom.splice(waitingRoomIndex, 1);
        this.waitingRoom.set(sessionId, waitingRoom);
        const token = this.generateToken(sessionId, participantId, 'participant');
        sessionData.participants.add(participantId);
        this.activeSessions.set(sessionId, sessionData);
        await this.notificationService.sendNotification({
            type: 'WAITING_ROOM_ADMITTED',
            recipientId: participantId,
            channels: ['in-app', 'push'],
            variables: {
                title: 'Admitted to Session',
                message: 'You have been admitted to the therapy session',
                sessionId,
                admittedBy,
            },
        });
        return {
            token,
            roomName: sessionId,
        };
    }
    async createBreakoutRooms(sessionId, rooms) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        if (!sessionData.options.enableBreakoutRooms) {
            throw new common_1.BadRequestException('Breakout rooms are not enabled for this session');
        }
        const breakoutRooms = await Promise.all(rooms.map(async (room) => {
            const router = await this.mediasoupService.createRouter({
                mediaCodecs: [
                    {
                        kind: 'video',
                        mimeType: 'video/VP8',
                        clockRate: 90000,
                        parameters: {
                            'x-google-start-bitrate': sessionData.options.startBitrate || 1000,
                        },
                    },
                    {
                        kind: 'audio',
                        mimeType: 'audio/opus',
                        clockRate: 48000,
                        channels: 2,
                    },
                ],
            });
            const producerTransport = await this.mediasoupService.createWebRtcTransport(router, {
                listenIps: [{ ip: '0.0.0.0', announcedIp: this.configService.get('MEDIASOUP_ANNOUNCED_IP', '127.0.0.1') }],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
                initialAvailableOutgoingBitrate: sessionData.options.startBitrate || 1000,
            });
            return {
                id: `breakout_${sessionId}_${room.name}`,
                name: room.name,
                participants: [],
                hostId: room.hostId,
                startTime: new Date(),
                router,
                producerTransport,
                consumerTransports: new Map(),
            };
        }));
        this.breakoutRooms.set(sessionId, breakoutRooms);
        return breakoutRooms;
    }
    async joinBreakoutRoom(sessionId, roomId, userId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const breakoutRooms = this.breakoutRooms.get(sessionId) || [];
        const room = breakoutRooms.find((r) => r.id === roomId);
        if (!room) {
            throw new common_1.NotFoundException('Breakout room not found');
        }
        const token = this.generateToken(sessionId, userId, 'participant');
        if (!room.participants.includes(userId)) {
            room.participants.push(userId);
        }
        return {
            token,
            roomName: roomId,
        };
    }
    async endBreakoutRooms(sessionId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const breakoutRooms = this.breakoutRooms.get(sessionId) || [];
        await Promise.all(breakoutRooms.map(async (room) => {
            for (const transport of room.consumerTransports.values()) {
                transport.close();
            }
            if (room.producerTransport) {
                room.producerTransport.close();
            }
            room.endTime = new Date();
        }));
        this.breakoutRooms.delete(sessionId);
    }
    async sendChatMessage(sessionId, message) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        if (!sessionData.options.enableChat) {
            throw new common_1.BadRequestException('Chat is not enabled for this session');
        }
        const chatMessage = {
            ...message,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
        };
        const messages = this.chatMessages.get(sessionId) || [];
        messages.push(chatMessage);
        this.chatMessages.set(sessionId, messages);
        if (sessionData.options.chatRetentionDays) {
            await this.storeChatMessage(sessionId, chatMessage);
        }
        return chatMessage;
    }
    async getChatHistory(sessionId, options = {}) {
        const messages = this.chatMessages.get(sessionId) || [];
        let filteredMessages = messages;
        if (options.startTime) {
            filteredMessages = filteredMessages.filter((msg) => msg.timestamp >= options.startTime);
        }
        if (options.endTime) {
            filteredMessages = filteredMessages.filter((msg) => msg.timestamp <= options.endTime);
        }
        const offset = options.offset || 0;
        const limit = options.limit || 50;
        return filteredMessages.slice(offset, offset + limit);
    }
    async startRecording(sessionId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        if (!sessionData.options.enableRecording) {
            throw new common_1.BadRequestException('Recording is not enabled for this session');
        }
        const videoStreams = [];
        const audioStreams = [];
        for (const producer of sessionData.producers.values()) {
            if (producer.kind === 'video') {
                videoStreams.push({
                    url: `mediasoup://${producer.id}`,
                    type: producer.appData?.source === 'screen' ? 'screen' : 'camera',
                });
            }
            else if (producer.kind === 'audio') {
                audioStreams.push({
                    url: `mediasoup://${producer.id}`,
                    type: producer.appData?.source === 'system' ? 'system' : 'mic',
                });
            }
        }
        const { recordingId } = await this.recordingService.startRecording(sessionId, [...videoStreams.map(v => ({ video: v })), ...audioStreams.map(a => ({ audio: a }))], {
            quality: sessionData.options.recordingQuality || 'medium',
            format: 'mp4',
            resolution: '720p',
        });
        if (!sessionData.recordings) {
            sessionData.recordings = [];
        }
        sessionData.recordings.push({
            recordingId,
            startTime: new Date(),
        });
        this.activeSessions.set(sessionId, sessionData);
    }
    async stopRecording(sessionId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const activeRecording = sessionData.recordings?.find((r) => !r.endTime);
        if (!activeRecording) {
            throw new common_1.BadRequestException('No active recording found');
        }
        await this.recordingService.stopRecording(activeRecording.recordingId);
        activeRecording.endTime = new Date();
        await this.sessionRepository.update(sessionId, {
            metadata: {
                ...sessionData.metadata,
                video: {
                    ...sessionData.metadata.video,
                    recordings: sessionData.recordings,
                },
            },
        });
    }
    async endSession(sessionId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        if (sessionData.options.enableBreakoutRooms) {
            await this.endBreakoutRooms(sessionId);
        }
        const activeRecording = sessionData.recordings?.find((r) => !r.endTime);
        if (activeRecording) {
            await this.stopRecording(sessionId);
        }
        for (const transport of sessionData.transports.values()) {
            transport.close();
        }
        await this.sessionRepository.update(sessionId, {
            status: therapy_session_entity_2.SessionStatus.COMPLETED,
            metadata: {
                ...sessionData.metadata,
                video: {
                    ...sessionData.metadata.video,
                    status: 'ended',
                    endTime: new Date(),
                    recordings: sessionData.recordings,
                    chatHistory: sessionData.options.enableChat
                        ? await this.getChatHistory(sessionId)
                        : undefined,
                },
            },
        });
        this.activeSessions.delete(sessionId);
        this.breakoutRooms.delete(sessionId);
        this.waitingRoom.delete(sessionId);
        this.chatMessages.delete(sessionId);
    }
    isUserAuthorized(session, userId) {
        return (session.therapistId === userId ||
            session.clientId === userId ||
            session.participantIds.includes(userId));
    }
    async storeChatMessage(sessionId, message) {
    }
    async disconnectParticipant(sessionId, participantId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        const participantTransports = Array.from(sessionData.transports.entries())
            .filter(([id, transport]) => id.startsWith(`${participantId}:`))
            .map(([id, transport]) => transport);
        for (const transport of participantTransports) {
            transport.close();
        }
        sessionData.participants.delete(participantId);
        this.signalingService.broadcastToUser(participantId, 'disconnect', {
            reason: 'disconnected-by-host',
            sessionId,
        });
    }
    async getRoomParticipants(sessionId) {
        const sessionData = this.activeSessions.get(sessionId);
        if (!sessionData) {
            throw new common_1.BadRequestException('Session is not active');
        }
        return Array.from(sessionData.participants);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], VideoService.prototype, "server", void 0);
VideoService = VideoService_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
        namespace: 'video',
    }),
    __param(0, (0, typeorm_1.InjectRepository)(therapy_session_entity_1.TherapySession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        mediasoup_service_1.MediaSoupService,
        signaling_service_1.SignalingService,
        recording_service_1.RecordingService,
        storage_service_1.StorageService,
        notification_service_1.TeletherapyNotificationService,
        config_1.ConfigService,
        axios_1.HttpService,
        media_session_repository_1.MediaSessionRepository])
], VideoService);
exports.VideoService = VideoService;
//# sourceMappingURL=video.service.js.map
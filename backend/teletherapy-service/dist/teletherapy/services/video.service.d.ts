import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TherapySession } from '../entities/therapy-session.entity';
import { StorageService } from './storage.service';
import { TeletherapyNotificationService } from './notification.service';
import { Server } from 'socket.io';
import { RedisService } from '../services/redis.service';
import { MediaSoupService } from './mediasoup.service';
import { SignalingService } from './signaling.service';
import { RecordingService } from './recording.service';
import * as mediasoup from 'mediasoup';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { MediaSessionRepository } from '../repositories/media-session.repository';
import { MediaSession, MediaSessionType } from '../entities/media-session.entity';
export interface VideoSessionOptions {
    enableRecording?: boolean;
    enableChat?: boolean;
    enableScreenSharing?: boolean;
    enableWaitingRoom?: boolean;
    enableBreakoutRooms?: boolean;
    maxParticipants?: number;
    recordingQuality?: 'high' | 'medium' | 'low';
    chatRetentionDays?: number;
    waitingRoomTimeout?: number;
    videoCodec?: 'VP8' | 'VP9' | 'H264';
    audioCodec?: 'opus';
    maxBitrate?: number;
    minBitrate?: number;
    startBitrate?: number;
    adaptiveBitrate?: boolean;
}
export interface BreakoutRoom {
    id: string;
    name: string;
    participants: string[];
    hostId: string;
    startTime?: Date;
    endTime?: Date;
    router: mediasoup.types.Router;
    producerTransport: mediasoup.types.WebRtcTransport;
    consumerTransports: Map<string, mediasoup.types.WebRtcTransport>;
}
export interface ChatMessage {
    id: string;
    sessionId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'file' | 'system';
    metadata?: {
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        fileType?: string;
    };
}
export declare class VideoService implements OnModuleInit {
    private readonly sessionRepository;
    private readonly redisService;
    private readonly mediasoupService;
    private readonly signalingService;
    private readonly recordingService;
    private readonly storageService;
    private readonly notificationService;
    private readonly configService;
    private readonly httpService;
    private readonly mediaSessionRepository;
    private readonly logger;
    server: Server;
    private worker;
    private activeSessions;
    private breakoutRooms;
    private waitingRoom;
    private chatMessages;
    constructor(sessionRepository: Repository<TherapySession>, redisService: RedisService, mediasoupService: MediaSoupService, signalingService: SignalingService, recordingService: RecordingService, storageService: StorageService, notificationService: TeletherapyNotificationService, configService: ConfigService, httpService: HttpService, mediaSessionRepository: MediaSessionRepository);
    private validateUser;
    onModuleInit(): Promise<void>;
    private initializeMediasoup;
    private initializeWebSocketHandlers;
    createSession(options: {
        type: MediaSessionType;
        contextId: string;
        startedBy: string;
        options?: VideoSessionOptions;
    }): Promise<MediaSession>;
    getWaitingRoomParticipants(sessionId: string): Promise<string[]>;
    rejectFromWaitingRoom(sessionId: string, participantId: string): Promise<void>;
    updateSessionSettings(sessionId: string, settings: Partial<VideoSessionOptions>): Promise<void>;
    getSessionStats(sessionId: string): Promise<any>;
    initializeSession(sessionId: string, options?: VideoSessionOptions): Promise<{
        token: string;
        routerRtpCapabilities: any;
    }>;
    private handleJoinSession;
    private handleProduce;
    private handleConsume;
    private handleDisconnect;
    private generateToken;
    joinSession(sessionId: string, userId: string, role: 'host' | 'participant'): Promise<{
        token: string;
        roomName: string;
        isInWaitingRoom: boolean;
    }>;
    leaveSession(sessionId: string, userId: string): Promise<void>;
    admitFromWaitingRoom(sessionId: string, participantId: string, admittedBy: string): Promise<{
        token: string;
        roomName: string;
    }>;
    createBreakoutRooms(sessionId: string, rooms: {
        name: string;
        hostId: string;
    }[]): Promise<BreakoutRoom[]>;
    joinBreakoutRoom(sessionId: string, roomId: string, userId: string): Promise<{
        token: string;
        roomName: string;
    }>;
    endBreakoutRooms(sessionId: string): Promise<void>;
    sendChatMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
    getChatHistory(sessionId: string, options?: {
        startTime?: Date;
        endTime?: Date;
        limit?: number;
        offset?: number;
    }): Promise<ChatMessage[]>;
    startRecording(sessionId: string): Promise<void>;
    stopRecording(sessionId: string): Promise<void>;
    endSession(sessionId: string): Promise<void>;
    private isUserAuthorized;
    private storeChatMessage;
    disconnectParticipant(sessionId: string, participantId: string): Promise<void>;
    getRoomParticipants(sessionId: string): Promise<string[]>;
}

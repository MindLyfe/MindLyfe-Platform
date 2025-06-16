import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TherapySession } from '../entities/therapy-session.entity';
// User entity is managed by auth-service
import { SessionStatus, SessionType } from '../entities/therapy-session.entity';
import { StorageService } from './storage.service';
import { TeletherapyNotificationService } from './notification.service';
import * as moment from 'moment-timezone';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RedisService } from '../services/redis.service';
import { MediaSoupService } from './mediasoup.service';
import { SignalingService } from './signaling.service';
import { RecordingService } from './recording.service';
import * as mediasoup from 'mediasoup';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { MediaSessionRepository } from '../repositories/media-session.repository';
import { MediaSession, MediaSessionType, MediaSessionStatus } from '../entities/media-session.entity';

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

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: 'video',
})
export class VideoService implements OnModuleInit {
  private readonly logger = new Logger(VideoService.name);
  @WebSocketServer() server: Server;

  private worker: mediasoup.types.Worker;
  private activeSessions: Map<string, {
    router: mediasoup.types.Router;
    transports: Map<string, mediasoup.types.WebRtcTransport>;
    producers: Map<string, mediasoup.types.Producer>;
    consumers: Map<string, mediasoup.types.Consumer>;
    options: VideoSessionOptions;
    participants: Set<string>;
    recordings: {
      recordingId: string;
      startTime: Date;
      endTime?: Date;
    }[];
    startTime: Date;
    metadata: any;
  }> = new Map();

  private breakoutRooms: Map<string, BreakoutRoom[]> = new Map();
  private waitingRoom: Map<string, string[]> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();

  constructor(
    @InjectRepository(TherapySession)
    private readonly sessionRepository: Repository<TherapySession>,
    // User repository replaced with HTTP calls to auth service
    private readonly redisService: RedisService,
    private readonly mediasoupService: MediaSoupService,
    private readonly signalingService: SignalingService,
    private readonly recordingService: RecordingService,
    private readonly storageService: StorageService,
    private readonly notificationService: TeletherapyNotificationService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly mediaSessionRepository: MediaSessionRepository,
  ) {
    // Don't initialize here - moved to onModuleInit
  }

  private async validateUser(userId: string): Promise<boolean> {
    try {
      const authServiceUrl = this.configService.get<string>('services.authServiceUrl');
      const response = await this.httpService.get(`${authServiceUrl}/api/auth/users/${userId}`).toPromise();
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Failed to validate user ${userId}: ${error.message}`);
      return false;
    }
  }

  async onModuleInit() {
    // Initialize MediaSoup worker and router
    await this.mediasoupService.initializeWorker();
    // Initialize MediaSoup worker for this service
    await this.initializeMediasoup();
    // Initialize WebSocket handlers after server is ready
    this.initializeWebSocketHandlers();
  }

  private async initializeMediasoup() {
    // Use the worker from MediaSoupService instead of creating a new one
    // The MediaSoupService already created and configured the worker
    this.worker = this.mediasoupService.getWorker();
    
    if (!this.worker) {
      throw new Error('MediaSoup worker not initialized');
    }

    this.logger.log('Mediasoup worker initialized from MediaSoupService');
  }

  private initializeWebSocketHandlers() {
    this.server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

      socket.on('join-session', async (data: { sessionId: string; userId: string; role: string }) => {
        try {
          const { token, routerRtpCapabilities } = await this.handleJoinSession(
            data.sessionId,
            data.userId,
            data.role,
          );
          socket.emit('join-session-success', { token, routerRtpCapabilities });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('produce', async (data: {
        sessionId: string;
        userId: string;
        kind: 'audio' | 'video';
        rtpParameters: any;
        appData: any;
      }) => {
        try {
          const producer = await this.handleProduce(data);
          socket.emit('produce-success', { producerId: producer.id });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('consume', async (data: {
        sessionId: string;
        userId: string;
        producerId: string;
        rtpCapabilities: any;
      }) => {
        try {
          const { consumer, params } = await this.handleConsume(data);
          socket.emit('consume-success', { consumerId: consumer.id, params });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        this.logger.log(`Client disconnected: ${socket.id}`);
        this.handleDisconnect(socket.id);
      });
    });
  }

  async createSession(options: {
    type: MediaSessionType;
    contextId: string;
    startedBy: string;
    options?: VideoSessionOptions;
  }): Promise<MediaSession> {
    try {
      const mediaSession = new MediaSession();
      mediaSession.type = options.type;
      mediaSession.contextId = options.contextId;
      mediaSession.startedBy = options.startedBy;
      mediaSession.status = MediaSessionStatus.PENDING;
      mediaSession.metadata = options.options || {};
      mediaSession.participants = [];

      const savedSession = await this.mediaSessionRepository.save(mediaSession);
      
      // Initialize MediaSoup router for this session
      await this.initializeSession(savedSession.id, options.options);
      
      return savedSession;
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`);
      throw new BadRequestException('Failed to create session');
    }
  }

  async getWaitingRoomParticipants(sessionId: string): Promise<string[]> {
    try {
      const waitingRoomKey = `waiting_room:${sessionId}`;
      const participants = await this.redisService.smembers(waitingRoomKey);
      return participants || [];
    } catch (error) {
      this.logger.error(`Error getting waiting room participants: ${error.message}`);
      return [];
    }
  }

  async rejectFromWaitingRoom(sessionId: string, participantId: string): Promise<void> {
    try {
      const waitingRoomKey = `waiting_room:${sessionId}`;
      await this.redisService.srem(waitingRoomKey, participantId);
      
      // Notify the participant they were rejected
      this.server.to(`user:${participantId}`).emit('waiting-room-rejected', { sessionId });
      
      this.logger.log(`Participant ${participantId} rejected from waiting room for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error rejecting participant from waiting room: ${error.message}`);
      throw new BadRequestException('Failed to reject participant');
    }
  }

  async updateSessionSettings(sessionId: string, settings: Partial<VideoSessionOptions>): Promise<void> {
    try {
      const session = await this.mediaSessionRepository.findOne({ where: { id: sessionId } });
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      session.metadata = { ...session.metadata, ...settings };
      await this.mediaSessionRepository.save(session);
      
      // Broadcast settings update to all participants
      this.server.to(`session:${sessionId}`).emit('session-settings-updated', settings);
      
      this.logger.log(`Session settings updated for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error updating session settings: ${error.message}`);
      throw new BadRequestException('Failed to update session settings');
    }
  }

  async getSessionStats(sessionId: string): Promise<any> {
    try {
      const sessionData = this.activeSessions.get(sessionId);
      if (!sessionData) {
        throw new NotFoundException('Session not found');
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
    } catch (error) {
      this.logger.error(`Error getting session stats: ${error.message}`);
      throw new BadRequestException('Failed to get session stats');
    }
  }

  async initializeSession(
    sessionId: string,
    options: VideoSessionOptions = {},
  ): Promise<{
    token: string;
    routerRtpCapabilities: any;
  }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['therapist', 'client', 'participants'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Session is not in scheduled status');
    }

    // Create Mediasoup router
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

    // Store session data
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

    // Generate JWT token
    const token = this.generateToken(sessionId, session.therapistId, 'host');

    // Update session metadata
    await this.sessionRepository.update(sessionId, {
      metadata: {
        ...session.metadata,
        video: {
          routerId: router.id,
          options: options as any,
          status: 'initialized',
        },
      },
    });

    return {
      token,
      routerRtpCapabilities: router.rtpCapabilities,
    };
  }

  private async handleJoinSession(
    sessionId: string,
    userId: string,
    role: string,
  ): Promise<{ token: string; routerRtpCapabilities: any }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['therapist', 'client', 'participants'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const isValidUser = await this.validateUser(userId);
    if (!isValidUser) {
      throw new NotFoundException('User not found');
    }

    // Check authorization
    if (!this.isUserAuthorized(session, userId)) {
      throw new BadRequestException('User is not authorized to join this session');
    }

    // Handle waiting room
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

    // Create transport for the participant
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

  private async handleProduce(data: {
    sessionId: string;
    userId: string;
    kind: 'audio' | 'video';
    rtpParameters: any;
    appData: any;
  }): Promise<mediasoup.types.Producer> {
    const sessionData = this.activeSessions.get(data.sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const transport = sessionData.transports.get(data.userId);
    if (!transport) {
      throw new BadRequestException('Transport not found');
    }

    const producer = await transport.produce({
      kind: data.kind,
      rtpParameters: data.rtpParameters,
      appData: data.appData,
    });

    sessionData.producers.set(producer.id, producer);

    // Notify other participants
    this.server.to(data.sessionId).emit('new-producer', {
      producerId: producer.id,
      kind: producer.kind,
      userId: data.userId,
    });

    return producer;
  }

  private async handleConsume(data: {
    sessionId: string;
    userId: string;
    producerId: string;
    rtpCapabilities: any;
  }): Promise<{ consumer: mediasoup.types.Consumer; params: any }> {
    const sessionData = this.activeSessions.get(data.sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const transport = sessionData.transports.get(data.userId);
    if (!transport) {
      throw new BadRequestException('Transport not found');
    }

    const producer = sessionData.producers.get(data.producerId);
    if (!producer) {
      throw new BadRequestException('Producer not found');
    }

    if (!sessionData.router.canConsume({
      producerId: producer.id,
      rtpCapabilities: data.rtpCapabilities,
    })) {
      throw new BadRequestException('Cannot consume this producer');
    }

    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: data.rtpCapabilities,
      paused: true,
    });

    sessionData.consumers.set(consumer.id, consumer);

    // Resume consumer after setup
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

  private handleDisconnect(socketId: string) {
    for (const [sessionId, sessionData] of this.activeSessions.entries()) {
      // Cleanup transports and participants
      sessionData.transports.delete(socketId);
      sessionData.participants.delete(socketId);

      // Cleanup producers and consumers
      const producerIds = Array.from(sessionData.producers.keys())
        .filter(id => id.startsWith(socketId));
      producerIds.forEach(id => sessionData.producers.delete(id));

      const consumerIds = Array.from(sessionData.consumers.keys())
        .filter(id => id.startsWith(socketId));
      consumerIds.forEach(id => sessionData.consumers.delete(id));

      // End session if no participants left
      if (sessionData.participants.size === 0) {
        this.endSession(sessionId);
      }
    }
  }

  private generateToken(sessionId: string, userId: string, role: string): string {
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

  async joinSession(
    sessionId: string,
    userId: string,
    role: 'host' | 'participant',
  ): Promise<{
    token: string;
    roomName: string;
    isInWaitingRoom: boolean;
  }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['therapist', 'client', 'participants'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const isValidUser = await this.validateUser(userId);
    if (!isValidUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user is authorized to join
    const isAuthorized = this.isUserAuthorized(session, userId);
    if (!isAuthorized) {
      throw new BadRequestException('User is not authorized to join this session');
    }

    // Handle waiting room
    if (sessionData.options.enableWaitingRoom && role === 'participant') {
      const waitingRoom = this.waitingRoom.get(sessionId) || [];
      if (!waitingRoom.includes(userId)) {
        waitingRoom.push(userId);
        this.waitingRoom.set(sessionId, waitingRoom);
        
        // Notify host about new participant in waiting room
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

    // Generate token for main room
    const token = this.generateToken(sessionId, userId, role);

    // Update participant list
    sessionData.participants.add(userId);
    this.activeSessions.set(sessionId, sessionData);

    return {
      token,
      roomName: sessionId,
      isInWaitingRoom: false,
    };
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    // Remove from main room participants
    sessionData.participants.delete(userId);

    // Remove from waiting room if present
    const waitingRoom = this.waitingRoom.get(sessionId) || [];
    const waitingRoomIndex = waitingRoom.indexOf(userId);
    if (waitingRoomIndex !== -1) {
      waitingRoom.splice(waitingRoomIndex, 1);
      this.waitingRoom.set(sessionId, waitingRoom);
    }

    // Remove from breakout rooms if present
    const breakoutRooms = this.breakoutRooms.get(sessionId) || [];
    for (const room of breakoutRooms) {
      const participantIndex = room.participants.indexOf(userId);
      if (participantIndex !== -1) {
        room.participants.splice(participantIndex, 1);
      }
    }

    // Check if session should end
    if (sessionData.participants.size === 0) {
      await this.endSession(sessionId);
    }
  }

  async admitFromWaitingRoom(
    sessionId: string,
    participantId: string,
    admittedBy: string,
  ): Promise<{ token: string; roomName: string }> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const waitingRoom = this.waitingRoom.get(sessionId) || [];
    const waitingRoomIndex = waitingRoom.indexOf(participantId);
    if (waitingRoomIndex === -1) {
      throw new BadRequestException('Participant is not in waiting room');
    }

    // Remove from waiting room
    waitingRoom.splice(waitingRoomIndex, 1);
    this.waitingRoom.set(sessionId, waitingRoom);

    // Generate new token for main room
    const token = this.generateToken(sessionId, participantId, 'participant');

    // Add to main room participants
    sessionData.participants.add(participantId);
    this.activeSessions.set(sessionId, sessionData);

    // Send notification to admitted participant
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

  async createBreakoutRooms(
    sessionId: string,
    rooms: { name: string; hostId: string }[],
  ): Promise<BreakoutRoom[]> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    if (!sessionData.options.enableBreakoutRooms) {
      throw new BadRequestException('Breakout rooms are not enabled for this session');
    }

    const breakoutRooms: BreakoutRoom[] = await Promise.all(
      rooms.map(async (room) => {
        // Create a new router for each breakout room
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

        // Create a producer transport for the host
        const producerTransport = await this.mediasoupService.createWebRtcTransport(router, {
          listenIps: [{ ip: '0.0.0.0', announcedIp: this.configService.get<string>('MEDIASOUP_ANNOUNCED_IP', '127.0.0.1') }],
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
      }),
    );

    this.breakoutRooms.set(sessionId, breakoutRooms);
    return breakoutRooms;
  }

  async joinBreakoutRoom(
    sessionId: string,
    roomId: string,
    userId: string,
  ): Promise<{ token: string; roomName: string }> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const breakoutRooms = this.breakoutRooms.get(sessionId) || [];
    const room = breakoutRooms.find((r) => r.id === roomId);
    if (!room) {
      throw new NotFoundException('Breakout room not found');
    }

    // Generate token for breakout room
    const token = this.generateToken(sessionId, userId, 'participant');

    // Add to room participants
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
    }

    return {
      token,
      roomName: roomId,
    };
  }

  async endBreakoutRooms(sessionId: string): Promise<void> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const breakoutRooms = this.breakoutRooms.get(sessionId) || [];
    await Promise.all(
      breakoutRooms.map(async (room) => {
        // Close all transport connections
        for (const transport of room.consumerTransports.values()) {
          transport.close();
        }
        
        // Close producer transport
        if (room.producerTransport) {
          room.producerTransport.close();
        }
        
        // Update room end time
        room.endTime = new Date();
      }),
    );

    this.breakoutRooms.delete(sessionId);
  }

  async sendChatMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>,
  ): Promise<ChatMessage> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    if (!sessionData.options.enableChat) {
      throw new BadRequestException('Chat is not enabled for this session');
    }

    const chatMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    const messages = this.chatMessages.get(sessionId) || [];
    messages.push(chatMessage);
    this.chatMessages.set(sessionId, messages);

    // Store message in database if retention is enabled
    if (sessionData.options.chatRetentionDays) {
      await this.storeChatMessage(sessionId, chatMessage);
    }

    return chatMessage;
  }

  async getChatHistory(
    sessionId: string,
    options: {
      startTime?: Date;
      endTime?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<ChatMessage[]> {
    const messages = this.chatMessages.get(sessionId) || [];
    
    let filteredMessages = messages;
    if (options.startTime) {
      filteredMessages = filteredMessages.filter(
        (msg) => msg.timestamp >= options.startTime,
      );
    }
    if (options.endTime) {
      filteredMessages = filteredMessages.filter(
        (msg) => msg.timestamp <= options.endTime,
      );
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return filteredMessages.slice(offset, offset + limit);
  }

  async startRecording(sessionId: string): Promise<void> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    if (!sessionData.options.enableRecording) {
      throw new BadRequestException('Recording is not enabled for this session');
    }

    // Get the streams to record
    const videoStreams = [];
    const audioStreams = [];

    // Add all producer streams to recording
    for (const producer of sessionData.producers.values()) {
      if (producer.kind === 'video') {
        videoStreams.push({
          url: `mediasoup://${producer.id}`,
          type: producer.appData?.source === 'screen' ? 'screen' : 'camera',
        });
      } else if (producer.kind === 'audio') {
        audioStreams.push({
          url: `mediasoup://${producer.id}`,
          type: producer.appData?.source === 'system' ? 'system' : 'mic',
        });
      }
    }

    // Start recording using the recording service
    const { recordingId } = await this.recordingService.startRecording(
      sessionId,
      [...videoStreams.map(v => ({ video: v })), ...audioStreams.map(a => ({ audio: a }))],
      {
        quality: sessionData.options.recordingQuality || 'medium',
        format: 'mp4',
        resolution: '720p',
      }
    );

    // Store recording metadata
    if (!sessionData.recordings) {
      sessionData.recordings = [];
    }
    
    sessionData.recordings.push({
      recordingId,
      startTime: new Date(),
    });

    this.activeSessions.set(sessionId, sessionData);
  }

  async stopRecording(sessionId: string): Promise<void> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    const activeRecording = sessionData.recordings?.find(
      (r) => !r.endTime,
    );
    if (!activeRecording) {
      throw new BadRequestException('No active recording found');
    }

    await this.recordingService.stopRecording(activeRecording.recordingId);
    activeRecording.endTime = new Date();

    // Update session metadata with recording information
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

  async endSession(sessionId: string): Promise<void> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    // End all breakout rooms
    if (sessionData.options.enableBreakoutRooms) {
      await this.endBreakoutRooms(sessionId);
    }

    // Stop any active recordings
    const activeRecording = sessionData.recordings?.find((r) => !r.endTime);
    if (activeRecording) {
      await this.stopRecording(sessionId);
    }

    // Close all transports and router
    for (const transport of sessionData.transports.values()) {
      transport.close();
    }

    // Update session status
    await this.sessionRepository.update(sessionId, {
      status: SessionStatus.COMPLETED,
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

    // Clean up
    this.activeSessions.delete(sessionId);
    this.breakoutRooms.delete(sessionId);
    this.waitingRoom.delete(sessionId);
    this.chatMessages.delete(sessionId);
  }

  private isUserAuthorized(session: TherapySession, userId: string): boolean {
    return (
      session.therapistId === userId ||
      session.clientId === userId ||
      session.participantIds.includes(userId)
    );
  }

  private async storeChatMessage(
    sessionId: string,
    message: ChatMessage,
  ): Promise<void> {
    // Implement chat message storage logic
    // This could store messages in a database or file system
    // based on the retention policy
  }

  async disconnectParticipant(sessionId: string, participantId: string): Promise<void> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    // Find all transports for this participant and close them
    const participantTransports = Array.from(sessionData.transports.entries())
      .filter(([id, transport]) => id.startsWith(`${participantId}:`))
      .map(([id, transport]) => transport);

    for (const transport of participantTransports) {
      transport.close();
    }

    // Remove participant from the session
    sessionData.participants.delete(participantId);
    
    // Emit disconnect event to let the client know they've been disconnected
    this.signalingService.broadcastToUser(participantId, 'disconnect', {
      reason: 'disconnected-by-host',
      sessionId,
    });
  }
  
  async getRoomParticipants(sessionId: string): Promise<string[]> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }
    
    return Array.from(sessionData.participants);
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MediaSessionRepository } from '../repositories/media-session.repository';
import { MediaSession, MediaSessionType, MediaSessionStatus } from '../entities/media-session.entity';

interface SignalingMessage {
  type: string;
  data: any;
  sessionId: string;
  userId: string;
  contextType: MediaSessionType;
  contextId: string;
}

@Injectable()
@WebSocketGateway({
  namespace: 'signaling',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SignalingService implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SignalingService.name);
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly sessionRooms: Map<string, Set<string>> = new Map();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly mediaSessionRepository: MediaSessionRepository,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Verify JWT token
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store client connection
      this.connectedClients.set(userId, client);

      // Join user's active sessions
      const activeSessions = await this.mediaSessionRepository.findByParticipant(userId);
      for (const session of activeSessions) {
        await this.joinSessionRoom(client, session.id);
      }

      this.logger.log(`Client connected: ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      this.connectedClients.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }

  private getUserIdFromSocket(client: Socket): string | null {
    for (const [userId, socket] of this.connectedClients.entries()) {
      if (socket === client) {
        return userId;
      }
    }
    return null;
  }

  private async joinSessionRoom(client: Socket, sessionId: string) {
    const room = `session:${sessionId}`;
    await client.join(room);
    
    if (!this.sessionRooms.has(room)) {
      this.sessionRooms.set(room, new Set());
    }
    this.sessionRooms.get(room).add(client.id);
  }

  private async leaveSessionRoom(client: Socket, sessionId: string) {
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

  @SubscribeMessage('join-session')
  async handleJoinSession(client: Socket, data: { sessionId: string; userId: string }) {
    const { sessionId, userId } = data;
    const session = await this.mediaSessionRepository.findById(sessionId);
    
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    await this.joinSessionRoom(client, sessionId);
    client.to(`session:${sessionId}`).emit('peer-joined', { userId });
  }

  @SubscribeMessage('leave-session')
  async handleLeaveSession(client: Socket, data: { sessionId: string; userId: string }) {
    const { sessionId, userId } = data;
    await this.leaveSessionRoom(client, sessionId);
    client.to(`session:${sessionId}`).emit('peer-left', { userId });
  }

  @SubscribeMessage('offer')
  async handleOffer(client: Socket, message: SignalingMessage) {
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

  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, message: SignalingMessage) {
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

  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(client: Socket, message: SignalingMessage) {
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

  @SubscribeMessage('media-status')
  async handleMediaStatus(client: Socket, message: SignalingMessage) {
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

  @SubscribeMessage('chat-message')
  async handleChatMessage(client: Socket, message: SignalingMessage) {
    const { sessionId, userId, data } = message;
    client.to(`session:${sessionId}`).emit('chat-message', {
      userId,
      data: {
        message: data.message,
        timestamp: new Date(),
      },
    });
  }

  @SubscribeMessage('raise-hand')
  async handleRaiseHand(client: Socket, message: SignalingMessage) {
    const { sessionId, userId } = message;
    client.to(`session:${sessionId}`).emit('peer-raised-hand', { userId });
  }

  @SubscribeMessage('recording-status')
  async handleRecordingStatus(client: Socket, message: SignalingMessage) {
    const { sessionId, data } = message;
    client.to(`session:${sessionId}`).emit('recording-status-update', {
      status: data.status,
      startedBy: data.startedBy,
      timestamp: new Date(),
    });
  }

  broadcastToSession(sessionId: string, event: string, data: any) {
    this.server.to(`session:${sessionId}`).emit(event, data);
  }

  broadcastToUser(userId: string, event: string, data: any) {
    const client = this.connectedClients.get(userId);
    if (client) {
      client.emit(event, data);
    }
  }
} 
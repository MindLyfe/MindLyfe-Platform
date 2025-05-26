import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MediaSessionRepository } from '../repositories/media-session.repository';
import { MediaSessionType } from '../entities/media-session.entity';
interface SignalingMessage {
    type: string;
    data: any;
    sessionId: string;
    userId: string;
    contextType: MediaSessionType;
    contextId: string;
}
export declare class SignalingService implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly mediaSessionRepository;
    private readonly logger;
    private readonly connectedClients;
    private readonly sessionRooms;
    server: Server;
    constructor(jwtService: JwtService, mediaSessionRepository: MediaSessionRepository);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    private getUserIdFromSocket;
    private joinSessionRoom;
    private leaveSessionRoom;
    handleJoinSession(client: Socket, data: {
        sessionId: string;
        userId: string;
    }): Promise<void>;
    handleLeaveSession(client: Socket, data: {
        sessionId: string;
        userId: string;
    }): Promise<void>;
    handleOffer(client: Socket, message: SignalingMessage): Promise<void>;
    handleAnswer(client: Socket, message: SignalingMessage): Promise<void>;
    handleIceCandidate(client: Socket, message: SignalingMessage): Promise<void>;
    handleMediaStatus(client: Socket, message: SignalingMessage): Promise<void>;
    handleChatMessage(client: Socket, message: SignalingMessage): Promise<void>;
    handleRaiseHand(client: Socket, message: SignalingMessage): Promise<void>;
    handleRecordingStatus(client: Socket, message: SignalingMessage): Promise<void>;
    broadcastToSession(sessionId: string, event: string, data: any): void;
    broadcastToUser(userId: string, event: string, data: any): void;
}
export {};

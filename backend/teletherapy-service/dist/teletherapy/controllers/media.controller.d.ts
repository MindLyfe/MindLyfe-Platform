import { VideoService } from '../services/video.service';
import { MediaSessionType } from '../entities/media-session.entity';
import { MediaSessionRepository } from '../repositories/media-session.repository';
declare class MediaSessionOptionsDto {
    recording?: boolean;
    chat?: boolean;
    screenSharing?: boolean;
    maxParticipants?: number;
    waitingRoom?: boolean;
    breakoutRooms?: boolean;
    codec?: CodecOptionsDto;
}
declare class CodecOptionsDto {
    video?: string;
    audio?: string;
}
declare class CreateMediaSessionDto {
    type: MediaSessionType;
    contextId: string;
    options?: MediaSessionOptionsDto;
}
declare class JoinMediaSessionDto {
    role: 'host' | 'participant';
}
declare class CreateBreakoutRoomDto {
    name: string;
    hostId: string;
}
declare class AdmitFromWaitingRoomDto {
    participantId: string;
}
export declare class MediaController {
    private readonly videoService;
    private readonly mediaSessionRepository;
    constructor(videoService: VideoService, mediaSessionRepository: MediaSessionRepository);
    createSession(req: any, createSessionDto: CreateMediaSessionDto): Promise<{
        status: string;
        data: any;
    }>;
    joinSession(req: any, sessionId: string, joinSessionDto: JoinMediaSessionDto): Promise<{
        status: string;
        data: {
            token: string;
            roomName: string;
            isInWaitingRoom: boolean;
        };
    }>;
    leaveSession(req: any, sessionId: string): Promise<{
        status: string;
        message: string;
    }>;
    getSession(sessionId: string): Promise<{
        status: string;
        data: import("../entities/media-session.entity").MediaSession;
    }>;
    getActiveSessionByContext(type: MediaSessionType, contextId: string): Promise<{
        status: string;
        data: import("../entities/media-session.entity").MediaSession;
    }>;
    getUserActiveSessions(req: any): Promise<{
        status: string;
        data: import("../entities/media-session.entity").MediaSession[];
    }>;
    startRecording(req: any, sessionId: string): Promise<{
        status: string;
        message: string;
    }>;
    stopRecording(req: any, sessionId: string): Promise<{
        status: string;
        message: string;
    }>;
    getSessionParticipants(sessionId: string): Promise<{
        status: string;
        data: User[];
    }>;
    sendChatMessage(req: any, sessionId: string, message: {
        content: string;
        type?: 'text' | 'file';
        metadata?: any;
    }): Promise<{
        status: string;
        data: import("../services/video.service").ChatMessage;
    }>;
    getChatHistory(sessionId: string, query: {
        startTime?: string;
        endTime?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        status: string;
        data: import("../services/video.service").ChatMessage[];
    }>;
    createBreakoutRooms(req: any, sessionId: string, rooms: CreateBreakoutRoomDto[]): Promise<{
        status: string;
        data: import("../services/video.service").BreakoutRoom[];
    }>;
    joinBreakoutRoom(req: any, sessionId: string, roomId: string): Promise<{
        status: string;
        data: {
            token: string;
            roomName: string;
        };
    }>;
    endBreakoutRooms(req: any, sessionId: string): Promise<{
        status: string;
        message: string;
    }>;
    getWaitingRoomParticipants(req: any, sessionId: string): Promise<{
        status: string;
        data: any;
    }>;
    admitFromWaitingRoom(req: any, sessionId: string, admitDto: AdmitFromWaitingRoomDto): Promise<{
        status: string;
        data: {
            token: string;
            roomName: string;
        };
    }>;
    rejectFromWaitingRoom(req: any, sessionId: string, rejectDto: AdmitFromWaitingRoomDto): Promise<{
        status: string;
        message: string;
    }>;
    updateSessionSettings(req: any, sessionId: string, settings: Partial<MediaSessionOptionsDto>): Promise<{
        status: string;
        message: string;
    }>;
    getSessionStats(req: any, sessionId: string): Promise<{
        status: string;
        data: any;
    }>;
}
export {};

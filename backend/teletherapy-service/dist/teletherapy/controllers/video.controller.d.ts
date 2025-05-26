import { VideoService, VideoSessionOptions } from '../services/video.service';
export declare class VideoController {
    private readonly videoService;
    constructor(videoService: VideoService);
    initializeSession(sessionId: string, options: VideoSessionOptions): Promise<{
        token: string;
        routerRtpCapabilities: any;
    }>;
    joinSession(req: any, sessionId: string, role?: 'host' | 'participant'): Promise<{
        token: string;
        roomName: string;
        isInWaitingRoom: boolean;
    }>;
    leaveSession(req: any, sessionId: string): Promise<void>;
    admitFromWaitingRoom(req: any, sessionId: string, participantId: string): Promise<{
        token: string;
        roomName: string;
    }>;
    createBreakoutRooms(sessionId: string, rooms: {
        name: string;
        hostId: string;
    }[]): Promise<import("../services/video.service").BreakoutRoom[]>;
    joinBreakoutRoom(req: any, sessionId: string, roomId: string): Promise<{
        token: string;
        roomName: string;
    }>;
    endBreakoutRooms(sessionId: string): Promise<void>;
    sendChatMessage(req: any, sessionId: string, message: {
        content: string;
        type: 'text' | 'file' | 'system';
        metadata?: {
            fileUrl?: string;
            fileName?: string;
            fileSize?: number;
            fileType?: string;
        };
    }): Promise<import("../services/video.service").ChatMessage>;
    getChatHistory(sessionId: string, startTimeStr?: string, endTimeStr?: string, limitStr?: string, offsetStr?: string): Promise<import("../services/video.service").ChatMessage[]>;
    startRecording(sessionId: string): Promise<void>;
    stopRecording(sessionId: string): Promise<void>;
    getParticipants(sessionId: string): Promise<string[]>;
    disconnectParticipant(sessionId: string, participantSid: string): Promise<void>;
    endSession(sessionId: string): Promise<void>;
}

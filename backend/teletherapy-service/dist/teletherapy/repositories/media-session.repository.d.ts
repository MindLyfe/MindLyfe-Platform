import { Repository } from 'typeorm';
import { MediaSession, MediaSessionType, MediaSessionStatus } from '../entities/media-session.entity';
export declare class MediaSessionRepository {
    private readonly repository;
    constructor(repository: Repository<MediaSession>);
    create(data: Partial<MediaSession>): Promise<MediaSession>;
    save(entity: MediaSession): Promise<MediaSession>;
    findOne(options: any): Promise<MediaSession | null>;
    findById(id: string): Promise<MediaSession>;
    findByContext(type: MediaSessionType, contextId: string): Promise<MediaSession[]>;
    findActiveByContext(type: MediaSessionType, contextId: string): Promise<MediaSession>;
    findByParticipant(userId: string): Promise<MediaSession[]>;
    addParticipant(sessionId: string, userId: string): Promise<MediaSession>;
    removeParticipant(sessionId: string, userId: string): Promise<MediaSession>;
    updateStatus(id: string, status: MediaSessionStatus): Promise<MediaSession>;
    updateMetadata(id: string, metadata: Record<string, any>): Promise<MediaSession>;
    findActiveSessions(): Promise<MediaSession[]>;
    findSessionsInDateRange(startDate: Date, endDate: Date): Promise<MediaSession[]>;
}

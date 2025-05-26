import { Repository } from 'typeorm';
import { Recording, RecordingStatus, RecordingQuality } from '../entities/recording.entity';
export declare class RecordingRepository {
    private readonly repository;
    constructor(repository: Repository<Recording>);
    create(data: Partial<Recording>): Promise<Recording>;
    findById(id: string): Promise<Recording>;
    findBySessionId(sessionId: string): Promise<Recording[]>;
    findByUserId(userId: string): Promise<Recording[]>;
    findByStatus(status: RecordingStatus): Promise<Recording[]>;
    findByQuality(quality: RecordingQuality): Promise<Recording[]>;
    findExpired(): Promise<Recording[]>;
    findActive(): Promise<Recording[]>;
    findInDateRange(startDate: Date, endDate: Date): Promise<Recording[]>;
    update(id: string, data: Partial<Recording>): Promise<Recording>;
    updateStatus(id: string, status: RecordingStatus): Promise<Recording>;
    softDelete(id: string): Promise<void>;
    hardDelete(id: string): Promise<void>;
    getAnalytics(startDate: Date, endDate: Date): Promise<{
        totalRecordings: number;
        totalDuration: number;
        averageDuration: number;
        qualityDistribution: Record<RecordingQuality, number>;
        statusDistribution: Record<RecordingStatus, number>;
        storageUsage: number;
        errorRate: number;
    }>;
    getParticipantStats(recordingId: string): Promise<{
        totalParticipants: number;
        averageDuration: number;
        videoEnabledPercentage: number;
        audioEnabledPercentage: number;
        screenSharePercentage: number;
    }>;
}

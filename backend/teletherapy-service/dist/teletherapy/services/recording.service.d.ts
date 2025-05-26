import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
export interface RecordingOptions {
    quality?: 'high' | 'medium' | 'low';
    format?: 'mp4' | 'webm';
    resolution?: '1080p' | '720p' | '480p';
    audioBitrate?: number;
    videoBitrate?: number;
    fps?: number;
    audioChannels?: number;
    audioSampleRate?: number;
}
export declare class RecordingService {
    private readonly configService;
    private readonly storageService;
    private readonly logger;
    private activeRecordings;
    constructor(configService: ConfigService, storageService: StorageService);
    startRecording(sessionId: string, inputStreams: {
        video?: {
            url: string;
            type: 'screen' | 'camera';
        };
        audio?: {
            url: string;
            type: 'mic' | 'system';
        };
    }[], options?: RecordingOptions): Promise<{
        recordingId: string;
        outputPath: string;
    }>;
    stopRecording(recordingId: string): Promise<void>;
    getRecordingStatus(recordingId: string): Promise<{
        status: 'active' | 'completed' | 'failed';
        startTime: Date;
        duration?: number;
        metadata?: any;
    }>;
    getRecordingMetadata(recordingId: string): Promise<any>;
    private updateRecordingMetadata;
    private getVideoBitrate;
    cleanupOldRecordings(maxAgeDays?: number): Promise<void>;
}

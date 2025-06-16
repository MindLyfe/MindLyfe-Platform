import { TherapySession } from './therapy-session.entity';
export declare enum RecordingStatus {
    PENDING = "pending",
    RECORDING = "recording",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum RecordingQuality {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum RecordingFormat {
    MP4 = "mp4",
    WEBM = "webm"
}
export declare enum RecordingResolution {
    P1080 = "1080p",
    P720 = "720p",
    P480 = "480p"
}
export declare class Recording {
    id: string;
    sessionId: string;
    session: TherapySession;
    startedBy: string;
    status: RecordingStatus;
    quality: RecordingQuality;
    format: RecordingFormat;
    resolution: RecordingResolution;
    duration: number;
    fileSize: number;
    storageUrl: string;
    storageKey: string;
    streams: {
        video?: {
            url: string;
            type: 'screen' | 'camera';
        }[];
        audio?: {
            url: string;
            type: 'mic' | 'system';
        }[];
    };
    metadata: {
        videoBitrate?: number;
        audioBitrate?: number;
        fps?: number;
        audioChannels?: number;
        audioSampleRate?: number;
        error?: string;
        processingTime?: number;
        uploadTime?: Date;
        encryptionKey?: string;
        encryptionIv?: string;
    };
    analytics: {
        networkStats?: {
            averageBitrate: number;
            packetLoss: number;
            jitter: number;
            latency: number;
        };
        qualityMetrics?: {
            videoQuality: number;
            audioQuality: number;
            frameDrops: number;
            audioDrops: number;
        };
        participantStats?: {
            userId: string;
            joinTime: Date;
            leaveTime?: Date;
            duration: number;
            videoEnabled: boolean;
            audioEnabled: boolean;
            screenShared: boolean;
        }[];
    };
    createdAt: Date;
    updatedAt: Date;
    startedAt: Date;
    endedAt: Date;
    processedAt: Date;
    uploadedAt: Date;
    expiresAt: Date;
    isEncrypted: boolean;
    isDeleted: boolean;
    deletedAt: Date;
}

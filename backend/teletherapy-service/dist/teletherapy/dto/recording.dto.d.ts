export declare class RecordingChapterDto {
    title: string;
    startTime: number;
    endTime: number;
    description?: string;
}
export declare class RecordingAccessControlDto {
    allowedUsers: string[];
    password?: string;
    expiresAt?: Date;
}
export declare class StartRecordingDto {
    recordAudio?: boolean;
    recordVideo?: boolean;
    quality?: 'high' | 'medium' | 'low';
    format?: 'mp4' | 'webm';
}
export declare class UpdateRecordingDto {
    chapters?: RecordingChapterDto[];
    accessControl?: RecordingAccessControlDto;
    thumbnailUrl?: string;
}
export declare class RecordingPlaybackDto {
    url: string;
    duration: number;
    format: string;
    chapters: RecordingChapterDto[];
    accessControl: RecordingAccessControlDto;
}

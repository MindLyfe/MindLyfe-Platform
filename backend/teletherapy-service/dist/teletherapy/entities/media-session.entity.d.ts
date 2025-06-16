export declare enum MediaSessionType {
    TELETHERAPY = "teletherapy",
    CHAT = "chat"
}
export declare enum MediaSessionStatus {
    PENDING = "pending",
    ACTIVE = "active",
    ENDED = "ended"
}
export declare class MediaSession {
    id: string;
    type: MediaSessionType;
    contextId: string;
    participants: string[];
    status: MediaSessionStatus;
    startedBy: string;
    startedAt: Date;
    endedAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
}

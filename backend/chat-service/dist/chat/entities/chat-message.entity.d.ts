import { ChatRoom } from './chat-room.entity';
export declare enum AttachmentType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    DOCUMENT = "document",
    OTHER = "other"
}
export interface Attachment {
    id: string;
    type: AttachmentType;
    url: string;
    name: string;
    size: number;
    mimeType: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
}
export declare class ChatMessage {
    id: string;
    senderId: string;
    roomId: string;
    content: string;
    metadata: Record<string, any>;
    isRead: boolean;
    isAnonymous: boolean;
    attachments: Attachment[];
    reactions: {
        userId: string;
        type: string;
        timestamp: Date;
    }[];
    replyToMessageId: string;
    isModerated: boolean;
    moderatedBy: string;
    moderatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    room: ChatRoom;
}

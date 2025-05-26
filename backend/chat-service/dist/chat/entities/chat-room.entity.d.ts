import { ChatMessage } from './chat-message.entity';
export declare enum RoomType {
    DIRECT = "direct",
    GROUP = "group",
    SUPPORT = "support",
    THERAPY = "therapy"
}
export declare enum RoomStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
    HIDDEN = "hidden",
    MODERATED = "moderated"
}
export declare enum PrivacyLevel {
    PUBLIC = "public",
    PRIVATE = "private",
    ENCRYPTED = "encrypted"
}
export declare class ChatRoom {
    id: string;
    name: string;
    description: string;
    participants: string[];
    status: RoomStatus;
    type: RoomType;
    privacyLevel: PrivacyLevel;
    isModerated: boolean;
    moderatedBy: string;
    moderatedAt: Date;
    isEncrypted: boolean;
    metadata: Record<string, any>;
    lastMessageId: string;
    lastMessageAt: Date;
    lastMessagePreview: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    messages: ChatMessage[];
}

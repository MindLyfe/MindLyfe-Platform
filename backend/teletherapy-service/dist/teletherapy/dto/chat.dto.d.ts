export declare enum MessageType {
    TEXT = "text",
    SYSTEM = "system",
    PRIVATE = "private"
}
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read"
}
export declare class ChatMessageDto {
    content: string;
    type: MessageType;
    recipientId?: string;
    attachments?: string[];
    metadata?: Record<string, any>;
}
export declare class ChatSettingsDto {
    allowPrivateChat: boolean;
    allowFileSharing: boolean;
    moderationEnabled: boolean;
    autoArchive: boolean;
    archiveAfterDays: number;
}
export declare class UpdateChatSettingsDto {
    settings: ChatSettingsDto;
}
export declare class ChatHistoryDto {
    startDate: Date;
    endDate: Date;
    type?: MessageType;
    userId?: string;
}
export declare class ModerationActionDto {
    messageId: string;
    action: 'delete' | 'warn' | 'mute';
    reason?: string;
    muteDuration?: number;
}
export declare class ChatAttachmentDto {
    fileName: string;
    fileType: string;
    fileSize: number;
    content: string;
}

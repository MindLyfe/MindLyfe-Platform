import { AttachmentType } from '../entities/chat-message.entity';
export declare class AttachmentDto {
    id: string;
    type: AttachmentType;
    url: string;
    name: string;
    size: number;
    mimeType: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
}
export declare class CreateMessageDto {
    roomId: string;
    content: string;
    isAnonymous?: boolean;
    replyToMessageId?: string;
    attachments?: AttachmentDto[];
    metadata?: Record<string, any>;
}

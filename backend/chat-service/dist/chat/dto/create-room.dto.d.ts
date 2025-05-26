import { RoomType, PrivacyLevel } from '../entities/chat-room.entity';
export declare class CreateRoomDto {
    name: string;
    description?: string;
    participants: string[];
    type?: RoomType;
    privacyLevel?: PrivacyLevel;
    isEncrypted?: boolean;
    metadata?: Record<string, any>;
}

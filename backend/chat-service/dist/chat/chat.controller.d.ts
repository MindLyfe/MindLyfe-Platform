import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { ModerateMessageDto, ReportMessageDto } from './dto/moderation.dto';
import { JwtUser } from '../auth/interfaces/user.interface';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createRoom(createRoomDto: CreateRoomDto, user: JwtUser): Promise<import("./entities/chat-room.entity").ChatRoom>;
    getRooms(user: JwtUser): Promise<import("./entities/chat-room.entity").ChatRoom[]>;
    getRoomById(id: string, user: JwtUser): Promise<import("./entities/chat-room.entity").ChatRoom>;
    createMessage(createMessageDto: CreateMessageDto, user: JwtUser): Promise<import("./entities/chat-message.entity").ChatMessage>;
    getMessages(id: string, limit?: number, offset?: number, user?: JwtUser): Promise<import("./entities/chat-message.entity").ChatMessage[]>;
    markMessagesAsRead(id: string, user: JwtUser): Promise<{
        success: boolean;
    }>;
    moderateMessage(moderateDto: ModerateMessageDto, user: JwtUser): Promise<import("./entities/chat-message.entity").ChatMessage>;
    reportMessage(reportDto: ReportMessageDto, user: JwtUser): Promise<{
        success: boolean;
        message: string;
    }>;
}

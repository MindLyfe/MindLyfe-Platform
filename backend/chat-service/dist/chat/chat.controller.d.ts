import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { ModerateMessageDto, ReportMessageDto } from './dto/moderation.dto';
import { JwtUser } from '../auth/interfaces/user.interface';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    healthCheck(): Promise<{
        status: string;
        service: string;
        timestamp: string;
        version: string;
        features: string[];
    }>;
}
export declare class ChatRoomsController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createRoom(createRoomDto: CreateRoomDto, user: JwtUser): Promise<import("./entities/chat-room.entity").ChatRoom>;
    getRooms(user: JwtUser): Promise<any[]>;
    getRoomById(id: string, user: JwtUser): Promise<any>;
}
export declare class ChatMessagesController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createMessage(createMessageDto: CreateMessageDto, user: JwtUser): Promise<any>;
    getMessages(id: string, limit?: number, offset?: number, user?: JwtUser): Promise<any[]>;
    markMessagesAsRead(id: string, user: JwtUser): Promise<{
        success: boolean;
        timestamp: string;
    }>;
}
export declare class ChatSocialController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getChatEligibleUsers(user: JwtUser): Promise<any[]>;
    updateRoomIdentitySettings(id: string, settings: {
        allowRealNames?: boolean;
        showAnonymousNames?: boolean;
    }, user: JwtUser): Promise<{
        success: boolean;
        settings: {
            allowRealNames?: boolean;
            showAnonymousNames?: boolean;
        };
        updatedAt: string;
    }>;
}
export declare class ChatModerationController {
    private readonly chatService;
    constructor(chatService: ChatService);
    moderateMessage(moderateDto: ModerateMessageDto, user: JwtUser): Promise<import("./entities/chat-message.entity").ChatMessage>;
    reportMessage(reportDto: ReportMessageDto, user: JwtUser): Promise<{
        success: boolean;
        reportId: string;
        message: string;
        reportedAt: string;
        estimatedReviewTime: string;
    }>;
}

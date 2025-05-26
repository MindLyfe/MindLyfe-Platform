import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtUser } from '../auth/interfaces/user.interface';
import { AuthClientService } from '@mindlyf/shared/auth-client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class ChatService {
    private readonly messageRepository;
    private readonly roomRepository;
    private readonly authClient;
    private readonly httpService;
    private readonly configService;
    private readonly communityServiceUrl;
    private readonly teletherapyServiceUrl;
    constructor(messageRepository: Repository<ChatMessage>, roomRepository: Repository<ChatRoom>, authClient: AuthClientService, httpService: HttpService, configService: ConfigService);
    createRoom(createRoomDto: CreateRoomDto, user: JwtUser): Promise<ChatRoom>;
    private canUsersChat;
    private checkTherapistClientRelationship;
    getRooms(user: JwtUser): Promise<ChatRoom[]>;
    getRoomById(roomId: string, user: JwtUser): Promise<ChatRoom>;
    createMessage(createMessageDto: CreateMessageDto, user: JwtUser): Promise<ChatMessage>;
    getMessages(roomId: string, user: JwtUser, limit?: number, offset?: number): Promise<ChatMessage[]>;
    markMessagesAsRead(roomId: string, user: JwtUser): Promise<void>;
    moderateMessage(messageId: string, action: string, user: JwtUser): Promise<ChatMessage>;
    private checkRateLimiting;
}

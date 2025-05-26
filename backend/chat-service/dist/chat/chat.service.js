"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const auth_client_1 = require("@mindlyf/shared/auth-client");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const chat_room_entity_2 = require("./entities/chat-room.entity");
const config_1 = require("@nestjs/config");
let ChatService = class ChatService {
    constructor(messageRepository, roomRepository, authClient, httpService, configService) {
        this.messageRepository = messageRepository;
        this.roomRepository = roomRepository;
        this.authClient = authClient;
        this.httpService = httpService;
        this.configService = configService;
        this.communityServiceUrl = this.configService.get('services.communityServiceUrl', 'http://community-service:3004');
        this.teletherapyServiceUrl = this.configService.get('services.teletherapyServiceUrl', 'http://teletherapy-service:3002');
    }
    async createRoom(createRoomDto, user) {
        const userInfo = await this.authClient.validateUser(user.id);
        const isGroupChat = createRoomDto.participants.length > 2 ||
            createRoomDto.type === chat_room_entity_2.RoomType.GROUP ||
            createRoomDto.type === chat_room_entity_2.RoomType.SUPPORT ||
            createRoomDto.type === chat_room_entity_2.RoomType.THERAPY;
        if (isGroupChat) {
            const hasPermission = userInfo.roles.some(role => ['admin', 'therapist'].includes(role.toLowerCase()));
            if (!hasPermission) {
                throw new common_1.ForbiddenException('Only therapists and admins can create group chats');
            }
        }
        else {
            if (createRoomDto.participants.length !== 2) {
                createRoomDto.participants = createRoomDto.participants.slice(0, 2);
            }
            createRoomDto.type = chat_room_entity_2.RoomType.DIRECT;
            const otherUserId = createRoomDto.participants.find(id => id !== user.id);
            if (otherUserId && otherUserId !== user.id) {
                const otherUserInfo = await this.authClient.validateUser(otherUserId);
                const otherUserIsTherapist = otherUserInfo.roles.some(role => ['therapist'].includes(role.toLowerCase()));
                const userIsTherapist = userInfo.roles.some(role => ['therapist'].includes(role.toLowerCase()));
                if ((otherUserIsTherapist && !userIsTherapist) || (userIsTherapist && !otherUserIsTherapist)) {
                    const therapistId = otherUserIsTherapist ? otherUserId : user.id;
                    const clientId = otherUserIsTherapist ? user.id : otherUserId;
                    const hasSession = await this.checkTherapistClientRelationship(therapistId, clientId, user.token);
                    if (!hasSession) {
                        throw new common_1.ForbiddenException('You can only chat with a therapist after booking a session with them');
                    }
                }
                else if (!userInfo.roles.some(role => ['admin', 'therapist'].includes(role.toLowerCase()))) {
                    const canChat = await this.canUsersChat(user.id, otherUserId);
                    if (!canChat) {
                        throw new common_1.ForbiddenException('You can only chat with users who follow you or whom you follow');
                    }
                }
            }
        }
        if (!createRoomDto.participants.includes(user.id)) {
            createRoomDto.participants.push(user.id);
        }
        await Promise.all(createRoomDto.participants.map(async (participantId) => {
            try {
                await this.authClient.validateUser(participantId);
            }
            catch (error) {
                throw new common_1.BadRequestException(`Invalid participant ID: ${participantId}`);
            }
        }));
        const room = this.roomRepository.create({
            ...createRoomDto,
            participants: createRoomDto.participants,
            metadata: {
                ...createRoomDto.metadata,
                isPrivate: createRoomDto.metadata?.isPrivate || false,
                isEncrypted: createRoomDto.metadata?.isEncrypted || false,
            }
        });
        return this.roomRepository.save(room);
    }
    async canUsersChat(userId1, userId2) {
        try {
            const sharedRooms = await this.roomRepository
                .createQueryBuilder('room')
                .where(`room.participants @> :user1Id AND room.participants @> :user2Id`, {
                user1Id: JSON.stringify([userId1]),
                user2Id: JSON.stringify([userId2])
            })
                .getCount();
            if (sharedRooms > 0) {
                return true;
            }
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.communityServiceUrl}/api/follows/check`, {
                    params: {
                        followerId: userId1,
                        followedId: userId2,
                        checkBothDirections: true
                    }
                }));
                return response.data?.follows === true;
            }
            catch (error) {
                console.error('Error checking follow relationship:', error.message);
                return false;
            }
        }
        catch (error) {
            console.error('Error checking if users can chat:', error.message);
            return false;
        }
    }
    async checkTherapistClientRelationship(therapistId, clientId, token) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/relationship`, {
                params: {
                    therapistId: therapistId,
                    clientId: clientId
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }));
            return response.data?.hasRelationship === true;
        }
        catch (error) {
            console.error('Error checking therapist-client relationship:', error.message);
            return false;
        }
    }
    async getRooms(user) {
        await this.authClient.validateUser(user.id);
        return this.roomRepository
            .createQueryBuilder('room')
            .where(`room.participants @> :userId`, { userId: JSON.stringify([user.id]) })
            .orderBy('room.updatedAt', 'DESC')
            .getMany();
    }
    async getRoomById(roomId, user) {
        await this.authClient.validateUser(user.id);
        const room = await this.roomRepository.findOne({ where: { id: roomId } });
        if (!room) {
            throw new common_1.NotFoundException(`Chat room with ID ${roomId} not found`);
        }
        if (!room.participants.includes(user.id)) {
            throw new common_1.ForbiddenException('You are not a participant in this chat room');
        }
        return room;
    }
    async createMessage(createMessageDto, user) {
        await this.authClient.validateUser(user.id);
        const room = await this.getRoomById(createMessageDto.roomId, user);
        await this.checkRateLimiting(room.id, user.id);
        const message = this.messageRepository.create({
            ...createMessageDto,
            senderId: user.id,
            isAnonymous: createMessageDto.metadata?.isAnonymous || false,
        });
        await this.roomRepository.update(room.id, {
            updatedAt: new Date(),
            lastMessageAt: new Date(),
            lastMessagePreview: createMessageDto.content.substring(0, 50) + (createMessageDto.content.length > 50 ? '...' : '')
        });
        return this.messageRepository.save(message);
    }
    async getMessages(roomId, user, limit = 50, offset = 0) {
        await this.authClient.validateUser(user.id);
        await this.getRoomById(roomId, user);
        return this.messageRepository.find({
            where: { roomId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async markMessagesAsRead(roomId, user) {
        await this.authClient.validateUser(user.id);
        await this.getRoomById(roomId, user);
        await this.messageRepository
            .createQueryBuilder()
            .update(chat_message_entity_1.ChatMessage)
            .set({ isRead: true })
            .where('roomId = :roomId AND senderId != :userId AND isRead = false', {
            roomId,
            userId: user.id,
        })
            .execute();
    }
    async moderateMessage(messageId, action, user) {
        const userInfo = await this.authClient.validateUser(user.id);
        const hasModeratorRole = userInfo.roles.some(role => ['admin', 'moderator'].includes(role.toLowerCase()));
        if (!hasModeratorRole) {
            throw new common_1.ForbiddenException('Only moderators or admins can moderate messages');
        }
        const message = await this.messageRepository.findOne({ where: { id: messageId } });
        if (!message) {
            throw new common_1.NotFoundException(`Message with ID ${messageId} not found`);
        }
        switch (action) {
            case 'hide':
                message.metadata = { ...message.metadata, moderated: true, moderatedBy: user.id };
                message.content = '[This message has been hidden by a moderator]';
                break;
            case 'delete':
                await this.messageRepository.softDelete(messageId);
                message.metadata = { ...message.metadata, deleted: true, deletedBy: user.id };
                break;
            default:
                throw new common_1.BadRequestException(`Unknown moderation action: ${action}`);
        }
        return this.messageRepository.save(message);
    }
    async checkRateLimiting(roomId, userId) {
        const recentMessages = await this.messageRepository.count({
            where: {
                roomId,
                senderId: userId,
                createdAt: new Date(Date.now() - 60 * 1000),
            },
        });
        if (recentMessages > 10) {
            throw new common_1.ForbiddenException('Rate limit exceeded. Please wait before sending more messages.');
        }
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_room_entity_1.ChatRoom)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof auth_client_1.AuthClientService !== "undefined" && auth_client_1.AuthClientService) === "function" ? _a : Object, typeof (_b = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _b : Object, config_1.ConfigService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map
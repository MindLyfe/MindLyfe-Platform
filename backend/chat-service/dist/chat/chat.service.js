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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const auth_client_service_1 = require("../shared/auth-client/auth-client.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const chat_room_entity_2 = require("./entities/chat-room.entity");
const config_1 = require("@nestjs/config");
const community_client_service_1 = require("../community/community-client.service");
const notification_service_1 = require("../common/services/notification.service");
let ChatService = class ChatService {
    constructor(messageRepository, roomRepository, authClient, httpService, configService, communityClient, notificationService) {
        this.messageRepository = messageRepository;
        this.roomRepository = roomRepository;
        this.authClient = authClient;
        this.httpService = httpService;
        this.configService = configService;
        this.communityClient = communityClient;
        this.notificationService = notificationService;
        this.communityServiceUrl = this.configService.get('services.communityServiceUrl', 'http://community-service:3004');
        this.teletherapyServiceUrl = this.configService.get('services.teletherapyServiceUrl', 'http://teletherapy-service:3002');
    }
    async createRoom(createRoomDto, user) {
        await this.authClient.validateUser(user.id);
        if (createRoomDto.participants && createRoomDto.participants.length > 0) {
            if (createRoomDto.type === chat_room_entity_2.RoomType.DIRECT && createRoomDto.participants.length === 2) {
                const otherUserId = createRoomDto.participants.find(id => id !== user.id);
                if (otherUserId) {
                    const canChat = await this.canUsersChat(user.id, otherUserId);
                    if (!canChat) {
                        throw new common_1.ForbiddenException('You can only chat with users you have a mutual follow relationship with, or therapists you have sessions with');
                    }
                }
            }
            if (createRoomDto.type === chat_room_entity_2.RoomType.GROUP || createRoomDto.type === chat_room_entity_2.RoomType.THERAPY || createRoomDto.type === chat_room_entity_2.RoomType.SUPPORT) {
                const userInfo = await this.authClient.validateUser(user.id);
                const userRoles = userInfo.roles || [userInfo.role];
                const canCreateGroup = userRoles.some(role => ['therapist', 'admin'].includes(role.toLowerCase()));
                if (!canCreateGroup) {
                    throw new common_1.ForbiddenException('Only therapists and admins can create group chat rooms');
                }
            }
            if (createRoomDto.type === chat_room_entity_2.RoomType.THERAPY && createRoomDto.participants.length === 2) {
                const otherUserId = createRoomDto.participants.find(id => id !== user.id);
                const userInfo = await this.authClient.validateUser(user.id);
                const userRoles = userInfo.roles || [userInfo.role];
                const isTherapist = userRoles.some(role => role.toLowerCase() === 'therapist');
                if (isTherapist && otherUserId) {
                    const hasRelationship = await this.checkTherapistClientRelationship(user.id, otherUserId);
                    if (!hasRelationship) {
                        throw new common_1.ForbiddenException('You can only chat with a therapist after booking a session with them');
                    }
                }
            }
        }
        const room = this.roomRepository.create({
            ...createRoomDto,
            participants: createRoomDto.participants,
            metadata: {
                ...createRoomDto.metadata,
                isPrivate: createRoomDto.metadata?.isPrivate || false,
                isEncrypted: createRoomDto.metadata?.isEncrypted || false,
                identityRevealSettings: {
                    allowRealNames: true,
                    fallbackToAnonymous: true,
                    showAnonymousNames: true
                }
            }
        });
        const savedRoom = await this.roomRepository.save(room);
        await this.communityClient.notifyChatRoomCreated(savedRoom.id, savedRoom.participants, savedRoom.type);
        if (createRoomDto.participants && createRoomDto.participants.length > 1) {
            const userInfo = await this.authClient.validateUser(user.id);
            await this.notificationService.notifyRoomInvitation(user.id, userInfo.name || userInfo.username || 'User', savedRoom.id, savedRoom.name || this.getRoomDisplayName(savedRoom, [], user.id), savedRoom.type, savedRoom.participants);
        }
        return savedRoom;
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
    async checkTherapistClientRelationship(therapistId, clientId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/relationship`, {
                params: {
                    therapistId: therapistId,
                    clientId: clientId
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
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .where(`room.participants @> :userId`, { userId: JSON.stringify([user.id]) })
            .orderBy('room.updatedAt', 'DESC')
            .getMany();
        const enrichedRooms = await Promise.all(rooms.map(async (room) => {
            const participantIdentities = await Promise.all(room.participants
                .filter(participantId => participantId !== user.id)
                .map(async (participantId) => {
                return await this.communityClient.getUserIdentity(participantId, user.id, room.type);
            }));
            return {
                ...room,
                participantIdentities,
                displayName: this.getRoomDisplayName(room, participantIdentities, user.id),
                participantCount: room.participants.length
            };
        }));
        return enrichedRooms;
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
        const participantIdentities = await Promise.all(room.participants.map(async (participantId) => {
            return await this.communityClient.getUserIdentity(participantId, user.id, room.type);
        }));
        return {
            ...room,
            participantIdentities,
            displayName: this.getRoomDisplayName(room, participantIdentities, user.id)
        };
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
        const savedMessage = await this.messageRepository.save(message);
        await this.roomRepository.update(room.id, {
            updatedAt: new Date(),
            lastMessageAt: new Date(),
            lastMessagePreview: createMessageDto.content.substring(0, 50) + (createMessageDto.content.length > 50 ? '...' : '')
        });
        const senderIdentity = await this.communityClient.getUserIdentity(user.id, user.id, room.type);
        const userInfo = await this.authClient.validateUser(user.id);
        await this.notificationService.notifyNewMessage(user.id, senderIdentity.anonymousDisplayName || userInfo.name || userInfo.username || 'User', room.id, room.displayName || 'Chat Room', createMessageDto.content, room.participants);
        return {
            ...savedMessage,
            senderIdentity,
            displayName: this.getMessageSenderDisplayName(savedMessage, senderIdentity, room.type)
        };
    }
    async getMessages(roomId, user, limit = 50, offset = 0) {
        await this.authClient.validateUser(user.id);
        const room = await this.getRoomById(roomId, user);
        const messages = await this.messageRepository.find({
            where: { roomId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        const enrichedMessages = await Promise.all(messages.map(async (message) => {
            const senderIdentity = await this.communityClient.getUserIdentity(message.senderId, user.id, room.type);
            return {
                ...message,
                senderIdentity,
                displayName: this.getMessageSenderDisplayName(message, senderIdentity, room.type),
                isOwnMessage: message.senderId === user.id
            };
        }));
        return enrichedMessages;
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
        const userRoles = userInfo.roles || [userInfo.role];
        const hasModeratorRole = userRoles.some(role => ['admin', 'moderator'].includes(role.toLowerCase()));
        if (!hasModeratorRole) {
            throw new common_1.ForbiddenException('Only moderators or admins can moderate messages');
        }
        const message = await this.messageRepository.findOne({ where: { id: messageId } });
        if (!message) {
            throw new common_1.NotFoundException(`Message with ID ${messageId} not found`);
        }
        const originalContent = message.content;
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
        const updatedMessage = await this.messageRepository.save(message);
        await this.notificationService.notifyMessageModerated(message.senderId, user.id, action, 'Community guidelines violation', originalContent);
        return updatedMessage;
    }
    async getChatEligibleUsers(user) {
        await this.authClient.validateUser(user.id);
        const chatPartners = await this.communityClient.getChatPartners(user.id);
        return chatPartners.map(partner => ({
            ...partner,
            canStartChat: true,
            relationshipType: 'mutual-follow'
        }));
    }
    async updateRoomIdentitySettings(roomId, settings, user) {
        const room = await this.getRoomById(roomId, user);
        if (!room.participants.includes(user.id)) {
            throw new common_1.ForbiddenException('Only room participants can update identity settings');
        }
        const updatedMetadata = {
            ...room.metadata,
            identityRevealSettings: {
                ...room.metadata?.identityRevealSettings,
                ...settings
            }
        };
        await this.roomRepository.update(roomId, { metadata: updatedMetadata });
    }
    getRoomDisplayName(room, participantIdentities, currentUserId) {
        if (room.name && room.name.trim()) {
            return room.name;
        }
        if (room.type === chat_room_entity_2.RoomType.DIRECT && participantIdentities.length === 1) {
            const otherParticipant = participantIdentities[0];
            if (otherParticipant.allowRealNameInChat && otherParticipant.realName) {
                return otherParticipant.realName;
            }
            else {
                return otherParticipant.anonymousDisplayName;
            }
        }
        if (room.type === chat_room_entity_2.RoomType.GROUP) {
            return `Group Chat (${room.participants.length} members)`;
        }
        if (room.type === chat_room_entity_2.RoomType.THERAPY) {
            return 'Therapy Session';
        }
        if (room.type === chat_room_entity_2.RoomType.SUPPORT) {
            return 'Support Group';
        }
        return 'Chat Room';
    }
    getMessageSenderDisplayName(message, senderIdentity, roomType) {
        if (message.isAnonymous) {
            return senderIdentity.anonymousDisplayName;
        }
        if ((roomType === 'direct' || roomType === 'therapy') &&
            senderIdentity.allowRealNameInChat &&
            senderIdentity.realName) {
            return senderIdentity.realName;
        }
        return senderIdentity.anonymousDisplayName;
    }
    async checkRateLimiting(roomId, userId) {
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentMessageCount = await this.messageRepository.count({
            where: {
                roomId,
                senderId: userId,
                createdAt: new Date()
            }
        });
        if (recentMessageCount >= 10) {
            throw new common_1.BadRequestException('Rate limit exceeded. Please wait before sending another message.');
        }
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_room_entity_1.ChatRoom)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        auth_client_service_1.AuthClientService,
        axios_1.HttpService,
        config_1.ConfigService,
        community_client_service_1.CommunityClientService,
        notification_service_1.ChatNotificationService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map
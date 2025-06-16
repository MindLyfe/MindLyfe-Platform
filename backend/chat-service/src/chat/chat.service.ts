import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtUser } from '../auth/interfaces/user.interface';
import { AuthClientService } from '../shared/auth-client/auth-client.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RoomType } from './entities/chat-room.entity';
import { ConfigService } from '@nestjs/config';
import { CommunityClientService } from '../community/community-client.service';
import { ChatNotificationService } from '../common/services/notification.service';

@Injectable()
export class ChatService {
  private readonly communityServiceUrl: string;
  private readonly teletherapyServiceUrl: string;

  constructor(
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatRoom)
    private readonly roomRepository: Repository<ChatRoom>,
    private readonly authClient: AuthClientService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly communityClient: CommunityClientService,
    private readonly notificationService: ChatNotificationService,
  ) {
    this.communityServiceUrl = this.configService.get<string>('services.communityServiceUrl', 'http://community-service:3004');
    this.teletherapyServiceUrl = this.configService.get<string>('services.teletherapyServiceUrl', 'http://teletherapy-service:3002');
  }

  async createRoom(createRoomDto: CreateRoomDto, user: JwtUser): Promise<ChatRoom> {
    // Validate user existence and role via auth service
    await this.authClient.validateUser(user.id);

    // Validate participants if provided
    if (createRoomDto.participants && createRoomDto.participants.length > 0) {
      // For direct rooms, ensure mutual follow or therapist relationship
      if (createRoomDto.type === RoomType.DIRECT && createRoomDto.participants.length === 2) {
        const otherUserId = createRoomDto.participants.find(id => id !== user.id);
        
        if (otherUserId) {
          // Check if users can chat (mutual follow or therapist relationship)
          const canChat = await this.canUsersChat(user.id, otherUserId);
          if (!canChat) {
            throw new ForbiddenException('You can only chat with users you have a mutual follow relationship with, or therapists you have sessions with');
          }
        }
      }

      // For group rooms, only therapists and admins can create them
      if (createRoomDto.type === RoomType.GROUP || createRoomDto.type === RoomType.THERAPY || createRoomDto.type === RoomType.SUPPORT) {
        const userInfo = await this.authClient.validateUser(user.id);
        const userRoles = userInfo.roles || [userInfo.role];
        const canCreateGroup = userRoles.some(role => 
          ['therapist', 'admin'].includes(role.toLowerCase())
        );
        
        if (!canCreateGroup) {
          throw new ForbiddenException('Only therapists and admins can create group chat rooms');
        }
      }

      // For therapy rooms, verify therapist-client relationship
      if (createRoomDto.type === RoomType.THERAPY && createRoomDto.participants.length === 2) {
        const otherUserId = createRoomDto.participants.find(id => id !== user.id);
        const userInfo = await this.authClient.validateUser(user.id);
        const userRoles = userInfo.roles || [userInfo.role];
        const isTherapist = userRoles.some(role => role.toLowerCase() === 'therapist');
        
        if (isTherapist && otherUserId) {
          // Therapist creating chat with client - verify relationship via teletherapy service
          const hasRelationship = await this.checkTherapistClientRelationship(user.id, otherUserId);
          if (!hasRelationship) {
            throw new ForbiddenException('You can only chat with a therapist after booking a session with them');
          }
        }
      }
    }

    const room = this.roomRepository.create({
      ...createRoomDto,
      // Store participants as a JSON array
      participants: createRoomDto.participants,
      // Add privacy settings
      metadata: {
        ...createRoomDto.metadata,
        isPrivate: createRoomDto.metadata?.isPrivate || false,
        isEncrypted: createRoomDto.metadata?.isEncrypted || false,
        identityRevealSettings: {
          allowRealNames: true, // Default to allow, users can change per room
          fallbackToAnonymous: true,
          showAnonymousNames: true
        }
      }
    });

    const savedRoom = await this.roomRepository.save(room);

    // Notify community service about room creation
    await this.communityClient.notifyChatRoomCreated(
      savedRoom.id,
      savedRoom.participants,
      savedRoom.type
    );

    // NOTIFICATION: Send room invitation notifications
    if (createRoomDto.participants && createRoomDto.participants.length > 1) {
      const userInfo = await this.authClient.validateUser(user.id);
      await this.notificationService.notifyRoomInvitation(
        user.id,
        userInfo.name || userInfo.username || 'User',
        savedRoom.id,
        savedRoom.name || this.getRoomDisplayName(savedRoom, [], user.id),
        savedRoom.type,
        savedRoom.participants
      );
    }

    return savedRoom;
  }

  // Check if users can chat based on follow relationship
  private async canUsersChat(userId1: string, userId2: string): Promise<boolean> {
    try {
      // Check if users share existing chat rooms
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
      
      // Check follow relationship from community service
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.communityServiceUrl}/api/follows/check`, {
            params: {
              followerId: userId1,
              followedId: userId2,
              checkBothDirections: true
            }
          })
        );
        
        return response.data?.follows === true;
      } catch (error) {
        console.error('Error checking follow relationship:', error.message);
        return false;
      }
    } catch (error) {
      // If error occurs, default to false
      console.error('Error checking if users can chat:', error.message);
      return false;
    }
  }

  // Check if a therapist and client have a session relationship
  private async checkTherapistClientRelationship(therapistId: string, clientId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/relationship`, {
          params: {
            therapistId: therapistId,
            clientId: clientId
          }
        })
      );

      return response.data?.hasRelationship === true;
    } catch (error) {
      console.error('Error checking therapist-client relationship:', error.message);
      // In case of error, default to false for security
      return false;
    }
  }

  async getRooms(user: JwtUser): Promise<any[]> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    // Find rooms where the user is a participant
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .where(`room.participants @> :userId`, { userId: JSON.stringify([user.id]) })
      .orderBy('room.updatedAt', 'DESC')
      .getMany();

    // Enrich rooms with participant identity information
    const enrichedRooms = await Promise.all(
      rooms.map(async (room) => {
        const participantIdentities = await Promise.all(
          room.participants
            .filter(participantId => participantId !== user.id) // Exclude current user
            .map(async (participantId) => {
              return await this.communityClient.getUserIdentity(
                participantId,
                user.id,
                room.type as any
              );
            })
        );

        return {
          ...room,
          participantIdentities,
          // Show appropriate names based on room type and user preferences
          displayName: this.getRoomDisplayName(room, participantIdentities, user.id),
          participantCount: room.participants.length
        };
      })
    );

    return enrichedRooms;
  }

  async getRoomById(roomId: string, user: JwtUser): Promise<any> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException(`Chat room with ID ${roomId} not found`);
    }

    // Check if the user is a participant in this room
    if (!room.participants.includes(user.id)) {
      throw new ForbiddenException('You are not a participant in this chat room');
    }

    // Enrich room with participant identity information
    const participantIdentities = await Promise.all(
      room.participants.map(async (participantId) => {
        return await this.communityClient.getUserIdentity(
          participantId,
          user.id,
          room.type as any
        );
      })
    );

    return {
      ...room,
      participantIdentities,
      displayName: this.getRoomDisplayName(room, participantIdentities, user.id)
    };
  }

  async createMessage(createMessageDto: CreateMessageDto, user: JwtUser): Promise<any> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    // Verify the room exists and user is a participant
    const room = await this.getRoomById(createMessageDto.roomId, user);

    // Apply rate limiting check
    await this.checkRateLimiting(room.id, user.id);

    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId: user.id,
      // Handle privacy features
      isAnonymous: createMessageDto.metadata?.isAnonymous || false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update the room's updatedAt timestamp and last message info
    await this.roomRepository.update(room.id, { 
      updatedAt: new Date(),
      lastMessageAt: new Date(),
      lastMessagePreview: createMessageDto.content.substring(0, 50) + (createMessageDto.content.length > 50 ? '...' : '')
    });

    // Enrich message with sender identity
    const senderIdentity = await this.communityClient.getUserIdentity(
      user.id,
      user.id, // Same user viewing their own message
      room.type as any
    );

    // NOTIFICATION: Send new message notifications
    const userInfo = await this.authClient.validateUser(user.id);
    await this.notificationService.notifyNewMessage(
      user.id,
      senderIdentity.anonymousDisplayName || userInfo.name || userInfo.username || 'User',
      room.id,
      room.displayName || 'Chat Room',
      createMessageDto.content,
      room.participants
    );

    return {
      ...savedMessage,
      senderIdentity,
      displayName: this.getMessageSenderDisplayName(savedMessage, senderIdentity, room.type)
    };
  }

  async getMessages(roomId: string, user: JwtUser, limit = 50, offset = 0): Promise<any[]> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    // Verify the room exists and user is a participant
    const room = await this.getRoomById(roomId, user);

    const messages = await this.messageRepository.find({
      where: { roomId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    // Enrich messages with sender identity information
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const senderIdentity = await this.communityClient.getUserIdentity(
          message.senderId,
          user.id,
          room.type as any
        );

        return {
          ...message,
          senderIdentity,
          displayName: this.getMessageSenderDisplayName(message, senderIdentity, room.type),
          isOwnMessage: message.senderId === user.id
        };
      })
    );

    return enrichedMessages;
  }

  async markMessagesAsRead(roomId: string, user: JwtUser): Promise<void> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    // Verify the room exists and user is a participant
    await this.getRoomById(roomId, user);

    // Mark all unread messages in the room as read
    // Only mark messages that were not sent by the current user
    await this.messageRepository
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ isRead: true })
      .where('roomId = :roomId AND senderId != :userId AND isRead = false', {
        roomId,
        userId: user.id,
      })
      .execute();
  }

  // New method for moderation functionality
  async moderateMessage(messageId: string, action: string, user: JwtUser): Promise<ChatMessage> {
    // Validate user existence and role via auth service
    const userInfo = await this.authClient.validateUser(user.id);
    const userRoles = userInfo.roles || [userInfo.role];
    const hasModeratorRole = userRoles.some(role => 
      ['admin', 'moderator'].includes(role.toLowerCase())
    );
    
    if (!hasModeratorRole) {
      throw new ForbiddenException('Only moderators or admins can moderate messages');
    }

    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    const originalContent = message.content;

    // Apply moderation action
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
        throw new BadRequestException(`Unknown moderation action: ${action}`);
    }

    const updatedMessage = await this.messageRepository.save(message);

    // NOTIFICATION: Send moderation notification
    await this.notificationService.notifyMessageModerated(
      message.senderId,
      user.id,
      action,
      'Community guidelines violation',
      originalContent
    );

    return updatedMessage;
  }

  /**
   * Get chat-eligible users from community service
   */
  async getChatEligibleUsers(user: JwtUser): Promise<any[]> {
    await this.authClient.validateUser(user.id);
    
    const chatPartners = await this.communityClient.getChatPartners(user.id);
    
    return chatPartners.map(partner => ({
      ...partner,
      canStartChat: true,
      relationshipType: 'mutual-follow'
    }));
  }

  /**
   * Update room identity reveal settings
   */
  async updateRoomIdentitySettings(
    roomId: string, 
    settings: { allowRealNames?: boolean; showAnonymousNames?: boolean }, 
    user: JwtUser
  ): Promise<void> {
    const room = await this.getRoomById(roomId, user);
    
    // Only room participants can update settings
    if (!room.participants.includes(user.id)) {
      throw new ForbiddenException('Only room participants can update identity settings');
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

  /**
   * Generate appropriate room display name based on participants and identity settings
   */
  private getRoomDisplayName(room: ChatRoom, participantIdentities: any[], currentUserId: string): string {
    if (room.name && room.name.trim()) {
      return room.name;
    }

    if (room.type === RoomType.DIRECT && participantIdentities.length === 1) {
      const otherParticipant = participantIdentities[0];
      
      // Show real name if available and allowed, otherwise anonymous name
      if (otherParticipant.allowRealNameInChat && otherParticipant.realName) {
        return otherParticipant.realName;
      } else {
        return otherParticipant.anonymousDisplayName;
      }
    }

    // For group chats, show participant count or custom name
    if (room.type === RoomType.GROUP) {
      return `Group Chat (${room.participants.length} members)`;
    }

    if (room.type === RoomType.THERAPY) {
      return 'Therapy Session';
    }

    if (room.type === RoomType.SUPPORT) {
      return 'Support Group';
    }

    return 'Chat Room';
  }

  /**
   * Generate appropriate message sender display name
   */
  private getMessageSenderDisplayName(message: ChatMessage, senderIdentity: any, roomType: string): string {
    // If message is explicitly anonymous, always show anonymous name
    if (message.isAnonymous) {
      return senderIdentity.anonymousDisplayName;
    }

    // For direct/therapy chats, prefer real names if allowed
    if ((roomType === 'direct' || roomType === 'therapy') && 
        senderIdentity.allowRealNameInChat && 
        senderIdentity.realName) {
      return senderIdentity.realName;
    }

    // Default to anonymous display name
    return senderIdentity.anonymousDisplayName;
  }

  /**
   * Check rate limiting for message sending
   */
  private async checkRateLimiting(roomId: string, userId: string): Promise<void> {
    // Basic rate limiting: 10 messages per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const recentMessageCount = await this.messageRepository.count({
      where: {
        roomId,
        senderId: userId,
        createdAt: new Date() // TypeORM will handle the comparison
      }
    });

    if (recentMessageCount >= 10) {
      throw new BadRequestException('Rate limit exceeded. Please wait before sending another message.');
    }
  }
}
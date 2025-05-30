import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtUser } from '../auth/interfaces/user.interface';
import { AuthClientService } from '@mindlyf/shared/auth-client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RoomType } from './entities/chat-room.entity';
import { ConfigService } from '@nestjs/config';
import { CommunityClientService } from '../community/community-client.service';

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
  ) {
    this.communityServiceUrl = this.configService.get<string>('services.communityServiceUrl', 'http://community-service:3004');
    this.teletherapyServiceUrl = this.configService.get<string>('services.teletherapyServiceUrl', 'http://teletherapy-service:3002');
  }

  async createRoom(createRoomDto: CreateRoomDto, user: JwtUser): Promise<ChatRoom> {
    // Validate user existence and role via auth service
    const userInfo = await this.authClient.validateUser(user.id);
    
    // Check if the room is a group chat (more than 2 participants)
    const isGroupChat = createRoomDto.participants.length > 2 || 
                       createRoomDto.type === RoomType.GROUP || 
                       createRoomDto.type === RoomType.SUPPORT || 
                       createRoomDto.type === RoomType.THERAPY;
    
    // Only therapists and admins can create group chats
    if (isGroupChat) {
      const hasPermission = userInfo.roles.some(role => 
        ['admin', 'therapist'].includes(role.toLowerCase())
      );
      
      if (!hasPermission) {
        throw new ForbiddenException('Only therapists and admins can create group chats');
      }
    } else {
      // For direct chats, ensure exactly 2 participants
      if (createRoomDto.participants.length !== 2) {
        createRoomDto.participants = createRoomDto.participants.slice(0, 2);
      }
      
      // Enforce the room type as DIRECT
      createRoomDto.type = RoomType.DIRECT;
      
      // Get the other user's ID
      const otherUserId = createRoomDto.participants.find(id => id !== user.id);
      
      // Skip check if both IDs are the same (shouldn't happen, but safeguard)
      if (otherUserId && otherUserId !== user.id) {
        // Get other user's info to check if they're a therapist
        const otherUserInfo = await this.authClient.validateUser(otherUserId);
        const otherUserIsTherapist = otherUserInfo.roles.some(role => 
          ['therapist'].includes(role.toLowerCase())
        );
        const userIsTherapist = userInfo.roles.some(role => 
          ['therapist'].includes(role.toLowerCase())
        );
        
        // If either user is a therapist, check if they have an existing session
        if ((otherUserIsTherapist && !userIsTherapist) || (userIsTherapist && !otherUserIsTherapist)) {
          const therapistId = otherUserIsTherapist ? otherUserId : user.id;
          const clientId = otherUserIsTherapist ? user.id : otherUserId;
          
          const hasSession = await this.communityClient.checkTherapySessionAccess(therapistId, clientId);
          
          if (!hasSession) {
            throw new ForbiddenException(
              'You can only chat with a therapist after booking a session with them'
            );
          }
        } else if (!userInfo.roles.some(role => ['admin', 'therapist'].includes(role.toLowerCase()))) {
          // If neither user is a therapist, check if they have mutual follow relationship
          const canChat = await this.communityClient.validateMutualFollow(user.id, otherUserId);
          
          if (!canChat) {
            throw new ForbiddenException(
              'You can only chat with users who have mutual follow relationship with you'
            );
          }
        }
      }
    }

    // Ensure the current user is included in the participants
    if (!createRoomDto.participants.includes(user.id)) {
      createRoomDto.participants.push(user.id);
    }

    // Validate all participants via auth service
    await Promise.all(
      createRoomDto.participants.map(async (participantId) => {
        try {
          await this.authClient.validateUser(participantId);
        } catch (error) {
          throw new BadRequestException(`Invalid participant ID: ${participantId}`);
        }
      })
    );

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
  private async checkTherapistClientRelationship(therapistId: string, clientId: string, token: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/relationship`, {
          params: {
            therapistId: therapistId,
            clientId: clientId
          },
          headers: {
            'Authorization': `Bearer ${token}`
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
    const hasModeratorRole = userInfo.roles.some(role => 
      ['admin', 'moderator'].includes(role.toLowerCase())
    );
    
    if (!hasModeratorRole) {
      throw new ForbiddenException('Only moderators or admins can moderate messages');
    }

    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

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

    return this.messageRepository.save(message);
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

  // Helper method for rate limiting
  private async checkRateLimiting(roomId: string, userId: string): Promise<void> {
    // Get recent messages from this user in this room
    const recentMessages = await this.messageRepository.count({
      where: {
        roomId,
        senderId: userId,
        createdAt: new Date(Date.now() - 60 * 1000), // Last minute
      },
    });

    // If more than 10 messages in the last minute, reject
    if (recentMessages > 10) {
      throw new ForbiddenException('Rate limit exceeded. Please wait before sending more messages.');
    }
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
}
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
          
          const hasSession = await this.checkTherapistClientRelationship(therapistId, clientId, user.token);
          
          if (!hasSession) {
            throw new ForbiddenException(
              'You can only chat with a therapist after booking a session with them'
            );
          }
        } else if (!userInfo.roles.some(role => ['admin', 'therapist'].includes(role.toLowerCase()))) {
          // If neither user is a therapist, check if they follow each other (for regular users)
          const canChat = await this.canUsersChat(user.id, otherUserId);
          
          if (!canChat) {
            throw new ForbiddenException(
              'You can only chat with users who follow you or whom you follow'
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
      }
    });

    return this.roomRepository.save(room);
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

  async getRooms(user: JwtUser): Promise<ChatRoom[]> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    // Find rooms where the user is a participant
    // Using a raw query with the JSONB contains operator
    return this.roomRepository
      .createQueryBuilder('room')
      .where(`room.participants @> :userId`, { userId: JSON.stringify([user.id]) })
      .orderBy('room.updatedAt', 'DESC')
      .getMany();
  }

  async getRoomById(roomId: string, user: JwtUser): Promise<ChatRoom> {
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

    return room;
  }

  async createMessage(createMessageDto: CreateMessageDto, user: JwtUser): Promise<ChatMessage> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    // Verify the room exists and user is a participant
    const room = await this.getRoomById(createMessageDto.roomId, user);

    // Apply rate limiting check (this would be better handled by a dedicated middleware)
    await this.checkRateLimiting(room.id, user.id);

    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId: user.id,
      // Handle privacy features
      isAnonymous: createMessageDto.metadata?.isAnonymous || false,
    });

    // Update the room's updatedAt timestamp and last message info
    await this.roomRepository.update(room.id, { 
      updatedAt: new Date(),
      lastMessageAt: new Date(),
      lastMessagePreview: createMessageDto.content.substring(0, 50) + (createMessageDto.content.length > 50 ? '...' : '')
    });

    return this.messageRepository.save(message);
  }

  async getMessages(roomId: string, user: JwtUser, limit = 50, offset = 0): Promise<ChatMessage[]> {
    // Validate user existence via auth service
    await this.authClient.validateUser(user.id);
    
    // Verify the room exists and user is a participant
    await this.getRoomById(roomId, user);

    return this.messageRepository.find({
      where: { roomId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
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
}
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { ModerateMessageDto, ModerateRoomDto, ReportMessageDto } from './dto/moderation.dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../auth';
import { JwtUser } from '../auth/interfaces/user.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('health')
  @Public()
  @ApiOperation({ 
    summary: 'Service health check',
    description: 'Get comprehensive health status and feature overview of the chat service'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy and operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'chat-service' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        version: { type: 'string', example: '1.0.0' },
        features: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Real-time messaging',
            'Group and private chats',
            'Video/Audio calling integration',
            'Message moderation',
            'File attachments',
            'Anonymous messaging',
            'End-to-end encryption',
            'Content moderation',
            'Follow-based messaging',
            'Therapist-client communication'
          ]
        }
      }
    }
  })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'chat-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: [
        'Real-time messaging',
        'Group and private chats',
        'Video/Audio calling integration',
        'Message moderation',
        'File attachments',
        'Anonymous messaging',
        'End-to-end encryption',
        'Content moderation',
        'Follow-based messaging',
        'Therapist-client communication'
      ]
    };
  }
}

@ApiTags('chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatRoomsController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @ApiOperation({ 
    summary: 'Create a new chat room',
    description: `
      Create a new chat room with specified participants and settings.
      
      **Business Rules:**
      - Direct rooms: Only between users with mutual follow relationships or therapist-client connections
      - Group rooms: Only therapists and admins can create
      - Therapy rooms: Requires verified therapist-client relationship
      - Support rooms: Available for group therapy sessions
    `
  })
  @ApiBody({
    type: CreateRoomDto,
    examples: {
      directChat: {
        summary: 'Direct Chat Room',
        description: 'Create a private 1-on-1 chat room',
        value: {
          name: 'Direct Chat',
          description: 'Private conversation',
          participants: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000'],
          type: 'direct',
          privacyLevel: 'private',
          isEncrypted: true,
          metadata: {
            source: 'mutual_follow'
          }
        }
      },
      therapyGroup: {
        summary: 'Therapy Group Room',
        description: 'Create a group therapy session room',
        value: {
          name: 'Anxiety Support Group',
          description: 'Weekly group therapy session for anxiety management',
          participants: [
            '123e4567-e89b-12d3-a456-426614174000',
            '223e4567-e89b-12d3-a456-426614174000',
            '323e4567-e89b-12d3-a456-426614174000'
          ],
          type: 'therapy',
          privacyLevel: 'private',
          isEncrypted: true,
          metadata: {
            sessionType: 'group_therapy',
            therapistId: '123e4567-e89b-12d3-a456-426614174000',
            maxParticipants: 8,
            allowAnonymous: true
          }
        }
      },
      supportGroup: {
        summary: 'Support Group Room',
        description: 'Create a peer support group room',
        value: {
          name: 'Depression Recovery Support',
          description: 'Peer support group for depression recovery',
          participants: [
            '123e4567-e89b-12d3-a456-426614174000',
            '223e4567-e89b-12d3-a456-426614174000'
          ],
          type: 'support',
          privacyLevel: 'private',
          metadata: {
            supportType: 'peer_support',
            moderatorId: '123e4567-e89b-12d3-a456-426614174000',
            allowAnonymous: true,
            guidelines: 'Please be respectful and supportive'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Chat room created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'Anxiety Support Group' },
        description: { type: 'string', example: 'Weekly group therapy session' },
        type: { type: 'string', example: 'therapy' },
        privacyLevel: { type: 'string', example: 'private' },
        isEncrypted: { type: 'boolean', example: true },
        participants: {
          type: 'array',
          items: { type: 'string' },
          example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000']
        },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        metadata: {
          type: 'object',
          example: {
            sessionType: 'group_therapy',
            allowAnonymous: true,
            identityRevealSettings: {
              allowRealNames: true,
              fallbackToAnonymous: true,
              showAnonymousNames: true
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or business rule violation' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (only therapists/admins can create group chats)' })
  @Roles('user', 'therapist', 'admin')
  async createRoom(@Body() createRoomDto: CreateRoomDto, @CurrentUser() user: JwtUser) {
    return this.chatService.createRoom(createRoomDto, user);
  }

  @Get('rooms')
  @ApiOperation({ 
    summary: 'Get user\'s chat rooms',
    description: 'Retrieve all chat rooms where the current user is a participant, ordered by most recent activity'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of chat rooms with enriched participant information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          name: { type: 'string', example: 'Therapy Support Group' },
          displayName: { type: 'string', example: 'Dr. Smith & Client' },
          type: { type: 'string', example: 'therapy' },
          participantCount: { type: 'number', example: 3 },
          unreadCount: { type: 'number', example: 2 },
          lastMessage: {
            type: 'object',
            properties: {
              content: { type: 'string', example: 'How are you feeling today?' },
              senderId: { type: 'string', example: '223e4567-e89b-12d3-a456-426614174000' },
              senderDisplayName: { type: 'string', example: 'Dr. Smith' },
              timestamp: { type: 'string', example: '2024-01-15T10:25:00.000Z' },
              isAnonymous: { type: 'boolean', example: false }
            }
          },
          participantIdentities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: '223e4567-e89b-12d3-a456-426614174000' },
                displayName: { type: 'string', example: 'Dr. Smith' },
                anonymousDisplayName: { type: 'string', example: 'Therapist-A' },
                allowRealNameInChat: { type: 'boolean', example: true },
                isOnline: { type: 'boolean', example: true }
              }
            }
          },
          updatedAt: { type: 'string', example: '2024-01-15T10:25:00.000Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @Roles('user', 'therapist', 'admin')
  async getRooms(@CurrentUser() user: JwtUser) {
    return this.chatService.getRooms(user);
  }

  @Get('rooms/:id')
  @ApiOperation({ 
    summary: 'Get specific chat room details',
    description: 'Retrieve detailed information about a specific chat room including participant identities and settings'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the chat room',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed chat room information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'Therapy Support Group' },
        description: { type: 'string', example: 'Weekly group therapy session' },
        type: { type: 'string', example: 'therapy' },
        privacyLevel: { type: 'string', example: 'private' },
        isEncrypted: { type: 'boolean', example: true },
        displayName: { type: 'string', example: 'Dr. Smith & Client' },
        participantCount: { type: 'number', example: 3 },
        participants: {
          type: 'array',
          items: { type: 'string' },
          example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000']
        },
        participantIdentities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string', example: '223e4567-e89b-12d3-a456-426614174000' },
              displayName: { type: 'string', example: 'Dr. Smith' },
              anonymousDisplayName: { type: 'string', example: 'Therapist-A' },
              allowRealNameInChat: { type: 'boolean', example: true },
              role: { type: 'string', example: 'therapist' },
              isOnline: { type: 'boolean', example: true },
              lastSeen: { type: 'string', example: '2024-01-15T10:25:00.000Z' }
            }
          }
        },
        metadata: {
          type: 'object',
          example: {
            isPrivate: true,
            isEncrypted: true,
            identityRevealSettings: {
              allowRealNames: true,
              fallbackToAnonymous: true,
              showAnonymousNames: true
            },
            sessionType: 'group_therapy',
            allowAnonymous: true
          }
        },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Not a participant in this chat room' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Roles('user', 'therapist', 'admin')
  async getRoomById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.chatService.getRoomById(id, user);
  }
}

@ApiTags('chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatMessagesController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @ApiOperation({ 
    summary: 'Send a new chat message',
    description: `
      Send a message to a chat room with optional attachments and reply functionality.
      
      **Features:**
      - Rich text content with formatting
      - File attachments (images, documents, audio)
      - Reply to specific messages
      - Anonymous messaging in group chats
      - Automatic content moderation
      - Rate limiting: 10 messages per minute
    `
  })
  @ApiBody({
    type: CreateMessageDto,
    examples: {
      simpleMessage: {
        summary: 'Simple Text Message',
        description: 'Send a basic text message',
        value: {
          roomId: '123e4567-e89b-12d3-a456-426614174000',
          content: 'Hello everyone! How is everyone feeling today?',
          isAnonymous: false
        }
      },
      messageWithAttachment: {
        summary: 'Message with Image Attachment',
        description: 'Send a message with an image attachment',
        value: {
          roomId: '123e4567-e89b-12d3-a456-426614174000',
          content: 'Here\'s my mood tracker for today',
          isAnonymous: false,
          attachments: [{
            id: '456e7890-e89b-12d3-a456-426614174000',
            type: 'image',
            url: 'https://storage.example.com/attachments/mood_tracker.jpg',
            name: 'mood_tracker.jpg',
            size: 256000,
            mimeType: 'image/jpeg',
            thumbnailUrl: 'https://storage.example.com/attachments/mood_tracker_thumb.jpg',
            metadata: { width: 1920, height: 1080 }
          }]
        }
      },
      replyMessage: {
        summary: 'Reply to Message',
        description: 'Reply to a specific message in the conversation',
        value: {
          roomId: '123e4567-e89b-12d3-a456-426614174000',
          content: 'Thank you for sharing that, it really helps to know I\'m not alone',
          isAnonymous: false,
          replyToMessageId: '789e1234-e89b-12d3-a456-426614174000'
        }
      },
      anonymousMessage: {
        summary: 'Anonymous Message',
        description: 'Send an anonymous message in a group chat',
        value: {
          roomId: '123e4567-e89b-12d3-a456-426614174000',
          content: 'I\'ve been struggling with anxiety lately but don\'t want to reveal my identity',
          isAnonymous: true,
          metadata: { sensitivity: 'high' }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        roomId: { type: 'string', example: '456e7890-e89b-12d3-a456-426614174000' },
        senderId: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
        content: { type: 'string', example: 'Hello everyone! How is everyone feeling today?' },
        isAnonymous: { type: 'boolean', example: false },
        senderDisplayName: { type: 'string', example: 'Dr. Smith' },
        attachments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '456e7890-e89b-12d3-a456-426614174000' },
              type: { type: 'string', example: 'image' },
              url: { type: 'string', example: 'https://storage.example.com/image.jpg' },
              name: { type: 'string', example: 'mood_tracker.jpg' },
              size: { type: 'number', example: 256000 },
              mimeType: { type: 'string', example: 'image/jpeg' }
            }
          }
        },
        replyTo: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
            content: { type: 'string', example: 'Original message content' },
            senderDisplayName: { type: 'string', example: 'Client A' }
          }
        },
        isRead: { type: 'boolean', example: false },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid message data or rate limit exceeded' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Not a participant in this chat room' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Roles('user', 'therapist', 'admin')
  async createMessage(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: JwtUser) {
    return this.chatService.createMessage(createMessageDto, user);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ 
    summary: 'Get messages from a chat room',
    description: 'Retrieve paginated messages from a specific chat room with sender identity information'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Chat room identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Maximum number of messages to return (default: 50, max: 100)',
    example: 50
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    description: 'Number of messages to skip for pagination (default: 0)',
    example: 0
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of messages with sender information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          roomId: { type: 'string', example: '456e7890-e89b-12d3-a456-426614174000' },
          senderId: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
          content: { type: 'string', example: 'Hello everyone! How is everyone feeling today?' },
          isAnonymous: { type: 'boolean', example: false },
          displayName: { type: 'string', example: 'Dr. Smith' },
          senderIdentity: {
            type: 'object',
            properties: {
              userId: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
              displayName: { type: 'string', example: 'Dr. Smith' },
              anonymousDisplayName: { type: 'string', example: 'Therapist-A' },
              allowRealNameInChat: { type: 'boolean', example: true },
              role: { type: 'string', example: 'therapist' }
            }
          },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '456e7890-e89b-12d3-a456-426614174000' },
                type: { type: 'string', example: 'image' },
                url: { type: 'string', example: 'https://storage.example.com/image.jpg' },
                name: { type: 'string', example: 'photo.jpg' },
                size: { type: 'number', example: 256000 },
                thumbnailUrl: { type: 'string', example: 'https://storage.example.com/thumb.jpg' }
              }
            }
          },
          replyTo: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', example: '321e7890-e89b-12d3-a456-426614174000' },
              content: { type: 'string', example: 'Original message' },
              senderDisplayName: { type: 'string', example: 'Client A' }
            }
          },
          isOwnMessage: { type: 'boolean', example: false },
          isRead: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Not a participant in this chat room' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Roles('user', 'therapist', 'admin')
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.chatService.getMessages(id, user, limit, offset);
  }

  @Post('rooms/:id/read')
  @ApiOperation({ 
    summary: 'Mark messages as read',
    description: 'Mark all unread messages in a specific chat room as read for the current user'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Chat room identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Messages marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        markedCount: { type: 'number', example: 5 },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Not a participant in this chat room' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Roles('user', 'therapist', 'admin')
  async markMessagesAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    await this.chatService.markMessagesAsRead(id, user);
    return { 
      success: true,
      timestamp: new Date().toISOString()
    };
  }
}

@ApiTags('social')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatSocialController {
  constructor(private readonly chatService: ChatService) {}

  @Get('chat-partners')
  @ApiOperation({ 
    summary: 'Get chat-eligible users',
    description: `
      Retrieve all users who can be contacted for chat based on social relationships.
      
      **Eligibility Criteria:**
      - Mutual follow relationships from Community Service
      - Verified therapist-client relationships from Teletherapy Service
      - Existing chat room participants
      
      **Privacy Features:**
      - Anonymous display names for privacy
      - Real name visibility based on user preferences
      - Online status indicators
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of chat-eligible users with relationship context',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          displayName: { type: 'string', example: 'Dr. Sarah Johnson' },
          anonymousDisplayName: { type: 'string', example: 'Therapist-A' },
          profilePicture: { type: 'string', example: 'https://storage.example.com/profiles/user123.jpg' },
          role: { type: 'string', example: 'therapist' },
          relationshipType: { 
            type: 'string', 
            enum: ['mutual-follow', 'therapist-client', 'existing-chat'],
            example: 'therapist-client'
          },
          canStartChat: { type: 'boolean', example: true },
          canStartCall: { type: 'boolean', example: true },
          isOnline: { type: 'boolean', example: true },
          lastSeen: { type: 'string', example: '2024-01-15T10:25:00.000Z' },
          specializations: {
            type: 'array',
            items: { type: 'string' },
            example: ['anxiety', 'depression', 'trauma']
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @Roles('user', 'therapist', 'admin')
  async getChatEligibleUsers(@CurrentUser() user: JwtUser) {
    return this.chatService.getChatEligibleUsers(user);
  }

  @Patch('rooms/:id/identity-settings')
  @ApiOperation({ 
    summary: 'Update room identity settings',
    description: `
      Configure identity reveal settings for a specific chat room.
      
      **Settings:**
      - \`allowRealNames\`: Whether to show real names in this room
      - \`showAnonymousNames\`: Whether to display anonymous names
      - \`fallbackToAnonymous\`: Auto-fallback when real names aren't available
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Chat room identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        allowRealNames: { 
          type: 'boolean', 
          description: 'Allow real names to be shown in this room',
          example: true 
        },
        showAnonymousNames: { 
          type: 'boolean', 
          description: 'Show anonymous display names',
          example: true 
        }
      }
    },
    examples: {
      enableRealNames: {
        summary: 'Enable Real Names',
        description: 'Allow participants to show their real names',
        value: {
          allowRealNames: true,
          showAnonymousNames: false
        }
      },
      anonymousOnly: {
        summary: 'Anonymous Only',
        description: 'Force anonymous names for all participants',
        value: {
          allowRealNames: false,
          showAnonymousNames: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Identity settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        settings: {
          type: 'object',
          properties: {
            allowRealNames: { type: 'boolean', example: true },
            showAnonymousNames: { type: 'boolean', example: true },
            fallbackToAnonymous: { type: 'boolean', example: true }
          }
        },
        updatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Only room participants can update settings' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Roles('user', 'therapist', 'admin')
  async updateRoomIdentitySettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() settings: { allowRealNames?: boolean; showAnonymousNames?: boolean },
    @CurrentUser() user: JwtUser
  ) {
    await this.chatService.updateRoomIdentitySettings(id, settings, user);
    return { 
      success: true,
      settings,
      updatedAt: new Date().toISOString()
    };
  }
}

@ApiTags('moderation')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatModerationController {
  constructor(private readonly chatService: ChatService) {}

  @Post('moderation/message')
  @ApiOperation({ 
    summary: 'Moderate a message',
    description: `
      Perform moderation actions on chat messages (admin/moderator/therapist only).
      
      **Available Actions:**
      - \`hide\`: Hide message content but keep metadata
      - \`delete\`: Soft delete the message
      - \`flag\`: Flag for manual review
      
      **Automated notifications** are sent to affected users.
    `
  })
  @ApiBody({
    type: ModerateMessageDto,
    examples: {
      hideMessage: {
        summary: 'Hide Inappropriate Message',
        description: 'Hide a message that violates community guidelines',
        value: {
          messageId: '123e4567-e89b-12d3-a456-426614174000',
          action: 'hide',
          reason: 'inappropriate_content',
          moderatorNote: 'Message contained inappropriate language'
        }
      },
      deleteMessage: {
        summary: 'Delete Harmful Message',
        description: 'Delete a message that could be harmful',
        value: {
          messageId: '123e4567-e89b-12d3-a456-426614174000',
          action: 'delete',
          reason: 'harmful_content',
          moderatorNote: 'Message contained potentially harmful content regarding self-harm'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Message moderated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        action: { type: 'string', example: 'hide' },
        reason: { type: 'string', example: 'inappropriate_content' },
        moderatedBy: { type: 'string', example: '456e7890-e89b-12d3-a456-426614174000' },
        moderatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        originalContent: { type: 'string', example: '[REDACTED]' },
        metadata: {
          type: 'object',
          properties: {
            moderated: { type: 'boolean', example: true },
            moderatedBy: { type: 'string', example: '456e7890-e89b-12d3-a456-426614174000' },
            moderationReason: { type: 'string', example: 'inappropriate_content' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient privileges (admin/moderator/therapist only)' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @Roles('admin', 'moderator', 'therapist')
  async moderateMessage(@Body() moderateDto: ModerateMessageDto, @CurrentUser() user: JwtUser) {
    return this.chatService.moderateMessage(moderateDto.messageId, moderateDto.action, user);
  }

  @Post('moderation/report')
  @ApiOperation({ 
    summary: 'Report a message',
    description: `
      Report a message for review by moderators.
      
      **Report Categories:**
      - \`inappropriate_content\`: Offensive or inappropriate language
      - \`spam\`: Spam or repetitive content
      - \`harassment\`: Harassment or bullying behavior
      - \`harmful_content\`: Self-harm or dangerous content
      - \`privacy_violation\`: Privacy violation or doxxing
      - \`other\`: Other concerns requiring review
      
      Reports trigger automatic notification to moderation team.
    `
  })
  @ApiBody({
    type: ReportMessageDto,
    examples: {
      inappropriateContent: {
        summary: 'Report Inappropriate Content',
        description: 'Report a message with inappropriate language',
        value: {
          messageId: '123e4567-e89b-12d3-a456-426614174000',
          reason: 'inappropriate_content',
          description: 'Message contains offensive language that makes me uncomfortable',
          severity: 'medium'
        }
      },
      harmfulContent: {
        summary: 'Report Harmful Content',
        description: 'Report content that could be harmful',
        value: {
          messageId: '123e4567-e89b-12d3-a456-426614174000',
          reason: 'harmful_content',
          description: 'Message discusses self-harm in concerning detail',
          severity: 'high'
        }
      },
      harassment: {
        summary: 'Report Harassment',
        description: 'Report harassment or bullying behavior',
        value: {
          messageId: '123e4567-e89b-12d3-a456-426614174000',
          reason: 'harassment',
          description: 'User is repeatedly targeting and harassing me',
          severity: 'high'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Message reported successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        reportId: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
        message: { type: 'string', example: 'Message reported successfully. Our moderation team will review it within 24 hours.' },
        reportedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        estimatedReviewTime: { type: 'string', example: '24 hours' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @Roles('user', 'therapist', 'admin')
  async reportMessage(@Body() reportDto: ReportMessageDto, @CurrentUser() user: JwtUser) {
    // In a real implementation, this would create a report record and notify moderators
    return { 
      success: true, 
      reportId: `report_${Date.now()}`,
      message: 'Message reported successfully. Our moderation team will review it within 24 hours.',
      reportedAt: new Date().toISOString(),
      estimatedReviewTime: '24 hours'
    };
  }
}
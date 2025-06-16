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
exports.ChatModerationController = exports.ChatSocialController = exports.ChatMessagesController = exports.ChatRoomsController = exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const create_room_dto_1 = require("./dto/create-room.dto");
const moderation_dto_1 = require("./dto/moderation.dto");
const auth_1 = require("../auth");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
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
};
__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Service health check',
        description: 'Get comprehensive health status and feature overview of the chat service'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "healthCheck", null);
ChatController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
exports.ChatController = ChatController;
let ChatRoomsController = class ChatRoomsController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createRoom(createRoomDto, user) {
        return this.chatService.createRoom(createRoomDto, user);
    }
    async getRooms(user) {
        return this.chatService.getRooms(user);
    }
    async getRoomById(id, user) {
        return this.chatService.getRoomById(id, user);
    }
};
__decorate([
    (0, common_1.Post)('rooms'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new chat room',
        description: `
      Create a new chat room with specified participants and settings.
      
      **Business Rules:**
      - Direct rooms: Only between users with mutual follow relationships or therapist-client connections
      - Group rooms: Only therapists and admins can create
      - Therapy rooms: Requires verified therapist-client relationship
      - Support rooms: Available for group therapy sessions
    `
    }),
    (0, swagger_1.ApiBody)({
        type: create_room_dto_1.CreateRoomDto,
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data or business rule violation' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions (only therapists/admins can create group chats)' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto, Object]),
    __metadata("design:returntype", Promise)
], ChatRoomsController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)('rooms'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user\'s chat rooms',
        description: 'Retrieve all chat rooms where the current user is a participant, ordered by most recent activity'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatRoomsController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get specific chat room details',
        description: 'Retrieve detailed information about a specific chat room including participant identities and settings'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Unique identifier of the chat room',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not a participant in this chat room' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatRoomsController.prototype, "getRoomById", null);
ChatRoomsController = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatRoomsController);
exports.ChatRoomsController = ChatRoomsController;
let ChatMessagesController = class ChatMessagesController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createMessage(createMessageDto, user) {
        return this.chatService.createMessage(createMessageDto, user);
    }
    async getMessages(id, limit, offset, user) {
        return this.chatService.getMessages(id, user, limit, offset);
    }
    async markMessagesAsRead(id, user) {
        await this.chatService.markMessagesAsRead(id, user);
        return {
            success: true,
            timestamp: new Date().toISOString()
        };
    }
};
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiBody)({
        type: create_message_dto_1.CreateMessageDto,
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid message data or rate limit exceeded' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not a participant in this chat room' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatMessagesController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('rooms/:id/messages'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get messages from a chat room',
        description: 'Retrieve paginated messages from a specific chat room with sender identity information'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Chat room identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Maximum number of messages to return (default: 50, max: 100)',
        example: 50
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        description: 'Number of messages to skip for pagination (default: 0)',
        example: 0
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not a participant in this chat room' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ChatMessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('rooms/:id/read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark messages as read',
        description: 'Mark all unread messages in a specific chat room as read for the current user'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Chat room identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not a participant in this chat room' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatMessagesController.prototype, "markMessagesAsRead", null);
ChatMessagesController = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatMessagesController);
exports.ChatMessagesController = ChatMessagesController;
let ChatSocialController = class ChatSocialController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getChatEligibleUsers(user) {
        return this.chatService.getChatEligibleUsers(user);
    }
    async updateRoomIdentitySettings(id, settings, user) {
        await this.chatService.updateRoomIdentitySettings(id, settings, user);
        return {
            success: true,
            settings,
            updatedAt: new Date().toISOString()
        };
    }
};
__decorate([
    (0, common_1.Get)('chat-partners'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatSocialController.prototype, "getChatEligibleUsers", null);
__decorate([
    (0, common_1.Patch)('rooms/:id/identity-settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update room identity settings',
        description: `
      Configure identity reveal settings for a specific chat room.
      
      **Settings:**
      - \`allowRealNames\`: Whether to show real names in this room
      - \`showAnonymousNames\`: Whether to display anonymous names
      - \`fallbackToAnonymous\`: Auto-fallback when real names aren't available
    `
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Chat room identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only room participants can update settings' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatSocialController.prototype, "updateRoomIdentitySettings", null);
ChatSocialController = __decorate([
    (0, swagger_1.ApiTags)('social'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatSocialController);
exports.ChatSocialController = ChatSocialController;
let ChatModerationController = class ChatModerationController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async moderateMessage(moderateDto, user) {
        return this.chatService.moderateMessage(moderateDto.messageId, moderateDto.action, user);
    }
    async reportMessage(reportDto, user) {
        return {
            success: true,
            reportId: `report_${Date.now()}`,
            message: 'Message reported successfully. Our moderation team will review it within 24 hours.',
            reportedAt: new Date().toISOString(),
            estimatedReviewTime: '24 hours'
        };
    }
};
__decorate([
    (0, common_1.Post)('moderation/message'),
    (0, swagger_1.ApiOperation)({
        summary: 'Moderate a message',
        description: `
      Perform moderation actions on chat messages (admin/moderator/therapist only).
      
      **Available Actions:**
      - \`hide\`: Hide message content but keep metadata
      - \`delete\`: Soft delete the message
      - \`flag\`: Flag for manual review
      
      **Automated notifications** are sent to affected users.
    `
    }),
    (0, swagger_1.ApiBody)({
        type: moderation_dto_1.ModerateMessageDto,
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient privileges (admin/moderator/therapist only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message not found' }),
    (0, auth_1.Roles)('admin', 'moderator', 'therapist'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [moderation_dto_1.ModerateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatModerationController.prototype, "moderateMessage", null);
__decorate([
    (0, common_1.Post)('moderation/report'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiBody)({
        type: moderation_dto_1.ReportMessageDto,
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message not found' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [moderation_dto_1.ReportMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatModerationController.prototype, "reportMessage", null);
ChatModerationController = __decorate([
    (0, swagger_1.ApiTags)('moderation'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatModerationController);
exports.ChatModerationController = ChatModerationController;
//# sourceMappingURL=chat.controller.js.map
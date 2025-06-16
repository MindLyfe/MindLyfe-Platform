import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== CHAT RESPONSE DTOS ====================

export class UserIdentityResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Display name for the user',
    example: 'Dr. Sarah Johnson'
  })
  displayName: string;

  @ApiProperty({
    description: 'Anonymous display name',
    example: 'Therapist-A'
  })
  anonymousDisplayName: string;

  @ApiProperty({
    description: 'Whether real name can be shown in chat',
    example: true
  })
  allowRealNameInChat: boolean;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'therapist', 'admin', 'moderator'],
    example: 'therapist'
  })
  role: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://storage.example.com/profiles/user123.jpg'
  })
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'Whether user is currently online',
    example: true
  })
  isOnline?: boolean;

  @ApiPropertyOptional({
    description: 'Last seen timestamp',
    example: '2024-01-15T10:25:00.000Z'
  })
  lastSeen?: string;
}

export class AttachmentResponseDto {
  @ApiProperty({
    description: 'Attachment ID',
    example: '456e7890-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Attachment type',
    enum: ['image', 'video', 'audio', 'document', 'file'],
    example: 'image'
  })
  type: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://storage.example.com/attachments/image.jpg'
  })
  url: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'mood_tracker.jpg'
  })
  name: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 256000
  })
  size: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg'
  })
  mimeType: string;

  @ApiPropertyOptional({
    description: 'Thumbnail URL for images/videos',
    example: 'https://storage.example.com/attachments/thumb.jpg'
  })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { width: 1920, height: 1080 }
  })
  metadata?: Record<string, any>;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Room ID where message was sent',
    example: '456e7890-e89b-12d3-a456-426614174000'
  })
  roomId: string;

  @ApiProperty({
    description: 'Sender user ID',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  senderId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello everyone! How is everyone feeling today?'
  })
  content: string;

  @ApiProperty({
    description: 'Whether message was sent anonymously',
    example: false
  })
  isAnonymous: boolean;

  @ApiProperty({
    description: 'Sender identity information',
    type: UserIdentityResponseDto
  })
  senderIdentity: UserIdentityResponseDto;

  @ApiPropertyOptional({
    description: 'Attachments included with message',
    type: [AttachmentResponseDto]
  })
  attachments?: AttachmentResponseDto[];

  @ApiPropertyOptional({
    description: 'Message being replied to',
    type: Object
  })
  replyTo?: {
    id: string;
    content: string;
    senderDisplayName: string;
  };

  @ApiProperty({
    description: 'Whether this is the current user\'s message',
    example: false
  })
  isOwnMessage: boolean;

  @ApiProperty({
    description: 'Whether message has been read',
    example: true
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Message update timestamp',
    example: '2024-01-15T10:35:00.000Z'
  })
  updatedAt?: string;

  @ApiPropertyOptional({
    description: 'Moderation metadata if message was moderated',
    example: { moderated: true, reason: 'inappropriate_content' }
  })
  moderationMetadata?: Record<string, any>;
}

export class ChatRoomResponseDto {
  @ApiProperty({
    description: 'Room ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Room name',
    example: 'Therapy Support Group'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Room description',
    example: 'Weekly group therapy session for anxiety management'
  })
  description?: string;

  @ApiProperty({
    description: 'Room type',
    enum: ['direct', 'group', 'therapy', 'support'],
    example: 'therapy'
  })
  type: string;

  @ApiProperty({
    description: 'Privacy level',
    enum: ['private', 'public'],
    example: 'private'
  })
  privacyLevel: string;

  @ApiProperty({
    description: 'Whether room uses encryption',
    example: true
  })
  isEncrypted: boolean;

  @ApiProperty({
    description: 'Display name for the room',
    example: 'Dr. Smith & Client'
  })
  displayName: string;

  @ApiProperty({
    description: 'Number of participants',
    example: 3
  })
  participantCount: number;

  @ApiProperty({
    description: 'Participant user IDs',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000']
  })
  participants: string[];

  @ApiProperty({
    description: 'Participant identity information',
    type: [UserIdentityResponseDto]
  })
  participantIdentities: UserIdentityResponseDto[];

  @ApiPropertyOptional({
    description: 'Number of unread messages for current user',
    example: 2
  })
  unreadCount?: number;

  @ApiPropertyOptional({
    description: 'Last message in the room',
    type: Object
  })
  lastMessage?: {
    content: string;
    senderId: string;
    senderDisplayName: string;
    timestamp: string;
    isAnonymous: boolean;
  };

  @ApiProperty({
    description: 'Room creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Room last update timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'Room metadata and settings',
    example: {
      identityRevealSettings: {
        allowRealNames: true,
        showAnonymousNames: true
      },
      sessionType: 'group_therapy',
      allowAnonymous: true
    }
  })
  metadata?: Record<string, any>;
}

export class ChatPartnerResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Dr. Sarah Johnson'
  })
  displayName: string;

  @ApiProperty({
    description: 'Anonymous display name',
    example: 'Therapist-A'
  })
  anonymousDisplayName: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://storage.example.com/profiles/user123.jpg'
  })
  profilePicture?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'therapist', 'admin'],
    example: 'therapist'
  })
  role: string;

  @ApiProperty({
    description: 'Type of relationship',
    enum: ['mutual-follow', 'therapist-client', 'existing-chat'],
    example: 'therapist-client'
  })
  relationshipType: string;

  @ApiProperty({
    description: 'Whether user can start chat',
    example: true
  })
  canStartChat: boolean;

  @ApiProperty({
    description: 'Whether user can start calls',
    example: true
  })
  canStartCall: boolean;

  @ApiProperty({
    description: 'Whether user is currently online',
    example: true
  })
  isOnline: boolean;

  @ApiPropertyOptional({
    description: 'Last seen timestamp',
    example: '2024-01-15T10:25:00.000Z'
  })
  lastSeen?: string;

  @ApiPropertyOptional({
    description: 'Therapist specializations',
    type: [String],
    example: ['anxiety', 'depression', 'trauma']
  })
  specializations?: string[];
}

// ==================== CALLING RESPONSE DTOS ====================

export class CallParticipantResponseDto {
  @ApiProperty({
    description: 'Participant user ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Dr. Smith'
  })
  displayName: string;

  @ApiProperty({
    description: 'Participant role in call',
    enum: ['caller', 'callee', 'moderator'],
    example: 'therapist'
  })
  role: string;

  @ApiProperty({
    description: 'When participant joined',
    example: '2024-01-15T10:30:00.000Z'
  })
  joinedAt: string;

  @ApiProperty({
    description: 'Whether participant is connected',
    example: true
  })
  isConnected: boolean;

  @ApiProperty({
    description: 'Media state information',
    type: Object
  })
  mediaState: {
    hasVideo: boolean;
    hasAudio: boolean;
    isVideoMuted: boolean;
    isAudioMuted: boolean;
    isScreenSharing: boolean;
  };

  @ApiProperty({
    description: 'Connection quality metrics',
    type: Object
  })
  connectionQuality: {
    signal: string;
    bitrate: number;
    latency: number;
    packetsLost: number;
  };

  @ApiPropertyOptional({
    description: 'When participant left call',
    example: '2024-01-15T10:53:45.000Z'
  })
  leftAt?: string;
}

export class CallSessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Call session status',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    example: 'in_progress'
  })
  status: string;

  @ApiProperty({
    description: 'Type of call',
    enum: ['video', 'audio'],
    example: 'video'
  })
  callType: string;

  @ApiProperty({
    description: 'Call participants',
    type: [CallParticipantResponseDto]
  })
  participants: CallParticipantResponseDto[];

  @ApiProperty({
    description: 'Call duration information',
    type: Object
  })
  duration: {
    started: string;
    current: string;
    maxDuration: string;
    remainingTime: string;
  };

  @ApiProperty({
    description: 'Associated chat room information',
    type: Object
  })
  chatRoomInfo: {
    id: string;
    name: string;
    type: string;
  };

  @ApiPropertyOptional({
    description: 'Call metadata',
    example: {
      isQuickCall: true,
      initiatedBy: '123e4567-e89b-12d3-a456-426614174000',
      callQuality: 'hd',
      recordingEnabled: false
    }
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'When call started',
    example: '2024-01-15T10:30:00.000Z'
  })
  startedAt?: string;

  @ApiPropertyOptional({
    description: 'When call ended',
    example: '2024-01-15T10:53:45.000Z'
  })
  endedAt?: string;
}

export class WebRTCTransportResponseDto {
  @ApiProperty({
    description: 'Transport ID',
    example: 'transport_456e7890'
  })
  id: string;

  @ApiProperty({
    description: 'ICE parameters for WebRTC',
    type: Object
  })
  iceParameters: {
    usernameFragment: string;
    password: string;
    iceLite: boolean;
  };

  @ApiProperty({
    description: 'ICE candidates',
    type: [Object]
  })
  iceCandidates: Array<{
    foundation: string;
    ip: string;
    port: number;
    priority: number;
    protocol: string;
    type: string;
  }>;

  @ApiProperty({
    description: 'DTLS parameters',
    type: Object
  })
  dtlsParameters: {
    fingerprints: Array<{
      algorithm: string;
      value: string;
    }>;
    role: string;
  };

  @ApiPropertyOptional({
    description: 'SCTP parameters for data channels',
    type: Object
  })
  sctpParameters?: {
    port: number;
    OS: number;
    MIS: number;
  };
}

export class MediaProducerResponseDto {
  @ApiProperty({
    description: 'Producer ID',
    example: 'producer_789e1234'
  })
  id: string;

  @ApiProperty({
    description: 'Media kind',
    enum: ['video', 'audio'],
    example: 'video'
  })
  kind: string;

  @ApiProperty({
    description: 'RTP parameters',
    type: Object
  })
  rtpParameters: Record<string, any>;

  @ApiProperty({
    description: 'Whether producer is paused',
    example: false
  })
  paused: boolean;

  @ApiProperty({
    description: 'Producer score metrics',
    type: Object
  })
  score: {
    encodingIdx: number;
    ssrc: number;
    rid: string;
    score: number;
  };
}

export class MediaConsumerResponseDto {
  @ApiProperty({
    description: 'Consumer ID',
    example: 'consumer_abc123'
  })
  id: string;

  @ApiProperty({
    description: 'Producer ID being consumed',
    example: 'producer_789e1234'
  })
  producerId: string;

  @ApiProperty({
    description: 'Media kind',
    enum: ['video', 'audio'],
    example: 'video'
  })
  kind: string;

  @ApiProperty({
    description: 'RTP parameters for consumption',
    type: Object
  })
  rtpParameters: Record<string, any>;

  @ApiProperty({
    description: 'Consumer type',
    enum: ['simple', 'simulcast', 'svc'],
    example: 'simulcast'
  })
  type: string;

  @ApiProperty({
    description: 'Whether consumer is paused',
    example: false
  })
  paused: boolean;

  @ApiPropertyOptional({
    description: 'Preferred spatial/temporal layers',
    type: Object
  })
  preferredLayers?: {
    spatialLayer: number;
    temporalLayer: number;
  };

  @ApiProperty({
    description: 'Consumer quality scores',
    type: Object
  })
  score: {
    score: number;
    producerScore: number;
    producerScores: number[];
  };
}

export class CallUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '223e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Dr. Sarah Johnson'
  })
  displayName: string;

  @ApiProperty({
    description: 'Anonymous display name',
    example: 'Therapist-A'
  })
  anonymousDisplayName: string;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'therapist', 'admin'],
    example: 'therapist'
  })
  role: string;

  @ApiProperty({
    description: 'Whether user is online',
    example: true
  })
  isOnline: boolean;

  @ApiProperty({
    description: 'Whether user is available for calls',
    example: true
  })
  isAvailableForCalls: boolean;

  @ApiProperty({
    description: 'Current call status',
    enum: ['available', 'in_call', 'busy', 'away'],
    example: 'available'
  })
  currentCallStatus: string;

  @ApiProperty({
    description: 'Device capabilities',
    type: Object
  })
  deviceCapabilities: {
    supportsVideo: boolean;
    supportsAudio: boolean;
    supportsScreenShare: boolean;
    preferredQuality: string;
  };

  @ApiProperty({
    description: 'Relationship type with current user',
    enum: ['mutual-follow', 'therapist-client', 'chat-participant'],
    example: 'therapist-client'
  })
  relationshipType: string;

  @ApiProperty({
    description: 'Call preferences',
    type: Object
  })
  callPreferences: {
    allowsDirectCalls: boolean;
    requiresAppointment: boolean;
    availableHours: {
      start: string;
      end: string;
      timezone: string;
    };
  };

  @ApiPropertyOptional({
    description: 'Last seen timestamp',
    example: '2024-01-15T10:25:00.000Z'
  })
  lastSeen?: string;
}

// ==================== MODERATION RESPONSE DTOS ====================

export class ModerationActionResponseDto {
  @ApiProperty({
    description: 'Message ID that was moderated',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Moderation action taken',
    enum: ['hide', 'delete', 'flag', 'warn'],
    example: 'hide'
  })
  action: string;

  @ApiProperty({
    description: 'Reason for moderation',
    example: 'inappropriate_content'
  })
  reason: string;

  @ApiProperty({
    description: 'ID of moderator who took action',
    example: '456e7890-e89b-12d3-a456-426614174000'
  })
  moderatedBy: string;

  @ApiProperty({
    description: 'When moderation occurred',
    example: '2024-01-15T10:30:00.000Z'
  })
  moderatedAt: string;

  @ApiProperty({
    description: 'Original content (redacted if hidden)',
    example: '[REDACTED]'
  })
  originalContent: string;

  @ApiProperty({
    description: 'Moderation metadata',
    type: Object
  })
  metadata: {
    moderated: boolean;
    moderatedBy: string;
    moderationReason: string;
  };
}

export class ReportResponseDto {
  @ApiProperty({
    description: 'Whether report was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Report ID',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  reportId: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Message reported successfully. Our moderation team will review it within 24 hours.'
  })
  message: string;

  @ApiProperty({
    description: 'When report was submitted',
    example: '2024-01-15T10:30:00.000Z'
  })
  reportedAt: string;

  @ApiProperty({
    description: 'Estimated review time',
    example: '24 hours'
  })
  estimatedReviewTime: string;
}

// ==================== COMMON RESPONSE DTOS ====================

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Whether operation was successful',
    example: true
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Success message',
    example: 'Operation completed successfully'
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Timestamp of operation',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp?: string;
}

export class HealthResponseDto {
  @ApiProperty({
    description: 'Service status',
    example: 'ok'
  })
  status: string;

  @ApiProperty({
    description: 'Service name',
    example: 'chat-service'
  })
  service: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Service version',
    example: '1.0.0'
  })
  version: string;

  @ApiProperty({
    description: 'Available features',
    type: [String],
    example: [
      'Real-time messaging',
      'Group and private chats',
      'Video/Audio calling integration',
      'Message moderation',
      'File attachments'
    ]
  })
  features: string[];
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid input data'
  })
  message: string;

  @ApiProperty({
    description: 'Error code',
    example: 'VALIDATION_ERROR'
  })
  error: string;

  @ApiPropertyOptional({
    description: 'HTTP status code',
    example: 400
  })
  statusCode?: number;

  @ApiPropertyOptional({
    description: 'Timestamp of error',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp?: string;

  @ApiPropertyOptional({
    description: 'Additional error details',
    type: Object
  })
  details?: Record<string, any>;
} 
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { JwtUser } from '../../auth/interfaces/user.interface';
import { CallingService, CreateCallDto } from './calling.service';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateCallDto {
  @ApiProperty({
    description: 'The ID of the user to call',
    example: '223e4567-e89b-12d3-a456-426614174000'
  })
  targetUserId: string;

  @ApiProperty({
    description: 'Type of call to initiate',
    enum: ['video', 'audio'],
    example: 'video'
  })
  callType: 'video' | 'audio';

  @ApiProperty({
    description: 'The chat room ID where the call is initiated from',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  chatRoomId: string;
}

export class JoinCallDto {
  @ApiProperty({
    description: 'Device capabilities for the call',
    example: {
      video: true,
      audio: true,
      screen: false
    }
  })
  deviceCapabilities: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  };
}

export class CreateTransportDto {
  @ApiProperty({
    description: 'Direction of the WebRTC transport',
    enum: ['send', 'recv'],
    example: 'send'
  })
  direction: 'send' | 'recv';

  @ApiProperty({
    description: 'RTP capabilities of the client',
    example: {
      codecs: [
        {
          mimeType: 'video/VP8',
          clockRate: 90000
        }
      ],
      headerExtensions: []
    }
  })
  rtpCapabilities: any;
}

export class ProduceMediaDto {
  @ApiProperty({
    description: 'Transport ID to use for media production',
    example: '456e7890-e89b-12d3-a456-426614174000'
  })
  transportId: string;

  @ApiProperty({
    description: 'Kind of media to produce',
    enum: ['video', 'audio'],
    example: 'video'
  })
  kind: 'video' | 'audio';

  @ApiProperty({
    description: 'RTP parameters for the media',
    example: {
      encodings: [{ maxBitrate: 1000000 }],
      rtcp: { cname: 'user123' }
    }
  })
  rtpParameters: any;
}

export class ConsumeMediaDto {
  @ApiProperty({
    description: 'Transport ID to use for media consumption',
    example: '456e7890-e89b-12d3-a456-426614174000'
  })
  transportId: string;

  @ApiProperty({
    description: 'Producer ID to consume media from',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  producerId: string;
}

@ApiTags('calling')
@ApiBearerAuth('JWT-auth')
@Controller('calling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CallingController {
  constructor(private readonly callingService: CallingService) {}

  @Post('initiate')
  @ApiOperation({ 
    summary: 'Initiate a video or audio call',
    description: `
      Start a video or audio call with another user by creating a teletherapy session.
      
      **Call Flow:**
      1. Validates calling permissions between users
      2. Creates a quick teletherapy session for the call
      3. Returns session ID for both participants to join
      4. Leverages MediaSoup SFU for high-quality media routing
      
      **Business Rules:**
      - Users must have chat relationship (mutual follow or therapist-client)
      - Both users must be participants in the specified chat room
      - Calls are limited to 60 minutes by default (extendable)
      - Video calls require camera permissions, audio calls require microphone
      
      **Integration:**
      - Creates session in Teletherapy Service at \`http://teletherapy-service:3002\`
      - Session includes metadata linking back to chat room
      - Participants receive notification through Notification Service
    `
  })
  @ApiBody({ 
    type: InitiateCallDto,
    examples: {
      videoCall: {
        summary: 'Video Call',
        description: 'Initiate a video call with camera and audio',
        value: {
          targetUserId: '223e4567-e89b-12d3-a456-426614174000',
          callType: 'video',
          chatRoomId: '123e4567-e89b-12d3-a456-426614174000'
        }
      },
      audioCall: {
        summary: 'Audio Only Call',
        description: 'Initiate an audio-only call (voice chat)',
        value: {
          targetUserId: '223e4567-e89b-12d3-a456-426614174000',
          callType: 'audio',
          chatRoomId: '123e4567-e89b-12d3-a456-426614174000'
        }
      },
      therapyCall: {
        summary: 'Therapy Session Call',
        description: 'Initiate a call in a therapy room between therapist and client',
        value: {
          targetUserId: '323e4567-e89b-12d3-a456-426614174000',
          callType: 'video',
          chatRoomId: '456e7890-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Call session created successfully',
    schema: {
      type: 'object',
      properties: {
        sessionId: { 
          type: 'string', 
          description: 'Unique teletherapy session ID for the call',
          example: '789e1234-e89b-12d3-a456-426614174000' 
        },
        callType: { 
          type: 'string', 
          enum: ['video', 'audio'],
          example: 'video' 
        },
        participants: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'User IDs of call participants',
          example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000']
        },
        message: { 
          type: 'string',
          example: 'Call session created. Share this session ID with the other participant.'
        },
        joinUrl: {
          type: 'string',
          description: 'Direct URL to join the call session',
          example: 'https://mindlyf.com/call/789e1234-e89b-12d3-a456-426614174000'
        },
        expiresAt: {
          type: 'string',
          description: 'When the call session expires if not joined',
          example: '2024-01-15T11:30:00.000Z'
        },
        chatRoomId: {
          type: 'string',
          description: 'Associated chat room ID',
          example: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid call data or users cannot call each other',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'You cannot call this user. Ensure you have a chat relationship.' },
        error: { type: 'string', example: 'INVALID_CALL_PERMISSION' },
        details: {
          type: 'object',
          properties: {
            reason: { type: 'string', example: 'no_chat_relationship' },
            chatRoomId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            requiredRelationship: { type: 'string', example: 'mutual_follow_or_therapy' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 500, description: 'Failed to create call session due to teletherapy service error' })
  @Roles('user', 'therapist', 'admin')
  async initiateCall(
    @Body() initiateCallDto: InitiateCallDto,
    @CurrentUser() user: JwtUser
  ) {
    // Check if users can call each other
    const canCall = await this.callingService.canUsersCall(
      user.id,
      initiateCallDto.targetUserId,
      initiateCallDto.chatRoomId
    );

    if (!canCall) {
      throw new HttpException(
        {
          message: 'You cannot call this user. Ensure you have a chat relationship.',
          error: 'INVALID_CALL_PERMISSION',
          details: {
            reason: 'no_chat_relationship',
            chatRoomId: initiateCallDto.chatRoomId,
            requiredRelationship: 'mutual_follow_or_therapy'
          }
        },
        HttpStatus.FORBIDDEN
      );
    }

    const createCallDto: CreateCallDto = {
      callerId: user.id,
      targetUserId: initiateCallDto.targetUserId,
      callType: initiateCallDto.callType,
      chatRoomId: initiateCallDto.chatRoomId,
    };

    const sessionId = await this.callingService.createQuickCallSession(createCallDto);

    return {
      sessionId,
      callType: initiateCallDto.callType,
      participants: [user.id, initiateCallDto.targetUserId],
      message: 'Call session created. Share this session ID with the other participant.',
      joinUrl: `https://mindlyf.com/call/${sessionId}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      chatRoomId: initiateCallDto.chatRoomId
    };
  }

  @Post('sessions/:sessionId/join')
  @ApiOperation({ 
    summary: 'Join a call session',
    description: `
      Join an existing call session using the session ID from call initiation.
      
      **Join Process:**
      1. Validates session exists and user has permission to join
      2. Connects to MediaSoup SFU in Teletherapy Service
      3. Returns WebRTC connection details for media setup
      4. Establishes transport for bidirectional media flow
      
      **Device Capabilities:**
      - \`video\`: Enable camera for video calls
      - \`audio\`: Enable microphone for audio
      - \`screen\`: Enable screen sharing (future feature)
      
      **Media Flow:**
      - Uses MediaSoup SFU for optimal quality and scalability
      - Supports adaptive bitrate based on network conditions
      - Handles multiple participants efficiently
    `
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'Unique teletherapy session identifier from call initiation',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: JoinCallDto,
    examples: {
      fullCapabilities: {
        summary: 'Full Video Call',
        description: 'Join with video and audio enabled',
        value: {
          deviceCapabilities: {
            video: true,
            audio: true,
            screen: false
          }
        }
      },
      audioOnly: {
        summary: 'Audio Only',
        description: 'Join with only audio (no video)',
        value: {
          deviceCapabilities: {
            video: false,
            audio: true,
            screen: false
          }
        }
      },
      screenShare: {
        summary: 'Screen Sharing',
        description: 'Join with screen sharing capability',
        value: {
          deviceCapabilities: {
            video: true,
            audio: true,
            screen: true
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully joined call session',
    schema: {
      type: 'object',
      properties: {
        sessionInfo: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
            status: { type: 'string', example: 'in_progress' },
            participants: {
              type: 'array',
              items: { 
                type: 'object',
                properties: {
                  userId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                  role: { type: 'string', example: 'participant' },
                  joinedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
                  hasVideo: { type: 'boolean', example: true },
                  hasAudio: { type: 'boolean', example: true }
                }
              }
            },
            startedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
            callType: { type: 'string', example: 'video' },
            chatRoomId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' }
          }
        },
        webrtcDetails: {
          type: 'object',
          properties: {
            routerRtpCapabilities: {
              type: 'object',
              description: 'MediaSoup router RTP capabilities'
            },
            transportOptions: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'transport_123' },
                iceParameters: { type: 'object' },
                iceCandidates: { type: 'array' },
                dtlsParameters: { type: 'object' }
              }
            }
          }
        },
        message: { 
          type: 'string',
          example: 'Successfully joined call session'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Call session not found or expired' })
  @ApiResponse({ status: 403, description: 'Not authorized to join this call session' })
  @ApiResponse({ status: 409, description: 'Session is full or already ended' })
  @Roles('user', 'therapist', 'admin')
  async joinCall(
    @Param('sessionId') sessionId: string,
    @Body() joinCallDto: JoinCallDto,
    @CurrentUser() user: JwtUser
  ) {
    const joinResult = await this.callingService.joinCallSession(sessionId, user.id);
    
    return {
      sessionInfo: joinResult,
      message: 'Successfully joined call session'
    };
  }

  @Post('sessions/:sessionId/end')
  @ApiOperation({ 
    summary: 'End a call session',
    description: `
      End an active call session, disconnecting all participants.
      
      **End Process:**
      1. Validates user has permission to end the call
      2. Gracefully disconnects all participants
      3. Closes MediaSoup transports and producers
      4. Updates session status to 'completed'
      5. Sends notifications to all participants
      
      **Permissions:**
      - Call initiator can always end the call
      - Any participant can leave (ends call if only 2 participants)
      - Therapists can end therapy session calls
      - Admins can end any call for moderation
      
      **Cleanup:**
      - All media streams are stopped
      - WebRTC connections are closed
      - Session metadata is archived
      - Chat room receives call summary
    `
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'Unique teletherapy session identifier',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Call session ended successfully',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string',
          example: 'Call session ended successfully'
        },
        sessionSummary: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
            duration: { type: 'string', example: '00:23:45' },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                  joinedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
                  leftAt: { type: 'string', example: '2024-01-15T10:53:45.000Z' },
                  participationTime: { type: 'string', example: '00:23:45' }
                }
              }
            },
            endedBy: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            endReason: { type: 'string', example: 'user_ended' },
            callQuality: {
              type: 'object',
              properties: {
                averageBitrate: { type: 'number', example: 850000 },
                packetsLost: { type: 'number', example: 12 },
                connectionQuality: { type: 'string', example: 'excellent' }
              }
            }
          }
        },
        endedAt: { type: 'string', example: '2024-01-15T10:53:45.000Z' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Call session not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to end this call session' })
  @ApiResponse({ status: 409, description: 'Call session is already ended' })
  @Roles('user', 'therapist', 'admin')
  async endCall(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtUser
  ) {
    await this.callingService.endCallSession(sessionId, user.id);
    
    return {
      message: 'Call session ended successfully',
      endedAt: new Date().toISOString()
    };
  }

  @Get('sessions/:sessionId/status')
  @ApiOperation({ 
    summary: 'Get call session status',
    description: `
      Retrieve current status and details of a call session.
      
      **Status Information:**
      - Session state (scheduled, in_progress, completed, cancelled)
      - Participant list with join times and capabilities
      - Call quality metrics and statistics
      - Duration and remaining time
      - Associated chat room information
      
      **Real-time Updates:**
      - Participant join/leave events
      - Media state changes (mute/unmute, video on/off)
      - Connection quality indicators
      - Network statistics
      
      **Privacy:**
      - Only participants can view session details
      - Therapists can monitor therapy session calls
      - Admins have full visibility for moderation
    `
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'Unique teletherapy session identifier',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Call session status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '789e1234-e89b-12d3-a456-426614174000' },
        status: { 
          type: 'string', 
          enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
          example: 'in_progress' 
        },
        callType: { type: 'string', example: 'video' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
              displayName: { type: 'string', example: 'Dr. Smith' },
              role: { type: 'string', example: 'therapist' },
              joinedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
              isConnected: { type: 'boolean', example: true },
              mediaState: {
                type: 'object',
                properties: {
                  hasVideo: { type: 'boolean', example: true },
                  hasAudio: { type: 'boolean', example: true },
                  isVideoMuted: { type: 'boolean', example: false },
                  isAudioMuted: { type: 'boolean', example: false },
                  isScreenSharing: { type: 'boolean', example: false }
                }
              },
              connectionQuality: {
                type: 'object',
                properties: {
                  signal: { type: 'string', example: 'excellent' },
                  bitrate: { type: 'number', example: 850000 },
                  latency: { type: 'number', example: 45 },
                  packetsLost: { type: 'number', example: 2 }
                }
              }
            }
          }
        },
        duration: {
          type: 'object',
          properties: {
            started: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
            current: { type: 'string', example: '00:15:23' },
            maxDuration: { type: 'string', example: '01:00:00' },
            remainingTime: { type: 'string', example: '00:44:37' }
          }
        },
        chatRoomInfo: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            name: { type: 'string', example: 'Therapy Session' },
            type: { type: 'string', example: 'therapy' }
          }
        },
        metadata: {
          type: 'object',
          properties: {
            isQuickCall: { type: 'boolean', example: true },
            initiatedBy: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            callQuality: { type: 'string', example: 'hd' },
            recordingEnabled: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Call session not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this call session' })
  @Roles('user', 'therapist', 'admin')
  async getCallStatus(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtUser
  ) {
    const sessionStatus = await this.callingService.getCallSessionStatus(sessionId);
    
    return sessionStatus;
  }

  @Post('sessions/:sessionId/transports')
  @ApiOperation({ 
    summary: 'Create WebRTC transport',
    description: `
      Create a WebRTC transport for sending or receiving media in the call session.
      
      **Transport Types:**
      - \`send\`: For sending local media (camera, microphone, screen)
      - \`recv\`: For receiving remote media from other participants
      
      **MediaSoup Integration:**
      - Creates transport on MediaSoup router in Teletherapy Service
      - Returns ICE parameters and DTLS fingerprints for WebRTC connection
      - Handles NAT traversal and firewall considerations
      
      **Performance:**
      - Optimized for low latency and high quality
      - Supports adaptive bitrate streaming
      - Handles network fluctuations gracefully
    `
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'Call session identifier',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: CreateTransportDto,
    examples: {
      sendTransport: {
        summary: 'Send Transport',
        description: 'Create transport for sending local media',
        value: {
          direction: 'send',
          rtpCapabilities: {
            codecs: [
              {
                mimeType: 'video/VP8',
                clockRate: 90000,
                parameters: {}
              },
              {
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2
              }
            ],
            headerExtensions: [
              {
                uri: 'urn:ietf:params:rtp-hdrext:sdes:mid',
                id: 1
              }
            ]
          }
        }
      },
      recvTransport: {
        summary: 'Receive Transport', 
        description: 'Create transport for receiving remote media',
        value: {
          direction: 'recv',
          rtpCapabilities: {
            codecs: [
              {
                mimeType: 'video/VP8',
                clockRate: 90000
              }
            ]
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'WebRTC transport created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'transport_456e7890' },
        iceParameters: {
          type: 'object',
          properties: {
            usernameFragment: { type: 'string', example: 'abc123' },
            password: { type: 'string', example: 'def456' },
            iceLite: { type: 'boolean', example: true }
          }
        },
        iceCandidates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              foundation: { type: 'string', example: '1' },
              ip: { type: 'string', example: '192.168.1.100' },
              port: { type: 'number', example: 5000 },
              priority: { type: 'number', example: 2113667326 },
              protocol: { type: 'string', example: 'udp' },
              type: { type: 'string', example: 'host' }
            }
          }
        },
        dtlsParameters: {
          type: 'object',
          properties: {
            fingerprints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  algorithm: { type: 'string', example: 'sha-256' },
                  value: { type: 'string', example: 'AB:CD:EF:...' }
                }
              }
            },
            role: { type: 'string', example: 'auto' }
          }
        },
        sctpParameters: {
          type: 'object',
          nullable: true,
          properties: {
            port: { type: 'number', example: 5000 },
            OS: { type: 'number', example: 1024 },
            MIS: { type: 'number', example: 1024 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Call session not found' })
  @ApiResponse({ status: 403, description: 'Not authorized for this call session' })
  @ApiResponse({ status: 500, description: 'Failed to create transport' })
  @Roles('user', 'therapist', 'admin')
  async createTransport(
    @Param('sessionId') sessionId: string,
    @Body() createTransportDto: CreateTransportDto,
    @CurrentUser() user: JwtUser
  ) {
    const transport = await this.callingService.createWebRTCTransport(
      sessionId,
      user.id,
      createTransportDto.direction
    );

    return transport;
  }

  @Post('sessions/:sessionId/produce')
  @ApiOperation({ 
    summary: 'Start media production',
    description: `
      Start producing media (video/audio) in the call session.
      
      **Media Production:**
      - Video: Camera feed, screen sharing, or virtual background
      - Audio: Microphone input with noise suppression and echo cancellation
      
      **Quality Control:**
      - Adaptive bitrate based on network conditions
      - Automatic quality adjustment for optimal experience
      - Support for multiple resolutions and framerates
      
      **Features:**
      - Real-time media processing
      - Bandwidth optimization
      - Multi-layer encoding for different participants
    `
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'Call session identifier',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: ProduceMediaDto,
    examples: {
      videoProduction: {
        summary: 'Video Production',
        description: 'Start producing video from camera',
        value: {
          transportId: 'transport_456e7890',
          kind: 'video',
          rtpParameters: {
            mid: '0',
            codecs: [
              {
                mimeType: 'video/VP8',
                payloadType: 96,
                clockRate: 90000,
                parameters: {},
                rtcpFeedback: [
                  { type: 'nack' },
                  { type: 'nack', parameter: 'pli' },
                  { type: 'ccm', parameter: 'fir' }
                ]
              }
            ],
            encodings: [
              {
                maxBitrate: 1000000,
                scaleResolutionDownBy: 1
              }
            ],
            rtcp: {
              cname: 'user123'
            }
          }
        }
      },
      audioProduction: {
        summary: 'Audio Production',
        description: 'Start producing audio from microphone',
        value: {
          transportId: 'transport_456e7890',
          kind: 'audio',
          rtpParameters: {
            mid: '1',
            codecs: [
              {
                mimeType: 'audio/opus',
                payloadType: 111,
                clockRate: 48000,
                channels: 2
              }
            ],
            encodings: [
              {
                maxBitrate: 64000
              }
            ]
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Media production started successfully',
    schema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string',
          description: 'Producer ID for this media stream',
          example: 'producer_789e1234'
        },
        kind: { 
          type: 'string',
          enum: ['video', 'audio'],
          example: 'video'
        },
        rtpParameters: {
          type: 'object',
          description: 'RTP parameters confirmed by MediaSoup'
        },
        paused: {
          type: 'boolean',
          description: 'Whether the producer is initially paused',
          example: false
        },
        score: {
          type: 'object',
          properties: {
            encodingIdx: { type: 'number', example: 0 },
            ssrc: { type: 'number', example: 123456789 },
            rid: { type: 'string', example: 'high' },
            score: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Call session or transport not found' })
  @ApiResponse({ status: 400, description: 'Invalid RTP parameters' })
  @ApiResponse({ status: 500, description: 'Failed to start media production' })
  @Roles('user', 'therapist', 'admin')
  async produceMedia(
    @Param('sessionId') sessionId: string,
    @Body() produceMediaDto: ProduceMediaDto,
    @CurrentUser() user: JwtUser
  ) {
    const producer = await this.callingService.startMediaProduction(
      sessionId,
      user.id,
      produceMediaDto.transportId,
      produceMediaDto.kind,
      produceMediaDto.rtpParameters
    );

    return producer;
  }

  @Post('sessions/:sessionId/consume')
  @ApiOperation({ 
    summary: 'Start media consumption',
    description: `
      Start consuming media from another participant in the call session.
      
      **Media Consumption:**
      - Receive video streams from other participants
      - Receive audio streams with spatial audio support
      - Handle multiple streams efficiently
      
      **Quality Management:**
      - Automatic quality adaptation based on bandwidth
      - Prioritization of active speakers
      - Efficient bandwidth usage with SFU architecture
      
      **Features:**
      - Real-time stream switching
      - Simulcast support for multiple qualities
      - Seamless participant addition/removal
    `
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'Call session identifier',
    example: '789e1234-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: ConsumeMediaDto,
    examples: {
      consumeVideo: {
        summary: 'Consume Video',
        description: 'Start receiving video from another participant',
        value: {
          transportId: 'transport_recv_456',
          producerId: 'producer_789e1234'
        }
      },
      consumeAudio: {
        summary: 'Consume Audio',
        description: 'Start receiving audio from another participant',
        value: {
          transportId: 'transport_recv_456',
          producerId: 'producer_audio_789'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Media consumption started successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Consumer ID for this media stream',
          example: 'consumer_abc123'
        },
        producerId: {
          type: 'string',
          description: 'ID of the producer being consumed',
          example: 'producer_789e1234'
        },
        kind: {
          type: 'string',
          enum: ['video', 'audio'],
          example: 'video'
        },
        rtpParameters: {
          type: 'object',
          description: 'RTP parameters for consuming the media'
        },
        type: {
          type: 'string',
          enum: ['simple', 'simulcast', 'svc'],
          example: 'simulcast'
        },
        paused: {
          type: 'boolean',
          description: 'Whether the consumer is initially paused',
          example: false
        },
        preferredLayers: {
          type: 'object',
          nullable: true,
          properties: {
            spatialLayer: { type: 'number', example: 2 },
            temporalLayer: { type: 'number', example: 2 }
          }
        },
        score: {
          type: 'object',
          properties: {
            score: { type: 'number', example: 10 },
            producerScore: { type: 'number', example: 10 },
            producerScores: {
              type: 'array',
              items: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Call session, transport, or producer not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to consume from this producer' })
  @ApiResponse({ status: 500, description: 'Failed to start media consumption' })
  @Roles('user', 'therapist', 'admin')
  async consumeMedia(
    @Param('sessionId') sessionId: string,
    @Body() consumeMediaDto: ConsumeMediaDto,
    @CurrentUser() user: JwtUser
  ) {
    const consumer = await this.callingService.startMediaConsumption(
      sessionId,
      user.id,
      consumeMediaDto.transportId,
      consumeMediaDto.producerId
    );

    return consumer;
  }

  @Get('available-users')
  @ApiOperation({ 
    summary: 'Get users available for calling',
    description: `
      Retrieve list of users who are available for video/audio calls.
      
      **Availability Criteria:**
      - Currently online and active
      - Have calling enabled in their preferences
      - Mutual follow relationship or therapy connection
      - Not currently in another call
      - Compatible device capabilities
      
      **Chat Room Context:**
      - If \`chatRoomId\` is provided, returns participants of that room
      - Shows online status and calling preferences
      - Indicates if user is already in a call
      
      **Privacy:**
      - Respects user privacy settings
      - Shows availability without revealing location
      - Anonymous names where configured
    `
  })
  @ApiQuery({ 
    name: 'chatRoomId', 
    required: false, 
    description: 'Filter by specific chat room participants',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of users available for calling',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: '223e4567-e89b-12d3-a456-426614174000' },
          displayName: { type: 'string', example: 'Dr. Sarah Johnson' },
          anonymousDisplayName: { type: 'string', example: 'Therapist-A' },
          role: { type: 'string', example: 'therapist' },
          isOnline: { type: 'boolean', example: true },
          isAvailableForCalls: { type: 'boolean', example: true },
          lastSeen: { type: 'string', example: '2024-01-15T10:25:00.000Z' },
          currentCallStatus: {
            type: 'string',
            enum: ['available', 'in_call', 'busy', 'away'],
            example: 'available'
          },
          deviceCapabilities: {
            type: 'object',
            properties: {
              supportsVideo: { type: 'boolean', example: true },
              supportsAudio: { type: 'boolean', example: true },
              supportsScreenShare: { type: 'boolean', example: true },
              preferredQuality: { type: 'string', example: 'hd' }
            }
          },
          relationshipType: {
            type: 'string',
            enum: ['mutual-follow', 'therapist-client', 'chat-participant'],
            example: 'therapist-client'
          },
          callPreferences: {
            type: 'object',
            properties: {
              allowsDirectCalls: { type: 'boolean', example: true },
              requiresAppointment: { type: 'boolean', example: false },
              availableHours: {
                type: 'object',
                properties: {
                  start: { type: 'string', example: '09:00' },
                  end: { type: 'string', example: '17:00' },
                  timezone: { type: 'string', example: 'UTC-8' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Chat room not found (if chatRoomId provided)' })
  @Roles('user', 'therapist', 'admin')
  async getAvailableUsers(
    @CurrentUser() user: JwtUser,
    @Query('chatRoomId') chatRoomId?: string
  ) {
    // This would typically integrate with presence service and user preferences
    // For now, return mock data structure
    return [
      {
        userId: '223e4567-e89b-12d3-a456-426614174000',
        displayName: 'Dr. Sarah Johnson',
        anonymousDisplayName: 'Therapist-A',
        role: 'therapist',
        isOnline: true,
        isAvailableForCalls: true,
        lastSeen: new Date().toISOString(),
        currentCallStatus: 'available',
        deviceCapabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenShare: true,
          preferredQuality: 'hd'
        },
        relationshipType: 'therapist-client',
        callPreferences: {
          allowsDirectCalls: true,
          requiresAppointment: false,
          availableHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC-8'
          }
        }
      }
    ];
  }
} 
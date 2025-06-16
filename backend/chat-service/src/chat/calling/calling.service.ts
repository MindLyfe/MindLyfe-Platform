import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { JwtUser } from '../../auth/interfaces/user.interface';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatNotificationService } from '../../common/services/notification.service';
import { AuthClientService } from '../../shared/auth-client/auth-client.service';

export interface CreateCallDto {
  callerId: string;
  targetUserId: string;
  callType: 'video' | 'audio';
  chatRoomId: string;
  metadata?: Record<string, any>;
}

export interface CallSession {
  id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  participants: string[];
  callType: 'video' | 'audio';
  chatRoomId: string;
  startedAt?: Date;
  endedAt?: Date;
  duration?: string;
  metadata?: Record<string, any>;
}

export interface CallParticipant {
  userId: string;
  role: string;
  joinedAt: Date;
  leftAt?: Date;
  hasVideo: boolean;
  hasAudio: boolean;
  connectionQuality?: string;
}

@Injectable()
export class CallingService {
  private readonly logger = new Logger(CallingService.name);
  private readonly teletherapyServiceUrl: string;
  private readonly serviceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(ChatRoom)
    private readonly roomRepository: Repository<ChatRoom>,
    private readonly notificationService: ChatNotificationService,
    private readonly authClient: AuthClientService,
  ) {
    this.teletherapyServiceUrl = this.configService.get<string>(
      'services.teletherapyServiceUrl',
      'http://teletherapy-service:3002'
    );
    this.serviceToken = this.configService.get<string>(
      'jwt.secret',
      'mindlyf-service-secret-key'
    );
  }

  /**
   * Check if two users can call each other
   */
  async canUsersCall(
    callerId: string, 
    targetUserId: string, 
    chatRoomId: string
  ): Promise<boolean> {
    try {
      // Validate both users exist and are active
      const [callerValid, targetValid] = await Promise.all([
        this.validateUserForCalling(callerId),
        this.validateUserForCalling(targetUserId)
      ]);

      if (!callerValid || !targetValid) {
        this.logger.warn(`User validation failed for call: caller=${callerId}, target=${targetUserId}`);
        return false;
      }

      // Check if users are participants in the chat room
      const room = await this.roomRepository.findOne({
        where: { id: chatRoomId }
      });
      if (!room || !room.participants.includes(callerId) || !room.participants.includes(targetUserId)) {
        this.logger.warn(`Users not in chat room ${chatRoomId}`);
        return false;
      }

      // For therapy rooms, ensure proper therapist-client relationship
      if (room.type === 'therapy') {
        const isValidTherapyRelation = await this.validateTherapyRelationship(
          callerId, 
          targetUserId
        );
        if (!isValidTherapyRelation) {
          this.logger.warn(`Invalid therapy relationship for call: ${callerId} -> ${targetUserId}`);
          return false;
        }
      }

      // Check calling preferences and availability
      const targetCallPreferences = await this.getUserCallPreferences(targetUserId);
      if (!targetCallPreferences.allowsDirectCalls) {
        this.logger.warn(`Target user ${targetUserId} does not allow direct calls`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking if users can call: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Create a quick call session via teletherapy service
   */
  async createQuickCallSession(createCallDto: CreateCallDto): Promise<string> {
    try {
      // Get user information for better session metadata
      const [callerInfo, targetInfo] = await Promise.all([
        this.authClient.validateUser(createCallDto.callerId),
        this.authClient.validateUser(createCallDto.targetUserId)
      ]);

      const sessionPayload = {
        type: 'quick_call',
        callType: createCallDto.callType,
        participants: [
          {
            userId: createCallDto.callerId,
            role: 'caller',
            name: callerInfo.name || callerInfo.username || 'User',
            userRole: callerInfo.role
          },
          {
            userId: createCallDto.targetUserId,
            role: 'callee',
            name: targetInfo.name || targetInfo.username || 'User',
            userRole: targetInfo.role
          }
        ],
        metadata: {
          chatRoomId: createCallDto.chatRoomId,
          initiatedFrom: 'chat-service',
          callInitiatedAt: new Date(),
          maxDuration: 3600, // 1 hour in seconds
          allowRecording: false,
          isQuickCall: true,
          ...createCallDto.metadata
        },
        settings: {
          autoEndAfter: 3600000, // 1 hour in milliseconds
          requiresParticipantApproval: false,
          allowScreenSharing: true,
          qualitySettings: {
            maxVideoResolution: '720p',
            maxAudioBitrate: 64000
          }
        }
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.teletherapyServiceUrl}/api/teletherapy/sessions`,
          sessionPayload,
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'Content-Type': 'application/json',
              'X-Service-Name': 'chat-service'
            },
            timeout: 15000
          }
        )
      );

      const sessionId = response.data.id;
      this.logger.log(`Created call session ${sessionId} for ${createCallDto.callerId} -> ${createCallDto.targetUserId}`);

      // Send notification to target user about incoming call
      await this.notificationService.notifyIncomingCall(
        createCallDto.callerId,
        callerInfo.name || callerInfo.username || 'User',
        createCallDto.targetUserId,
        sessionId,
        createCallDto.callType,
        createCallDto.chatRoomId,
        await this.getChatRoomName(createCallDto.chatRoomId)
      );

      return sessionId;
    } catch (error) {
      this.logger.error(`Failed to create call session: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create call session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Join a call session
   */
  async joinCallSession(sessionId: string, userId: string): Promise<any> {
    try {
      // Validate user and get session info
      const userInfo = await this.authClient.validateUser(userId);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.teletherapyServiceUrl}/api/teletherapy/sessions/${sessionId}/join`,
          {
            userId,
            userInfo: {
              name: userInfo.name || userInfo.username,
              role: userInfo.role,
              capabilities: {
                video: true,
                audio: true,
                screen: false
              }
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      const sessionInfo = response.data;

      // Notify other participants that user joined
      const otherParticipants = sessionInfo.participants
        .filter(p => p.userId !== userId)
        .map(p => p.userId);

      if (otherParticipants.length > 0) {
        await this.notificationService.notifyCallStarted(
          sessionId,
          sessionInfo.participants.map(p => p.userId),
          sessionInfo.callType,
          sessionInfo.metadata?.chatRoomName || 'Call'
        );
      }

      this.logger.log(`User ${userId} joined call session ${sessionId}`);
      return sessionInfo;
    } catch (error) {
      this.logger.error(`Failed to join call session: ${error.message}`, error.stack);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new HttpException('Call session not found', HttpStatus.NOT_FOUND);
      } else if (error.response?.status === 403) {
        throw new HttpException('Not authorized to join this call', HttpStatus.FORBIDDEN);
      } else if (error.response?.status === 409) {
        throw new HttpException('Call session is full or ended', HttpStatus.CONFLICT);
      }
      
      throw new HttpException(
        'Failed to join call session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * End a call session
   */
  async endCallSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Get session info before ending
      const sessionInfo = await this.getCallSessionStatus(sessionId);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.teletherapyServiceUrl}/api/teletherapy/sessions/${sessionId}/end`,
          {
            endedBy: userId,
            endReason: 'user_ended',
            endTime: new Date()
          },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      const endedSession = response.data;

      // Calculate duration
      const duration = this.calculateDuration(
        sessionInfo.startedAt, 
        new Date()
      );

      // Notify all participants that call ended
      const participantIds = sessionInfo.participants.map(p => p.userId);
      await this.notificationService.notifyCallEnded(
        sessionId,
        participantIds,
        duration,
        'user_ended',
        userId
      );

      this.logger.log(`Call session ${sessionId} ended by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to end call session: ${error.message}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new HttpException('Call session not found', HttpStatus.NOT_FOUND);
      } else if (error.response?.status === 403) {
        throw new HttpException('Not authorized to end this call', HttpStatus.FORBIDDEN);
      }
      
      throw new HttpException(
        'Failed to end call session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get call session status
   */
  async getCallSessionStatus(sessionId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.teletherapyServiceUrl}/api/teletherapy/sessions/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      const sessionData = response.data;

      // Enrich with user information
      const enrichedParticipants = await Promise.all(
        sessionData.participants.map(async (participant) => {
          try {
            const userInfo = await this.authClient.validateUser(participant.userId);
            return {
              ...participant,
              displayName: userInfo.name || userInfo.username || 'User',
              role: userInfo.role,
              isOnline: true // Could integrate with presence service
            };
          } catch (error) {
            this.logger.warn(`Could not enrich participant ${participant.userId}: ${error.message}`);
            return {
              ...participant,
              displayName: 'User',
              role: 'user',
              isOnline: false
            };
          }
        })
      );

      return {
        ...sessionData,
        participants: enrichedParticipants,
        duration: sessionData.startedAt ? this.calculateDuration(
          new Date(sessionData.startedAt),
          sessionData.endedAt ? new Date(sessionData.endedAt) : new Date()
        ) : null
      };
    } catch (error) {
      this.logger.error(`Failed to get call session status: ${error.message}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new HttpException('Call session not found', HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        'Failed to get call session status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create WebRTC transport for media
   */
  async createWebRTCTransport(
    sessionId: string,
    userId: string,
    direction: 'send' | 'recv'
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.teletherapyServiceUrl}/api/teletherapy/sessions/${sessionId}/transports`,
          {
            userId,
            direction,
            options: {
              enableUdp: true,
              enableTcp: true,
              preferUdp: true,
              initialAvailableOutgoingBitrate: 1000000
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      this.logger.log(`Created ${direction} transport for user ${userId} in session ${sessionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create transport: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create transport',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Start media production
   */
  async startMediaProduction(
    sessionId: string,
    userId: string,
    transportId: string,
    kind: 'video' | 'audio',
    rtpParameters: any
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.teletherapyServiceUrl}/api/teletherapy/sessions/${sessionId}/produce`,
          {
            userId,
            transportId,
            kind,
            rtpParameters
          },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      this.logger.log(`Started ${kind} production for user ${userId} in session ${sessionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to start media production: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to start media production',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Start media consumption
   */
  async startMediaConsumption(
    sessionId: string,
    userId: string,
    transportId: string,
    producerId: string
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.teletherapyServiceUrl}/api/teletherapy/sessions/${sessionId}/consume`,
          {
            userId,
            transportId,
            producerId
          },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      this.logger.log(`Started media consumption for user ${userId} in session ${sessionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to start media consumption: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to start media consumption',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate user for calling capabilities
   */
  private async validateUserForCalling(userId: string): Promise<boolean> {
    try {
      const userInfo = await this.authClient.validateUser(userId);
      return userInfo && userInfo.status === 'active' && userInfo.emailVerified;
    } catch (error) {
      this.logger.warn(`User validation failed for ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate therapy relationship between users
   */
  private async validateTherapyRelationship(
    userId1: string, 
    userId2: string
  ): Promise<boolean> {
    try {
      // This would integrate with the teletherapy service to verify relationship
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.teletherapyServiceUrl}/api/teletherapy/relationships/validate`,
          {
            params: { user1: userId1, user2: userId2 },
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      return response.data.isValidRelationship;
    } catch (error) {
      this.logger.warn(`Therapy relationship validation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get user calling preferences
   */
  private async getUserCallPreferences(userId: string): Promise<any> {
    try {
      // This would integrate with user preferences service
      return {
        allowsDirectCalls: true,
        requiresAppointment: false,
        maxCallDuration: 3600,
        preferredQuality: 'hd',
        allowsRecording: false
      };
    } catch (error) {
      this.logger.warn(`Could not get call preferences for ${userId}: ${error.message}`);
      return { allowsDirectCalls: true, requiresAppointment: false };
    }
  }

  /**
   * Get chat room name for notifications
   */
  private async getChatRoomName(chatRoomId: string): Promise<string> {
    try {
      // This would get the room name from the database
      const room = await this.roomRepository.findOne({ where: { id: chatRoomId } });
      return room?.name || 'Call';
    } catch (error) {
      return 'Call';
    }
  }

  /**
   * Calculate duration between two dates
   */
  private calculateDuration(startTime: Date, endTime: Date): string {
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}
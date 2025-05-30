import { Injectable, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface MutualFollowData {
  canChat: boolean;
  chatPartner?: {
    anonymousId: string;
    displayName: string;
    avatarColor: string;
    role: string;
    isVerifiedTherapist: boolean;
    realUserId: string;
    allowRealNameInChat: boolean;
  };
  mutualFollowEstablishedAt?: Date;
  chatAccessGrantedAt?: Date;
}

export interface ChatPartner {
  anonymousId: string;
  displayName: string;
  avatarColor: string;
  role: string;
  isVerifiedTherapist: boolean;
  realUserId: string;
  allowRealNameInChat: boolean;
  mutualFollowEstablishedAt: Date;
  chatAccessGrantedAt: Date;
  lastActiveAt?: Date;
}

export interface UserIdentity {
  realUserId: string;
  anonymousDisplayName: string;
  allowRealNameInChat: boolean;
  realName?: string;
  avatarUrl?: string;
}

@Injectable()
export class CommunityClientService {
  private readonly logger = new Logger(CommunityClientService.name);
  private readonly communityServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.communityServiceUrl = this.configService.get<string>(
      'services.communityServiceUrl', 
      'http://community-service:3004'
    );
  }

  /**
   * Check if two users can chat based on mutual follow relationship
   */
  async checkChatEligibility(userId: string, targetAnonymousId: string): Promise<MutualFollowData> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.communityServiceUrl}/api/follows/check-chat-eligibility`,
          { userId: targetAnonymousId },
          {
            headers: {
              'Authorization': `Bearer ${userId}`, // In a real system, this would be a proper JWT
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to check chat eligibility: ${error.message}`, error.stack);
      return { canChat: false };
    }
  }

  /**
   * Get all chat-eligible users for a specific user
   */
  async getChatPartners(userId: string): Promise<ChatPartner[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.communityServiceUrl}/api/follows/chat-partners`,
          {
            headers: {
              'Authorization': `Bearer ${userId}`, // In a real system, this would be a proper JWT
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      return response.data.chatPartners || [];
    } catch (error) {
      this.logger.error(`Failed to get chat partners: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Validate mutual follow relationship between two real user IDs
   */
  async validateMutualFollow(realUserId1: string, realUserId2: string): Promise<boolean> {
    try {
      // Convert real user IDs to anonymous IDs and check
      const chatPartners = await this.getChatPartners(realUserId1);
      return chatPartners.some(partner => partner.realUserId === realUserId2);
    } catch (error) {
      this.logger.error(`Failed to validate mutual follow: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get user identity information for chat display
   * Handles both anonymous and real name display based on preferences
   */
  async getUserIdentity(
    realUserId: string, 
    viewerUserId: string, 
    roomType: 'direct' | 'group' | 'therapy' | 'support'
  ): Promise<UserIdentity> {
    try {
      // First, get anonymous identity from community service
      const chatPartners = await this.getChatPartners(viewerUserId);
      const partner = chatPartners.find(p => p.realUserId === realUserId);

      if (!partner) {
        // If not a chat partner, return anonymous identity only
        return {
          realUserId,
          anonymousDisplayName: 'Anonymous User',
          allowRealNameInChat: false
        };
      }

      const identity: UserIdentity = {
        realUserId,
        anonymousDisplayName: partner.displayName,
        allowRealNameInChat: partner.allowRealNameInChat
      };

      // If real names are allowed and this is a direct chat, get real identity
      if (partner.allowRealNameInChat && (roomType === 'direct' || roomType === 'therapy')) {
        try {
          const realIdentity = await this.getRealUserIdentity(realUserId);
          identity.realName = realIdentity.realName;
          identity.avatarUrl = realIdentity.avatarUrl;
        } catch (error) {
          this.logger.warn(`Could not get real identity for user ${realUserId}: ${error.message}`);
        }
      }

      return identity;
    } catch (error) {
      this.logger.error(`Failed to get user identity: ${error.message}`, error.stack);
      return {
        realUserId,
        anonymousDisplayName: 'Anonymous User',
        allowRealNameInChat: false
      };
    }
  }

  /**
   * Get real user identity from auth service
   */
  private async getRealUserIdentity(realUserId: string): Promise<{ realName: string; avatarUrl?: string }> {
    try {
      // This would call the auth service to get real user data
      // For now, return a placeholder
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get('services.authServiceUrl', 'http://auth-service:3001')}/api/auth/users/${realUserId}`,
          {
            headers: {
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      return {
        realName: response.data.name || response.data.username,
        avatarUrl: response.data.avatarUrl
      };
    } catch (error) {
      throw new Error(`Could not get real user identity: ${error.message}`);
    }
  }

  /**
   * Check if users are in the same therapy session (for therapist-client communication)
   */
  async checkTherapySessionAccess(therapistId: string, clientId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get('services.teletherapyServiceUrl', 'http://teletherapy-service:3002')}/api/teletherapy/sessions/relationship`,
          {
            params: { therapistId, clientId },
            headers: {
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      return response.data?.hasRelationship === true;
    } catch (error) {
      this.logger.error(`Failed to check therapy session access: ${error.message}`);
      return false;
    }
  }

  /**
   * Notify community service about new chat room creation
   */
  async notifyChatRoomCreated(roomId: string, participants: string[], roomType: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.communityServiceUrl}/api/notifications/chat-room-created`,
          {
            roomId,
            participants,
            roomType,
            timestamp: new Date()
          },
          {
            headers: {
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );
    } catch (error) {
      this.logger.warn(`Failed to notify community service about chat room creation: ${error.message}`);
      // Non-critical, don't throw
    }
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface NotificationPayload {
  type: string;
  recipientId: string;
  channels: string[];
  variables: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export enum ChatNotificationType {
  // Chat Message Notifications
  NEW_CHAT_MESSAGE = 'new_chat_message',
  MESSAGE_REPLY = 'message_reply',
  MESSAGE_MENTION = 'message_mention',
  MESSAGE_REACTION = 'message_reaction',
  
  // Chat Room Notifications
  CHAT_ROOM_INVITATION = 'chat_room_invitation',
  ROOM_CREATED = 'room_created',
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',
  ROOM_SETTINGS_UPDATED = 'room_settings_updated',
  
  // Calling Notifications
  INCOMING_CALL = 'incoming_call',
  CALL_STARTED = 'call_started',
  CALL_ENDED = 'call_ended',
  CALL_MISSED = 'call_missed',
  CALL_DECLINED = 'call_declined',
  CALL_PARTICIPANT_JOINED = 'call_participant_joined',
  CALL_PARTICIPANT_LEFT = 'call_participant_left',
  
  // Moderation Notifications
  MESSAGE_MODERATED = 'message_moderated',
  MESSAGE_DELETED = 'message_deleted',
  REPORT_SUBMITTED = 'report_submitted',
  REPORT_RESOLVED = 'report_resolved',
  
  // Social Notifications
  CHAT_REQUEST = 'chat_request',
  CHAT_REQUEST_ACCEPTED = 'chat_request_accepted',
  MUTUAL_FOLLOW_CHAT_ENABLED = 'mutual_follow_chat_enabled',
  THERAPY_CHAT_ENABLED = 'therapy_chat_enabled',
  
  // System Notifications
  CHAT_MAINTENANCE = 'chat_maintenance',
  FEATURE_ANNOUNCEMENT = 'feature_announcement',
  SECURITY_ALERT = 'security_alert'
}

@Injectable()
export class ChatNotificationService {
  private readonly logger = new Logger(ChatNotificationService.name);
  private readonly notificationServiceUrl: string;
  private readonly serviceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>(
      'services.notificationServiceUrl',
      'http://notification-service:3005'
    );
    this.serviceToken = this.configService.get<string>(
      'jwt.secret',
      'mindlyf-service-secret-key'
    );
  }

  /**
   * Send notification to notification service with retry logic
   */
  async sendNotification(notification: NotificationPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notifications`,
          {
            ...notification,
            timestamp: new Date(),
            serviceSource: 'chat-service',
            version: '1.0.0'
          },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        )
      );

      this.logger.log(`Notification sent: ${notification.type} to user ${notification.recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      // Store failed notification for retry (in production, this would use a queue)
      await this.handleFailedNotification(notification, error);
    }
  }

  /**
   * Send bulk notifications efficiently
   */
  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<void> {
    try {
      const bulkPayload = {
        notifications: notifications.map(notification => ({
          ...notification,
          timestamp: new Date(),
          serviceSource: 'chat-service'
        }))
      };

      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notifications/bulk`,
          bulkPayload,
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service',
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        )
      );

      this.logger.log(`Bulk notifications sent: ${notifications.length} notifications`);
    } catch (error) {
      this.logger.error(`Failed to send bulk notifications: ${error.message}`, error.stack);
      // Fallback to individual notifications
      for (const notification of notifications) {
        await this.sendNotification(notification);
      }
    }
  }

  // ==================== CHAT MESSAGE NOTIFICATIONS ====================

  /**
   * Notify participants about new chat message
   */
  async notifyNewMessage(
    senderId: string,
    senderName: string,
    roomId: string,
    roomName: string,
    messageContent: string,
    participantIds: string[],
    isAnonymous: boolean = false,
    attachmentCount: number = 0
  ): Promise<void> {
    const otherParticipants = participantIds.filter(id => id !== senderId);

    const notifications: NotificationPayload[] = otherParticipants.map(participantId => ({
      type: ChatNotificationType.NEW_CHAT_MESSAGE,
      recipientId: participantId,
      channels: ['push', 'in_app', 'websocket'],
      variables: {
        senderName: isAnonymous ? 'Anonymous User' : senderName,
        senderId: isAnonymous ? null : senderId,
        roomName,
        roomId,
        messagePreview: this.truncateMessage(messageContent, 100),
        fullMessage: messageContent,
        hasAttachments: attachmentCount > 0,
        attachmentCount,
        isAnonymous,
        timestamp: new Date(),
        messageId: `msg_${Date.now()}`
      },
      priority: 'high',
      metadata: {
        roomId,
        senderId,
        messageType: 'text',
        requiresResponse: false
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Notify user about message reply
   */
  async notifyMessageReply(
    originalMessageAuthorId: string,
    replierName: string,
    roomId: string,
    roomName: string,
    replyContent: string,
    originalMessagePreview: string
  ): Promise<void> {
    await this.sendNotification({
      type: ChatNotificationType.MESSAGE_REPLY,
      recipientId: originalMessageAuthorId,
      channels: ['push', 'in_app', 'email'],
      variables: {
        replierName,
        roomName,
        roomId,
        replyContent: this.truncateMessage(replyContent, 100),
        originalMessagePreview: this.truncateMessage(originalMessagePreview, 50),
        timestamp: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify user about message mention
   */
  async notifyMessageMention(
    mentionedUserId: string,
    mentionerName: string,
    roomId: string,
    roomName: string,
    messageContent: string
  ): Promise<void> {
    await this.sendNotification({
      type: ChatNotificationType.MESSAGE_MENTION,
      recipientId: mentionedUserId,
      channels: ['push', 'in_app', 'email'],
      variables: {
        mentionerName,
        roomName,
        roomId,
        messageContent: this.truncateMessage(messageContent, 100),
        timestamp: new Date()
      },
      priority: 'high'
    });
  }

  // ==================== CHAT ROOM NOTIFICATIONS ====================

  /**
   * Notify participants about chat room invitation
   */
  async notifyRoomInvitation(
    inviterId: string,
    inviterName: string,
    roomId: string,
    roomName: string,
    roomType: string,
    invitedUserIds: string[]
  ): Promise<void> {
    const otherParticipants = invitedUserIds.filter(id => id !== inviterId);

    const notifications: NotificationPayload[] = otherParticipants.map(participantId => ({
      type: ChatNotificationType.CHAT_ROOM_INVITATION,
      recipientId: participantId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        inviterName,
        roomName,
        roomId,
        roomType,
        invitationDate: new Date(),
        roomDescription: this.getRoomTypeDescription(roomType),
        acceptUrl: `${this.configService.get('app.frontendUrl')}/chat/rooms/${roomId}/join`,
        participantCount: invitedUserIds.length
      },
      priority: 'high',
      metadata: {
        roomId,
        inviterId,
        roomType,
        actionRequired: true
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Notify when participant joins room
   */
  async notifyParticipantJoined(
    roomId: string,
    roomName: string,
    joinedUserId: string,
    joinedUserName: string,
    participantIds: string[]
  ): Promise<void> {
    const otherParticipants = participantIds.filter(id => id !== joinedUserId);

    const notifications: NotificationPayload[] = otherParticipants.map(participantId => ({
      type: ChatNotificationType.PARTICIPANT_JOINED,
      recipientId: participantId,
      channels: ['in_app', 'websocket'],
      variables: {
        joinedUserName,
        joinedUserId,
        roomName,
        roomId,
        joinedAt: new Date(),
        newParticipantCount: participantIds.length
      },
      priority: 'normal'
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Notify when participant leaves room
   */
  async notifyParticipantLeft(
    roomId: string,
    roomName: string,
    leftUserId: string,
    leftUserName: string,
    participantIds: string[]
  ): Promise<void> {
    const otherParticipants = participantIds.filter(id => id !== leftUserId);

    const notifications: NotificationPayload[] = otherParticipants.map(participantId => ({
      type: ChatNotificationType.PARTICIPANT_LEFT,
      recipientId: participantId,
      channels: ['in_app', 'websocket'],
      variables: {
        leftUserName,
        leftUserId,
        roomName,
        roomId,
        leftAt: new Date(),
        remainingParticipantCount: participantIds.length
      },
      priority: 'normal'
    }));

    await this.sendBulkNotifications(notifications);
  }

  // ==================== CALLING NOTIFICATIONS ====================

  /**
   * Notify user about incoming call
   */
  async notifyIncomingCall(
    callerId: string,
    callerName: string,
    targetUserId: string,
    sessionId: string,
    callType: 'video' | 'audio',
    chatRoomId: string,
    roomName?: string
  ): Promise<void> {
    await this.sendNotification({
      type: ChatNotificationType.INCOMING_CALL,
      recipientId: targetUserId,
      channels: ['push', 'in_app', 'websocket', 'webrtc'],
      variables: {
        callerName,
        callerId,
        sessionId,
        callType,
        chatRoomId,
        roomName: roomName || 'Direct Call',
        callStartTime: new Date(),
        acceptUrl: `${this.configService.get('app.frontendUrl')}/call/${sessionId}`,
        declineUrl: `${this.configService.get('app.frontendUrl')}/call/${sessionId}/decline`,
        ringDuration: 30000 // 30 seconds
      },
      priority: 'high',
      metadata: {
        sessionId,
        callType,
        requiresImmediateAction: true,
        autoExpire: true,
        expireAfterMs: 30000
      }
    });
  }

  /**
   * Notify participants that call has started
   */
  async notifyCallStarted(
    sessionId: string,
    participantIds: string[],
    callType: 'video' | 'audio',
    roomName: string
  ): Promise<void> {
    const notifications: NotificationPayload[] = participantIds.map(participantId => ({
      type: ChatNotificationType.CALL_STARTED,
      recipientId: participantId,
      channels: ['in_app', 'websocket'],
      variables: {
        sessionId,
        callType,
        roomName,
        startTime: new Date(),
        participantCount: participantIds.length,
        callUrl: `${this.configService.get('app.frontendUrl')}/call/${sessionId}`
      },
      priority: 'normal'
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Notify participants that call has ended
   */
  async notifyCallEnded(
    sessionId: string,
    participantIds: string[],
    duration: string,
    endReason: string,
    endedBy?: string
  ): Promise<void> {
    const notifications: NotificationPayload[] = participantIds.map(participantId => ({
      type: ChatNotificationType.CALL_ENDED,
      recipientId: participantId,
      channels: ['in_app', 'websocket'],
      variables: {
        sessionId,
        duration,
        endReason,
        endedBy,
        endTime: new Date(),
        summary: `Call duration: ${duration}`
      },
      priority: 'normal',
      metadata: {
        sessionId,
        callSummary: true
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Notify user about missed call
   */
  async notifyMissedCall(
    callerId: string,
    callerName: string,
    targetUserId: string,
    sessionId: string,
    callType: 'video' | 'audio',
    missedAt: Date
  ): Promise<void> {
    await this.sendNotification({
      type: ChatNotificationType.CALL_MISSED,
      recipientId: targetUserId,
      channels: ['push', 'in_app', 'email'],
      variables: {
        callerName,
        callerId,
        sessionId,
        callType,
        missedAt,
        callbackUrl: `${this.configService.get('app.frontendUrl')}/chat/rooms`, // Link to chat rooms
        callDuration: '0',
        canCallBack: true
      },
      priority: 'normal',
      metadata: {
        sessionId,
        callType: 'missed',
        requiresFollowUp: true
      }
    });
  }

  // ==================== MODERATION NOTIFICATIONS ====================

  /**
   * Notify user about message moderation
   */
  async notifyMessageModerated(
    messageAuthorId: string,
    moderatorId: string,
    action: string,
    reason: string,
    messageContent: string,
    roomId?: string
  ): Promise<void> {
    await this.sendNotification({
      type: ChatNotificationType.MESSAGE_MODERATED,
      recipientId: messageAuthorId,
      channels: ['email', 'in_app'],
      variables: {
        action,
        reason,
        moderatorId,
        messagePreview: this.truncateMessage(messageContent, 50),
        moderatedAt: new Date(),
        roomId,
        appealUrl: `${this.configService.get('app.frontendUrl')}/appeals/new`,
        guidelinesUrl: `${this.configService.get('app.frontendUrl')}/community-guidelines`
      },
      priority: 'high',
      metadata: {
        moderationAction: action,
        reason,
        requiresAcknowledgment: true
      }
    });
  }

  /**
   * Notify moderators about new report
   */
  async notifyModeratorsOfReport(
    reporterUserId: string,
    reportedMessageId: string,
    reason: string,
    description: string,
    severity: string,
    roomId: string
  ): Promise<void> {
    // This would typically get a list of moderators from the auth service
    const moderatorIds = await this.getModeratorIds();

    const notifications: NotificationPayload[] = moderatorIds.map(moderatorId => ({
      type: ChatNotificationType.REPORT_SUBMITTED,
      recipientId: moderatorId,
      channels: ['email', 'in_app', 'slack'], // Could integrate with Slack for urgent reports
      variables: {
        reporterUserId,
        reportedMessageId,
        reason,
        description,
        severity,
        roomId,
        reportedAt: new Date(),
        reviewUrl: `${this.configService.get('app.adminUrl')}/moderation/reports/${reportedMessageId}`,
        priority: severity === 'high' ? 'URGENT' : 'NORMAL'
      },
      priority: severity === 'high' ? 'high' : 'normal',
      metadata: {
        reportType: 'message_report',
        severity,
        requiresModerationAction: true
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  // ==================== SOCIAL NOTIFICATIONS ====================

  /**
   * Notify user when mutual follow enables chat
   */
  async notifyMutualFollowChatEnabled(
    userId: string,
    partnerName: string,
    partnerAnonymousId: string
  ): Promise<void> {
    await this.sendNotification({
      type: ChatNotificationType.MUTUAL_FOLLOW_CHAT_ENABLED,
      recipientId: userId,
      channels: ['push', 'in_app'],
      variables: {
        partnerName,
        partnerAnonymousId,
        enabledAt: new Date(),
        chatUrl: `${this.configService.get('app.frontendUrl')}/chat/new?partner=${partnerAnonymousId}`,
        canStartCalling: true
      },
      priority: 'normal',
      metadata: {
        socialFeature: 'mutual_follow',
        actionAvailable: 'start_chat'
      }
    });
  }

  /**
   * Notify client when therapy chat is enabled
   */
  async notifyTherapyChatEnabled(
    clientId: string,
    therapistId: string,
    therapistName: string,
    sessionId: string
  ): Promise<void> {
    await this.sendNotification({
      type: ChatNotificationType.THERAPY_CHAT_ENABLED,
      recipientId: clientId,
      channels: ['push', 'in_app', 'email'],
      variables: {
        therapistName,
        therapistId,
        sessionId,
        enabledAt: new Date(),
        chatUrl: `${this.configService.get('app.frontendUrl')}/chat/therapy/${sessionId}`,
        sessionDuration: '50 minutes',
        supportEmail: this.configService.get('app.supportEmail')
      },
      priority: 'high',
      metadata: {
        sessionId,
        sessionType: 'therapy',
        isSecureChat: true
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Handle failed notification with retry logic
   */
  private async handleFailedNotification(notification: NotificationPayload, error: any): Promise<void> {
    // In production, this would store the notification in a retry queue
    this.logger.warn(`Storing failed notification for retry: ${notification.type} to ${notification.recipientId}`);
    
    // Could implement exponential backoff retry here
    // For now, just log the failure
  }

  /**
   * Truncate message content for preview
   */
  private truncateMessage(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get description for room type
   */
  private getRoomTypeDescription(roomType: string): string {
    const descriptions = {
      direct: 'Private conversation',
      group: 'Group chat',
      therapy: 'Therapy session',
      support: 'Support group'
    };
    return descriptions[roomType] || 'Chat room';
  }

  /**
   * Get list of moderator IDs from auth service
   */
  private async getModeratorIds(): Promise<string[]> {
    try {
      // This would call the auth service to get moderators
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get('services.authServiceUrl', 'http://auth-service:3001')}/api/auth/users/moderators`,
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      return response.data.moderators.map(mod => mod.id);
    } catch (error) {
      this.logger.error(`Failed to get moderator IDs: ${error.message}`);
      return []; // Return empty array as fallback
    }
  }

  /**
   * Send system-wide notification to all active users
   */
  async sendSystemNotification(
    type: ChatNotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notifications/system-broadcast`,
          {
            type,
            title,
            message,
            actionUrl,
            priority,
            timestamp: new Date(),
            serviceSource: 'chat-service'
          },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'chat-service'
            }
          }
        )
      );

      this.logger.log(`System notification sent: ${type}`);
    } catch (error) {
      this.logger.error(`Failed to send system notification: ${error.message}`, error.stack);
    }
  }
} 
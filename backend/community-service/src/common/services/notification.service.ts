import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface CommunityNotificationPayload {
  type: string;
  recipientId: string;
  channels: string[];
  variables: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export enum CommunityNotificationType {
  NEW_POST_FROM_FOLLOWED_USER = 'new_post_from_followed_user',
  NEW_COMMENT_ON_POST = 'new_comment_on_post',
  REPLY_TO_COMMENT = 'reply_to_comment',
  NEW_REACTION = 'new_reaction',
  NEW_FOLLOWER = 'new_follower',
  MUTUAL_FOLLOW_ESTABLISHED = 'mutual_follow_established',
  CONTENT_REPORTED = 'content_reported',
  CONTENT_MODERATED = 'content_moderated',
  POST_FEATURED = 'post_featured',
  THERAPIST_VERIFICATION_APPROVED = 'therapist_verification_approved',
  THERAPIST_VERIFICATION_REJECTED = 'therapist_verification_rejected',
  FOLLOW_REQUEST = 'follow_request',
  FOLLOW_REQUEST_ACCEPTED = 'follow_request_accepted',
  POST_LIKED = 'post_liked',
  COMMENT_LIKED = 'comment_liked',
  MENTION_IN_POST = 'mention_in_post',
  MENTION_IN_COMMENT = 'mention_in_comment'
}

@Injectable()
export class CommunityNotificationService {
  private readonly logger = new Logger(CommunityNotificationService.name);
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>(
      'NOTIFICATION_SERVICE_URL',
      'http://notification-service:3005'
    );
  }

  /**
   * Send notification to notification service
   */
  async sendNotification(notification: CommunityNotificationPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notification`,
          {
            ...notification,
            timestamp: new Date(),
            serviceSource: 'community-service'
          },
          {
            headers: {
              'X-Service-Name': 'community-service',
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        )
      );

      this.logger.log(`Community notification sent: ${notification.type} to user ${notification.recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to send community notification: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical for community functionality
    }
  }

  /**
   * Notify followers about new post
   */
  async notifyFollowersAboutNewPost(
    authorId: string,
    authorName: string,
    postId: string,
    postTitle: string,
    postContent: string,
    postCategory: string,
    followerIds: string[]
  ): Promise<void> {
    for (const followerId of followerIds) {
      await this.sendNotification({
        type: CommunityNotificationType.NEW_POST_FROM_FOLLOWED_USER,
        recipientId: followerId,
        channels: ['in_app'],
        variables: {
          authorName,
          postId,
          postTitle,
          postPreview: postContent.substring(0, 100),
          postCategory,
          createdAt: new Date()
        },
        priority: 'normal'
      });
    }
  }

  /**
   * Notify post author about new comment
   */
  async notifyPostAuthorAboutComment(
    postAuthorId: string,
    commenterName: string,
    postId: string,
    postTitle: string,
    commentContent: string,
    commentId: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.NEW_COMMENT_ON_POST,
      recipientId: postAuthorId,
      channels: ['in_app', 'email'],
      variables: {
        commenterName,
        postId,
        postTitle,
        commentId,
        commentPreview: commentContent.substring(0, 100),
        commentedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify comment author about reply
   */
  async notifyCommentAuthorAboutReply(
    commentAuthorId: string,
    replierName: string,
    originalComment: string,
    replyContent: string,
    postId: string,
    replyId: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.REPLY_TO_COMMENT,
      recipientId: commentAuthorId,
      channels: ['in_app'],
      variables: {
        replierName,
        originalComment: originalComment.substring(0, 50),
        replyPreview: replyContent.substring(0, 100),
        postId,
        replyId,
        repliedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify content author about reaction
   */
  async notifyContentAuthorAboutReaction(
    contentAuthorId: string,
    reactorName: string,
    reactionType: string,
    contentType: 'post' | 'comment',
    contentId: string,
    contentPreview: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.NEW_REACTION,
      recipientId: contentAuthorId,
      channels: ['in_app'],
      variables: {
        reactorName,
        reactionType,
        contentType,
        contentId,
        contentPreview: contentPreview.substring(0, 50),
        reactedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify user about new follower
   */
  async notifyNewFollower(
    followedUserId: string,
    followerName: string,
    followerRole: string,
    followerId: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.NEW_FOLLOWER,
      recipientId: followedUserId,
      channels: ['in_app'],
      variables: {
        followerName,
        followerRole,
        followerId,
        followedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify both users about mutual follow establishment
   */
  async notifyMutualFollowEstablished(
    userId1: string,
    userId2: string,
    user1Name: string,
    user2Name: string
  ): Promise<void> {
    // Notify first user
    await this.sendNotification({
      type: CommunityNotificationType.MUTUAL_FOLLOW_ESTABLISHED,
      recipientId: userId1,
      channels: ['in_app', 'push'],
      variables: {
        partnerName: user2Name,
        partnerId: userId2,
        chatEnabled: true,
        establishedAt: new Date()
      },
      priority: 'high'
    });

    // Notify second user
    await this.sendNotification({
      type: CommunityNotificationType.MUTUAL_FOLLOW_ESTABLISHED,
      recipientId: userId2,
      channels: ['in_app', 'push'],
      variables: {
        partnerName: user1Name,
        partnerId: userId1,
        chatEnabled: true,
        establishedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify moderators about reported content
   */
  async notifyModeratorsAboutReport(
    contentType: 'post' | 'comment',
    contentId: string,
    reason: string,
    reporterId: string,
    reportCount: number,
    moderatorIds: string[]
  ): Promise<void> {
    for (const moderatorId of moderatorIds) {
      await this.sendNotification({
        type: CommunityNotificationType.CONTENT_REPORTED,
        recipientId: moderatorId,
        channels: ['email', 'in_app'],
        variables: {
          contentType,
          contentId,
          reason,
          reporterId,
          reportCount,
          reportedAt: new Date()
        },
        priority: 'high'
      });
    }
  }

  /**
   * Notify content author about moderation action
   */
  async notifyContentModerated(
    contentAuthorId: string,
    action: 'approved' | 'removed' | 'warned',
    contentType: 'post' | 'comment',
    contentId: string,
    reason: string,
    moderatorId: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.CONTENT_MODERATED,
      recipientId: contentAuthorId,
      channels: ['email', 'in_app'],
      variables: {
        action,
        contentType,
        contentId,
        reason,
        moderatorId,
        moderatedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify user about therapist verification result
   */
  async notifyTherapistVerification(
    userId: string,
    status: 'approved' | 'rejected',
    reason?: string,
    verifiedBy?: string
  ): Promise<void> {
    const notificationType = status === 'approved' 
      ? CommunityNotificationType.THERAPIST_VERIFICATION_APPROVED 
      : CommunityNotificationType.THERAPIST_VERIFICATION_REJECTED;

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        status,
        reason: reason || '',
        verifiedBy: verifiedBy || '',
        verifiedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify user about post being featured
   */
  async notifyPostFeatured(
    postAuthorId: string,
    postId: string,
    postTitle: string,
    featuredBy: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.POST_FEATURED,
      recipientId: postAuthorId,
      channels: ['in_app', 'email'],
      variables: {
        postId,
        postTitle,
        featuredBy,
        featuredAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify about follow request (if private profiles are implemented)
   */
  async notifyFollowRequest(
    targetUserId: string,
    requesterName: string,
    requesterId: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.FOLLOW_REQUEST,
      recipientId: targetUserId,
      channels: ['in_app', 'push'],
      variables: {
        requesterName,
        requesterId,
        requestedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about follow request acceptance
   */
  async notifyFollowRequestAccepted(
    requesterId: string,
    accepterName: string,
    accepterId: string
  ): Promise<void> {
    await this.sendNotification({
      type: CommunityNotificationType.FOLLOW_REQUEST_ACCEPTED,
      recipientId: requesterId,
      channels: ['in_app'],
      variables: {
        accepterName,
        accepterId,
        acceptedAt: new Date()
      },
      priority: 'normal'
    });
  }
} 
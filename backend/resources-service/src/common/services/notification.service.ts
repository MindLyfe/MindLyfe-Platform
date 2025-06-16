import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ResourceNotificationPayload {
  type: string;
  recipientId: string;
  channels: string[];
  variables: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export enum ResourceNotificationType {
  // Resource creation and management
  RESOURCE_CREATED = 'resource_created',
  RESOURCE_UPDATED = 'resource_updated',
  RESOURCE_PUBLISHED = 'resource_published',
  RESOURCE_ARCHIVED = 'resource_archived',
  RESOURCE_DELETED = 'resource_deleted',
  
  // Resource access and engagement
  RESOURCE_VIEWED = 'resource_viewed',
  RESOURCE_DOWNLOADED = 'resource_downloaded',
  RESOURCE_SHARED = 'resource_shared',
  RESOURCE_FAVORITED = 'resource_favorited',
  
  // Content moderation
  RESOURCE_REPORTED = 'resource_reported',
  RESOURCE_MODERATED = 'resource_moderated',
  RESOURCE_FEATURED = 'resource_featured',
  
  // Learning path notifications
  LEARNING_PATH_CREATED = 'learning_path_created',
  LEARNING_PATH_COMPLETED = 'learning_path_completed',
  LEARNING_PATH_MILESTONE = 'learning_path_milestone',
  
  // Recommendations
  NEW_RESOURCE_RECOMMENDATION = 'new_resource_recommendation',
  RESOURCE_COLLECTION_UPDATED = 'resource_collection_updated',
  
  // System notifications
  RESOURCE_BACKUP_COMPLETED = 'resource_backup_completed',
  RESOURCE_MAINTENANCE = 'resource_maintenance',
  RESOURCE_QUOTA_WARNING = 'resource_quota_warning'
}

@Injectable()
export class ResourceNotificationService {
  private readonly logger = new Logger(ResourceNotificationService.name);
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>(
      'services.notificationServiceUrl',
      'http://notification-service:3005'
    );
  }

  /**
   * Send notification to notification service
   */
  async sendNotification(notification: ResourceNotificationPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notification`,
          {
            ...notification,
            timestamp: new Date(),
            serviceSource: 'resources-service'
          },
          {
            headers: {
              'X-Service-Name': 'resources-service',
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        )
      );

      this.logger.log(`Resource notification sent: ${notification.type} to user ${notification.recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to send resource notification: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical for resource functionality
    }
  }

  /**
   * Notify admin about new resource creation
   */
  async notifyResourceCreated(
    creatorId: string,
    resourceId: string,
    title: string,
    type: string,
    category: string,
    adminIds: string[] = []
  ): Promise<void> {
    // Notify creator
    await this.sendNotification({
      type: ResourceNotificationType.RESOURCE_CREATED,
      recipientId: creatorId,
      channels: ['in_app'],
      variables: {
        resourceId,
        title,
        type,
        category,
        createdAt: new Date()
      },
      priority: 'normal'
    });

    // Notify admins
    for (const adminId of adminIds) {
      await this.sendNotification({
        type: ResourceNotificationType.RESOURCE_CREATED,
        recipientId: adminId,
        channels: ['in_app', 'email'],
        variables: {
          resourceId,
          title,
          type,
          category,
          creatorId,
          createdAt: new Date()
        },
        priority: 'normal'
      });
    }
  }

  /**
   * Notify about resource updates
   */
  async notifyResourceUpdated(
    updaterId: string,
    resourceId: string,
    title: string,
    changes: string[],
    subscriberIds: string[] = []
  ): Promise<void> {
    // Notify updater
    await this.sendNotification({
      type: ResourceNotificationType.RESOURCE_UPDATED,
      recipientId: updaterId,
      channels: ['in_app'],
      variables: {
        resourceId,
        title,
        changes,
        updatedAt: new Date()
      },
      priority: 'normal'
    });

    // Notify subscribers if resource has followers
    for (const subscriberId of subscriberIds) {
      if (subscriberId !== updaterId) {
        await this.sendNotification({
          type: ResourceNotificationType.RESOURCE_UPDATED,
          recipientId: subscriberId,
          channels: ['in_app'],
          variables: {
            resourceId,
            title,
            changes,
            updatedAt: new Date()
          },
          priority: 'normal'
        });
      }
    }
  }

  /**
   * Notify about resource publication
   */
  async notifyResourcePublished(
    publisherId: string,
    resourceId: string,
    title: string,
    type: string,
    category: string,
    targetAudienceIds: string[] = []
  ): Promise<void> {
    // Notify publisher
    await this.sendNotification({
      type: ResourceNotificationType.RESOURCE_PUBLISHED,
      recipientId: publisherId,
      channels: ['in_app', 'email'],
      variables: {
        resourceId,
        title,
        type,
        category,
        publishedAt: new Date()
      },
      priority: 'high'
    });

    // Notify target audience
    for (const userId of targetAudienceIds) {
      if (userId !== publisherId) {
        await this.sendNotification({
          type: ResourceNotificationType.RESOURCE_PUBLISHED,
          recipientId: userId,
          channels: ['in_app'],
          variables: {
            resourceId,
            title,
            type,
            category,
            publishedAt: new Date()
          },
          priority: 'normal'
        });
      }
    }
  }

  /**
   * Notify about resource downloads
   */
  async notifyResourceDownloaded(
    downloaderId: string,
    resourceOwnerId: string,
    resourceId: string,
    title: string,
    downloadCount: number
  ): Promise<void> {
    // Only notify owner if different from downloader
    if (downloaderId !== resourceOwnerId) {
      await this.sendNotification({
        type: ResourceNotificationType.RESOURCE_DOWNLOADED,
        recipientId: resourceOwnerId,
        channels: ['in_app'],
        variables: {
          resourceId,
          title,
          downloaderId,
          downloadCount,
          downloadedAt: new Date()
        },
        priority: 'normal'
      });
    }
  }

  /**
   * Notify about resource being reported
   */
  async notifyResourceReported(
    reporterId: string,
    resourceId: string,
    title: string,
    reason: string,
    moderatorIds: string[]
  ): Promise<void> {
    for (const moderatorId of moderatorIds) {
      await this.sendNotification({
        type: ResourceNotificationType.RESOURCE_REPORTED,
        recipientId: moderatorId,
        channels: ['email', 'in_app'],
        variables: {
          resourceId,
          title,
          reason,
          reporterId,
          reportedAt: new Date()
        },
        priority: 'high'
      });
    }
  }

  /**
   * Notify about resource moderation action
   */
  async notifyResourceModerated(
    resourceOwnerId: string,
    resourceId: string,
    title: string,
    action: 'approved' | 'rejected' | 'archived',
    reason: string,
    moderatorId: string
  ): Promise<void> {
    await this.sendNotification({
      type: ResourceNotificationType.RESOURCE_MODERATED,
      recipientId: resourceOwnerId,
      channels: ['email', 'in_app'],
      variables: {
        resourceId,
        title,
        action,
        reason,
        moderatorId,
        moderatedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about resource being featured
   */
  async notifyResourceFeatured(
    resourceOwnerId: string,
    resourceId: string,
    title: string,
    featuredBy: string,
    featuredUntil?: Date
  ): Promise<void> {
    await this.sendNotification({
      type: ResourceNotificationType.RESOURCE_FEATURED,
      recipientId: resourceOwnerId,
      channels: ['email', 'in_app'],
      variables: {
        resourceId,
        title,
        featuredBy,
        featuredAt: new Date(),
        featuredUntil: featuredUntil || null
      },
      priority: 'high'
    });
  }

  /**
   * Notify about learning path completion
   */
  async notifyLearningPathCompleted(
    userId: string,
    pathId: string,
    pathName: string,
    completedResourcesCount: number,
    certificateId?: string
  ): Promise<void> {
    await this.sendNotification({
      type: ResourceNotificationType.LEARNING_PATH_COMPLETED,
      recipientId: userId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        pathId,
        pathName,
        completedResourcesCount,
        certificateId: certificateId || null,
        completedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about new resource recommendations
   */
  async notifyNewResourceRecommendation(
    userId: string,
    recommendedResourceIds: string[],
    recommendationReason: string,
    category: string
  ): Promise<void> {
    await this.sendNotification({
      type: ResourceNotificationType.NEW_RESOURCE_RECOMMENDATION,
      recipientId: userId,
      channels: ['in_app'],
      variables: {
        recommendedResourceIds,
        recommendationReason,
        category,
        recommendedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify about resource quota warnings
   */
  async notifyResourceQuotaWarning(
    userId: string,
    currentUsage: number,
    quotaLimit: number,
    warningThreshold: number
  ): Promise<void> {
    await this.sendNotification({
      type: ResourceNotificationType.RESOURCE_QUOTA_WARNING,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        currentUsage,
        quotaLimit,
        warningThreshold,
        usagePercentage: Math.round((currentUsage / quotaLimit) * 100),
        checkedAt: new Date()
      },
      priority: 'high'
    });
  }
} 
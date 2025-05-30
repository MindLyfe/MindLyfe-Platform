import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationEntity, NotificationStatus, NotificationType } from './entities/notification.entity';
import { NotificationChannelEntity, ChannelType } from './entities/notification-channel.entity';
import { NotificationTemplateEntity } from './entities/notification-template.entity';
import { NotificationPreferenceEntity, TimeWindow } from './entities/notification-preference.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthService } from '../auth/auth.service';
import { NotificationChannelFactory } from './channels/notification-channel.factory';
import { NotificationQueueService, QueueOptions } from './queue/notification-queue.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    
    @InjectRepository(NotificationChannelEntity)
    private channelRepository: Repository<NotificationChannelEntity>,
    
    @InjectRepository(NotificationTemplateEntity)
    private templateRepository: Repository<NotificationTemplateEntity>,
    
    @InjectRepository(NotificationPreferenceEntity)
    private preferenceRepository: Repository<NotificationPreferenceEntity>,
    
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly channelFactory: NotificationChannelFactory,
    private readonly queueService: NotificationQueueService,
  ) {}

  /**
   * Create a new notification
   */
  async createNotification(dto: CreateNotificationDto): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      recipientEmail: dto.recipientEmail,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      metadata: dto.metadata || {},
      status: NotificationStatus.PENDING,
      templateId: dto.templateId,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    // Save the notification entity first
    const savedNotification = await this.notificationRepository.save(notification);
    
    // If the notification should be sent immediately
    if (!notification.scheduledAt || new Date(notification.scheduledAt) <= new Date()) {
      // Add to queue for processing with appropriate context
      const queueOptions: QueueOptions = {
        priority: this.getPriorityForNotificationType(notification.type),
        metadata: {
          isTransactional: this.isTransactionalNotification(notification.type),
          requiresImmediate: this.requiresImmediateDelivery(notification.type),
        }
      };
      
      await this.queueService.enqueue(savedNotification, queueOptions);
    }
    
    return savedNotification;
  }

  /**
   * Send a notification through the specified channels or default channels
   */
  async sendNotification(
    notification: NotificationEntity | string,
    channels?: ChannelType[],
  ): Promise<NotificationEntity> {
    // If a string ID is provided, fetch the notification
    if (typeof notification === 'string') {
      notification = await this.findOne(notification);
    }

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // If notification is already sent and not failed, return it
    if (
      notification.status !== NotificationStatus.PENDING &&
      notification.status !== NotificationStatus.FAILED
    ) {
      return notification;
    }

    // Get user preferences
    const userPrefs = await this.preferenceRepository.findOne({
      where: { userId: notification.userId },
    });
    
    // Check if user has exceeded daily/weekly limits
    if (userPrefs && !this.isTransactionalNotification(notification.type)) {
      const withinLimits = await this.isWithinFrequencyLimits(notification.userId, notification.type);
      if (!withinLimits) {
        this.logger.log(`Notification not sent - user ${notification.userId} has exceeded frequency limits`);
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = 'Frequency limit exceeded';
        return this.notificationRepository.save(notification);
      }
    }
    
    // Check if user is in Do Not Disturb period
    if (userPrefs && userPrefs.doNotDisturb?.enabled && !this.requiresImmediateDelivery(notification.type)) {
      const isDnd = this.isInDoNotDisturbPeriod(userPrefs.doNotDisturb);
      if (isDnd) {
        // Reschedule for after DND period if not a critical notification
        const endOfDnd = this.getEndOfDoNotDisturbPeriod(userPrefs.doNotDisturb);
        if (endOfDnd) {
          notification.scheduledAt = endOfDnd;
          notification.status = NotificationStatus.PENDING;
          notification.metadata = {
            ...notification.metadata,
            rescheduledDueToDnd: true,
          };
          return this.notificationRepository.save(notification);
        }
      }
    }

    // Smart channel selection based on user context
    const contextAwareChannels = await this.getContextAwareChannels(
      notification.userId,
      notification.type,
      channels,
    );

    if (contextAwareChannels.length === 0) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = 'No appropriate channels available';
      return this.notificationRepository.save(notification);
    }

    // Send through each selected channel
    const results = await Promise.allSettled(
      contextAwareChannels.map(channelType => this.sendThroughChannel(notification, channelType)),
    );
    
    // Update notification status based on results
    const failures = results.filter(r => r.status === 'rejected').length;
    
    if (failures === 0) {
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
    } else if (failures === contextAwareChannels.length) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = 'Failed to send through any channel';
    } else {
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      notification.errorMessage = `Failed to send through ${failures} of ${contextAwareChannels.length} channels`;
    }
    
    return this.notificationRepository.save(notification);
  }

  /**
   * Send a notification through a specific channel
   */
  private async sendThroughChannel(
    notification: NotificationEntity,
    channelType: ChannelType,
  ): Promise<void> {
    try {
      // Get channel configuration
      const channel = await this.channelRepository.findOne({
        where: { 
          type: channelType,
          isActive: true,
        },
      });
      
      if (!channel) {
        throw new Error(`Channel ${channelType} is not active or does not exist`);
      }

      // Get the appropriate channel adapter
      const channelAdapter = this.channelFactory.getChannel(channelType);
      
      // Send the notification through the adapter
      const result = await channelAdapter.send(notification);
      
      if (!result.success) {
        throw new Error(
          result.error?.message || `Failed to send through ${channelType}`
        );
      }
      
      // Update notification with channel info
      notification.channelId = channel.id;
      
      this.logger.log(
        `Notification ${notification.id} sent successfully through ${channelType}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification through ${channelType}: ${error.message}`, 
        error.stack
      );
      throw error;
    }
  }

  /**
   * Get user details from auth service
   */
  private async getUserDetails(userId: string): Promise<any> {
    try {
      // Try to get a system token
      // In a real implementation, we'd use a service account or API key
      const systemToken = this.configService.get('system.apiToken');
      
      // Get user details
      return await this.authService.getUserById(userId, systemToken);
    } catch (error) {
      this.logger.error(`Failed to get user details: ${error.message}`);
      // Return minimal user info
      return { id: userId };
    }
  }

  /**
   * Get context-aware channels based on user status and preferences
   */
  private async getContextAwareChannels(
    userId: string, 
    notificationType: NotificationType,
    explicitChannels?: ChannelType[],
  ): Promise<ChannelType[]> {
    try {
      // If explicit channels are provided, use those (but still filter by user preferences)
      if (explicitChannels && explicitChannels.length > 0) {
        return await this.filterChannelsByPreferences(userId, notificationType, explicitChannels);
      }
      
      // Get user preferences
      const preferences = await this.preferenceRepository.findOne({
        where: { userId },
      });
      
      // If no preferences, use defaults
      if (!preferences) {
        return this.getDefaultChannelsForType(notificationType);
      }
      
      // Check if user is currently active in the app
      const isUserActive = preferences.isOnline && 
        preferences.lastActivity && 
        (new Date().getTime() - preferences.lastActivity.getTime() < 5 * 60 * 1000); // 5 minutes
      
      // If user is active, prefer in-app notifications
      if (isUserActive) {
        // For transactional/important notifications, still use all channels
        if (this.isTransactionalNotification(notificationType) || this.requiresImmediateDelivery(notificationType)) {
          return await this.getEnabledChannelsForUser(userId, notificationType);
        }
        
        // For regular notifications, just use in-app when user is active
        const inAppChannel = [ChannelType.IN_APP];
        return await this.filterChannelsByPreferences(userId, notificationType, inAppChannel);
      }
      
      // If user is not active, use type-specific preferences
      const typePrefs = preferences.typePreferences?.[notificationType];
      if (typePrefs?.enabled && typePrefs.preferredChannels?.length > 0) {
        const channelTypes = typePrefs.preferredChannels.map(c => 
          c === 'email' 
            ? ChannelType.EMAIL 
            : c === 'sms' 
              ? ChannelType.SMS 
              : c === 'push' 
                ? ChannelType.PUSH 
                : ChannelType.IN_APP
        );
        return await this.filterChannelsByPreferences(userId, notificationType, channelTypes);
      }
      
      // Fall back to enabled channels
      return await this.getEnabledChannelsForUser(userId, notificationType);
    } catch (error) {
      this.logger.error(`Failed to get context-aware channels: ${error.message}`);
      return this.getDefaultChannelsForType(notificationType);
    }
  }

  /**
   * Get enabled notification channels for a user
   */
  private async getEnabledChannelsForUser(
    userId: string,
    notificationType: NotificationType,
  ): Promise<ChannelType[]> {
    try {
      // Find user preferences
      const preferences = await this.preferenceRepository.findOne({
        where: { userId },
      });
      
      if (!preferences) {
        return this.getDefaultChannelsForType(notificationType);
      }
      
      // Special handling for marketing notifications
      if (notificationType === NotificationType.MARKETING && !preferences.receiveMarketing) {
        return []; // Don't send marketing notifications if user opted out
      }
      
      // Special handling for gamification notifications
      if (this.isGamificationNotification(notificationType) && 
          preferences.gamification && 
          !this.isGamificationEnabled(preferences.gamification, notificationType)) {
        return []; // Don't send gamification notifications if disabled
      }
      
      // Extract enabled channels from preferences
      const enabledChannels = Object.entries(preferences.channels || {})
        .filter(([_, value]) => value.enabled)
        .filter(([_, value]) => {
          // Check if this content type is enabled
          return !value.contentTypes || 
            value.contentTypes.includes(notificationType);
        })
        .filter(([channel, value]) => {
          // Check if current time is within allowed time windows
          if (!value.timeWindows || value.timeWindows.length === 0) {
            return true;
          }
          
          return this.isWithinTimeWindows(value.timeWindows);
        })
        .filter(([channel, _]) => {
          // Only include SMS/Email for transactional if opted in
          if ((channel === 'email' || channel === 'sms') && 
              !this.isTransactionalNotification(notificationType)) {
            return preferences.receiveTransactional;
          }
          return true;
        })
        .map(([key, _]) => {
          // Map preference key to channel type
          return key === 'email' 
            ? ChannelType.EMAIL 
            : key === 'sms' 
              ? ChannelType.SMS 
              : key === 'push' 
                ? ChannelType.PUSH 
                : ChannelType.IN_APP;
        });
      
      if (enabledChannels.length > 0) {
        return enabledChannels;
      }
      
      // Fall back to default channels
      return this.getDefaultChannelsForType(notificationType);
    } catch (error) {
      this.logger.error(`Failed to get enabled channels: ${error.message}`);
      return this.getDefaultChannelsForType(notificationType);
    }
  }
  
  /**
   * Filter channels by user preferences
   */
  private async filterChannelsByPreferences(
    userId: string,
    notificationType: NotificationType,
    channels: ChannelType[],
  ): Promise<ChannelType[]> {
    try {
      // Find user preferences
      const preferences = await this.preferenceRepository.findOne({
        where: { userId },
      });
      
      if (!preferences) {
        return channels;
      }
      
      // Filter channels based on user preferences
      return channels.filter(channelType => {
        const channelKey = channelType === ChannelType.EMAIL 
          ? 'email' 
          : channelType === ChannelType.SMS 
            ? 'sms' 
            : channelType === ChannelType.PUSH 
              ? 'push' 
              : 'in_app';
        
        const channelPrefs = preferences.channels?.[channelKey];
        
        // Check if channel is enabled
        if (!channelPrefs?.enabled) {
          return false;
        }
        
        // Check if notification type is allowed for this channel
        if (channelPrefs.contentTypes && 
            !channelPrefs.contentTypes.includes(notificationType)) {
          return false;
        }
        
        // Check if channel has consent (for SMS/Email)
        if ((channelType === ChannelType.EMAIL || channelType === ChannelType.SMS) && 
            !this.isTransactionalNotification(notificationType)) {
          if (!channelPrefs.consentGiven) {
            return false;
          }
        }
        
        // Check time windows for SMS/Email/Push
        if ((channelType === ChannelType.EMAIL || 
             channelType === ChannelType.SMS || 
             channelType === ChannelType.PUSH) && 
            channelPrefs.timeWindows && 
            channelPrefs.timeWindows.length > 0) {
          return this.isWithinTimeWindows(channelPrefs.timeWindows);
        }
        
        return true;
      });
    } catch (error) {
      this.logger.error(`Failed to filter channels by preferences: ${error.message}`);
      return channels;
    }
  }

  /**
   * Check if current time is within allowed time windows
   */
  private isWithinTimeWindows(timeWindows: TimeWindow[]): boolean {
    const now = new Date();
    const currentDay = now.getDay(); // 0-6, where 0 is Sunday
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check if current time is within any of the allowed windows
    return timeWindows.some(window => {
      // Check day of week
      if (window.dayOfWeek !== currentDay) {
        return false;
      }
      
      // Check time window
      return currentTime >= window.startTime && currentTime <= window.endTime;
    });
  }
  
  /**
   * Check if user is in do not disturb period
   */
  private isInDoNotDisturbPeriod(dnd: { enabled: boolean; startTime: string; endTime: string; timezone: string }): boolean {
    if (!dnd.enabled) {
      return false;
    }
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Handle overnight DND periods
    if (dnd.startTime > dnd.endTime) {
      // DND period spans midnight
      return currentTime >= dnd.startTime || currentTime <= dnd.endTime;
    } else {
      // Normal DND period within same day
      return currentTime >= dnd.startTime && currentTime <= dnd.endTime;
    }
  }
  
  /**
   * Get end of do not disturb period
   */
  private getEndOfDoNotDisturbPeriod(dnd: { enabled: boolean; startTime: string; endTime: string; timezone: string }): Date | null {
    if (!dnd.enabled) {
      return null;
    }
    
    const now = new Date();
    const [endHours, endMinutes] = dnd.endTime.split(':').map(part => parseInt(part, 10));
    
    const endTime = new Date(now);
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    // If end time is in the past for today, schedule for tomorrow
    if (endTime <= now) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    return endTime;
  }
  
  /**
   * Check if notification type is transactional (required for service functionality)
   */
  private isTransactionalNotification(type: NotificationType): boolean {
    return [
      NotificationType.ACCOUNT,
      NotificationType.PAYMENT,
      NotificationType.SUBSCRIPTION,
    ].includes(type);
  }
  
  /**
   * Check if notification requires immediate delivery
   */
  private requiresImmediateDelivery(type: NotificationType): boolean {
    return [
      NotificationType.ACCOUNT,
      NotificationType.PAYMENT,
      NotificationType.SUBSCRIPTION,
    ].includes(type);
  }
  
  /**
   * Check if notification is related to gamification
   */
  private isGamificationNotification(type: NotificationType, notification?: NotificationEntity): boolean {
    if (!notification) {
      // If no specific notification provided, just check the type
      return type === NotificationType.SYSTEM;
    }
    
    // This checks metadata for more specific categorization
    return type === NotificationType.SYSTEM && 
           (
             (notification.metadata?.category === 'streak') ||
             (notification.metadata?.category === 'achievement') ||
             (notification.metadata?.category === 'challenge') ||
             (notification.metadata?.category === 'milestone')
           );
  }
  
  /**
   * Check if specific gamification type is enabled
   */
  private isGamificationEnabled(
    gamificationPrefs: { 
      streaks: boolean; 
      achievements: boolean; 
      challenges: boolean; 
      milestones: boolean; 
    },
    notificationType: NotificationType,
    notification?: NotificationEntity
  ): boolean {
    // Get gamification category from metadata
    const category = notification?.metadata?.category;
    
    if (!category) {
      return true; // Default to enabled if no category specified
    }
    
    switch (category) {
      case 'streak':
        return gamificationPrefs.streaks;
      case 'achievement':
        return gamificationPrefs.achievements;
      case 'challenge':
        return gamificationPrefs.challenges;
      case 'milestone':
        return gamificationPrefs.milestones;
      default:
        return true;
    }
  }
  
  /**
   * Check if user is within frequency limits
   */
  private async isWithinFrequencyLimits(
    userId: string,
    notificationType: NotificationType
  ): Promise<boolean> {
    try {
      // Get user preferences
      const preferences = await this.preferenceRepository.findOne({
        where: { userId },
      });
      
      if (!preferences?.frequency) {
        return true; // No frequency limits set
      }
      
      // Get today's and this week's notifications count
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Count today's notifications
      const todayCount = await this.notificationRepository.count({
        where: {
          userId,
          createdAt: { $gte: startOfToday },
          status: NotificationStatus.SENT,
        },
      });
      
      // Count this week's notifications
      const weeklyCount = await this.notificationRepository.count({
        where: {
          userId,
          createdAt: { $gte: startOfWeek },
          status: NotificationStatus.SENT,
        },
      });
      
      // Check type-specific limits first
      if (preferences.frequency.byType?.[notificationType]) {
        const typeLimits = preferences.frequency.byType[notificationType];
        
        if (typeLimits.daily && todayCount >= typeLimits.daily) {
          return false; // Exceeded daily limit for this type
        }
        
        if (typeLimits.weekly && weeklyCount >= typeLimits.weekly) {
          return false; // Exceeded weekly limit for this type
        }
      }
      
      // Check overall limits
      if (preferences.frequency.daily && todayCount >= preferences.frequency.daily) {
        return false; // Exceeded overall daily limit
      }
      
      if (preferences.frequency.weekly && weeklyCount >= preferences.frequency.weekly) {
        return false; // Exceeded overall weekly limit
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to check frequency limits: ${error.message}`);
      return true; // Default to allowed if we can't check
    }
  }

  /**
   * Get default channels for a notification type
   */
  private getDefaultChannelsForType(type: NotificationType): ChannelType[] {
    // Default channel preferences based on notification type
    const defaultChannels = {
      [NotificationType.ACCOUNT]: [ChannelType.EMAIL, ChannelType.IN_APP],
      [NotificationType.SYSTEM]: [ChannelType.IN_APP],
      [NotificationType.THERAPY]: [ChannelType.EMAIL, ChannelType.PUSH, ChannelType.IN_APP],
      [NotificationType.COMMUNITY]: [ChannelType.IN_APP, ChannelType.PUSH],
      [NotificationType.CHAT]: [ChannelType.PUSH, ChannelType.IN_APP],
      [NotificationType.MARKETING]: [ChannelType.EMAIL],
    };
    
    return defaultChannels[type] || [ChannelType.IN_APP];
  }

  /**
   * Get priority for a notification type
   */
  private getPriorityForNotificationType(type: NotificationType): 'high' | 'medium' | 'low' {
    // Set priority based on notification type
    const priorities = {
      [NotificationType.THERAPY]: 'high',
      [NotificationType.ACCOUNT]: 'high',
      [NotificationType.SYSTEM]: 'medium',
      [NotificationType.CHAT]: 'medium',
      [NotificationType.COMMUNITY]: 'medium',
      [NotificationType.MARKETING]: 'low',
    };
    
    return priorities[type] || 'medium';
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    
    return this.notificationRepository.save(notification);
  }

  /**
   * Find a notification by ID
   */
  async findOne(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['template', 'channel'],
    });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    
    return notification;
  }

  /**
   * Find all notifications for a user
   */
  async findAllForUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: NotificationType;
      read?: boolean;
    } = {},
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    
    const query = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.template', 'template')
      .leftJoinAndSelect('notification.channel', 'channel')
      .where('notification.userId = :userId', { userId });
    
    if (options.type) {
      query.andWhere('notification.type = :type', { type: options.type });
    }
    
    if (options.read !== undefined) {
      query.andWhere('notification.isRead = :read', { read: options.read });
    }
    
    const [notifications, total] = await query
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    return { notifications, total };
  }

  /**
   * Delete a notification
   */
  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    
    await this.notificationRepository.remove(notification);
  }
  
  /**
   * Update user online status
   */
  async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    // Get user preferences or create if doesn't exist
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });
    
    if (!preferences) {
      preferences = this.preferenceRepository.create({
        userId,
        isOnline: false,
      });
    }
    
    // Update online status and last activity
    preferences.isOnline = isOnline;
    preferences.lastActivity = new Date();
    
    await this.preferenceRepository.save(preferences);
    
    this.logger.log(`Updated user ${userId} online status: ${isOnline}`);
  }
  
  /**
   * Get the in-app notification adapter
   */
  getInAppAdapter(): any {
    return this.channelFactory.getChannel(ChannelType.IN_APP);
  }
} 
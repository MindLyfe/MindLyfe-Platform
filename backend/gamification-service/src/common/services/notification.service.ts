import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface GamificationNotificationPayload {
  type: string;
  recipientId: string;
  channels: string[];
  variables: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export enum GamificationNotificationType {
  // Achievement notifications
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  ACHIEVEMENT_PROGRESS = 'achievement_progress',
  MILESTONE_REACHED = 'milestone_reached',
  RARE_ACHIEVEMENT_UNLOCKED = 'rare_achievement_unlocked',
  
  // Badge notifications
  BADGE_EARNED = 'badge_earned',
  BADGE_UPGRADED = 'badge_upgraded',
  FIRST_BADGE_EARNED = 'first_badge_earned',
  SPECIAL_BADGE_EARNED = 'special_badge_earned',
  
  // Level and XP notifications
  LEVEL_UP = 'level_up',
  XP_EARNED = 'xp_earned',
  XP_MILESTONE = 'xp_milestone',
  LEVEL_MILESTONE = 'level_milestone',
  MAX_LEVEL_REACHED = 'max_level_reached',
  
  // Streak notifications
  STREAK_STARTED = 'streak_started',
  STREAK_EXTENDED = 'streak_extended',
  STREAK_MILESTONE = 'streak_milestone',
  STREAK_BROKEN = 'streak_broken',
  STREAK_RECOVERED = 'streak_recovered',
  PERSONAL_BEST_STREAK = 'personal_best_streak',
  
  // Challenge notifications
  CHALLENGE_CREATED = 'challenge_created',
  CHALLENGE_JOINED = 'challenge_joined',
  CHALLENGE_COMPLETED = 'challenge_completed',
  CHALLENGE_FAILED = 'challenge_failed',
  CHALLENGE_REWARD_EARNED = 'challenge_reward_earned',
  DAILY_CHALLENGE_AVAILABLE = 'daily_challenge_available',
  WEEKLY_CHALLENGE_AVAILABLE = 'weekly_challenge_available',
  
  // Leaderboard notifications
  LEADERBOARD_POSITION_GAINED = 'leaderboard_position_gained',
  LEADERBOARD_TOP_ACHIEVED = 'leaderboard_top_achieved',
  LEADERBOARD_RANK_LOST = 'leaderboard_rank_lost',
  WEEKLY_LEADERBOARD_WINNER = 'weekly_leaderboard_winner',
  MONTHLY_LEADERBOARD_WINNER = 'monthly_leaderboard_winner',
  
  // Reward notifications
  REWARD_EARNED = 'reward_earned',
  REWARD_CLAIMED = 'reward_claimed',
  REWARD_EXPIRED = 'reward_expired',
  BONUS_REWARD_AVAILABLE = 'bonus_reward_available',
  SPECIAL_OFFER_AVAILABLE = 'special_offer_available',
  
  // Social gamification
  FRIEND_ACHIEVEMENT = 'friend_achievement',
  FRIEND_LEVEL_UP = 'friend_level_up',
  TEAM_ACHIEVEMENT = 'team_achievement',
  GUILD_INVITATION = 'guild_invitation',
  GUILD_ACHIEVEMENT = 'guild_achievement',
  
  // Activity encouragement
  ACTIVITY_REMINDER = 'activity_reminder',
  COMEBACK_BONUS = 'comeback_bonus',
  PROGRESS_ENCOURAGEMENT = 'progress_encouragement',
  GOAL_REMINDER = 'goal_reminder',
  
  // Special events
  EVENT_STARTED = 'event_started',
  EVENT_ENDING_SOON = 'event_ending_soon',
  EVENT_REWARD_AVAILABLE = 'event_reward_available',
  SEASONAL_BONUS = 'seasonal_bonus'
}

@Injectable()
export class GamificationNotificationService {
  private readonly logger = new Logger(GamificationNotificationService.name);
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
  async sendNotification(notification: GamificationNotificationPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notification`,
          {
            ...notification,
            timestamp: new Date(),
            serviceSource: 'gamification-service'
          },
          {
            headers: {
              'X-Service-Name': 'gamification-service',
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        )
      );

      this.logger.log(`Gamification notification sent: ${notification.type} to user ${notification.recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to send gamification notification: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical for gamification functionality
    }
  }

  /**
   * Notify about achievement unlocked
   */
  async notifyAchievementUnlocked(
    userId: string,
    achievementId: string,
    achievementName: string,
    description: string,
    rarity: 'common' | 'rare' | 'epic' | 'legendary',
    xpReward: number,
    isFirstAchievement: boolean = false
  ): Promise<void> {
    const notificationType = rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' 
      ? GamificationNotificationType.RARE_ACHIEVEMENT_UNLOCKED 
      : GamificationNotificationType.ACHIEVEMENT_UNLOCKED;

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels: ['in_app', 'push'],
      variables: {
        achievementId,
        achievementName,
        description,
        rarity,
        xpReward,
        isFirstAchievement,
        unlockedAt: new Date()
      },
      priority: rarity === 'legendary' ? 'high' : 'normal'
    });
  }

  /**
   * Notify about badge earned
   */
  async notifyBadgeEarned(
    userId: string,
    badgeId: string,
    badgeName: string,
    badgeLevel: number,
    description: string,
    isUpgrade: boolean = false,
    isFirstBadge: boolean = false
  ): Promise<void> {
    let notificationType = GamificationNotificationType.BADGE_EARNED;
    
    if (isFirstBadge) {
      notificationType = GamificationNotificationType.FIRST_BADGE_EARNED;
    } else if (isUpgrade) {
      notificationType = GamificationNotificationType.BADGE_UPGRADED;
    }

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels: ['in_app', 'push'],
      variables: {
        badgeId,
        badgeName,
        badgeLevel,
        description,
        isUpgrade,
        isFirstBadge,
        earnedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about level up
   */
  async notifyLevelUp(
    userId: string,
    newLevel: number,
    previousLevel: number,
    xpTotal: number,
    xpForNext: number,
    rewards: string[],
    isMilestone: boolean = false
  ): Promise<void> {
    const notificationType = isMilestone 
      ? GamificationNotificationType.LEVEL_MILESTONE 
      : GamificationNotificationType.LEVEL_UP;

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels: ['in_app', 'push', 'email'],
      variables: {
        newLevel,
        previousLevel,
        levelGain: newLevel - previousLevel,
        xpTotal,
        xpForNext,
        rewards,
        isMilestone,
        leveledUpAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about XP earned
   */
  async notifyXPEarned(
    userId: string,
    xpEarned: number,
    xpTotal: number,
    source: string,
    sourceId: string,
    multiplier: number = 1
  ): Promise<void> {
    // Only send notification for significant XP gains
    if (xpEarned >= 50 || multiplier > 1) {
      await this.sendNotification({
        type: GamificationNotificationType.XP_EARNED,
        recipientId: userId,
        channels: ['in_app'],
        variables: {
          xpEarned,
          xpTotal,
          source,
          sourceId,
          multiplier,
          hasBonus: multiplier > 1,
          earnedAt: new Date()
        },
        priority: 'normal'
      });
    }
  }

  /**
   * Notify about streak events
   */
  async notifyStreakEvent(
    userId: string,
    streakType: string,
    currentStreak: number,
    eventType: 'started' | 'extended' | 'milestone' | 'broken' | 'recovered' | 'personal_best',
    milestoneValue?: number,
    previousBest?: number
  ): Promise<void> {
    let notificationType: GamificationNotificationType;
    
    switch (eventType) {
      case 'started':
        notificationType = GamificationNotificationType.STREAK_STARTED;
        break;
      case 'extended':
        notificationType = GamificationNotificationType.STREAK_EXTENDED;
        break;
      case 'milestone':
        notificationType = GamificationNotificationType.STREAK_MILESTONE;
        break;
      case 'broken':
        notificationType = GamificationNotificationType.STREAK_BROKEN;
        break;
      case 'recovered':
        notificationType = GamificationNotificationType.STREAK_RECOVERED;
        break;
      case 'personal_best':
        notificationType = GamificationNotificationType.PERSONAL_BEST_STREAK;
        break;
    }

    const channels = eventType === 'broken' ? ['in_app'] : ['in_app', 'push'];
    const priority = eventType === 'personal_best' || eventType === 'milestone' ? 'high' : 'normal';

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels,
      variables: {
        streakType,
        currentStreak,
        eventType,
        milestoneValue: milestoneValue || null,
        previousBest: previousBest || null,
        eventAt: new Date()
      },
      priority
    });
  }

  /**
   * Notify about challenge events
   */
  async notifyChallengeEvent(
    userId: string,
    challengeId: string,
    challengeName: string,
    eventType: 'joined' | 'completed' | 'failed' | 'reward_earned',
    progress?: number,
    totalRequired?: number,
    reward?: string
  ): Promise<void> {
    let notificationType: GamificationNotificationType;
    
    switch (eventType) {
      case 'joined':
        notificationType = GamificationNotificationType.CHALLENGE_JOINED;
        break;
      case 'completed':
        notificationType = GamificationNotificationType.CHALLENGE_COMPLETED;
        break;
      case 'failed':
        notificationType = GamificationNotificationType.CHALLENGE_FAILED;
        break;
      case 'reward_earned':
        notificationType = GamificationNotificationType.CHALLENGE_REWARD_EARNED;
        break;
    }

    const channels = eventType === 'completed' || eventType === 'reward_earned' 
      ? ['in_app', 'push'] 
      : ['in_app'];
    
    const priority = eventType === 'completed' || eventType === 'reward_earned' ? 'high' : 'normal';

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels,
      variables: {
        challengeId,
        challengeName,
        eventType,
        progress: progress || null,
        totalRequired: totalRequired || null,
        reward: reward || null,
        eventAt: new Date()
      },
      priority
    });
  }

  /**
   * Notify about leaderboard position changes
   */
  async notifyLeaderboardChange(
    userId: string,
    leaderboardType: string,
    newPosition: number,
    previousPosition: number,
    totalParticipants: number,
    isTopPosition: boolean = false,
    isWinner: boolean = false
  ): Promise<void> {
    let notificationType: GamificationNotificationType;
    
    if (isWinner) {
      notificationType = leaderboardType.includes('weekly') 
        ? GamificationNotificationType.WEEKLY_LEADERBOARD_WINNER
        : GamificationNotificationType.MONTHLY_LEADERBOARD_WINNER;
    } else if (isTopPosition || newPosition <= 3) {
      notificationType = GamificationNotificationType.LEADERBOARD_TOP_ACHIEVED;
    } else if (newPosition < previousPosition) {
      notificationType = GamificationNotificationType.LEADERBOARD_POSITION_GAINED;
    } else {
      notificationType = GamificationNotificationType.LEADERBOARD_RANK_LOST;
    }

    const priority = isWinner || isTopPosition ? 'high' : 'normal';
    const channels = isWinner ? ['email', 'in_app', 'push'] : ['in_app', 'push'];

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels,
      variables: {
        leaderboardType,
        newPosition,
        previousPosition,
        totalParticipants,
        positionChange: previousPosition - newPosition,
        isTopPosition,
        isWinner,
        updatedAt: new Date()
      },
      priority
    });
  }

  /**
   * Notify about rewards
   */
  async notifyReward(
    userId: string,
    rewardId: string,
    rewardType: string,
    rewardValue: string,
    eventType: 'earned' | 'claimed' | 'expired',
    source: string,
    expiryDate?: Date
  ): Promise<void> {
    let notificationType: GamificationNotificationType;
    
    switch (eventType) {
      case 'earned':
        notificationType = GamificationNotificationType.REWARD_EARNED;
        break;
      case 'claimed':
        notificationType = GamificationNotificationType.REWARD_CLAIMED;
        break;
      case 'expired':
        notificationType = GamificationNotificationType.REWARD_EXPIRED;
        break;
    }

    const channels = eventType === 'expired' ? ['in_app'] : ['in_app', 'push'];
    const priority = eventType === 'earned' ? 'high' : 'normal';

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels,
      variables: {
        rewardId,
        rewardType,
        rewardValue,
        eventType,
        source,
        expiryDate: expiryDate || null,
        eventAt: new Date()
      },
      priority
    });
  }

  /**
   * Notify about friend gamification events
   */
  async notifyFriendEvent(
    userId: string,
    friendId: string,
    friendName: string,
    eventType: 'achievement' | 'level_up',
    eventDetails: Record<string, any>
  ): Promise<void> {
    const notificationType = eventType === 'achievement' 
      ? GamificationNotificationType.FRIEND_ACHIEVEMENT 
      : GamificationNotificationType.FRIEND_LEVEL_UP;

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels: ['in_app'],
      variables: {
        friendId,
        friendName,
        eventType,
        ...eventDetails,
        eventAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Send daily challenge notification
   */
  async notifyDailyChallengeAvailable(
    userId: string,
    challengeId: string,
    challengeName: string,
    description: string,
    reward: string,
    expiryTime: Date
  ): Promise<void> {
    await this.sendNotification({
      type: GamificationNotificationType.DAILY_CHALLENGE_AVAILABLE,
      recipientId: userId,
      channels: ['in_app', 'push'],
      variables: {
        challengeId,
        challengeName,
        description,
        reward,
        expiryTime,
        availableAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Send activity reminder notification
   */
  async notifyActivityReminder(
    userId: string,
    activityType: string,
    daysInactive: number,
    missedRewards: string[],
    comebackBonus?: string
  ): Promise<void> {
    await this.sendNotification({
      type: GamificationNotificationType.ACTIVITY_REMINDER,
      recipientId: userId,
      channels: ['push', 'email'],
      variables: {
        activityType,
        daysInactive,
        missedRewards,
        comebackBonus: comebackBonus || null,
        reminderSentAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify about comeback bonus
   */
  async notifyComebackBonus(
    userId: string,
    bonusType: string,
    bonusValue: string,
    daysAway: number,
    validUntil: Date
  ): Promise<void> {
    await this.sendNotification({
      type: GamificationNotificationType.COMEBACK_BONUS,
      recipientId: userId,
      channels: ['in_app', 'push'],
      variables: {
        bonusType,
        bonusValue,
        daysAway,
        validUntil,
        awardedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about special events
   */
  async notifySpecialEvent(
    userId: string,
    eventId: string,
    eventName: string,
    eventType: 'started' | 'ending_soon' | 'reward_available',
    description: string,
    endDate?: Date,
    rewardDetails?: Record<string, any>
  ): Promise<void> {
    let notificationType: GamificationNotificationType;
    
    switch (eventType) {
      case 'started':
        notificationType = GamificationNotificationType.EVENT_STARTED;
        break;
      case 'ending_soon':
        notificationType = GamificationNotificationType.EVENT_ENDING_SOON;
        break;
      case 'reward_available':
        notificationType = GamificationNotificationType.EVENT_REWARD_AVAILABLE;
        break;
    }

    const priority = eventType === 'ending_soon' || eventType === 'reward_available' ? 'high' : 'normal';

    await this.sendNotification({
      type: notificationType,
      recipientId: userId,
      channels: ['in_app', 'push'],
      variables: {
        eventId,
        eventName,
        eventType,
        description,
        endDate: endDate || null,
        rewardDetails: rewardDetails || {},
        eventAt: new Date()
      },
      priority
    });
  }

  /**
   * Send progress encouragement
   */
  async notifyProgressEncouragement(
    userId: string,
    goalType: string,
    currentProgress: number,
    targetProgress: number,
    encouragementMessage: string,
    suggestedActions: string[]
  ): Promise<void> {
    await this.sendNotification({
      type: GamificationNotificationType.PROGRESS_ENCOURAGEMENT,
      recipientId: userId,
      channels: ['in_app'],
      variables: {
        goalType,
        currentProgress,
        targetProgress,
        progressPercentage: Math.round((currentProgress / targetProgress) * 100),
        encouragementMessage,
        suggestedActions,
        sentAt: new Date()
      },
      priority: 'normal'
    });
  }
} 
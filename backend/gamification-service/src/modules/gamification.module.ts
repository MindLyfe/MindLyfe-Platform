import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Entities
import { UserStreak } from '../entities/user-streak.entity';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { Achievement } from '../entities/achievement.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { Reward } from '../entities/reward.entity';
import { UserReward } from '../entities/user-reward.entity';
import { ActivityEvent } from '../entities/activity-event.entity';
import { LeaderboardEntry } from '../entities/leaderboard-entry.entity';

// Services
import { GamificationNotificationService } from '../common/services/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserStreak,
      Badge,
      UserBadge,
      Achievement,
      UserAchievement,
      Reward,
      UserReward,
      ActivityEvent,
      LeaderboardEntry,
    ]),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    GamificationNotificationService,
  ],
  exports: [
    GamificationNotificationService,
  ],
})
export class GamificationModule {} 
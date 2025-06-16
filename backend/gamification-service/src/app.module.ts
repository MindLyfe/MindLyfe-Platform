import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

// Configuration
import configuration from './config/configuration';

// Modules
import { GamificationModule } from './modules/gamification.module';
import { HealthModule } from './modules/health.module';

// Entities
import { UserStreak } from './entities/user-streak.entity';
import { StreakDefinition } from './entities/streak-definition.entity';
import { StreakMilestone } from './entities/streak-milestone.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { BadgeRequirement } from './entities/badge-requirement.entity';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { AchievementStep } from './entities/achievement-step.entity';
import { Reward } from './entities/reward.entity';
import { UserReward } from './entities/user-reward.entity';
import { ActivityEvent } from './entities/activity-event.entity';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // HTTP client
    HttpModule,

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [
          UserStreak,
          StreakDefinition,
          StreakMilestone,
          Badge,
          UserBadge,
          BadgeRequirement,
          Achievement,
          UserAchievement,
          AchievementStep,
          Reward,
          UserReward,
          ActivityEvent,
          LeaderboardEntry,
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging', false),
        ssl: configService.get('database.ssl', false),
      }),
      inject: [ConfigService],
    }),

    // Event system
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Health checks
    TerminusModule,

    // Feature modules
    GamificationModule,
    HealthModule,
  ],
})
export class AppModule {} 
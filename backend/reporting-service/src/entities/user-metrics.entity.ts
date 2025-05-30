import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from '../enums';

@Entity('user_metrics')
@Index(['userId', 'date'])
@Index(['organizationId', 'date'])
@Index(['cohort', 'date'])
@Unique(['userId', 'date'])
export class UserMetrics extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  organizationId?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  userRole: UserRole;

  // User status and registration info
  @Column({ type: 'date' })
  registrationDate: Date;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  cohort: string; // e.g., "2024-01", "Q1-2024"

  @Column({ type: 'integer', default: 0 })
  daysSinceRegistration: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastActiveAt?: Date;

  // Session metrics
  @Column({ type: 'integer', default: 0 })
  sessionsCount: number;

  @Column({ type: 'float', default: 0 })
  totalSessionDuration: number; // in seconds

  @Column({ type: 'float', default: 0 })
  averageSessionDuration: number; // in seconds

  @Column({ type: 'timestamp with time zone', nullable: true })
  firstSessionAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastSessionAt?: Date;

  // Engagement metrics
  @Column({ type: 'integer', default: 0 })
  totalEvents: number;

  @Column({ type: 'integer', default: 0 })
  uniqueFeatures: number;

  @Column({ type: 'float', default: 0 })
  engagementScore: number; // 0-100 calculated score

  @Column({ type: 'text', array: true, default: [] })
  featuresUsed: string[];

  @Column({ type: 'jsonb', default: {} })
  featureUsageCount: Record<string, number>;

  // Retention metrics
  @Column({ type: 'boolean', default: false })
  day1Retention: boolean;

  @Column({ type: 'boolean', default: false })
  day7Retention: boolean;

  @Column({ type: 'boolean', default: false })
  day30Retention: boolean;

  @Column({ type: 'integer', default: 0 })
  consecutiveDaysActive: number;

  @Column({ type: 'integer', default: 0 })
  totalDaysActive: number;

  // Content and communication metrics
  @Column({ type: 'integer', default: 0 })
  messagesReceived: number;

  @Column({ type: 'integer', default: 0 })
  messagesSent: number;

  @Column({ type: 'integer', default: 0 })
  notificationsReceived: number;

  @Column({ type: 'integer', default: 0 })
  notificationsOpened: number;

  @Column({ type: 'integer', default: 0 })
  notificationsClicked: number;

  @Column({ type: 'float', default: 0 })
  notificationEngagementRate: number;

  // Therapy and wellness metrics
  @Column({ type: 'integer', default: 0 })
  therapySessionsScheduled: number;

  @Column({ type: 'integer', default: 0 })
  therapySessionsCompleted: number;

  @Column({ type: 'integer', default: 0 })
  therapySessionsCancelled: number;

  @Column({ type: 'float', default: 0 })
  therapyCompletionRate: number;

  @Column({ type: 'float', default: 0 })
  averageTherapyRating: number;

  @Column({ type: 'integer', default: 0 })
  journalEntriesCreated: number;

  @Column({ type: 'integer', default: 0 })
  meditationSessionsCompleted: number;

  @Column({ type: 'integer', default: 0 })
  moodCheckins: number;

  // Community engagement metrics
  @Column({ type: 'integer', default: 0 })
  postsCreated: number;

  @Column({ type: 'integer', default: 0 })
  commentsCreated: number;

  @Column({ type: 'integer', default: 0 })
  reactionsGiven: number;

  @Column({ type: 'integer', default: 0 })
  reactionsReceived: number;

  @Column({ type: 'integer', default: 0 })
  followersGained: number;

  @Column({ type: 'integer', default: 0 })
  followingCount: number;

  @Column({ type: 'float', default: 0 })
  communityEngagementScore: number;

  // Gamification metrics
  @Column({ type: 'integer', default: 0 })
  badgesEarned: number;

  @Column({ type: 'integer', default: 0 })
  achievementsUnlocked: number;

  @Column({ type: 'integer', default: 0 })
  pointsEarned: number;

  @Column({ type: 'integer', default: 0 })
  currentLevel: number;

  @Column({ type: 'integer', default: 0 })
  streaksStarted: number;

  @Column({ type: 'integer', default: 0 })
  streaksCompleted: number;

  @Column({ type: 'integer', default: 0 })
  longestStreak: number;

  @Column({ type: 'integer', default: 0 })
  currentStreak: number;

  // Financial metrics
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'integer', default: 0 })
  totalTransactions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageOrderValue: number;

  @Column({ type: 'boolean', default: false })
  hasActiveSubscription: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subscriptionTier?: string;

  @Column({ type: 'date', nullable: true })
  subscriptionStartDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyRecurringRevenue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lifetimeValue: number;

  // Support and help metrics
  @Column({ type: 'integer', default: 0 })
  supportTicketsCreated: number;

  @Column({ type: 'integer', default: 0 })
  supportTicketsResolved: number;

  @Column({ type: 'float', default: 0 })
  averageSupportResponseTime: number; // in hours

  @Column({ type: 'float', default: 0 })
  supportSatisfactionRating: number;

  // Risk and health metrics
  @Column({ type: 'float', default: 0 })
  churnRisk: number; // 0-1 probability

  @Column({ type: 'varchar', length: 50, default: 'active' })
  @Index()
  healthStatus: string; // active, at_risk, churned, etc.

  @Column({ type: 'float', default: 0 })
  wellnessScore: number; // calculated wellness indicator

  @Column({ type: 'integer', default: 0 })
  crisisInterventions: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastCrisisAt?: Date;

  // Device and platform metrics
  @Column({ type: 'varchar', length: 100, nullable: true })
  primaryDevice?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primaryPlatform?: string;

  @Column({ type: 'text', array: true, default: [] })
  devicesUsed: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  preferredLanguage?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  timezone?: string;

  // Geographic metrics
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  // Custom metrics and scores
  @Column({ type: 'jsonb', default: {} })
  customMetrics: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  scores: Record<string, number>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'text', array: true, default: [] })
  segments: string[];

  // Calculation metadata
  @Column({ type: 'timestamp with time zone' })
  calculatedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  calculationJobId?: string;

  @Column({ type: 'integer', default: 0 })
  dataPointsProcessed: number;
} 
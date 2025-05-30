import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('daily_summaries')
@Index(['service', 'date'])
@Index(['organizationId', 'date'])
@Unique(['service', 'date', 'organizationId'])
export class DailySummary extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  @Index()
  service: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  organizationId?: string;

  // User metrics
  @Column({ type: 'integer', default: 0 })
  totalUsers: number;

  @Column({ type: 'integer', default: 0 })
  activeUsers: number;

  @Column({ type: 'integer', default: 0 })
  newUsers: number;

  @Column({ type: 'integer', default: 0 })
  returningUsers: number;

  @Column({ type: 'float', default: 0 })
  retentionRate: number;

  // Session metrics
  @Column({ type: 'integer', default: 0 })
  totalSessions: number;

  @Column({ type: 'float', default: 0 })
  averageSessionDuration: number; // in seconds

  @Column({ type: 'float', default: 0 })
  bounceRate: number;

  @Column({ type: 'float', default: 0 })
  averagePageViews: number;

  // Engagement metrics
  @Column({ type: 'integer', default: 0 })
  totalEvents: number;

  @Column({ type: 'integer', default: 0 })
  uniqueEventUsers: number;

  @Column({ type: 'float', default: 0 })
  eventsPerUser: number;

  @Column({ type: 'float', default: 0 })
  engagementRate: number;

  // Feature-specific metrics (flexible JSONB)
  @Column({ type: 'jsonb', default: {} })
  featureMetrics: Record<string, any>;

  // Revenue metrics
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'integer', default: 0 })
  totalTransactions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageOrderValue: number;

  @Column({ type: 'float', default: 0 })
  conversionRate: number;

  // Subscription metrics
  @Column({ type: 'integer', default: 0 })
  newSubscriptions: number;

  @Column({ type: 'integer', default: 0 })
  cancelledSubscriptions: number;

  @Column({ type: 'integer', default: 0 })
  totalActiveSubscriptions: number;

  @Column({ type: 'float', default: 0 })
  subscriptionChurnRate: number;

  // Notification metrics
  @Column({ type: 'integer', default: 0 })
  notificationsSent: number;

  @Column({ type: 'integer', default: 0 })
  notificationsDelivered: number;

  @Column({ type: 'integer', default: 0 })
  notificationsOpened: number;

  @Column({ type: 'integer', default: 0 })
  notificationsClicked: number;

  @Column({ type: 'float', default: 0 })
  notificationDeliveryRate: number;

  @Column({ type: 'float', default: 0 })
  notificationOpenRate: number;

  @Column({ type: 'float', default: 0 })
  notificationClickRate: number;

  // Therapy session metrics
  @Column({ type: 'integer', default: 0 })
  scheduledSessions: number;

  @Column({ type: 'integer', default: 0 })
  completedSessions: number;

  @Column({ type: 'integer', default: 0 })
  cancelledSessions: number;

  @Column({ type: 'integer', default: 0 })
  noShowSessions: number;

  @Column({ type: 'float', default: 0 })
  sessionCompletionRate: number;

  @Column({ type: 'float', default: 0 })
  averageSessionRating: number;

  // Chat metrics
  @Column({ type: 'integer', default: 0 })
  totalMessages: number;

  @Column({ type: 'integer', default: 0 })
  activeConversations: number;

  @Column({ type: 'float', default: 0 })
  averageResponseTime: number; // in seconds

  @Column({ type: 'float', default: 0 })
  messagesPerConversation: number;

  // Community metrics
  @Column({ type: 'integer', default: 0 })
  totalPosts: number;

  @Column({ type: 'integer', default: 0 })
  totalComments: number;

  @Column({ type: 'integer', default: 0 })
  totalReactions: number;

  @Column({ type: 'integer', default: 0 })
  activePosters: number;

  @Column({ type: 'float', default: 0 })
  engagementPerPost: number;

  // Gamification metrics
  @Column({ type: 'integer', default: 0 })
  badgesEarned: number;

  @Column({ type: 'integer', default: 0 })
  achievementsUnlocked: number;

  @Column({ type: 'integer', default: 0 })
  streaksStarted: number;

  @Column({ type: 'integer', default: 0 })
  streaksCompleted: number;

  @Column({ type: 'integer', default: 0 })
  pointsEarned: number;

  @Column({ type: 'float', default: 0 })
  averageStreakLength: number;

  // Error and performance metrics
  @Column({ type: 'integer', default: 0 })
  totalErrors: number;

  @Column({ type: 'float', default: 0 })
  errorRate: number;

  @Column({ type: 'float', default: 0 })
  averageResponseTime: number; // in milliseconds

  @Column({ type: 'float', default: 0 })
  uptime: number; // percentage

  // Custom metrics (service-specific)
  @Column({ type: 'jsonb', default: {} })
  customMetrics: Record<string, any>;

  // Aggregation metadata
  @Column({ type: 'timestamp with time zone' })
  aggregatedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  aggregationJobId?: string;

  @Column({ type: 'integer', default: 0 })
  totalRecordsProcessed: number;

  @Column({ type: 'jsonb', nullable: true })
  aggregationConfig?: Record<string, any>;
} 
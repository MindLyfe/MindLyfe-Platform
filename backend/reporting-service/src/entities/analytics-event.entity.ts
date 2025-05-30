import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AnalyticsEventType, DataPrivacyLevel } from '../enums';

@Entity('analytics_events')
@Index(['service', 'eventType', 'timestamp'])
@Index(['userId', 'timestamp'])
@Index(['sessionId', 'timestamp'])
export class AnalyticsEvent extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  @Index()
  service: string;

  @Column({
    type: 'enum',
    enum: AnalyticsEventType,
    default: AnalyticsEventType.USER_ACTION,
  })
  @Index()
  eventType: AnalyticsEventType;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  eventName: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  sessionId?: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ type: 'timestamp with time zone' })
  @Index()
  timestamp: Date;

  @Column({ type: 'jsonb' })
  properties: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  platform?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  medium?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  campaign?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  pageUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  timezone?: string;

  @Column({
    type: 'enum',
    enum: DataPrivacyLevel,
    default: DataPrivacyLevel.INTERNAL,
  })
  privacyLevel: DataPrivacyLevel;

  @Column({ type: 'boolean', default: false })
  @Index()
  isAnonymized: boolean;

  @Column({ type: 'boolean', default: false })
  @Index()
  isProcessed: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  batchId?: string;

  @Column({ type: 'float', nullable: true })
  value?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency?: string;

  @Column({ type: 'integer', nullable: true })
  duration?: number; // in milliseconds

  @Column({ type: 'jsonb', nullable: true })
  context?: Record<string, any>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  experimentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variantId?: string;
} 
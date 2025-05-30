import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ReportType, ReportStatus, ExportFormat, UserRole } from '../enums';

@Entity('reports')
@Index(['type', 'status'])
@Index(['createdBy', 'createdAt'])
@Index(['organizationId', 'createdAt'])
export class Report extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    default: ReportType.USAGE,
  })
  @Index()
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  @Index()
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ExportFormat,
    default: ExportFormat.PDF,
  })
  format: ExportFormat;

  @Column({ type: 'uuid' })
  @Index()
  createdBy: string; // User ID who requested the report

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  createdByRole: UserRole;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  organizationId?: string;

  // Report generation parameters
  @Column({ type: 'jsonb' })
  parameters: {
    dateRange: {
      startDate: string;
      endDate: string;
    };
    filters: Record<string, any>;
    metrics: string[];
    groupBy?: string[];
    aggregation?: string;
    services?: string[];
    userSegments?: string[];
    includeCharts?: boolean;
    chartTypes?: string[];
    customTemplate?: string;
  };

  // Report content and files
  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath?: string; // S3 path or local file path

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number; // in bytes

  @Column({ type: 'varchar', length: 255, nullable: true })
  downloadUrl?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  downloadUrlExpiresAt?: Date;

  // Generation metadata
  @Column({ type: 'timestamp with time zone', nullable: true })
  generationStartedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  generationCompletedAt?: Date;

  @Column({ type: 'integer', nullable: true })
  generationDurationMs?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  generationJobId?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', nullable: true })
  errorDetails?: Record<string, any>;

  // Report metrics and statistics
  @Column({ type: 'integer', default: 0 })
  totalRecords: number;

  @Column({ type: 'integer', default: 0 })
  totalPages: number;

  @Column({ type: 'integer', default: 0 })
  totalCharts: number;

  @Column({ type: 'jsonb', nullable: true })
  summary?: {
    keyMetrics: Record<string, number>;
    insights: string[];
    recommendations: string[];
  };

  // Access and sharing
  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'text', array: true, default: [] })
  sharedWith: string[]; // User IDs

  @Column({ type: 'varchar', length: 255, nullable: true })
  shareToken?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  shareTokenExpiresAt?: Date;

  // Download tracking
  @Column({ type: 'integer', default: 0 })
  downloadCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastDownloadedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  lastDownloadedBy?: string;

  // Scheduling information
  @Column({ type: 'boolean', default: false })
  isScheduled: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  scheduleFrequency?: string; // daily, weekly, monthly, quarterly

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextScheduledAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  parentReportId?: string; // For scheduled reports, reference to original

  // Data sources and processing
  @Column({ type: 'text', array: true, default: [] })
  dataSources: string[];

  @Column({ type: 'jsonb', nullable: true })
  dataQuality?: {
    completeness: number; // 0-1
    accuracy: number; // 0-1
    timeliness: number; // 0-1
    consistency: number; // 0-1
    issues: string[];
  };

  // Performance tracking
  @Column({ type: 'integer', nullable: true })
  queryExecutionTimeMs?: number;

  @Column({ type: 'integer', nullable: true })
  renderingTimeMs?: number;

  @Column({ type: 'integer', nullable: true })
  totalProcessingTimeMs?: number;

  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics?: Record<string, any>;

  // Compliance and audit
  @Column({ type: 'boolean', default: false })
  containsPII: boolean;

  @Column({ type: 'boolean', default: false })
  isAnonymized: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complianceLevel?: string; // public, internal, confidential, restricted

  @Column({ type: 'text', array: true, default: [] })
  complianceTags: string[];

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: {
    events: Array<{
      timestamp: string;
      action: string;
      userId: string;
      details?: Record<string, any>;
    }>;
  };

  // Expiry and retention
  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'boolean', default: false })
  autoDelete: boolean;

  @Column({ type: 'integer', nullable: true })
  retentionDays?: number;

  // Tags and categorization
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  project?: string;

  // Version control
  @Column({ type: 'varchar', length: 20, default: '1.0' })
  version: string;

  @Column({ type: 'uuid', nullable: true })
  baseReportId?: string; // For report templates or versions

  @Column({ type: 'jsonb', nullable: true })
  versionHistory?: Array<{
    version: string;
    timestamp: string;
    userId: string;
    changes: string[];
  }>;
} 
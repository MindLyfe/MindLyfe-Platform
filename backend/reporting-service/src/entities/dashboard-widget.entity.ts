import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WidgetType, MetricType, TimePeriod, ColorScheme, UserRole } from '../enums';

@Entity('dashboard_widgets')
@Index(['dashboardId', 'position'])
@Index(['createdBy', 'isActive'])
@Index(['organizationId', 'isActive'])
export class DashboardWidget extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  dashboardId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: WidgetType,
    default: WidgetType.METRIC_CARD,
  })
  @Index()
  type: WidgetType;

  @Column({
    type: 'enum',
    enum: MetricType,
    default: MetricType.COUNTER,
  })
  metricType: MetricType;

  @Column({ type: 'uuid' })
  @Index()
  createdBy: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  createdByRole: UserRole;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  organizationId?: string;

  // Widget positioning and layout
  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ type: 'integer', default: 4 })
  gridWidth: number; // 1-12 grid system

  @Column({ type: 'integer', default: 4 })
  gridHeight: number;

  @Column({ type: 'integer', default: 0 })
  gridX: number;

  @Column({ type: 'integer', default: 0 })
  gridY: number;

  // Data source and query configuration
  @Column({ type: 'varchar', length: 100 })
  @Index()
  dataSource: string; // analytics_events, daily_summaries, user_metrics, etc.

  @Column({ type: 'varchar', length: 100 })
  metric: string; // The specific metric to display

  @Column({ type: 'jsonb' })
  query: {
    filters: Record<string, any>;
    groupBy?: string[];
    aggregation: string; // sum, count, avg, min, max, etc.
    timeColumn?: string;
    valueColumn?: string;
    dimensions?: string[];
  };

  @Column({
    type: 'enum',
    enum: TimePeriod,
    default: TimePeriod.DAILY,
  })
  timePeriod: TimePeriod;

  @Column({ type: 'jsonb', nullable: true })
  dateRange?: {
    type: 'relative' | 'absolute';
    value: string | { start: string; end: string };
  };

  // Display configuration
  @Column({
    type: 'enum',
    enum: ColorScheme,
    default: ColorScheme.MINDLYFE_BRAND,
  })
  colorScheme: ColorScheme;

  @Column({ type: 'jsonb', nullable: true })
  displayOptions?: {
    showTitle?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    showDataLabels?: boolean;
    showGrid?: boolean;
    showAxis?: boolean;
    animateOnLoad?: boolean;
    refreshInterval?: number; // seconds
    precision?: number; // decimal places
    unit?: string; // %, $, etc.
    format?: string; // number, currency, percentage
    threshold?: {
      warning: number;
      critical: number;
      colors: {
        normal: string;
        warning: string;
        critical: string;
      };
    };
  };

  // Chart-specific configuration
  @Column({ type: 'jsonb', nullable: true })
  chartConfig?: {
    xAxis?: {
      label?: string;
      type?: 'category' | 'time' | 'number';
      format?: string;
      rotation?: number;
    };
    yAxis?: {
      label?: string;
      type?: 'linear' | 'logarithmic';
      format?: string;
      min?: number;
      max?: number;
    };
    series?: Array<{
      name: string;
      color?: string;
      type?: 'line' | 'bar' | 'area';
      yAxisIndex?: number;
    }>;
    legend?: {
      position: 'top' | 'bottom' | 'left' | 'right';
      orientation: 'horizontal' | 'vertical';
    };
  };

  // Data and refresh settings
  @Column({ type: 'integer', default: 300 })
  refreshIntervalSeconds: number; // Auto-refresh interval

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastRefreshedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  cachedData?: {
    data: any;
    timestamp: string;
    expiresAt: string;
  };

  @Column({ type: 'boolean', default: true })
  autoRefresh: boolean;

  @Column({ type: 'boolean', default: false })
  realTimeUpdates: boolean;

  // Widget state and behavior
  @Column({ type: 'boolean', default: true })
  @Index()
  isVisible: boolean;

  @Column({ type: 'boolean', default: false })
  isMinimized: boolean;

  @Column({ type: 'boolean', default: true })
  isResizable: boolean;

  @Column({ type: 'boolean', default: true })
  isDraggable: boolean;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'text', array: true, default: [] })
  sharedWith: string[]; // User IDs

  // Permission and access control
  @Column({ type: 'jsonb', nullable: true })
  permissions?: {
    view: string[]; // User IDs or roles
    edit: string[];
    delete: string[];
    share: string[];
  };

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  // Performance and optimization
  @Column({ type: 'integer', nullable: true })
  lastQueryTimeMs?: number;

  @Column({ type: 'integer', nullable: true })
  lastRenderTimeMs?: number;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastViewedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  lastViewedBy?: string;

  // Error handling
  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastErrorAt?: Date;

  @Column({ type: 'integer', default: 0 })
  errorCount: number;

  @Column({ type: 'boolean', default: false })
  hasDataIssues: boolean;

  // Widget template and configuration
  @Column({ type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  templateVersion?: string;

  @Column({ type: 'jsonb', nullable: true })
  customConfig?: Record<string, any>;

  // Alerts and notifications
  @Column({ type: 'jsonb', nullable: true })
  alerts?: {
    enabled: boolean;
    conditions: Array<{
      metric: string;
      operator: '>' | '<' | '=' | '>=' | '<=';
      value: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
    }>;
    recipients: string[]; // User IDs
    channels: string[]; // email, slack, etc.
  };

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastAlertAt?: Date;

  @Column({ type: 'integer', default: 0 })
  alertCount: number;

  // Data quality and validation
  @Column({ type: 'jsonb', nullable: true })
  dataValidation?: {
    rules: Array<{
      field: string;
      type: 'required' | 'range' | 'format' | 'custom';
      value: any;
      message: string;
    }>;
    lastValidatedAt: string;
    isValid: boolean;
    issues: string[];
  };

  // Export and sharing
  @Column({ type: 'boolean', default: true })
  allowExport: boolean;

  @Column({ type: 'text', array: true, default: ['png', 'svg', 'csv'] })
  exportFormats: string[];

  @Column({ type: 'integer', default: 0 })
  exportCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastExportedAt?: Date;

  // Widget tags and categorization
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  project?: string;

  // Version and history
  @Column({ type: 'varchar', length: 20, default: '1.0' })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  versionHistory?: Array<{
    version: string;
    timestamp: string;
    userId: string;
    changes: string[];
  }>;
} 
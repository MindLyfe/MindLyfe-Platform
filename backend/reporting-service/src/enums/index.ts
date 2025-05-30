// Metric type enums
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
  PERCENTAGE = 'percentage',
  RATE = 'rate',
  DURATION = 'duration',
}

// Report type enums
export enum ReportType {
  USAGE = 'usage',
  ENGAGEMENT = 'engagement',
  CLINICAL = 'clinical',
  FINANCIAL = 'financial',
  COMPLIANCE = 'compliance',
  OPERATIONAL = 'operational',
  CUSTOM = 'custom',
}

// Time period enums
export enum TimePeriod {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// Export format enums
export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  PNG = 'png',
  SVG = 'svg',
}

// Aggregation function enums
export enum AggregationFunction {
  SUM = 'sum',
  COUNT = 'count',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE = 'percentile',
  DISTINCT_COUNT = 'distinct_count',
}

// Dashboard widget type enums
export enum WidgetType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  AREA_CHART = 'area_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  TABLE = 'table',
  METRIC_CARD = 'metric_card',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
  TREEMAP = 'treemap',
  PROGRESS_BAR = 'progress_bar',
}

// Chart color schemes
export enum ColorScheme {
  DEFAULT = 'default',
  MINDLYFE_BRAND = 'mindlyfe_brand',
  HEALTH_FOCUSED = 'health_focused',
  ACCESSIBLE = 'accessible',
  MONOCHROME = 'monochrome',
  RAINBOW = 'rainbow',
  CLINICAL = 'clinical',
}

// Report status enums
export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
}

// Event type enums for analytics
export enum AnalyticsEventType {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  BUSINESS_EVENT = 'business_event',
  CLINICAL_EVENT = 'clinical_event',
  NOTIFICATION_EVENT = 'notification_event',
  PAYMENT_EVENT = 'payment_event',
  GAMIFICATION_EVENT = 'gamification_event',
}

// User role enums (matching auth service)
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  THERAPIST = 'therapist',
  ORGANIZATION_ADMIN = 'organization_admin',
  SUPPORT = 'support',
  ANALYST = 'analyst',
  MODERATOR = 'moderator',
}

// Notification channel enums
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
}

// Notification status enums
export enum NotificationStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  UNSUBSCRIBED = 'unsubscribed',
}

// Gamification element types
export enum GamificationElementType {
  BADGE = 'badge',
  ACHIEVEMENT = 'achievement',
  STREAK = 'streak',
  LEVEL = 'level',
  POINT = 'point',
  REWARD = 'reward',
  LEADERBOARD = 'leaderboard',
  CHALLENGE = 'challenge',
}

// Payment gateway enums
export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
}

// Payment status enums
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

// Subscription status enums
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  TRIALING = 'trialing',
  PAUSED = 'paused',
  EXPIRED = 'expired',
}

// Therapy session status enums
export enum TherapySessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

// Chat message types
export enum ChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  EMOJI = 'emoji',
  SYSTEM = 'system',
}

// Community content types
export enum CommunityContentType {
  POST = 'post',
  COMMENT = 'comment',
  REACTION = 'reaction',
  SHARE = 'share',
  MENTION = 'mention',
  FOLLOW = 'follow',
}

// Data privacy levels
export enum DataPrivacyLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  ANONYMIZED = 'anonymized',
}

// Alert severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

// Data source types
export enum DataSourceType {
  OPERATIONAL_DB = 'operational_db',
  ANALYTICS_DB = 'analytics_db',
  DATA_LAKE = 'data_lake',
  EXTERNAL_API = 'external_api',
  REAL_TIME_STREAM = 'real_time_stream',
  CACHED_DATA = 'cached_data',
} 
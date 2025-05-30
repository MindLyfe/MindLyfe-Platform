import { z } from 'zod';

// Configuration for the Data Lake Logger
export interface DataLakeConfig {
  bucketName: string;
  region: string;
  kmsKeyId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  enableLocalBuffer?: boolean;
  bufferSize?: number;
  flushInterval?: number;
  enableCompression?: boolean;
  enableEncryption?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Logging options for individual log calls
export interface LoggingOptions {
  validateSchema?: boolean;
  enablePIIDetection?: boolean;
  customFields?: Record<string, any>;
}

// Base log entry schema
const BaseLogEntrySchema = z.object({
  service: z.string(),
  timestamp: z.string(),
  interaction_type: z.string(),
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Service-specific schemas
const AuthServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('auth-service'),
  action: z.enum(['login', 'logout', 'register', 'password_reset', 'token_refresh']),
  success: z.boolean(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  error_code: z.string().optional(),
  error_message: z.string().optional(),
});

const LyfBotServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('lyfbot-service'),
  prompt: z.string(),
  response: z.string(),
  model: z.string(),
  tokens_used: z.number().optional(),
  response_time_ms: z.number().optional(),
  sentiment_score: z.number().optional(),
  intent: z.string().optional(),
});

const JournalServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('journal-service'),
  entry_id: z.string(),
  entry_content: z.string(),
  mood_score: z.number().optional(),
  tags: z.array(z.string()).optional(),
  word_count: z.number().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
});

const AIServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('ai-service'),
  model: z.string(),
  prompt: z.string().optional(),
  response: z.string().optional(),
  tokens_used: z.number().optional(),
  response_time_ms: z.number().optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
});

const PaymentServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('payment-service'),
  transaction_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  payment_method: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  stripe_payment_intent_id: z.string().optional(),
});

const NotificationServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('notification-service'),
  notification_id: z.string(),
  type: z.enum(['email', 'push', 'sms', 'in_app']),
  recipient: z.string(),
  subject: z.string().optional(),
  content: z.string(),
  status: z.enum(['sent', 'delivered', 'failed', 'opened']),
});

const GamificationServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('gamification-service'),
  achievement_id: z.string().optional(),
  points_earned: z.number().optional(),
  level: z.number().optional(),
  badge_earned: z.string().optional(),
  streak_count: z.number().optional(),
});

const ChatServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('chat-service'),
  chat_id: z.string(),
  message_id: z.string(),
  message_type: z.enum(['text', 'image', 'file', 'system']),
  message_content: z.string(),
  sender_id: z.string(),
  recipient_id: z.string().optional(),
});

const CommunityServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('community-service'),
  post_id: z.string().optional(),
  comment_id: z.string().optional(),
  content_type: z.enum(['post', 'comment', 'like', 'share']),
  content: z.string().optional(),
  visibility: z.enum(['public', 'private', 'friends']).optional(),
});

const TeletherapyServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('teletherapy-service'),
  session_id: z.string(),
  therapist_id: z.string(),
  session_duration_minutes: z.number().optional(),
  session_type: z.enum(['video', 'audio', 'chat']),
  session_status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
});

const RecommendationServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('recommendation-service'),
  recommendation_type: z.enum(['content', 'therapist', 'activity', 'resource']),
  recommendation_id: z.string(),
  algorithm_version: z.string().optional(),
  confidence_score: z.number().optional(),
  user_feedback: z.enum(['positive', 'negative', 'neutral']).optional(),
});

const ResourceServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('resource-service'),
  resource_id: z.string(),
  resource_type: z.enum(['article', 'video', 'audio', 'exercise', 'assessment']),
  action: z.enum(['view', 'download', 'complete', 'bookmark']),
  progress_percentage: z.number().optional(),
});

const ReportingServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('reporting-service'),
  report_type: z.enum(['usage', 'engagement', 'clinical', 'financial']),
  report_id: z.string(),
  generated_for: z.string().optional(),
  data_range_start: z.string().optional(),
  data_range_end: z.string().optional(),
});

const AnalyticsServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('analytics-service'),
  event_name: z.string(),
  event_properties: z.record(z.any()).optional(),
  page_url: z.string().optional(),
  referrer: z.string().optional(),
  device_type: z.enum(['mobile', 'tablet', 'desktop']).optional(),
});

const ComplianceServiceSchema = BaseLogEntrySchema.extend({
  service: z.literal('compliance-service'),
  audit_event: z.string(),
  data_subject: z.string().optional(),
  legal_basis: z.string().optional(),
  retention_period: z.string().optional(),
  compliance_framework: z.enum(['GDPR', 'HIPAA', 'PDPO']).optional(),
});

// Union of all log entry schemas
export const LogEntrySchema = z.discriminatedUnion('service', [
  AuthServiceSchema,
  LyfBotServiceSchema,
  JournalServiceSchema,
  AIServiceSchema,
  PaymentServiceSchema,
  NotificationServiceSchema,
  GamificationServiceSchema,
  ChatServiceSchema,
  CommunityServiceSchema,
  TeletherapyServiceSchema,
  RecommendationServiceSchema,
  ResourceServiceSchema,
  ReportingServiceSchema,
  AnalyticsServiceSchema,
  ComplianceServiceSchema,
]);

// TypeScript type inferred from the schema
export type LogEntry = z.infer<typeof LogEntrySchema>;

// User consent management
export interface UserConsent {
  user_id: string;
  consent_ai_training: boolean;
  consent_data_sale: boolean;
  consent_analytics: boolean;
  consent_personalization: boolean;
  consent_research: boolean;
  consent_timestamp: string;
  consent_version: string;
  ip_address?: string;
  user_agent?: string;
}

// PII detection and anonymization
export interface PIIField {
  field: string;
  type: 'email' | 'phone' | 'name' | 'address' | 'ssn' | 'credit_card' | 'custom';
  value?: string;
  matches?: string[];
  confidence?: number;
}

// Training data export
export interface TrainingDataEntry {
  id: string;
  prompt: string;
  completion: string;
  source: string;
  timestamp: string;
  user_id?: string;
  quality_score: number;
  metadata: Record<string, any>;
}

// Embedding data for vector search
export interface EmbeddingData {
  user_id: string;
  text: string;
  embedding: number[];
  source: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// Analytics export
export interface AnalyticsExport {
  user_id: string;
  events: Array<{
    event_name: string;
    timestamp: string;
    properties: Record<string, any>;
  }>;
  aggregations: Record<string, number>;
  date_range: {
    start: string;
    end: string;
  };
}

// Error handling
export interface DataLakeError {
  code: string;
  message: string;
  service: string;
  timestamp: string;
  details?: Record<string, any>;
}

// Export validation schemas for external use
export {
  AuthServiceSchema,
  LyfBotServiceSchema,
  JournalServiceSchema,
  AIServiceSchema,
  PaymentServiceSchema,
  NotificationServiceSchema,
  GamificationServiceSchema,
  ChatServiceSchema,
  CommunityServiceSchema,
  TeletherapyServiceSchema,
  RecommendationServiceSchema,
  ResourceServiceSchema,
  ReportingServiceSchema,
  AnalyticsServiceSchema,
  ComplianceServiceSchema,
}; 
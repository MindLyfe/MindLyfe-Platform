export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3004,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'mindlyf_community',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    key: process.env.ENCRYPTION_KEY,
    ivLength: 16,
    saltLength: 64,
  },
  moderation: {
    autoModerationEnabled: process.env.AUTO_MODERATION_ENABLED === 'true',
    sensitiveContentThreshold: parseFloat(process.env.SENSITIVE_CONTENT_THRESHOLD || '0.7'),
    maxReportsBeforeReview: parseInt(process.env.MAX_REPORTS_BEFORE_REVIEW || '3', 10),
    maxPostsPerDay: parseInt(process.env.MAX_POSTS_PER_DAY || '10', 10),
    maxCommentsPerDay: parseInt(process.env.MAX_COMMENTS_PER_DAY || '50', 10),
    autoModerate: process.env.AUTO_MODERATE_CONTENT === 'true',
    toxicityThreshold: parseFloat(process.env.TOXICITY_THRESHOLD) || 0.7,
    enableContentFiltering: process.env.ENABLE_CONTENT_FILTERING !== 'false',
  },
  privacy: {
    defaultPostRetentionDays: parseInt(process.env.DEFAULT_POST_RETENTION_DAYS || '365', 10),
    defaultCommentRetentionDays: parseInt(process.env.DEFAULT_COMMENT_RETENTION_DAYS || '180', 10),
    defaultMessageRetentionDays: parseInt(process.env.DEFAULT_MESSAGE_RETENTION_DAYS || '90', 10),
    anonymizationEnabled: process.env.ANONYMIZATION_ENABLED === 'true',
  },
  rateLimiting: {
    posts: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: parseInt(process.env.RATE_LIMIT_POSTS_MAX || '10', 10),
    },
    comments: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: parseInt(process.env.RATE_LIMIT_COMMENTS_MAX || '50', 10),
    },
    reactions: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: parseInt(process.env.RATE_LIMIT_REACTIONS_MAX || '100', 10),
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'mindlyf-community-secret-key-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  anonymity: {
    enabled: process.env.ENABLE_ANONYMITY !== 'false',
    requireAnonymousPosts: process.env.REQUIRE_ANONYMOUS_POSTS !== 'false',
    allowRealNamesInChat: process.env.ALLOW_REAL_NAMES_IN_CHAT === 'true',
  },
  community: {
    allowAnonymousPosts: process.env.ALLOW_ANONYMOUS_POSTS !== 'false',
    requireModeration: process.env.REQUIRE_MODERATION === 'true',
    enableRealtimeEvents: process.env.ENABLE_REAL_TIME_EVENTS !== 'false',
    maxPostLength: parseInt(process.env.MAX_POST_LENGTH, 10) || 5000,
    maxCommentLength: parseInt(process.env.MAX_COMMENT_LENGTH, 10) || 1000,
  },
  fileUpload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif'],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
  },
}); 
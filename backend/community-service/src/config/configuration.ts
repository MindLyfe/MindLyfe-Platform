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
}); 
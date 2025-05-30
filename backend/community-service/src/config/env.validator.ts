import * as Joi from 'joi';

export const validate = (config: Record<string, unknown>) => {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3004),
    
    // Database
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().default('postgres'),
    DB_PASSWORD: Joi.string().default('postgres'),
    DB_NAME: Joi.string().default('mindlyfe_community'),
    DB_SYNC: Joi.boolean().default(false),
    DB_LOGGING: Joi.boolean().default(false),
    DB_SSL: Joi.boolean().default(false),
    
    // JWT
    JWT_SECRET: Joi.string().default('mindlyfe-community-service-secret'),
    
    // Redis
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),
    
    // Encryption for privacy service
    ENCRYPTION_KEY: Joi.string().optional(),
    
    // Moderation settings
    AUTO_MODERATION_ENABLED: Joi.boolean().default(false),
    SENSITIVE_CONTENT_THRESHOLD: Joi.number().min(0).max(1).default(0.7),
    MAX_REPORTS_BEFORE_REVIEW: Joi.number().default(3),
    MAX_POSTS_PER_DAY: Joi.number().default(10),
    MAX_COMMENTS_PER_DAY: Joi.number().default(50),
    
    // Privacy settings
    DEFAULT_POST_RETENTION_DAYS: Joi.number().default(365),
    DEFAULT_COMMENT_RETENTION_DAYS: Joi.number().default(180),
    DEFAULT_MESSAGE_RETENTION_DAYS: Joi.number().default(90),
    ANONYMIZATION_ENABLED: Joi.boolean().default(true),
    
    // Follow system settings
    AUTO_GRANT_CHAT_ACCESS_ON_MUTUAL: Joi.boolean().default(true),
    MAX_FOLLOWS_PER_DAY: Joi.number().default(50),
    MAX_FOLLOWERS_PER_USER: Joi.number().default(1000),
    NOTIFY_ON_MUTUAL_FOLLOW: Joi.boolean().default(true),
    FOLLOW_SUGGESTIONS_ENABLED: Joi.boolean().default(true),
    
    // Rate limiting
    RATE_LIMIT_POSTS_MAX: Joi.number().default(10),
    RATE_LIMIT_COMMENTS_MAX: Joi.number().default(50),
    RATE_LIMIT_REACTIONS_MAX: Joi.number().default(100),
    RATE_LIMIT_FOLLOWS_MAX: Joi.number().default(20),
    
    // Service URLs
    CHAT_SERVICE_URL: Joi.string().default('http://chat-service:3003'),
    AUTH_SERVICE_URL: Joi.string().default('http://auth-service:3001'),
    NOTIFICATION_SERVICE_URL: Joi.string().default('http://notification-service:3005'),
  });

  const { error, value } = schema.validate(config, { allowUnknown: true });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
}; 
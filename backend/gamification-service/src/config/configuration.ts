export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3008,
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'mindlyf_gamification',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'mindlyf:gamification:',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CORS_ORIGINS?.split(',') || ['https://app.mindlyf.com']
      : ['http://localhost:3000', 'http://localhost:8080'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // External services
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT, 10) || 10000,
    },
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
    analytics: {
      url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3009',
      timeout: parseInt(process.env.ANALYTICS_SERVICE_TIMEOUT, 10) || 10000,
    },
  },

  // Gamification settings
  gamification: {
    // Streak settings
    streaks: {
      defaultGracePeriodHours: parseInt(process.env.STREAK_GRACE_PERIOD_HOURS, 10) || 24,
      maxStreakCount: parseInt(process.env.MAX_STREAK_COUNT, 10) || 1000,
      enableStreakRecovery: process.env.ENABLE_STREAK_RECOVERY !== 'false',
    },
    
    // Badge settings
    badges: {
      enableHiddenBadges: process.env.ENABLE_HIDDEN_BADGES !== 'false',
      maxBadgesPerUser: parseInt(process.env.MAX_BADGES_PER_USER, 10) || 100,
    },
    
    // Achievement settings
    achievements: {
      enableProgressNotifications: process.env.ENABLE_PROGRESS_NOTIFICATIONS !== 'false',
      progressNotificationThreshold: parseInt(process.env.PROGRESS_NOTIFICATION_THRESHOLD, 10) || 25,
    },
    
    // Reward settings
    rewards: {
      enableRewardExpiration: process.env.ENABLE_REWARD_EXPIRATION !== 'false',
      defaultExpirationDays: parseInt(process.env.DEFAULT_REWARD_EXPIRATION_DAYS, 10) || 30,
    },
    
    // Leaderboard settings
    leaderboards: {
      enableGlobalLeaderboards: process.env.ENABLE_GLOBAL_LEADERBOARDS !== 'false',
      leaderboardSize: parseInt(process.env.LEADERBOARD_SIZE, 10) || 100,
      updateIntervalMinutes: parseInt(process.env.LEADERBOARD_UPDATE_INTERVAL, 10) || 15,
    },
  },

  // Caching
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes
    max: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 1000,
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
  },

  // Health checks
  health: {
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT, 10) || 5000,
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || 30000,
  },

  // Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    webhook: process.env.MONITORING_WEBHOOK_URL,
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
  },
}); 
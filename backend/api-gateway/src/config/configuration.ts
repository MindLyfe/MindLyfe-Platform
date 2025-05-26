export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'mindlyf-auth-secret-key-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  
  // Service URLs - Updated with correct ports
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    },
    user: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001', // User management is part of auth service
    },
    ai: {
      url: process.env.AI_SERVICE_URL || 'http://ai-service:8000',
    },
    journal: {
      url: process.env.JOURNAL_SERVICE_URL || 'http://journal-service:8001',
    },
    recommender: {
      url: process.env.RECOMMENDER_SERVICE_URL || 'http://recommender-service:8002',
    },
    lyfbot: {
      url: process.env.LYFBOT_SERVICE_URL || 'http://lyfbot-service:8003',
    },
    chat: {
      url: process.env.CHAT_SERVICE_URL || 'http://chat-service:3003',
    },
    teletherapy: {
      url: process.env.TELETHERAPY_SERVICE_URL || 'http://teletherapy-service:3002',
    },
    community: {
      url: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3004',
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
    },
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
});
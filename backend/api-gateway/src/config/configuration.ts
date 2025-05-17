export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  
  // Service URLs
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    },
    user: {
      url: process.env.USER_SERVICE_URL || 'http://auth-service:3001', // User management is part of auth service
    },
    ai: {
      url: process.env.AI_SERVICE_URL || 'http://ai-service:3002',
    },
    journal: {
      url: process.env.JOURNAL_SERVICE_URL || 'http://journal-service:3003',
    },
    recommender: {
      url: process.env.RECOMMENDER_SERVICE_URL || 'http://recommender-service:3004',
    },
    chat: {
      url: process.env.CHAT_SERVICE_URL || 'http://chat-service:3005',
    },
    teletherapy: {
      url: process.env.TELETHERAPY_SERVICE_URL || 'http://teletherapy-service:3006',
    },
    reporting: {
      url: process.env.REPORTING_SERVICE_URL || 'http://reporting-service:3007',
    },
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
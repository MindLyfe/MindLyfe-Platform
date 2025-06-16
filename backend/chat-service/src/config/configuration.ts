export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3003,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'mindlyfe_chat',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'mindlyfe-auth-secret-key-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  socketio: {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      serviceToken: process.env.AUTH_SERVICE_TOKEN || 'mindlyf-inter-service-auth-token',
    },
    community: {
      url: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3004',
      serviceToken: process.env.COMMUNITY_SERVICE_TOKEN || 'mindlyf-inter-service-community-token',
    },
    teletherapy: {
      url: process.env.TELETHERAPY_SERVICE_URL || 'http://teletherapy-service:3002',
      serviceToken: process.env.TELETHERAPY_SERVICE_TOKEN || 'mindlyf-inter-service-teletherapy-token',
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
      serviceToken: process.env.NOTIFICATION_SERVICE_TOKEN || 'mindlyf-inter-service-notification-token',
    },
    communityServiceUrl: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3004',
    teletherapyServiceUrl: process.env.TELETHERAPY_SERVICE_URL || 'http://teletherapy-service:3002',
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
  },
  SERVICE_NAME: process.env.SERVICE_NAME || 'chat-service',
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
    destination: process.env.UPLOAD_DESTINATION || './uploads',
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60000,
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      'https://mindlyf.app',
      'https://app.mindlyf.app',
      'https://admin.mindlyf.app'
    ],
    credentials: true,
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
});
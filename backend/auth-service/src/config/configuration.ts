export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  
  // Database Configuration
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'mindlyfe_auth',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'mindlyfe-auth-secret-key-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    serviceSecret: process.env.JWT_SERVICE_SECRET || 'mindlyfe-service-secret-key-dev',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  
  // Session Configuration
  session: {
    cleanupInterval: process.env.SESSION_CLEANUP_INTERVAL || '0 0 * * *', // Default: daily at midnight
    maxInactiveDays: parseInt(process.env.SESSION_MAX_INACTIVE_DAYS, 10) || 30, // Default: 30 days
  },
  
  // AWS Cognito (if using Cognito for authentication)
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    region: process.env.AWS_REGION || 'us-east-1',
  },
  
  // Password Policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  
  // AWS configuration for SES email service
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  
  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'support@mindlyfe.com',
    replyTo: process.env.EMAIL_REPLY_TO || 'noreply@mindlyfe.com',
  },
  
  // Frontend URL for email links
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  // Rate limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60, // seconds
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10, // requests per TTL
    authTtl: parseInt(process.env.AUTH_THROTTLE_TTL, 10) || 60,
    authLimit: parseInt(process.env.AUTH_THROTTLE_LIMIT, 10) || 5,
  },
  
  // MFA configuration
  mfa: {
    issuer: process.env.MFA_ISSUER || 'MindLyfe',
    window: parseInt(process.env.MFA_WINDOW, 10) || 1, // time steps before/after for validation
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  },
  
  // Service URLs
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
});
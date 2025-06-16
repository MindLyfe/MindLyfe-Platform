export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  
  // Production-grade CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://app.mindlyfe.com',
          'https://admin.mindlyfe.com',
          'https://mindlyfe.com',
          'https://www.mindlyfe.com'
        ]
      : process.env.NODE_ENV === 'staging'
      ? [
          'https://staging.mindlyfe.com',
          'https://admin-staging.mindlyfe.com',
          'https://api-staging.mindlyfe.com'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:8080',
          'http://127.0.0.1:3000'
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
      'X-User-Agent'
    ],
    exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  },

  // Request Security Configuration
  security: {
    // Request size limits
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
    maxFileSize: process.env.MAX_FILE_SIZE || '50mb',
    maxFieldSize: process.env.MAX_FIELD_SIZE || '1mb',
    maxFields: parseInt(process.env.MAX_FIELDS, 10) || 100,
    
    // Request timeouts
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000, // 30 seconds
    keepAliveTimeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10) || 5000, // 5 seconds
    headersTimeout: parseInt(process.env.HEADERS_TIMEOUT, 10) || 60000, // 60 seconds
    
    // Rate limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requests per window
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Auth-specific rate limiting
    authRateLimit: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5, // 5 auth attempts per window
      message: 'Too many authentication attempts, please try again later.',
      skipSuccessfulRequests: true,
    },
    
    // Payment-specific rate limiting
    paymentRateLimit: {
      windowMs: parseInt(process.env.PAYMENT_RATE_LIMIT_WINDOW, 10) || 60 * 1000, // 1 minute
      max: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX, 10) || 10, // 10 payment requests per minute
      message: 'Too many payment requests, please try again later.',
    },
  },

  // Helmet Security Headers Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.mindlyfe.com', 'wss://api.mindlyfe.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for API compatibility
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
  },

  // Service URLs Configuration
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT, 10) || 10000,
      retries: parseInt(process.env.AUTH_SERVICE_RETRIES, 10) || 3,
    },
    payment: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3006',
      timeout: parseInt(process.env.PAYMENT_SERVICE_TIMEOUT, 10) || 30000,
      retries: parseInt(process.env.PAYMENT_SERVICE_RETRIES, 10) || 2,
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
      timeout: parseInt(process.env.NOTIFICATION_SERVICE_TIMEOUT, 10) || 15000,
      retries: parseInt(process.env.NOTIFICATION_SERVICE_RETRIES, 10) || 3,
    },
    resources: {
      url: process.env.RESOURCES_SERVICE_URL || 'http://resources-service:3007',
      timeout: parseInt(process.env.RESOURCES_SERVICE_TIMEOUT, 10) || 20000,
      retries: parseInt(process.env.RESOURCES_SERVICE_RETRIES, 10) || 2,
    },
    ai: {
      url: process.env.AI_SERVICE_URL || 'http://ai-service:8000',
      timeout: parseInt(process.env.AI_SERVICE_TIMEOUT, 10) || 60000,
      retries: parseInt(process.env.AI_SERVICE_RETRIES, 10) || 1,
    },
    journal: {
      url: process.env.JOURNAL_SERVICE_URL || 'http://journal-service:8001',
      timeout: parseInt(process.env.JOURNAL_SERVICE_TIMEOUT, 10) || 15000,
      retries: parseInt(process.env.JOURNAL_SERVICE_RETRIES, 10) || 2,
    },
    recommender: {
      url: process.env.RECOMMENDER_SERVICE_URL || 'http://recommender-service:8002',
      timeout: parseInt(process.env.RECOMMENDER_SERVICE_TIMEOUT, 10) || 30000,
      retries: parseInt(process.env.RECOMMENDER_SERVICE_RETRIES, 10) || 2,
    },
    lyfbot: {
      url: process.env.LYFBOT_SERVICE_URL || 'http://lyfebot-service:8003',
      timeout: parseInt(process.env.LYFBOT_SERVICE_TIMEOUT, 10) || 45000,
      retries: parseInt(process.env.LYFBOT_SERVICE_RETRIES, 10) || 1,
    },
    chat: {
      url: process.env.CHAT_SERVICE_URL || 'http://chat-service:3003',
      timeout: parseInt(process.env.CHAT_SERVICE_TIMEOUT, 10) || 15000,
      retries: parseInt(process.env.CHAT_SERVICE_RETRIES, 10) || 2,
    },
    teletherapy: {
      url: process.env.TELETHERAPY_SERVICE_URL || 'http://teletherapy-service:3002',
      timeout: parseInt(process.env.TELETHERAPY_SERVICE_TIMEOUT, 10) || 30000,
      retries: parseInt(process.env.TELETHERAPY_SERVICE_RETRIES, 10) || 2,
    },
    community: {
      url: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3004',
      timeout: parseInt(process.env.COMMUNITY_SERVICE_TIMEOUT, 10) || 20000,
      retries: parseInt(process.env.COMMUNITY_SERVICE_RETRIES, 10) || 2,
    },
  },

  // Health Check Configuration
  health: {
    enabled: true,
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT, 10) || 5000,
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || 30000, // 30 seconds
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES, 10) || 3,
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    webhook: process.env.MONITORING_WEBHOOK_URL,
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    tracingEnabled: process.env.TRACING_ENABLED === 'true',
  },

  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  // Redis Configuration (for caching and rate limiting)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'mindlyf:gateway:',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
    enableSecurityLogging: process.env.ENABLE_SECURITY_LOGGING !== 'false', // Default to true
  },
});
export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3009,
  
  // Analytics Database Configuration (Primary data warehouse)
  analyticsDatabase: {
    type: process.env.ANALYTICS_DB_TYPE || 'postgres',
    host: process.env.ANALYTICS_DB_HOST || 'localhost',
    port: parseInt(process.env.ANALYTICS_DB_PORT, 10) || 5432,
    username: process.env.ANALYTICS_DB_USERNAME || 'postgres',
    password: process.env.ANALYTICS_DB_PASSWORD || 'postgres',
    name: process.env.ANALYTICS_DB_NAME || 'mindlyfe_analytics',
    synchronize: process.env.ANALYTICS_DB_SYNCHRONIZE === 'true',
    logging: process.env.ANALYTICS_DB_LOGGING === 'true',
    ssl: process.env.ANALYTICS_DB_SSL === 'true',
  },
  
  // Operational Database Configuration (Read-only access for real-time data)
  operationalDatabase: {
    type: process.env.OPERATIONAL_DB_TYPE || 'postgres',
    host: process.env.OPERATIONAL_DB_HOST || 'localhost',
    port: parseInt(process.env.OPERATIONAL_DB_PORT, 10) || 5432,
    username: process.env.OPERATIONAL_DB_USERNAME || 'postgres',
    password: process.env.OPERATIONAL_DB_PASSWORD || 'postgres',
    name: process.env.OPERATIONAL_DB_NAME || 'mindlyfe_main',
    synchronize: false, // Never sync operational DB
    logging: process.env.OPERATIONAL_DB_LOGGING === 'true',
    ssl: process.env.OPERATIONAL_DB_SSL === 'true',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    serviceSecret: process.env.JWT_SERVICE_SECRET || 'mindlyfe-service-secret-key-dev',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 2, // Use different DB for reporting
  },

  // ETL Configuration
  etl: {
    batchSize: parseInt(process.env.ETL_BATCH_SIZE, 10) || 1000,
    scheduleInterval: parseInt(process.env.ETL_SCHEDULE_INTERVAL, 10) || 300000, // 5 minutes
    enableRealTimeProcessing: process.env.ENABLE_REAL_TIME_PROCESSING === 'true',
    dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS, 10) || 365,
  },

  // Report Configuration
  reports: {
    cacheTtl: parseInt(process.env.REPORT_CACHE_TTL, 10) || 3600, // 1 hour
    maxReportSizeMb: parseInt(process.env.MAX_REPORT_SIZE_MB, 10) || 50,
    enableScheduledReports: process.env.ENABLE_SCHEDULED_REPORTS === 'true',
    storagePath: process.env.REPORT_STORAGE_PATH || '/tmp/reports',
  },

  // Dashboard Configuration
  dashboard: {
    refreshInterval: parseInt(process.env.DASHBOARD_REFRESH_INTERVAL, 10) || 60000, // 1 minute
    maxDashboardWidgets: parseInt(process.env.MAX_DASHBOARD_WIDGETS, 10) || 20,
    enableCustomDashboards: process.env.ENABLE_CUSTOM_DASHBOARDS === 'true',
  },

  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.S3_REPORTS_BUCKET || 'mindlyfe-reports',
    athenaDatabase: process.env.ATHENA_DATABASE || 'mindlyfe_analytics',
    athenaWorkgroup: process.env.ATHENA_WORKGROUP || 'mindlyfe-primary',
  },

  // External Service URLs
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
    gamification: process.env.GAMIFICATION_SERVICE_URL || 'http://gamification-service:3008',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3006',
    teletherapy: process.env.TELETHERAPY_SERVICE_URL || 'http://teletherapy-service:3002',
    chat: process.env.CHAT_SERVICE_URL || 'http://chat-service:3003',
    community: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3004',
    resources: process.env.RESOURCES_SERVICE_URL || 'http://resources-service:3007',
  },

  // Data Lake Configuration
  dataLake: {
    bucketName: process.env.DATA_LAKE_BUCKET_NAME || 'mindlyfe-data-lake',
    region: process.env.AWS_REGION || 'us-east-1',
    enableDataLakeQuery: process.env.ENABLE_DATA_LAKE_QUERY === 'true',
  },

  // Rate limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60, // seconds
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100, // requests per TTL
    reportTtl: parseInt(process.env.REPORT_THROTTLE_TTL, 10) || 300, // 5 minutes
    reportLimit: parseInt(process.env.REPORT_THROTTLE_LIMIT, 10) || 10,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  },

  // Analytics Processing
  analytics: {
    realTimeWindow: parseInt(process.env.ANALYTICS_REAL_TIME_WINDOW, 10) || 300, // 5 minutes
    aggregationBatchSize: parseInt(process.env.AGGREGATION_BATCH_SIZE, 10) || 5000,
    enableMetricCaching: process.env.ENABLE_METRIC_CACHING !== 'false',
    metricCacheTtl: parseInt(process.env.METRIC_CACHE_TTL, 10) || 300, // 5 minutes
  },

  // Notification Analytics
  notificationAnalytics: {
    enableRealTimeTracking: process.env.ENABLE_NOTIFICATION_REAL_TIME_TRACKING === 'true',
    trackingRetentionDays: parseInt(process.env.NOTIFICATION_TRACKING_RETENTION_DAYS, 10) || 90,
    aggregationLevel: process.env.NOTIFICATION_AGGREGATION_LEVEL || 'hourly', // hourly, daily, weekly
  },

  // Security
  security: {
    enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
    auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 365,
    enableDataMasking: process.env.ENABLE_DATA_MASKING === 'true',
  },
}); 
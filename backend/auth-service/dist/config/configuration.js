"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
    database: {
        type: process.env.DB_TYPE || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'mindlyf_auth',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
        ssl: process.env.DB_SSL === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
        serviceSecret: process.env.JWT_SERVICE_SECRET || 'mindlyf-service-secret-key-dev',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
    },
    session: {
        cleanupInterval: process.env.SESSION_CLEANUP_INTERVAL || '0 0 * * *',
        maxInactiveDays: parseInt(process.env.SESSION_MAX_INACTIVE_DAYS, 10) || 30,
    },
    cognito: {
        userPoolId: process.env.COGNITO_USER_POOL_ID,
        clientId: process.env.COGNITO_CLIENT_ID,
        region: process.env.AWS_REGION || 'us-east-1',
    },
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
    },
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKey: process.env.AWS_ACCESS_KEY_ID,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    email: {
        from: process.env.EMAIL_FROM || 'support@mindlyf.com',
        replyTo: process.env.EMAIL_REPLY_TO || 'noreply@mindlyf.com',
    },
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
        authTtl: parseInt(process.env.AUTH_THROTTLE_TTL, 10) || 60,
        authLimit: parseInt(process.env.AUTH_THROTTLE_LIMIT, 10) || 5,
    },
    mfa: {
        issuer: process.env.MFA_ISSUER || 'MindLyf',
        window: parseInt(process.env.MFA_WINDOW, 10) || 1,
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    },
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
});
//# sourceMappingURL=configuration.js.map
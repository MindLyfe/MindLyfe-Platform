"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const configuration = () => ({
    port: parseInt(process.env.PORT, 10) || 3005,
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'mindlyf_notification',
        synchronize: process.env.DB_SYNC === 'true',
        logging: process.env.DB_LOGGING === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'notification-service-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || '',
    },
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ses: {
            sourceEmail: process.env.AWS_SES_SOURCE_EMAIL || 'noreply@mindlyf.com',
        },
    },
    services: {
        authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    },
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map
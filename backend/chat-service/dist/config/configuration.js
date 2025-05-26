"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const configuration = () => ({
    port: parseInt(process.env.PORT, 10) || 3003,
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'mindlyf_chat',
        synchronize: process.env.DB_SYNC === 'true',
        logging: process.env.DB_LOGGING === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'mindlyf-chat-secret',
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
        communityServiceUrl: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3004',
        teletherapyServiceUrl: process.env.TELETHERAPY_SERVICE_URL || 'http://teletherapy-service:3002',
        authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    },
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map
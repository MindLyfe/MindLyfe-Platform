export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'mindlyfe_teletherapy',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'mindlyfe-teletherapy-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  webrtc: {
    iceServers: process.env.ICE_SERVERS ? JSON.parse(process.env.ICE_SERVERS) : [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
  services: {
    chatServiceUrl: process.env.CHAT_SERVICE_URL || 'http://chat-service:3003',
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
  },
  auth: {
    serviceToken: process.env.SERVICE_TOKEN || 'teletherapy-service-token',
    serviceName: 'teletherapy-service',
  },
});
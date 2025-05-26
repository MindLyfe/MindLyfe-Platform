import * as Joi from 'joi';

export const validate = (config: Record<string, unknown>) => {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3003),
    
    // Database
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().default('postgres'),
    DB_PASSWORD: Joi.string().default('postgres'),
    DB_NAME: Joi.string().default('mindlyf_chat'),
    DB_SYNC: Joi.boolean().default(false),
    DB_LOGGING: Joi.boolean().default(false),
    
    // JWT
    JWT_SECRET: Joi.string().default('mindlyf-chat-secret'),
    JWT_EXPIRES_IN: Joi.string().default('15m'),
    
    // Redis
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),
    
    // Socket.IO
    SOCKET_CORS_ORIGIN: Joi.string().default('*'),
    
    // Service URLs
    COMMUNITY_SERVICE_URL: Joi.string().default('http://community-service:3004'),
    TELETHERAPY_SERVICE_URL: Joi.string().default('http://teletherapy-service:3002'),
    AUTH_SERVICE_URL: Joi.string().default('http://auth-service:3001'),
  });

  const { error, value } = schema.validate(config, { allowUnknown: true });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
};
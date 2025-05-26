import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Basic configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  
  // Database configuration
  DB_HOST: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.string().default('localhost'),
  }),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.string().default('postgres'),
  }),
  DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.string().default('postgres'),
  }),
  DB_NAME: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.string().default('mindlyf_auth'),
  }),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),
  
  // JWT configuration
  JWT_SECRET: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().min(32),
    otherwise: Joi.string().default('dev-secret-key-change-in-production'),
  }),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().optional(),

  // Redis configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),
  
  // AWS configuration
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  AWS_SECRET_ACCESS_KEY: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  
  // Email configuration
  EMAIL_FROM: Joi.string().email().default('support@mindlyf.com'),
  EMAIL_REPLY_TO: Joi.string().email().default('noreply@mindlyf.com'),
  
  // Frontend URL for email links
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  
  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(10),
  AUTH_THROTTLE_TTL: Joi.number().default(60),
  AUTH_THROTTLE_LIMIT: Joi.number().default(5),
  
  // MFA configuration
  MFA_ISSUER: Joi.string().default('MindLyf'),
  MFA_TIME_STEP: Joi.number().default(30),
  MFA_WINDOW: Joi.number().default(1),
  
  // CORS configuration
  CORS_ORIGIN: Joi.string().default('*'),
});

/**
 * Validate environment variables against the schema.
 * This function should be called when the application starts.
 */
export function validateEnv(config: Record<string, any>): Record<string, any> {
  const { error, value } = envValidationSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    const missingVars = error.details
      .filter(detail => detail.type === 'any.required')
      .map(detail => detail.context?.key);
      
    const invalidVars = error.details
      .filter(detail => detail.type !== 'any.required')
      .map(detail => `${detail.context?.key}: ${detail.message}`);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
    }
    
    if (invalidVars.length > 0) {
      console.error('❌ Invalid environment variables:', invalidVars);
    }

    if (process.env.NODE_ENV === 'production') {
      console.error('⛔ Application startup aborted due to missing or invalid environment variables.');
      throw new Error('Invalid environment configuration');
    } else {
      console.warn('⚠️ Application starting with invalid environment configuration. This would fail in production!');
    }
  }

  // Check for development environment with production-like settings
  if (process.env.NODE_ENV !== 'production') {
    if (value.JWT_SECRET === 'dev-secret-key-change-in-production') {
      console.warn('⚠️ Using default JWT secret in development environment.');
      console.warn('   In production, use a strong, unique value stored securely (e.g., AWS Secrets Manager).');
    }
  }

  return value;
} 
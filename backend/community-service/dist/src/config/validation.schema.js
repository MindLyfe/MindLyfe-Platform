"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const Joi = require("joi");
exports.validationSchema = Joi.object({
    PORT: Joi.number().default(3004),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_SYNC: Joi.boolean().default(false),
    DB_LOGGING: Joi.boolean().default(false),
    DB_SSL: Joi.boolean().default(false),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),
    ENCRYPTION_KEY: Joi.string().required().min(32),
    AUTO_MODERATION_ENABLED: Joi.boolean().default(false),
    SENSITIVE_CONTENT_THRESHOLD: Joi.number().min(0).max(1).default(0.7),
    MAX_REPORTS_BEFORE_REVIEW: Joi.number().min(1).default(3),
    MAX_POSTS_PER_DAY: Joi.number().min(1).default(10),
    MAX_COMMENTS_PER_DAY: Joi.number().min(1).default(50),
    DEFAULT_POST_RETENTION_DAYS: Joi.number().min(1).default(365),
    DEFAULT_COMMENT_RETENTION_DAYS: Joi.number().min(1).default(180),
    DEFAULT_MESSAGE_RETENTION_DAYS: Joi.number().min(1).default(90),
    ANONYMIZATION_ENABLED: Joi.boolean().default(true),
    RATE_LIMIT_POSTS_MAX: Joi.number().min(1).default(10),
    RATE_LIMIT_COMMENTS_MAX: Joi.number().min(1).default(50),
    RATE_LIMIT_REACTIONS_MAX: Joi.number().min(1).default(100),
    AUTH_SERVICE_URL: Joi.string().required(),
    AUTH_SERVICE_TOKEN: Joi.string().required(),
});
//# sourceMappingURL=validation.schema.js.map
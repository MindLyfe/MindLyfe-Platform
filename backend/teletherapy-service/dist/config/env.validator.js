"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const Joi = require("joi");
const validate = (config) => {
    const schema = Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3002),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().default('postgres'),
        DB_NAME: Joi.string().default('mindlyfe_teletherapy'),
        DB_SYNC: Joi.boolean().default(false),
        DB_LOGGING: Joi.boolean().default(false),
        JWT_SECRET: Joi.string().default('mindlyf-teletherapy-secret'),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').default(''),
        ICE_SERVERS: Joi.string().optional(),
        CHAT_SERVICE_URL: Joi.string().default('http://chat-service:3003'),
        AUTH_SERVICE_URL: Joi.string().default('http://auth-service:3001'),
    });
    const { error, value } = schema.validate(config, { allowUnknown: true });
    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }
    return value;
};
exports.validate = validate;
//# sourceMappingURL=env.validator.js.map
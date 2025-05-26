import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface ServiceTokensConfig {
  services: {
    [key: string]: {
      token: string;
      name: string;
    };
  };
}

export const serviceTokensConfig = registerAs('serviceTokens', () => ({
  services: {
    'chat-service': {
      token: process.env.CHAT_SERVICE_TOKEN,
      name: 'chat-service',
    },
    'teletherapy-service': {
      token: process.env.TELETHERAPY_SERVICE_TOKEN,
      name: 'teletherapy-service',
    },
    'api-gateway': {
      token: process.env.API_GATEWAY_TOKEN,
      name: 'api-gateway',
    },
  },
}));

export const serviceTokensValidationSchema = Joi.object({
  CHAT_SERVICE_TOKEN: Joi.string().required(),
  TELETHERAPY_SERVICE_TOKEN: Joi.string().required(),
  API_GATEWAY_TOKEN: Joi.string().required(),
}); 
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const config_1 = require("@nestjs/config");
let LoggerModule = class LoggerModule {
};
exports.LoggerModule = LoggerModule;
exports.LoggerModule = LoggerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProduction = configService.get('environment') === 'production';
                    return {
                        pinoHttp: {
                            level: isProduction ? 'info' : 'debug',
                            transport: isProduction
                                ? undefined
                                : { target: 'pino-pretty', options: { singleLine: true } },
                            redact: [
                                'req.headers.authorization',
                                'req.headers.cookie',
                                'req.headers["set-cookie"]',
                                'req.body.password',
                                'req.body.passwordConfirmation',
                                'req.body.currentPassword',
                                'req.body.newPassword',
                                'req.body.newPasswordConfirmation'
                            ],
                            formatters: {
                                level: (label) => {
                                    return { level: label };
                                },
                            },
                            customProps: (req, res) => {
                                const user = req.user;
                                return {
                                    context: 'HTTP',
                                    userId: user?.sub,
                                    correlationId: req.headers['x-correlation-id'],
                                };
                            },
                        },
                    };
                },
            }),
        ],
        exports: [nestjs_pino_1.LoggerModule],
    })
], LoggerModule);
//# sourceMappingURL=logger.module.js.map
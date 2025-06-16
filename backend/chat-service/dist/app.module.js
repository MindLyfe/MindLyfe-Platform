"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const configuration_1 = require("./config/configuration");
const env_validator_1 = require("./config/env.validator");
const auth_module_1 = require("./auth/auth.module");
const chat_module_1 = require("./chat/chat.module");
const health_module_1 = require("./health/health.module");
const auth_client_module_1 = require("./shared/auth-client/auth-client.module");
const request_logging_middleware_1 = require("./common/middleware/request-logging.middleware");
const logger_service_1 = require("./common/services/logger.service");
const websocket_docs_controller_1 = require("./websocket/websocket-docs.controller");
const notification_docs_controller_1 = require("./notifications/notification-docs.controller");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(request_logging_middleware_1.RequestLoggingMiddleware)
            .forRoutes('*');
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.configuration],
                validate: env_validator_1.validate,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.name'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('database.synchronize'),
                    logging: configService.get('database.logging'),
                    retryAttempts: 3,
                    retryDelay: 3000,
                    autoLoadEntities: true,
                }),
            }),
            auth_module_1.AuthModule,
            auth_client_module_1.AuthClientModule,
            chat_module_1.ChatModule,
            health_module_1.HealthModule,
        ],
        controllers: [websocket_docs_controller_1.WebSocketDocsController, notification_docs_controller_1.NotificationDocsController],
        providers: [
            logger_service_1.CustomLoggerService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map
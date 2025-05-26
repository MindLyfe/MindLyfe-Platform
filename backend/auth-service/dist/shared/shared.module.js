"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const email_service_1 = require("./services/email.service");
const redis_service_1 = require("./services/redis.service");
const auth_logging_middleware_1 = require("./middleware/auth-logging.middleware");
const event_module_1 = require("./events/event.module");
const event_service_1 = require("./events/event.service");
let SharedModule = class SharedModule {
    configure(consumer) {
        consumer
            .apply(auth_logging_middleware_1.AuthLoggingMiddleware)
            .forRoutes('auth', 'mfa', 'sessions');
    }
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            event_module_1.EventModule,
        ],
        providers: [email_service_1.EmailService, redis_service_1.RedisService, auth_logging_middleware_1.AuthLoggingMiddleware, event_service_1.EventService],
        exports: [
            email_service_1.EmailService,
            redis_service_1.RedisService,
            auth_logging_middleware_1.AuthLoggingMiddleware,
            event_module_1.EventModule,
            event_service_1.EventService,
        ],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map
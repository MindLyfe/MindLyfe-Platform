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
const terminus_1 = require("@nestjs/terminus");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = require("./config/configuration");
const env_validator_1 = require("./config/env.validator");
const app_controller_1 = require("./app.controller");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const subscription_module_1 = require("./subscription/subscription.module");
const organization_module_1 = require("./organization/organization.module");
const shared_module_1 = require("./shared/shared.module");
const user_entity_1 = require("./entities/user.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
const organization_entity_1 = require("./entities/organization.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const therapy_session_entity_1 = require("./entities/therapy-session.entity");
const payment_entity_1 = require("./entities/payment.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validate: env_validator_1.validateEnv,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_NAME', 'mindlyf_auth'),
                    entities: [
                        user_entity_1.User,
                        user_session_entity_1.UserSession,
                        organization_entity_1.Organization,
                        subscription_entity_1.Subscription,
                        therapy_session_entity_1.TherapySession,
                        payment_entity_1.Payment
                    ],
                    synchronize: configService.get('DB_SYNCHRONIZE', true),
                    logging: configService.get('DB_LOGGING', true),
                    ssl: configService.get('DB_SSL', false) ? { rejectUnauthorized: false } : false,
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60,
                    limit: 10,
                }]),
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            subscription_module_1.SubscriptionModule,
            organization_module_1.OrganizationModule,
            terminus_1.TerminusModule,
            axios_1.HttpModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
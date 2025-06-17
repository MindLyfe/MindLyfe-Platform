"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const terminus_1 = require("@nestjs/terminus");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const configuration_1 = __importDefault(require("./config/configuration"));
const env_validator_1 = require("./config/env.validator");
const app_controller_1 = require("./app.controller");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const session_module_1 = require("./auth/session/session.module");
const subscription_module_1 = require("./subscription/subscription.module");
const organization_module_1 = require("./organization/organization.module");
const shared_module_1 = require("./shared/shared.module");
const health_module_1 = require("./health/health.module");
const support_module_1 = require("./support/support.module");
const therapist_module_1 = require("./therapist/therapist.module");
const user_entity_1 = require("./entities/user.entity");
const therapist_entity_1 = require("./entities/therapist.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
const organization_entity_1 = require("./entities/organization.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const therapy_session_entity_1 = require("./entities/therapy-session.entity");
const payment_entity_1 = require("./entities/payment.entity");
const support_shift_entity_1 = require("./entities/support-shift.entity");
const support_routing_entity_1 = require("./entities/support-routing.entity");
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
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.name'),
                    entities: [
                        user_entity_1.User,
                        therapist_entity_1.Therapist,
                        user_session_entity_1.UserSession,
                        organization_entity_1.Organization,
                        subscription_entity_1.Subscription,
                        therapy_session_entity_1.TherapySession,
                        payment_entity_1.Payment,
                        support_shift_entity_1.SupportShift,
                        support_routing_entity_1.SupportRouting,
                    ],
                    synchronize: configService.get('database.synchronize'),
                    logging: configService.get('database.logging'),
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            session_module_1.SessionModule,
            subscription_module_1.SubscriptionModule,
            organization_module_1.OrganizationModule,
            shared_module_1.SharedModule,
            health_module_1.HealthModule,
            support_module_1.SupportModule,
            therapist_module_1.TherapistModule,
            terminus_1.TerminusModule,
            axios_1.HttpModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
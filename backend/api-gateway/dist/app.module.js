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
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const terminus_1 = require("@nestjs/terminus");
const configuration_1 = require("./config/configuration");
const health_controller_1 = require("./health/health.controller");
const proxy_controller_1 = require("./controllers/proxy.controller");
const admin_controller_1 = require("./controllers/admin.controller");
const proxy_service_1 = require("./services/proxy.service");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const user_module_1 = require("./user/user.module");
const ai_module_1 = require("./modules/ai.module");
const community_module_1 = require("./modules/community.module");
const payment_module_1 = require("./modules/payment.module");
const resources_module_1 = require("./modules/resources.module");
const notification_module_1 = require("./modules/notification.module");
const lyfbot_module_1 = require("./modules/lyfbot.module");
const therapy_module_1 = require("./modules/therapy.module");
const docs_module_1 = require("./docs/docs.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('jwt.secret'),
                    signOptions: {
                        expiresIn: configService.get('jwt.expiresIn'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            terminus_1.TerminusModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            ai_module_1.AiModule,
            community_module_1.CommunityModule,
            payment_module_1.PaymentModule,
            resources_module_1.ResourcesModule,
            notification_module_1.NotificationModule,
            lyfbot_module_1.LyfbotModule,
            therapy_module_1.TherapyModule,
            docs_module_1.DocsModule,
        ],
        controllers: [
            health_controller_1.HealthController,
            proxy_controller_1.ProxyController,
            admin_controller_1.AdminController,
        ],
        providers: [
            proxy_service_1.ProxyService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map
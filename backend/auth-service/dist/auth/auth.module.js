"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const mfa_service_1 = require("./mfa/mfa.service");
const mfa_controller_1 = require("./mfa/mfa.controller");
const core_1 = require("@nestjs/core");
const roles_guard_1 = require("./roles/roles.guard");
const user_module_1 = require("../user/user.module");
const session_module_1 = require("./session/session.module");
const user_entity_1 = require("../entities/user.entity");
const therapist_entity_1 = require("../entities/therapist.entity");
const therapist_controller_1 = require("../therapist/therapist.controller");
const therapist_service_1 = require("../therapist/therapist.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            session_module_1.SessionModule,
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, therapist_entity_1.Therapist]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('jwt.secret', 'mindlyf-dev-secret'),
                    signOptions: {
                        expiresIn: configService.get('jwt.expiresIn', '15m'),
                    },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController, mfa_controller_1.MfaController, therapist_controller_1.TherapistController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            mfa_service_1.MfaService,
            therapist_service_1.TherapistService,
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
        exports: [auth_service_1.AuthService, mfa_service_1.MfaService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
const subscription_entity_1 = require("../entities/subscription.entity");
const session_service_1 = require("./session.service");
const session_controller_1 = require("./session.controller");
let SessionModule = class SessionModule {
};
exports.SessionModule = SessionModule;
exports.SessionModule = SessionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, therapy_session_entity_1.TherapySession, subscription_entity_1.Subscription])
        ],
        controllers: [session_controller_1.TherapySessionController],
        providers: [session_service_1.TherapySessionService],
        exports: [session_service_1.TherapySessionService]
    })
], SessionModule);
//# sourceMappingURL=session.module.js.map
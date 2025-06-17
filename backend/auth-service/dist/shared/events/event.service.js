"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = exports.EventType = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
var EventType;
(function (EventType) {
    EventType["USER_CREATED"] = "user.created";
    EventType["USER_UPDATED"] = "user.updated";
    EventType["USER_DELETED"] = "user.deleted";
    EventType["AUTH_LOGIN_SUCCESS"] = "auth.login.success";
    EventType["AUTH_LOGIN_FAILED"] = "auth.login.failed";
    EventType["AUTH_LOGOUT"] = "auth.logout";
    EventType["AUTH_PASSWORD_CHANGED"] = "auth.password.changed";
    EventType["AUTH_PASSWORD_RESET_REQUESTED"] = "auth.password.reset.requested";
    EventType["AUTH_PASSWORD_RESET_COMPLETED"] = "auth.password.reset.completed";
    EventType["MFA_ENABLED"] = "mfa.enabled";
    EventType["MFA_DISABLED"] = "mfa.disabled";
    EventType["MFA_VERIFICATION_SUCCESS"] = "mfa.verification.success";
    EventType["MFA_VERIFICATION_FAILED"] = "mfa.verification.failed";
    EventType["ROLE_CHANGED"] = "role.changed";
    EventType["TOKEN_REFRESHED"] = "token.refreshed";
    EventType["TOKEN_REVOKED"] = "token.revoked";
    EventType["EMAIL_VERIFICATION_SENT"] = "email.verification.sent";
    EventType["EMAIL_VERIFICATION_COMPLETED"] = "email.verification.completed";
    EventType["EMAIL_PASSWORD_RESET_SENT"] = "email.password.reset.sent";
})(EventType || (exports.EventType = EventType = {}));
let EventService = EventService_1 = class EventService {
    configService;
    logger = new common_1.Logger(EventService_1.name);
    isDev;
    constructor(configService) {
        this.configService = configService;
        this.isDev = configService.get('environment') === 'development';
    }
    emit(eventType, payload, metadata = {}) {
        if (!metadata.timestamp) {
            metadata.timestamp = new Date().toISOString();
        }
        const event = {
            type: eventType,
            payload,
            metadata,
        };
        if (this.isDev) {
            this.logger.debug(`[EVENT EMITTED] ${eventType}`, { event });
            return;
        }
        this.logger.log(`Event emitted: ${eventType}`);
    }
};
exports.EventService = EventService;
exports.EventService = EventService = EventService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EventService);
//# sourceMappingURL=event.service.js.map
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
var NotificationChannelFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationChannelFactory = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const notification_channel_entity_1 = require("../entities/notification-channel.entity");
const email_adapter_1 = require("./email.adapter");
const sms_adapter_1 = require("./sms.adapter");
const push_adapter_1 = require("./push.adapter");
const in_app_adapter_1 = require("./in-app.adapter");
let NotificationChannelFactory = NotificationChannelFactory_1 = class NotificationChannelFactory {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger(NotificationChannelFactory_1.name);
    }
    getChannel(channelType) {
        try {
            switch (channelType) {
                case notification_channel_entity_1.ChannelType.EMAIL:
                    return this.moduleRef.get(email_adapter_1.EmailAdapter, { strict: false });
                case notification_channel_entity_1.ChannelType.SMS:
                    return this.moduleRef.get(sms_adapter_1.SmsAdapter, { strict: false });
                case notification_channel_entity_1.ChannelType.PUSH:
                    return this.moduleRef.get(push_adapter_1.PushAdapter, { strict: false });
                case notification_channel_entity_1.ChannelType.IN_APP:
                    return this.moduleRef.get(in_app_adapter_1.InAppAdapter, { strict: false });
                case notification_channel_entity_1.ChannelType.WEBHOOK:
                    throw new Error('Webhook adapter not implemented');
                default:
                    throw new Error(`Unsupported channel type: ${channelType}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to get channel adapter for ${channelType}: ${error.message}`);
            throw error;
        }
    }
};
exports.NotificationChannelFactory = NotificationChannelFactory;
exports.NotificationChannelFactory = NotificationChannelFactory = NotificationChannelFactory_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], NotificationChannelFactory);
//# sourceMappingURL=notification-channel.factory.js.map
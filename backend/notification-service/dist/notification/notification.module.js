"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_service_1 = require("./notification.service");
const notification_controller_1 = require("./notification.controller");
const support_notification_service_1 = require("./support-notification.service");
const support_notification_controller_1 = require("./support-notification.controller");
const notification_entity_1 = require("./entities/notification.entity");
const notification_channel_entity_1 = require("./entities/notification-channel.entity");
const notification_template_entity_1 = require("./entities/notification-template.entity");
const notification_preference_entity_1 = require("./entities/notification-preference.entity");
const email_module_1 = require("../email/email.module");
const auth_module_1 = require("../auth/auth.module");
const notification_channel_factory_1 = require("./channels/notification-channel.factory");
const email_adapter_1 = require("./channels/email.adapter");
const sms_adapter_1 = require("./channels/sms.adapter");
const push_adapter_1 = require("./channels/push.adapter");
const in_app_adapter_1 = require("./channels/in-app.adapter");
const notification_queue_service_1 = require("./queue/notification-queue.service");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                notification_entity_1.NotificationEntity,
                notification_channel_entity_1.NotificationChannelEntity,
                notification_template_entity_1.NotificationTemplateEntity,
                notification_preference_entity_1.NotificationPreferenceEntity,
            ]),
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
        ],
        controllers: [notification_controller_1.NotificationController, support_notification_controller_1.SupportNotificationController],
        providers: [
            notification_service_1.NotificationService,
            support_notification_service_1.SupportNotificationService,
            notification_channel_factory_1.NotificationChannelFactory,
            email_adapter_1.EmailAdapter,
            sms_adapter_1.SmsAdapter,
            push_adapter_1.PushAdapter,
            in_app_adapter_1.InAppAdapter,
            notification_queue_service_1.NotificationQueueService,
        ],
        exports: [notification_service_1.NotificationService, support_notification_service_1.SupportNotificationService, notification_queue_service_1.NotificationQueueService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map
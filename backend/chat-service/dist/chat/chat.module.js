"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const auth_client_module_1 = require("../shared/auth-client/auth-client.module");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const axios_1 = require("@nestjs/axios");
const calling_module_1 = require("./calling/calling.module");
const notification_service_1 = require("../common/services/notification.service");
const community_client_module_1 = require("../community/community-client.module");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([chat_message_entity_1.ChatMessage, chat_room_entity_1.ChatRoom]),
            auth_client_module_1.AuthClientModule,
            axios_1.HttpModule,
            community_client_module_1.CommunityClientModule,
            (0, common_1.forwardRef)(() => calling_module_1.CallingModule),
        ],
        controllers: [
            chat_controller_1.ChatController,
            chat_controller_1.ChatRoomsController,
            chat_controller_1.ChatMessagesController,
            chat_controller_1.ChatSocialController,
            chat_controller_1.ChatModerationController
        ],
        providers: [
            chat_service_1.ChatService,
            notification_service_1.ChatNotificationService
        ],
        exports: [chat_service_1.ChatService, notification_service_1.ChatNotificationService],
    })
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map
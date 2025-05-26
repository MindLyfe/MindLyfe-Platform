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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const create_room_dto_1 = require("./dto/create-room.dto");
const moderation_dto_1 = require("./dto/moderation.dto");
const auth_1 = require("../auth");
const swagger_1 = require("@nestjs/swagger");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createRoom(createRoomDto, user) {
        return this.chatService.createRoom(createRoomDto, user);
    }
    async getRooms(user) {
        return this.chatService.getRooms(user);
    }
    async getRoomById(id, user) {
        return this.chatService.getRoomById(id, user);
    }
    async createMessage(createMessageDto, user) {
        return this.chatService.createMessage(createMessageDto, user);
    }
    async getMessages(id, limit, offset, user) {
        return this.chatService.getMessages(id, user, limit, offset);
    }
    async markMessagesAsRead(id, user) {
        await this.chatService.markMessagesAsRead(id, user);
        return { success: true };
    }
    async moderateMessage(moderateDto, user) {
        return this.chatService.moderateMessage(moderateDto.messageId, moderateDto.action, user);
    }
    async reportMessage(reportDto, user) {
        return { success: true, message: 'Message reported successfully' };
    }
};
__decorate([
    (0, common_1.Post)('rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new chat room' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The chat room has been successfully created.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Only therapists and admins can create group chats.' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)('rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all chat rooms for the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the list of chat rooms.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific chat room by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The chat room ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the chat room.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found.' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomById", null);
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new chat message' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The chat message has been successfully created.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found.' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('rooms/:id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages for a specific chat room' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The chat room ID' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Maximum number of messages to return' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Number of messages to skip' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the list of messages.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found.' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('rooms/:id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all messages in a room as read' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The chat room ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages marked as read.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found.' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markMessagesAsRead", null);
__decorate([
    (0, common_1.Post)('moderation/message'),
    (0, swagger_1.ApiOperation)({ summary: 'Moderate a message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message moderated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Only admins and moderators can moderate messages.' }),
    (0, auth_1.Roles)('admin', 'moderator', 'therapist'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [moderation_dto_1.ModerateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "moderateMessage", null);
__decorate([
    (0, common_1.Post)('moderation/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Report a message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message reported successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, auth_1.Roles)('user', 'therapist', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [moderation_dto_1.ReportMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "reportMessage", null);
ChatController = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map
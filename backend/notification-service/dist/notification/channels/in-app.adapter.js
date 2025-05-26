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
var InAppAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../entities/notification.entity");
const notification_template_entity_1 = require("../entities/notification-template.entity");
let InAppAdapter = InAppAdapter_1 = class InAppAdapter {
    constructor(configService, templateRepository, notificationRepository) {
        this.configService = configService;
        this.templateRepository = templateRepository;
        this.notificationRepository = notificationRepository;
        this.logger = new common_1.Logger(InAppAdapter_1.name);
    }
    async send(notification) {
        try {
            notification.status = 'sent';
            notification.sentAt = new Date();
            await this.notificationRepository.save(notification);
            await this.emitWebSocketEvent(notification);
            this.logger.log(`In-app notification saved for user ${notification.userId}`);
            return {
                success: true,
                notificationId: notification.id,
                channelReferenceId: notification.id,
                status: 'sent',
                metadata: {
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to save in-app notification: ${error.message}`);
            return {
                success: false,
                notificationId: notification.id,
                status: 'failed',
                error: {
                    code: error.code || 'IN_APP_SAVE_ERROR',
                    message: error.message,
                },
            };
        }
    }
    async validateTemplate(templateId) {
        try {
            const template = await this.templateRepository.findOne({
                where: { id: templateId },
            });
            if (!template) {
                return {
                    valid: false,
                    errors: ['Template not found'],
                };
            }
            return { valid: true };
        }
        catch (error) {
            this.logger.error(`Template validation error: ${error.message}`);
            return {
                valid: false,
                errors: [error.message],
            };
        }
    }
    async getDeliveryStatus(notificationId, externalId) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId },
            });
            if (!notification) {
                throw new Error(`Notification not found: ${notificationId}`);
            }
            let status;
            if (notification.isRead) {
                status = 'read';
            }
            else {
                status = 'delivered';
            }
            return {
                status,
                timestamp: notification.isRead ? notification.readAt : notification.sentAt,
                metadata: {
                    isRead: notification.isRead,
                    readAt: notification.readAt,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get delivery status: ${error.message}`);
            return {
                status: 'failed',
                timestamp: new Date(),
                error: {
                    code: error.code || 'STATUS_FETCH_ERROR',
                    message: error.message,
                },
            };
        }
    }
    getCapabilities() {
        return {
            supportsRichContent: true,
            supportsAttachments: true,
            supportsDeliveryReceipts: true,
            supportsReadReceipts: true,
            supportsBulkSend: true,
            maxMessageSize: 100 * 1024,
            rateLimit: {
                maxPerSecond: 100,
                maxPerMinute: 6000,
                maxPerHour: 360000,
                maxPerDay: 8640000,
            },
        };
    }
    async getUnreadCount(userId) {
        try {
            const count = await this.notificationRepository.count({
                where: {
                    userId,
                    isRead: false,
                },
            });
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to get unread count: ${error.message}`);
            return 0;
        }
    }
    async markAllAsRead(userId) {
        try {
            await this.notificationRepository.update({
                userId,
                isRead: false,
            }, {
                isRead: true,
                readAt: new Date(),
            });
            this.logger.log(`Marked all notifications as read for user ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to mark all as read: ${error.message}`);
            return false;
        }
    }
    async deleteNotification(notificationId) {
        try {
            const result = await this.notificationRepository.delete(notificationId);
            if (result.affected > 0) {
                this.logger.log(`Deleted notification ${notificationId}`);
                return true;
            }
            else {
                this.logger.warn(`Notification not found for deletion: ${notificationId}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete notification: ${error.message}`);
            return false;
        }
    }
    async emitWebSocketEvent(notification) {
        this.logger.log(`WebSocket event would be emitted for user ${notification.userId}`);
    }
};
exports.InAppAdapter = InAppAdapter;
exports.InAppAdapter = InAppAdapter = InAppAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(notification_template_entity_1.NotificationTemplateEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.NotificationEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InAppAdapter);
//# sourceMappingURL=in-app.adapter.js.map
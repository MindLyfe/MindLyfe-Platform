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
var SmsAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const twilio_1 = require("twilio");
const notification_template_entity_1 = require("../entities/notification-template.entity");
const auth_service_1 = require("../../auth/auth.service");
let SmsAdapter = SmsAdapter_1 = class SmsAdapter {
    constructor(configService, authService, templateRepository) {
        this.configService = configService;
        this.authService = authService;
        this.templateRepository = templateRepository;
        this.logger = new common_1.Logger(SmsAdapter_1.name);
        const accountSid = this.configService.get('twilio.accountSid');
        const authToken = this.configService.get('twilio.authToken');
        this.fromPhoneNumber = this.configService.get('twilio.phoneNumber');
        if (accountSid && authToken) {
            this.twilioClient = new twilio_1.Twilio(accountSid, authToken);
        }
        else {
            this.logger.warn('Twilio credentials not found. SMS functionality will be limited.');
        }
    }
    async send(notification) {
        var _a;
        try {
            if (!this.twilioClient) {
                throw new Error('Twilio client not initialized');
            }
            const user = await this.getUserDetails(notification.userId);
            const phoneNumber = ((_a = notification.metadata) === null || _a === void 0 ? void 0 : _a.phoneNumber) || user.phoneNumber;
            if (!phoneNumber) {
                throw new Error('No recipient phone number available');
            }
            let messageText = notification.message;
            if (notification.templateId) {
                const template = await this.templateRepository.findOne({
                    where: { id: notification.templateId },
                });
                if (template) {
                    messageText = this.formatSmsTemplate(template.content, Object.assign(Object.assign({}, notification.metadata), { firstName: user.firstName, lastName: user.lastName }));
                }
            }
            messageText = this.truncateMessage(messageText);
            const response = await this.twilioClient.messages.create({
                body: messageText,
                from: this.fromPhoneNumber,
                to: phoneNumber,
            });
            this.logger.log(`SMS sent to ${phoneNumber} with ID: ${response.sid}`);
            return {
                success: true,
                notificationId: notification.id,
                channelReferenceId: response.sid,
                status: 'sent',
                metadata: {
                    messageId: response.sid,
                    timestamp: new Date().toISOString(),
                    segments: this.estimateSegmentCount(messageText),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to send SMS: ${error.message}`);
            return {
                success: false,
                notificationId: notification.id,
                status: 'failed',
                error: {
                    code: error.code || 'SMS_SEND_ERROR',
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
            const errors = [];
            if (template.content.length > 1600) {
                errors.push('Template exceeds maximum SMS length');
            }
            return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined,
            };
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
            if (!this.twilioClient) {
                throw new Error('Twilio client not initialized');
            }
            const message = await this.twilioClient.messages(externalId).fetch();
            let status;
            switch (message.status) {
                case 'delivered':
                    status = 'delivered';
                    break;
                case 'sent':
                    status = 'sent';
                    break;
                case 'failed':
                case 'undelivered':
                    status = 'failed';
                    break;
                default:
                    status = 'sent';
            }
            return {
                status,
                timestamp: new Date(),
                metadata: {
                    twilioStatus: message.status,
                    errorCode: message.errorCode,
                    errorMessage: message.errorMessage,
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
            supportsRichContent: false,
            supportsAttachments: false,
            supportsDeliveryReceipts: true,
            supportsReadReceipts: false,
            supportsBulkSend: true,
            maxMessageSize: 1600,
            rateLimit: {
                maxPerSecond: 1,
                maxPerMinute: 60,
                maxPerHour: 3600,
                maxPerDay: 86400,
            },
        };
    }
    estimateSegmentCount(message) {
        const hasUnicode = /[^\u0000-\u007F]/.test(message);
        const charsPerSegment = hasUnicode ? 70 : 160;
        if (message.length <= charsPerSegment) {
            return 1;
        }
        else {
            const effectiveCharsPerSegment = hasUnicode ? 67 : 153;
            return Math.ceil(message.length / effectiveCharsPerSegment);
        }
    }
    async validatePhoneNumber(phoneNumber) {
        try {
            if (!this.twilioClient) {
                const phoneRegex = /^\+[1-9]\d{1,14}$/;
                return phoneRegex.test(phoneNumber);
            }
            const lookup = await this.twilioClient.lookups.v1
                .phoneNumbers(phoneNumber)
                .fetch();
            return !!lookup.phoneNumber;
        }
        catch (error) {
            this.logger.error(`Phone validation error: ${error.message}`);
            return false;
        }
    }
    async getUserDetails(userId) {
        try {
            const systemToken = this.configService.get('system.apiToken');
            return await this.authService.getUserById(userId, systemToken);
        }
        catch (error) {
            this.logger.error(`Failed to get user details: ${error.message}`);
            return { id: userId };
        }
    }
    formatSmsTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }
    truncateMessage(message) {
        const MAX_LENGTH = 1600;
        if (message.length <= MAX_LENGTH) {
            return message;
        }
        return message.substring(0, MAX_LENGTH - 3) + '...';
    }
};
exports.SmsAdapter = SmsAdapter;
exports.SmsAdapter = SmsAdapter = SmsAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(notification_template_entity_1.NotificationTemplateEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService,
        typeorm_2.Repository])
], SmsAdapter);
//# sourceMappingURL=sms.adapter.js.map
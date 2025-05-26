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
var EmailAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_ses_1 = require("@aws-sdk/client-ses");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const notification_template_entity_1 = require("../entities/notification-template.entity");
const auth_service_1 = require("../../auth/auth.service");
let EmailAdapter = EmailAdapter_1 = class EmailAdapter {
    constructor(configService, authService, templateRepository) {
        this.configService = configService;
        this.authService = authService;
        this.templateRepository = templateRepository;
        this.logger = new common_1.Logger(EmailAdapter_1.name);
        this.templates = new Map();
        this.ses = new client_ses_1.SESClient({
            region: this.configService.get('aws.region'),
            credentials: {
                accessKeyId: this.configService.get('aws.accessKeyId'),
                secretAccessKey: this.configService.get('aws.secretAccessKey'),
            },
        });
        this.sourceEmail = this.configService.get('aws.ses.sourceEmail');
        this.loadTemplates();
    }
    loadTemplates() {
        const templatesDir = path.join(__dirname, '../../templates');
        try {
            if (fs.existsSync(templatesDir)) {
                const templateFiles = fs.readdirSync(templatesDir);
                templateFiles.forEach((file) => {
                    if (file.endsWith('.hbs')) {
                        const templateName = file.replace('.hbs', '');
                        const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
                        const compiledTemplate = handlebars.compile(templateContent);
                        this.templates.set(templateName, compiledTemplate);
                        this.logger.log(`Loaded email template: ${templateName}`);
                    }
                });
            }
            else {
                this.logger.warn(`Templates directory not found: ${templatesDir}`);
            }
        }
        catch (error) {
            this.logger.error(`Error loading templates: ${error.message}`);
        }
    }
    async send(notification) {
        var _a, _b;
        try {
            const user = await this.getUserDetails(notification.userId);
            const recipientEmail = notification.recipientEmail || user.email;
            if (!recipientEmail) {
                throw new Error('No recipient email address available');
            }
            let htmlContent;
            if (notification.templateId) {
                const template = await this.templateRepository.findOne({
                    where: { id: notification.templateId },
                });
                if (template && this.templates.has(template.name)) {
                    const compiledTemplate = this.templates.get(template.name);
                    htmlContent = compiledTemplate(Object.assign(Object.assign({}, notification.metadata), { firstName: user.firstName, lastName: user.lastName, year: new Date().getFullYear() }));
                }
                else {
                    htmlContent = ((_a = notification.metadata) === null || _a === void 0 ? void 0 : _a.html) || notification.message;
                }
            }
            else {
                htmlContent = ((_b = notification.metadata) === null || _b === void 0 ? void 0 : _b.html) || notification.message;
            }
            const params = {
                Source: this.sourceEmail,
                Destination: {
                    ToAddresses: [recipientEmail],
                },
                Message: {
                    Subject: {
                        Data: notification.title,
                    },
                    Body: {
                        Text: {
                            Data: this.getTextFromHtml(htmlContent) || notification.message,
                        },
                        Html: {
                            Data: htmlContent,
                        },
                    },
                },
            };
            const command = new client_ses_1.SendEmailCommand(params);
            const response = await this.ses.send(command);
            this.logger.log(`Email sent to ${recipientEmail} with subject: ${notification.title}`);
            return {
                success: true,
                notificationId: notification.id,
                channelReferenceId: response.MessageId,
                status: 'sent',
                metadata: {
                    messageId: response.MessageId,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return {
                success: false,
                notificationId: notification.id,
                status: 'failed',
                error: {
                    code: error.code || 'EMAIL_SEND_ERROR',
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
            if (!this.templates.has(template.name)) {
                return {
                    valid: false,
                    errors: ['Template file not found'],
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
        return {
            status: 'sent',
            timestamp: new Date(),
            metadata: {
                messageId: externalId,
            },
        };
    }
    getCapabilities() {
        return {
            supportsRichContent: true,
            supportsAttachments: true,
            supportsDeliveryReceipts: false,
            supportsReadReceipts: false,
            supportsBulkSend: true,
            maxMessageSize: 10 * 1024 * 1024,
            rateLimit: {
                maxPerSecond: 14,
                maxPerMinute: 840,
                maxPerHour: 50000,
                maxPerDay: 50000 * 24,
            },
        };
    }
    async validateEmailAddress(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    async addAttachment(notificationId, attachment) {
        this.logger.log(`Attachment would be added to email ${notificationId}: ${attachment.filename}`);
        return true;
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
    getTextFromHtml(html) {
        if (!html)
            return '';
        return html
            .replace(/<style[^>]*>.*<\/style>/g, '')
            .replace(/<script[^>]*>.*<\/script>/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
};
exports.EmailAdapter = EmailAdapter;
exports.EmailAdapter = EmailAdapter = EmailAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(notification_template_entity_1.NotificationTemplateEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService,
        typeorm_2.Repository])
], EmailAdapter);
//# sourceMappingURL=email.adapter.js.map
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
var PushAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin = require("firebase-admin");
const notification_template_entity_1 = require("../entities/notification-template.entity");
const auth_service_1 = require("../../auth/auth.service");
let PushAdapter = PushAdapter_1 = class PushAdapter {
    constructor(configService, authService, templateRepository) {
        this.configService = configService;
        this.authService = authService;
        this.templateRepository = templateRepository;
        this.logger = new common_1.Logger(PushAdapter_1.name);
        this.initialized = false;
        this.deviceTokens = new Map();
        this.initFirebaseAdmin();
    }
    initFirebaseAdmin() {
        var _a;
        try {
            if (admin.apps.length === 0) {
                const projectId = this.configService.get('firebase.projectId');
                const privateKey = (_a = this.configService.get('firebase.privateKey')) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n');
                const clientEmail = this.configService.get('firebase.clientEmail');
                if (!projectId || !privateKey || !clientEmail) {
                    this.logger.warn('Firebase credentials not complete. Push notification functionality will be limited.');
                    return;
                }
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        privateKey,
                        clientEmail,
                    }),
                });
                this.initialized = true;
                this.logger.log('Firebase Admin SDK initialized successfully');
            }
            else {
                this.initialized = true;
                this.logger.log('Firebase Admin SDK already initialized');
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
        }
    }
    async send(notification) {
        var _a;
        try {
            if (!this.initialized) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const deviceTokens = await this.getDeviceTokensForUser(notification.userId);
            if (!deviceTokens || deviceTokens.length === 0) {
                throw new Error('No device tokens available for user');
            }
            const pushNotification = {
                tokens: deviceTokens.map(dt => dt.token),
                notification: {
                    title: notification.title,
                    body: notification.message,
                },
                data: Object.assign({ notificationId: notification.id, type: notification.type }, notification.metadata),
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                            contentAvailable: true,
                        },
                    },
                },
                webpush: {
                    notification: {
                        icon: this.configService.get('app.logoUrl'),
                    },
                    fcmOptions: {
                        link: `${this.configService.get('app.url')}/notifications/${notification.id}`,
                    },
                },
            };
            const response = await admin.messaging().sendMulticast(pushNotification);
            this.logger.log(`Push notification sent with success count: ${response.successCount}/${deviceTokens.length}`);
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    var _a, _b;
                    if (!resp.success) {
                        this.logger.error(`Failed to send to token: ${deviceTokens[idx].token}, error: ${resp.error}`);
                        failedTokens.push(deviceTokens[idx].token);
                        if (((_a = resp.error) === null || _a === void 0 ? void 0 : _a.code) === 'messaging/invalid-registration-token' ||
                            ((_b = resp.error) === null || _b === void 0 ? void 0 : _b.code) === 'messaging/registration-token-not-registered') {
                            this.deactivateDeviceToken(notification.userId, deviceTokens[idx].token);
                        }
                    }
                });
            }
            return {
                success: response.successCount > 0,
                notificationId: notification.id,
                channelReferenceId: (_a = response.responses.find(r => r.success)) === null || _a === void 0 ? void 0 : _a.messageId,
                status: response.successCount > 0 ? 'sent' : 'failed',
                metadata: {
                    successCount: response.successCount,
                    failureCount: response.failureCount,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`);
            return {
                success: false,
                notificationId: notification.id,
                status: 'failed',
                error: {
                    code: error.code || 'PUSH_SEND_ERROR',
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
            if (template.content.length > 4000) {
                errors.push('Template exceeds maximum payload size');
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
            supportsAttachments: false,
            supportsDeliveryReceipts: false,
            supportsReadReceipts: false,
            supportsBulkSend: true,
            maxMessageSize: 4000,
            rateLimit: {
                maxPerSecond: 1000,
                maxPerMinute: 60000,
                maxPerHour: 600000,
                maxPerDay: 10000000,
            },
        };
    }
    async registerDevice(userId, deviceToken, platform) {
        try {
            if (!this.deviceTokens.has(userId)) {
                this.deviceTokens.set(userId, []);
            }
            const userTokens = this.deviceTokens.get(userId);
            const existingToken = userTokens.find(t => t.token === deviceToken);
            if (existingToken) {
                existingToken.platform = platform;
                existingToken.lastUsed = new Date();
                existingToken.active = true;
            }
            else {
                userTokens.push({
                    userId,
                    token: deviceToken,
                    platform,
                    lastUsed: new Date(),
                    active: true,
                });
            }
            this.logger.log(`Device registered for user ${userId} on ${platform} platform`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to register device: ${error.message}`);
            return false;
        }
    }
    async unregisterDevice(deviceToken) {
        try {
            for (const [userId, tokens] of this.deviceTokens.entries()) {
                const tokenIndex = tokens.findIndex(t => t.token === deviceToken);
                if (tokenIndex >= 0) {
                    tokens[tokenIndex].active = false;
                    this.logger.log(`Device unregistered: ${deviceToken}`);
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Failed to unregister device: ${error.message}`);
            return false;
        }
    }
    async sendToTopic(topic, notification) {
        try {
            if (!this.initialized) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const message = {
                topic,
                notification: {
                    title: notification.title,
                    body: notification.message,
                },
                data: Object.assign({ notificationId: notification.id, type: notification.type }, notification.metadata),
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await admin.messaging().send(message);
            this.logger.log(`Push notification sent to topic ${topic} with ID: ${response}`);
            return {
                success: true,
                notificationId: notification.id,
                channelReferenceId: response,
                status: 'sent',
                metadata: {
                    topic,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to send topic notification: ${error.message}`);
            return {
                success: false,
                notificationId: notification.id,
                status: 'failed',
                error: {
                    code: error.code || 'TOPIC_SEND_ERROR',
                    message: error.message,
                },
            };
        }
    }
    async getDeviceTokensForUser(userId) {
        if (!this.deviceTokens.has(userId)) {
            this.deviceTokens.set(userId, [{
                    userId,
                    token: 'dummy-token-for-testing',
                    platform: 'android',
                    lastUsed: new Date(),
                    active: true,
                }]);
        }
        return this.deviceTokens.get(userId).filter(t => t.active);
    }
    deactivateDeviceToken(userId, token) {
        const userTokens = this.deviceTokens.get(userId);
        if (userTokens) {
            const tokenObj = userTokens.find(t => t.token === token);
            if (tokenObj) {
                tokenObj.active = false;
                this.logger.log(`Deactivated invalid token for user ${userId}`);
            }
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
};
exports.PushAdapter = PushAdapter;
exports.PushAdapter = PushAdapter = PushAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(notification_template_entity_1.NotificationTemplateEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService,
        typeorm_2.Repository])
], PushAdapter);
//# sourceMappingURL=push.adapter.js.map
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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const email_service_1 = require("../email/email.service");
const notification_entity_1 = require("./entities/notification.entity");
const notification_channel_entity_1 = require("./entities/notification-channel.entity");
const notification_template_entity_1 = require("./entities/notification-template.entity");
const notification_preference_entity_1 = require("./entities/notification-preference.entity");
const auth_service_1 = require("../auth/auth.service");
const notification_channel_factory_1 = require("./channels/notification-channel.factory");
const notification_queue_service_1 = require("./queue/notification-queue.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, channelRepository, templateRepository, preferenceRepository, emailService, configService, authService, channelFactory, queueService) {
        this.notificationRepository = notificationRepository;
        this.channelRepository = channelRepository;
        this.templateRepository = templateRepository;
        this.preferenceRepository = preferenceRepository;
        this.emailService = emailService;
        this.configService = configService;
        this.authService = authService;
        this.channelFactory = channelFactory;
        this.queueService = queueService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async createNotification(dto) {
        const notification = this.notificationRepository.create({
            userId: dto.userId,
            recipientEmail: dto.recipientEmail,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            metadata: dto.metadata || {},
            status: notification_entity_1.NotificationStatus.PENDING,
            templateId: dto.templateId,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        });
        const savedNotification = await this.notificationRepository.save(notification);
        if (!notification.scheduledAt || new Date(notification.scheduledAt) <= new Date()) {
            const queueOptions = {
                priority: this.getPriorityForNotificationType(notification.type),
                metadata: {
                    isTransactional: this.isTransactionalNotification(notification.type),
                    requiresImmediate: this.requiresImmediateDelivery(notification.type),
                }
            };
            await this.queueService.enqueue(savedNotification, queueOptions);
        }
        return savedNotification;
    }
    async sendNotification(notification, channels) {
        var _a;
        if (typeof notification === 'string') {
            notification = await this.findOne(notification);
        }
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.status !== notification_entity_1.NotificationStatus.PENDING &&
            notification.status !== notification_entity_1.NotificationStatus.FAILED) {
            return notification;
        }
        const userPrefs = await this.preferenceRepository.findOne({
            where: { userId: notification.userId },
        });
        if (userPrefs && !this.isTransactionalNotification(notification.type)) {
            const withinLimits = await this.isWithinFrequencyLimits(notification.userId, notification.type);
            if (!withinLimits) {
                this.logger.log(`Notification not sent - user ${notification.userId} has exceeded frequency limits`);
                notification.status = notification_entity_1.NotificationStatus.FAILED;
                notification.errorMessage = 'Frequency limit exceeded';
                return this.notificationRepository.save(notification);
            }
        }
        if (userPrefs && ((_a = userPrefs.doNotDisturb) === null || _a === void 0 ? void 0 : _a.enabled) && !this.requiresImmediateDelivery(notification.type)) {
            const isDnd = this.isInDoNotDisturbPeriod(userPrefs.doNotDisturb);
            if (isDnd) {
                const endOfDnd = this.getEndOfDoNotDisturbPeriod(userPrefs.doNotDisturb);
                if (endOfDnd) {
                    notification.scheduledAt = endOfDnd;
                    notification.status = notification_entity_1.NotificationStatus.PENDING;
                    notification.metadata = Object.assign(Object.assign({}, notification.metadata), { rescheduledDueToDnd: true });
                    return this.notificationRepository.save(notification);
                }
            }
        }
        const contextAwareChannels = await this.getContextAwareChannels(notification.userId, notification.type, channels);
        if (contextAwareChannels.length === 0) {
            notification.status = notification_entity_1.NotificationStatus.FAILED;
            notification.errorMessage = 'No appropriate channels available';
            return this.notificationRepository.save(notification);
        }
        const results = await Promise.allSettled(contextAwareChannels.map(channelType => this.sendThroughChannel(notification, channelType)));
        const failures = results.filter(r => r.status === 'rejected').length;
        if (failures === 0) {
            notification.status = notification_entity_1.NotificationStatus.SENT;
            notification.sentAt = new Date();
        }
        else if (failures === contextAwareChannels.length) {
            notification.status = notification_entity_1.NotificationStatus.FAILED;
            notification.errorMessage = 'Failed to send through any channel';
        }
        else {
            notification.status = notification_entity_1.NotificationStatus.SENT;
            notification.sentAt = new Date();
            notification.errorMessage = `Failed to send through ${failures} of ${contextAwareChannels.length} channels`;
        }
        return this.notificationRepository.save(notification);
    }
    async sendThroughChannel(notification, channelType) {
        var _a;
        try {
            const channel = await this.channelRepository.findOne({
                where: {
                    type: channelType,
                    isActive: true,
                },
            });
            if (!channel) {
                throw new Error(`Channel ${channelType} is not active or does not exist`);
            }
            const channelAdapter = this.channelFactory.getChannel(channelType);
            const result = await channelAdapter.send(notification);
            if (!result.success) {
                throw new Error(((_a = result.error) === null || _a === void 0 ? void 0 : _a.message) || `Failed to send through ${channelType}`);
            }
            notification.channelId = channel.id;
            this.logger.log(`Notification ${notification.id} sent successfully through ${channelType}`);
        }
        catch (error) {
            this.logger.error(`Failed to send notification through ${channelType}: ${error.message}`, error.stack);
            throw error;
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
    async getContextAwareChannels(userId, notificationType, explicitChannels) {
        var _a, _b;
        try {
            if (explicitChannels && explicitChannels.length > 0) {
                return await this.filterChannelsByPreferences(userId, notificationType, explicitChannels);
            }
            const preferences = await this.preferenceRepository.findOne({
                where: { userId },
            });
            if (!preferences) {
                return this.getDefaultChannelsForType(notificationType);
            }
            const isUserActive = preferences.isOnline &&
                preferences.lastActivity &&
                (new Date().getTime() - preferences.lastActivity.getTime() < 5 * 60 * 1000);
            if (isUserActive) {
                if (this.isTransactionalNotification(notificationType) || this.requiresImmediateDelivery(notificationType)) {
                    return await this.getEnabledChannelsForUser(userId, notificationType);
                }
                const inAppChannel = [notification_channel_entity_1.ChannelType.IN_APP];
                return await this.filterChannelsByPreferences(userId, notificationType, inAppChannel);
            }
            const typePrefs = (_a = preferences.typePreferences) === null || _a === void 0 ? void 0 : _a[notificationType];
            if ((typePrefs === null || typePrefs === void 0 ? void 0 : typePrefs.enabled) && ((_b = typePrefs.preferredChannels) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                const channelTypes = typePrefs.preferredChannels.map(c => c === 'email'
                    ? notification_channel_entity_1.ChannelType.EMAIL
                    : c === 'sms'
                        ? notification_channel_entity_1.ChannelType.SMS
                        : c === 'push'
                            ? notification_channel_entity_1.ChannelType.PUSH
                            : notification_channel_entity_1.ChannelType.IN_APP);
                return await this.filterChannelsByPreferences(userId, notificationType, channelTypes);
            }
            return await this.getEnabledChannelsForUser(userId, notificationType);
        }
        catch (error) {
            this.logger.error(`Failed to get context-aware channels: ${error.message}`);
            return this.getDefaultChannelsForType(notificationType);
        }
    }
    async getEnabledChannelsForUser(userId, notificationType) {
        try {
            const preferences = await this.preferenceRepository.findOne({
                where: { userId },
            });
            if (!preferences) {
                return this.getDefaultChannelsForType(notificationType);
            }
            if (notificationType === notification_entity_1.NotificationType.MARKETING && !preferences.receiveMarketing) {
                return [];
            }
            if (this.isGamificationNotification(notificationType) &&
                preferences.gamification &&
                !this.isGamificationEnabled(preferences.gamification, notificationType)) {
                return [];
            }
            const enabledChannels = Object.entries(preferences.channels || {})
                .filter(([_, value]) => value.enabled)
                .filter(([_, value]) => {
                return !value.contentTypes ||
                    value.contentTypes.includes(notificationType);
            })
                .filter(([channel, value]) => {
                if (!value.timeWindows || value.timeWindows.length === 0) {
                    return true;
                }
                return this.isWithinTimeWindows(value.timeWindows);
            })
                .filter(([channel, _]) => {
                if ((channel === 'email' || channel === 'sms') &&
                    !this.isTransactionalNotification(notificationType)) {
                    return preferences.receiveTransactional;
                }
                return true;
            })
                .map(([key, _]) => {
                return key === 'email'
                    ? notification_channel_entity_1.ChannelType.EMAIL
                    : key === 'sms'
                        ? notification_channel_entity_1.ChannelType.SMS
                        : key === 'push'
                            ? notification_channel_entity_1.ChannelType.PUSH
                            : notification_channel_entity_1.ChannelType.IN_APP;
            });
            if (enabledChannels.length > 0) {
                return enabledChannels;
            }
            return this.getDefaultChannelsForType(notificationType);
        }
        catch (error) {
            this.logger.error(`Failed to get enabled channels: ${error.message}`);
            return this.getDefaultChannelsForType(notificationType);
        }
    }
    async filterChannelsByPreferences(userId, notificationType, channels) {
        try {
            const preferences = await this.preferenceRepository.findOne({
                where: { userId },
            });
            if (!preferences) {
                return channels;
            }
            return channels.filter(channelType => {
                var _a;
                const channelKey = channelType === notification_channel_entity_1.ChannelType.EMAIL
                    ? 'email'
                    : channelType === notification_channel_entity_1.ChannelType.SMS
                        ? 'sms'
                        : channelType === notification_channel_entity_1.ChannelType.PUSH
                            ? 'push'
                            : 'in_app';
                const channelPrefs = (_a = preferences.channels) === null || _a === void 0 ? void 0 : _a[channelKey];
                if (!(channelPrefs === null || channelPrefs === void 0 ? void 0 : channelPrefs.enabled)) {
                    return false;
                }
                if (channelPrefs.contentTypes &&
                    !channelPrefs.contentTypes.includes(notificationType)) {
                    return false;
                }
                if ((channelType === notification_channel_entity_1.ChannelType.EMAIL || channelType === notification_channel_entity_1.ChannelType.SMS) &&
                    !this.isTransactionalNotification(notificationType)) {
                    if (!channelPrefs.consentGiven) {
                        return false;
                    }
                }
                if ((channelType === notification_channel_entity_1.ChannelType.EMAIL ||
                    channelType === notification_channel_entity_1.ChannelType.SMS ||
                    channelType === notification_channel_entity_1.ChannelType.PUSH) &&
                    channelPrefs.timeWindows &&
                    channelPrefs.timeWindows.length > 0) {
                    return this.isWithinTimeWindows(channelPrefs.timeWindows);
                }
                return true;
            });
        }
        catch (error) {
            this.logger.error(`Failed to filter channels by preferences: ${error.message}`);
            return channels;
        }
    }
    isWithinTimeWindows(timeWindows) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return timeWindows.some(window => {
            if (window.dayOfWeek !== currentDay) {
                return false;
            }
            return currentTime >= window.startTime && currentTime <= window.endTime;
        });
    }
    isInDoNotDisturbPeriod(dnd) {
        if (!dnd.enabled) {
            return false;
        }
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        if (dnd.startTime > dnd.endTime) {
            return currentTime >= dnd.startTime || currentTime <= dnd.endTime;
        }
        else {
            return currentTime >= dnd.startTime && currentTime <= dnd.endTime;
        }
    }
    getEndOfDoNotDisturbPeriod(dnd) {
        if (!dnd.enabled) {
            return null;
        }
        const now = new Date();
        const [endHours, endMinutes] = dnd.endTime.split(':').map(part => parseInt(part, 10));
        const endTime = new Date(now);
        endTime.setHours(endHours, endMinutes, 0, 0);
        if (endTime <= now) {
            endTime.setDate(endTime.getDate() + 1);
        }
        return endTime;
    }
    isTransactionalNotification(type) {
        return [
            notification_entity_1.NotificationType.ACCOUNT,
            notification_entity_1.NotificationType.PAYMENT,
            notification_entity_1.NotificationType.SUBSCRIPTION,
        ].includes(type);
    }
    requiresImmediateDelivery(type) {
        return [
            notification_entity_1.NotificationType.ACCOUNT,
            notification_entity_1.NotificationType.PAYMENT,
            notification_entity_1.NotificationType.SUBSCRIPTION,
        ].includes(type);
    }
    isGamificationNotification(type, notification) {
        var _a, _b, _c, _d;
        if (!notification) {
            return type === notification_entity_1.NotificationType.SYSTEM;
        }
        return type === notification_entity_1.NotificationType.SYSTEM &&
            ((((_a = notification.metadata) === null || _a === void 0 ? void 0 : _a.category) === 'streak') ||
                (((_b = notification.metadata) === null || _b === void 0 ? void 0 : _b.category) === 'achievement') ||
                (((_c = notification.metadata) === null || _c === void 0 ? void 0 : _c.category) === 'challenge') ||
                (((_d = notification.metadata) === null || _d === void 0 ? void 0 : _d.category) === 'milestone'));
    }
    isGamificationEnabled(gamificationPrefs, notificationType, notification) {
        var _a;
        const category = (_a = notification === null || notification === void 0 ? void 0 : notification.metadata) === null || _a === void 0 ? void 0 : _a.category;
        if (!category) {
            return true;
        }
        switch (category) {
            case 'streak':
                return gamificationPrefs.streaks;
            case 'achievement':
                return gamificationPrefs.achievements;
            case 'challenge':
                return gamificationPrefs.challenges;
            case 'milestone':
                return gamificationPrefs.milestones;
            default:
                return true;
        }
    }
    async isWithinFrequencyLimits(userId, notificationType) {
        var _a;
        try {
            const preferences = await this.preferenceRepository.findOne({
                where: { userId },
            });
            if (!(preferences === null || preferences === void 0 ? void 0 : preferences.frequency)) {
                return true;
            }
            const now = new Date();
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const todayCount = await this.notificationRepository.count({
                where: {
                    userId,
                    createdAt: { $gte: startOfToday },
                    status: notification_entity_1.NotificationStatus.SENT,
                },
            });
            const weeklyCount = await this.notificationRepository.count({
                where: {
                    userId,
                    createdAt: { $gte: startOfWeek },
                    status: notification_entity_1.NotificationStatus.SENT,
                },
            });
            if ((_a = preferences.frequency.byType) === null || _a === void 0 ? void 0 : _a[notificationType]) {
                const typeLimits = preferences.frequency.byType[notificationType];
                if (typeLimits.daily && todayCount >= typeLimits.daily) {
                    return false;
                }
                if (typeLimits.weekly && weeklyCount >= typeLimits.weekly) {
                    return false;
                }
            }
            if (preferences.frequency.daily && todayCount >= preferences.frequency.daily) {
                return false;
            }
            if (preferences.frequency.weekly && weeklyCount >= preferences.frequency.weekly) {
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to check frequency limits: ${error.message}`);
            return true;
        }
    }
    getDefaultChannelsForType(type) {
        const defaultChannels = {
            [notification_entity_1.NotificationType.ACCOUNT]: [notification_channel_entity_1.ChannelType.EMAIL, notification_channel_entity_1.ChannelType.IN_APP],
            [notification_entity_1.NotificationType.SYSTEM]: [notification_channel_entity_1.ChannelType.IN_APP],
            [notification_entity_1.NotificationType.THERAPY]: [notification_channel_entity_1.ChannelType.EMAIL, notification_channel_entity_1.ChannelType.PUSH, notification_channel_entity_1.ChannelType.IN_APP],
            [notification_entity_1.NotificationType.COMMUNITY]: [notification_channel_entity_1.ChannelType.IN_APP, notification_channel_entity_1.ChannelType.PUSH],
            [notification_entity_1.NotificationType.CHAT]: [notification_channel_entity_1.ChannelType.PUSH, notification_channel_entity_1.ChannelType.IN_APP],
            [notification_entity_1.NotificationType.MARKETING]: [notification_channel_entity_1.ChannelType.EMAIL],
        };
        return defaultChannels[type] || [notification_channel_entity_1.ChannelType.IN_APP];
    }
    getPriorityForNotificationType(type) {
        const priorities = {
            [notification_entity_1.NotificationType.THERAPY]: 'high',
            [notification_entity_1.NotificationType.ACCOUNT]: 'high',
            [notification_entity_1.NotificationType.SYSTEM]: 'medium',
            [notification_entity_1.NotificationType.CHAT]: 'medium',
            [notification_entity_1.NotificationType.COMMUNITY]: 'medium',
            [notification_entity_1.NotificationType.MARKETING]: 'low',
        };
        return priorities[type] || 'medium';
    }
    async markAsRead(id, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        notification.isRead = true;
        notification.readAt = new Date();
        return this.notificationRepository.save(notification);
    }
    async findOne(id) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['template', 'channel'],
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return notification;
    }
    async findAllForUser(userId, options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;
        const query = this.notificationRepository.createQueryBuilder('notification')
            .leftJoinAndSelect('notification.template', 'template')
            .leftJoinAndSelect('notification.channel', 'channel')
            .where('notification.userId = :userId', { userId });
        if (options.type) {
            query.andWhere('notification.type = :type', { type: options.type });
        }
        if (options.read !== undefined) {
            query.andWhere('notification.isRead = :read', { read: options.read });
        }
        const [notifications, total] = await query
            .orderBy('notification.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return { notifications, total };
    }
    async remove(id, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.notificationRepository.remove(notification);
    }
    async updateUserOnlineStatus(userId, isOnline) {
        let preferences = await this.preferenceRepository.findOne({
            where: { userId },
        });
        if (!preferences) {
            preferences = this.preferenceRepository.create({
                userId,
                isOnline: false,
            });
        }
        preferences.isOnline = isOnline;
        preferences.lastActivity = new Date();
        await this.preferenceRepository.save(preferences);
        this.logger.log(`Updated user ${userId} online status: ${isOnline}`);
    }
    getInAppAdapter() {
        return this.channelFactory.getChannel(notification_channel_entity_1.ChannelType.IN_APP);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.NotificationEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_channel_entity_1.NotificationChannelEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_template_entity_1.NotificationTemplateEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreferenceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService,
        config_1.ConfigService,
        auth_service_1.AuthService,
        notification_channel_factory_1.NotificationChannelFactory,
        notification_queue_service_1.NotificationQueueService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map
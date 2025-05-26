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
var NotificationQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const notification_entity_1 = require("../entities/notification.entity");
let NotificationQueueService = NotificationQueueService_1 = class NotificationQueueService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.logger = new common_1.Logger(NotificationQueueService_1.name);
        this.processingJobs = new Set();
        this.defaultOptions = {
            priority: 'medium',
            retryStrategy: {
                maxRetries: 3,
                backoffFactor: 2,
                initialDelay: 5000,
            },
        };
    }
    async enqueue(notification, options) {
        try {
            const queueOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
            notification.metadata = Object.assign(Object.assign({}, notification.metadata), { queue: {
                    priority: queueOptions.priority,
                    retryCount: 0,
                    maxRetries: queueOptions.retryStrategy.maxRetries,
                    nextRetryAt: queueOptions.delay
                        ? new Date(Date.now() + queueOptions.delay)
                        : null,
                    initialDelay: queueOptions.retryStrategy.initialDelay,
                    backoffFactor: queueOptions.retryStrategy.backoffFactor,
                    enqueuedAt: new Date(),
                } });
            if (queueOptions.delay) {
                notification.scheduledAt = new Date(Date.now() + queueOptions.delay);
            }
            await this.notificationRepository.save(notification);
            this.logger.log(`Notification ${notification.id} added to queue with priority ${queueOptions.priority}`);
            return notification.id;
        }
        catch (error) {
            this.logger.error(`Failed to enqueue notification: ${error.message}`);
            throw error;
        }
    }
    async processBatch(batchSize = 10) {
        var _a;
        try {
            const notifications = await this.getNextBatch(batchSize);
            if (notifications.length === 0) {
                return { processed: 0, successful: 0, failed: 0 };
            }
            let successful = 0;
            let failed = 0;
            for (const notification of notifications) {
                notification.status = notification_entity_1.NotificationStatus.PENDING;
                this.processingJobs.add(notification.id);
            }
            await this.notificationRepository.save(notifications);
            for (const notification of notifications) {
                try {
                    const success = Math.random() > 0.2;
                    if (success) {
                        notification.status = notification_entity_1.NotificationStatus.SENT;
                        notification.sentAt = new Date();
                        successful++;
                        this.logger.log(`Successfully processed notification ${notification.id}`);
                    }
                    else {
                        const queueInfo = (_a = notification.metadata) === null || _a === void 0 ? void 0 : _a.queue;
                        if (queueInfo && queueInfo.retryCount < queueInfo.maxRetries) {
                            const nextRetryDelay = queueInfo.initialDelay * Math.pow(queueInfo.backoffFactor, queueInfo.retryCount);
                            notification.metadata.queue.retryCount++;
                            notification.metadata.queue.nextRetryAt = new Date(Date.now() + nextRetryDelay);
                            notification.scheduledAt = new Date(Date.now() + nextRetryDelay);
                            notification.status = notification_entity_1.NotificationStatus.PENDING;
                            this.logger.log(`Scheduling retry ${queueInfo.retryCount + 1}/${queueInfo.maxRetries} ` +
                                `for notification ${notification.id} in ${nextRetryDelay}ms`);
                        }
                        else {
                            notification.status = notification_entity_1.NotificationStatus.FAILED;
                            notification.errorMessage = 'Max retry attempts reached';
                            failed++;
                            this.logger.warn(`Failed to process notification ${notification.id} after max retries`);
                        }
                    }
                }
                catch (error) {
                    notification.status = notification_entity_1.NotificationStatus.FAILED;
                    notification.errorMessage = error.message;
                    failed++;
                    this.logger.error(`Error processing notification ${notification.id}: ${error.message}`);
                }
                finally {
                    this.processingJobs.delete(notification.id);
                }
            }
            await this.notificationRepository.save(notifications);
            return {
                processed: notifications.length,
                successful,
                failed,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process notification batch: ${error.message}`);
            return { processed: 0, successful: 0, failed: 0 };
        }
    }
    async getStats() {
        try {
            const totalItems = await this.notificationRepository.count({
                where: [
                    { status: notification_entity_1.NotificationStatus.PENDING },
                    { status: notification_entity_1.NotificationStatus.FAILED },
                ],
            });
            const pendingItems = await this.notificationRepository.count({
                where: { status: notification_entity_1.NotificationStatus.PENDING },
            });
            const failedItems = await this.notificationRepository.count({
                where: { status: notification_entity_1.NotificationStatus.FAILED },
            });
            const highPriority = await this.notificationRepository.count({
                where: { status: notification_entity_1.NotificationStatus.PENDING },
                andWhere: "metadata->>'queue'->>'priority' = 'high'",
            });
            const mediumPriority = await this.notificationRepository.count({
                where: { status: notification_entity_1.NotificationStatus.PENDING },
                andWhere: "metadata->>'queue'->>'priority' = 'medium'",
            });
            const lowPriority = await this.notificationRepository.count({
                where: { status: notification_entity_1.NotificationStatus.PENDING },
                andWhere: "metadata->>'queue'->>'priority' = 'low'",
            });
            return {
                totalItems,
                processingItems: this.processingJobs.size,
                pendingItems,
                failedItems,
                averageProcessingTime: 500,
                itemsByPriority: {
                    high: highPriority,
                    medium: mediumPriority,
                    low: lowPriority,
                },
                itemsByChannel: {},
            };
        }
        catch (error) {
            this.logger.error(`Failed to get queue stats: ${error.message}`);
            return {
                totalItems: 0,
                processingItems: 0,
                pendingItems: 0,
                failedItems: 0,
                averageProcessingTime: 0,
                itemsByPriority: { high: 0, medium: 0, low: 0 },
                itemsByChannel: {},
            };
        }
    }
    async clear() {
        try {
            await this.notificationRepository.update({ status: notification_entity_1.NotificationStatus.PENDING }, { status: notification_entity_1.NotificationStatus.FAILED, errorMessage: 'Queue cleared' });
            this.logger.log('Notification queue cleared');
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to clear queue: ${error.message}`);
            return false;
        }
    }
    async getNextBatch(batchSize) {
        const now = new Date();
        const excludeIds = Array.from(this.processingJobs);
        const query = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.status = :status', { status: notification_entity_1.NotificationStatus.PENDING })
            .andWhere('(notification.scheduledAt IS NULL OR notification.scheduledAt <= :now)', { now })
            .orderBy("notification.metadata->>'queue'->>'priority'", 'ASC')
            .addOrderBy('notification.createdAt', 'ASC')
            .take(batchSize);
        if (excludeIds.length > 0) {
            query.andWhere('notification.id NOT IN (:...excludeIds)', { excludeIds });
        }
        return query.getMany();
    }
    async processQueue() {
        this.logger.debug('Processing notification queue');
        await this.processBatch(50);
    }
    async retryFailedNotifications() {
        var _a;
        this.logger.debug('Retrying failed notifications');
        try {
            const failedNotifications = await this.notificationRepository
                .createQueryBuilder('notification')
                .where('notification.status = :status', { status: notification_entity_1.NotificationStatus.FAILED })
                .andWhere("notification.metadata->>'queue'->>'retryCount' < notification.metadata->>'queue'->>'maxRetries'")
                .getMany();
            for (const notification of failedNotifications) {
                const queueInfo = (_a = notification.metadata) === null || _a === void 0 ? void 0 : _a.queue;
                if (queueInfo) {
                    const nextRetryDelay = queueInfo.initialDelay * Math.pow(queueInfo.backoffFactor, queueInfo.retryCount);
                    notification.metadata.queue.retryCount++;
                    notification.metadata.queue.nextRetryAt = new Date(Date.now() + nextRetryDelay);
                    notification.scheduledAt = new Date(Date.now() + nextRetryDelay);
                    notification.status = notification_entity_1.NotificationStatus.PENDING;
                    await this.notificationRepository.save(notification);
                    this.logger.log(`Scheduled retry ${queueInfo.retryCount}/${queueInfo.maxRetries} ` +
                        `for notification ${notification.id} in ${nextRetryDelay}ms`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to retry failed notifications: ${error.message}`);
        }
    }
};
exports.NotificationQueueService = NotificationQueueService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationQueueService.prototype, "processQueue", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationQueueService.prototype, "retryFailedNotifications", null);
exports.NotificationQueueService = NotificationQueueService = NotificationQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.NotificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationQueueService);
//# sourceMappingURL=notification-queue.service.js.map
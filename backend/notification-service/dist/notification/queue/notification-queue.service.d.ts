import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
export interface QueueOptions {
    priority?: 'high' | 'medium' | 'low';
    delay?: number;
    retryStrategy?: {
        maxRetries: number;
        backoffFactor: number;
        initialDelay: number;
    };
}
export interface QueueStats {
    totalItems: number;
    processingItems: number;
    pendingItems: number;
    failedItems: number;
    averageProcessingTime: number;
    itemsByPriority: {
        high: number;
        medium: number;
        low: number;
    };
    itemsByChannel: Record<string, number>;
}
export declare class NotificationQueueService {
    private notificationRepository;
    private readonly logger;
    private processingJobs;
    private readonly defaultOptions;
    constructor(notificationRepository: Repository<NotificationEntity>);
    enqueue(notification: NotificationEntity, options?: QueueOptions): Promise<string>;
    processBatch(batchSize?: number): Promise<{
        processed: number;
        successful: number;
        failed: number;
    }>;
    getStats(): Promise<QueueStats>;
    clear(): Promise<boolean>;
    private getNextBatch;
    processQueue(): Promise<void>;
    retryFailedNotifications(): Promise<void>;
}

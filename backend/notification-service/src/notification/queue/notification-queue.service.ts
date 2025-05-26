import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NotificationEntity, NotificationStatus } from '../entities/notification.entity';
import { ChannelType } from '../entities/notification-channel.entity';

export interface QueueOptions {
  priority?: 'high' | 'medium' | 'low';
  delay?: number; // Milliseconds to delay processing
  retryStrategy?: {
    maxRetries: number;
    backoffFactor: number;
    initialDelay: number; // Milliseconds
  };
}

export interface QueueStats {
  totalItems: number;
  processingItems: number;
  pendingItems: number;
  failedItems: number;
  averageProcessingTime: number; // Milliseconds
  itemsByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  itemsByChannel: Record<string, number>;
}

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);
  private processingJobs = new Set<string>();
  private readonly defaultOptions: QueueOptions = {
    priority: 'medium',
    retryStrategy: {
      maxRetries: 3,
      backoffFactor: 2,
      initialDelay: 5000, // 5 seconds
    },
  };

  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
  ) {}

  /**
   * Add a notification to the queue
   */
  async enqueue(
    notification: NotificationEntity,
    options?: QueueOptions
  ): Promise<string> {
    try {
      const queueOptions = { ...this.defaultOptions, ...options };
      
      // Set metadata related to queue
      notification.metadata = {
        ...notification.metadata,
        queue: {
          priority: queueOptions.priority,
          retryCount: 0,
          maxRetries: queueOptions.retryStrategy.maxRetries,
          nextRetryAt: queueOptions.delay 
            ? new Date(Date.now() + queueOptions.delay) 
            : null,
          initialDelay: queueOptions.retryStrategy.initialDelay,
          backoffFactor: queueOptions.retryStrategy.backoffFactor,
          enqueuedAt: new Date(),
        },
      };
      
      // If there's a delay, update the scheduled time
      if (queueOptions.delay) {
        notification.scheduledAt = new Date(Date.now() + queueOptions.delay);
      }
      
      // Save the notification with queue information
      await this.notificationRepository.save(notification);
      
      this.logger.log(`Notification ${notification.id} added to queue with priority ${queueOptions.priority}`);
      
      return notification.id;
    } catch (error) {
      this.logger.error(`Failed to enqueue notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process the next batch of notifications in the queue
   */
  async processBatch(batchSize: number = 10): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    try {
      // Find notifications that are ready to be processed
      const notifications = await this.getNextBatch(batchSize);
      
      if (notifications.length === 0) {
        return { processed: 0, successful: 0, failed: 0 };
      }
      
      let successful = 0;
      let failed = 0;
      
      // Mark notifications as processing
      for (const notification of notifications) {
        notification.status = NotificationStatus.PENDING;
        this.processingJobs.add(notification.id);
      }
      
      await this.notificationRepository.save(notifications);
      
      // Process each notification
      for (const notification of notifications) {
        try {
          // This would call the notification service to send the notification
          // For now, we'll just simulate success/failure
          const success = Math.random() > 0.2; // 80% success rate for simulation
          
          if (success) {
            notification.status = NotificationStatus.SENT;
            notification.sentAt = new Date();
            successful++;
            
            this.logger.log(`Successfully processed notification ${notification.id}`);
          } else {
            // Handle retry logic
            const queueInfo = notification.metadata?.queue;
            
            if (queueInfo && queueInfo.retryCount < queueInfo.maxRetries) {
              // Calculate next retry time with exponential backoff
              const nextRetryDelay = queueInfo.initialDelay * Math.pow(
                queueInfo.backoffFactor, 
                queueInfo.retryCount
              );
              
              // Update retry information
              notification.metadata.queue.retryCount++;
              notification.metadata.queue.nextRetryAt = new Date(Date.now() + nextRetryDelay);
              notification.scheduledAt = new Date(Date.now() + nextRetryDelay);
              notification.status = NotificationStatus.PENDING;
              
              this.logger.log(
                `Scheduling retry ${queueInfo.retryCount + 1}/${queueInfo.maxRetries} ` +
                `for notification ${notification.id} in ${nextRetryDelay}ms`
              );
            } else {
              // Max retries reached
              notification.status = NotificationStatus.FAILED;
              notification.errorMessage = 'Max retry attempts reached';
              failed++;
              
              this.logger.warn(`Failed to process notification ${notification.id} after max retries`);
            }
          }
        } catch (error) {
          notification.status = NotificationStatus.FAILED;
          notification.errorMessage = error.message;
          failed++;
          
          this.logger.error(`Error processing notification ${notification.id}: ${error.message}`);
        } finally {
          this.processingJobs.delete(notification.id);
        }
      }
      
      // Save the updated notifications
      await this.notificationRepository.save(notifications);
      
      return {
        processed: notifications.length,
        successful,
        failed,
      };
    } catch (error) {
      this.logger.error(`Failed to process notification batch: ${error.message}`);
      return { processed: 0, successful: 0, failed: 0 };
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    try {
      // Get total count
      const totalItems = await this.notificationRepository.count({
        where: [
          { status: NotificationStatus.PENDING },
          { status: NotificationStatus.FAILED },
        ],
      });
      
      // Get counts by status
      const pendingItems = await this.notificationRepository.count({
        where: { status: NotificationStatus.PENDING },
      });
      
      const failedItems = await this.notificationRepository.count({
        where: { status: NotificationStatus.FAILED },
      });
      
      // Get counts by priority
      const highPriority = await this.notificationRepository.count({
        where: { status: NotificationStatus.PENDING },
        andWhere: "metadata->>'queue'->>'priority' = 'high'",
      });
      
      const mediumPriority = await this.notificationRepository.count({
        where: { status: NotificationStatus.PENDING },
        andWhere: "metadata->>'queue'->>'priority' = 'medium'",
      });
      
      const lowPriority = await this.notificationRepository.count({
        where: { status: NotificationStatus.PENDING },
        andWhere: "metadata->>'queue'->>'priority' = 'low'",
      });
      
      // In a real implementation, we'd calculate average processing time
      // from historical data. For now, we'll use a placeholder.
      
      return {
        totalItems,
        processingItems: this.processingJobs.size,
        pendingItems,
        failedItems,
        averageProcessingTime: 500, // Placeholder
        itemsByPriority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
        itemsByChannel: {}, // Placeholder - would calculate in real implementation
      };
    } catch (error) {
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

  /**
   * Clear the queue
   */
  async clear(): Promise<boolean> {
    try {
      // Only clear pending notifications, not failed ones
      await this.notificationRepository.update(
        { status: NotificationStatus.PENDING },
        { status: NotificationStatus.FAILED, errorMessage: 'Queue cleared' }
      );
      
      this.logger.log('Notification queue cleared');
      return true;
    } catch (error) {
      this.logger.error(`Failed to clear queue: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the next batch of notifications to process
   */
  private async getNextBatch(batchSize: number): Promise<NotificationEntity[]> {
    // Query for high priority notifications first, then medium, then low
    // Also consider scheduled time and exclude already processing notifications
    const now = new Date();
    
    // Exclude notifications that are already being processed
    const excludeIds = Array.from(this.processingJobs);
    
    // Build the query
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.status = :status', { status: NotificationStatus.PENDING })
      .andWhere('(notification.scheduledAt IS NULL OR notification.scheduledAt <= :now)', { now })
      .orderBy("notification.metadata->>'queue'->>'priority'", 'ASC') // High is first (alphabetically)
      .addOrderBy('notification.createdAt', 'ASC')
      .take(batchSize);
    
    if (excludeIds.length > 0) {
      query.andWhere('notification.id NOT IN (:...excludeIds)', { excludeIds });
    }
    
    return query.getMany();
  }

  /**
   * Periodic job to process the queue
   * Runs every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processQueue() {
    this.logger.debug('Processing notification queue');
    await this.processBatch(50); // Process up to 50 notifications at a time
  }

  /**
   * Periodic job to retry failed notifications
   * Runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications() {
    this.logger.debug('Retrying failed notifications');
    
    try {
      // Find failed notifications that haven't reached max retries
      const failedNotifications = await this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.status = :status', { status: NotificationStatus.FAILED })
        .andWhere("notification.metadata->>'queue'->>'retryCount' < notification.metadata->>'queue'->>'maxRetries'")
        .getMany();
      
      for (const notification of failedNotifications) {
        const queueInfo = notification.metadata?.queue;
        
        if (queueInfo) {
          // Calculate next retry time with exponential backoff
          const nextRetryDelay = queueInfo.initialDelay * Math.pow(
            queueInfo.backoffFactor, 
            queueInfo.retryCount
          );
          
          // Update retry information
          notification.metadata.queue.retryCount++;
          notification.metadata.queue.nextRetryAt = new Date(Date.now() + nextRetryDelay);
          notification.scheduledAt = new Date(Date.now() + nextRetryDelay);
          notification.status = NotificationStatus.PENDING;
          
          await this.notificationRepository.save(notification);
          
          this.logger.log(
            `Scheduled retry ${queueInfo.retryCount}/${queueInfo.maxRetries} ` +
            `for notification ${notification.id} in ${nextRetryDelay}ms`
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to retry failed notifications: ${error.message}`);
    }
  }
} 
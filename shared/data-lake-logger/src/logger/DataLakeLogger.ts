import { S3Client } from '@aws-sdk/client-s3';
import { KMSClient, EncryptCommand } from '@aws-sdk/client-kms';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfDay } from 'date-fns';
import { createLogger, Logger, transports, format as winstonFormat } from 'winston';
import { gzip } from 'zlib';
import { promisify } from 'util';

import {
  DataLakeConfig,
  LogEntry,
  LogEntrySchema,
  DataLakeError,
  LoggingOptions,
} from '../types';
import { PIIDetector } from '../utils/PIIDetector';
import { ConsentManager } from '../utils/ConsentManager';

const gzipAsync = promisify(gzip);

export class DataLakeLogger {
  private s3Client: S3Client;
  private kmsClient: KMSClient;
  private logger: Logger;
  private config: DataLakeConfig;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout | undefined;
  private piiDetector: PIIDetector;
  private consentManager: ConsentManager;

  constructor(config: DataLakeConfig) {
    this.config = {
      enableLocalBuffer: true,
      bufferSize: 100,
      flushInterval: 30000, // 30 seconds
      enableCompression: true,
      enableEncryption: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    // Initialize AWS clients
    const awsConfig = {
      region: this.config.region,
      ...(this.config.accessKeyId && this.config.secretAccessKey ? {
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
          ...(this.config.sessionToken && { sessionToken: this.config.sessionToken }),
        }
      } : {}),
    };

    this.s3Client = new S3Client(awsConfig);
    this.kmsClient = new KMSClient(awsConfig);

    // Initialize utilities
    this.piiDetector = new PIIDetector();
    this.consentManager = new ConsentManager();

    // Initialize Winston logger for local logging
    this.logger = createLogger({
      level: 'info',
      format: winstonFormat.combine(
        winstonFormat.timestamp(),
        winstonFormat.errors({ stack: true }),
        winstonFormat.json()
      ),
      transports: [
        new transports.Console({
          format: winstonFormat.combine(
            winstonFormat.colorize(),
            winstonFormat.simple()
          ),
        }),
      ],
    });

    // Start flush timer if buffering is enabled
    if (this.config.enableLocalBuffer && this.config.flushInterval) {
      this.startFlushTimer();
    }

    // Graceful shutdown handling
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Log an entry to the data lake
   */
  async log(entry: LogEntry, options: LoggingOptions = {}): Promise<void> {
    try {
      // Validate schema if enabled
      if (options.validateSchema !== false) {
        const validationResult = LogEntrySchema.safeParse(entry);
        if (!validationResult.success) {
          throw new Error(`Invalid log entry schema: ${validationResult.error.message}`);
        }
      }

      // Check user consent for data processing
      if (entry.user_id) {
        const hasConsent = await this.consentManager.checkConsent(entry.user_id, 'consent_analytics');
        if (!hasConsent) {
          this.logger.warn(`User ${entry.user_id} has not consented to analytics logging`);
          return;
        }
      }

      // Process the entry
      let processedEntry = { ...entry };

      // Add timestamp if not present
      if (!processedEntry.timestamp) {
        processedEntry.timestamp = new Date().toISOString();
      }

      // Add custom fields
      if (options.customFields) {
        processedEntry = { ...processedEntry, ...options.customFields };
      }

      // Detect and handle PII
      if (options.enablePIIDetection !== false) {
        processedEntry = await this.piiDetector.detectAndAnonymize(processedEntry);
      }

      // Add to buffer or send immediately
      if (this.config.enableLocalBuffer) {
        this.buffer.push(processedEntry);
        
        // Flush if buffer is full
        if (this.buffer.length >= (this.config.bufferSize || 100)) {
          await this.flush();
        }
      } else {
        await this.sendToS3([processedEntry]);
      }

    } catch (error) {
      const dataLakeError: DataLakeError = {
        code: 'LOG_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        service: entry.service,
        timestamp: new Date().toISOString(),
        details: { originalEntry: entry, options },
      };

      this.logger.error('Failed to log entry to data lake', dataLakeError);
      
      // Re-throw for caller to handle
      throw error;
    }
  }

  /**
   * Log multiple entries at once
   */
  async logBatch(entries: LogEntry[], options: LoggingOptions = {}): Promise<void> {
    for (const entry of entries) {
      await this.log(entry, options);
    }
  }

  /**
   * Flush buffered logs to S3
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const entriesToFlush = [...this.buffer];
    this.buffer = [];

    try {
      await this.sendToS3(entriesToFlush);
      this.logger.info(`Flushed ${entriesToFlush.length} entries to data lake`);
    } catch (error) {
      // Put entries back in buffer for retry
      this.buffer.unshift(...entriesToFlush);
      throw error;
    }
  }

  /**
   * Send entries to S3
   */
  private async sendToS3(entries: LogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    // Group entries by service and date for optimal S3 structure
    const groupedEntries = this.groupEntriesByServiceAndDate(entries);

    const uploadPromises = Object.entries(groupedEntries).map(
      ([key, serviceEntries]) => this.uploadServiceEntries(key, serviceEntries)
    );

    await Promise.all(uploadPromises);
  }

  /**
   * Group entries by service and date
   */
  private groupEntriesByServiceAndDate(entries: LogEntry[]): Record<string, LogEntry[]> {
    const grouped: Record<string, LogEntry[]> = {};

    for (const entry of entries) {
      const date = startOfDay(new Date(entry.timestamp));
      const key = `${entry.service}-${format(date, 'yyyy-MM-dd')}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    }

    return grouped;
  }

  /**
   * Upload entries for a specific service and date
   */
  private async uploadServiceEntries(key: string, entries: LogEntry[]): Promise<void> {
    const [service, dateStr] = key.split('-');
    if (!service || !dateStr) {
      throw new Error(`Invalid key format: ${key}`);
    }
    
    const date = new Date(dateStr);
    
    // Create S3 key following the data lake structure
    const s3Key = this.generateS3Key(service, date, entries[0]?.user_id);
    
    // Prepare data
    let data = entries.map(entry => JSON.stringify(entry)).join('\n');
    
    // Compress if enabled
    if (this.config.enableCompression) {
      const compressed = await gzipAsync(Buffer.from(data, 'utf8'));
      data = compressed.toString('base64');
    }

    // Encrypt if enabled
    if (this.config.enableEncryption && this.config.kmsKeyId) {
      data = await this.encryptData(data);
    }

    // Upload to S3 with retry logic
    await this.uploadWithRetry(s3Key, data);
  }

  /**
   * Generate S3 key following data lake structure
   */
  private generateS3Key(service: string, date: Date, userId?: string): string {
    const year = format(date, 'yyyy');
    const month = format(date, 'MM');
    const day = format(date, 'dd');
    const timestamp = format(new Date(), 'HHmmss');
    const uuid = uuidv4().substring(0, 8);
    
    const filename = userId 
      ? `${userId}_${timestamp}_${uuid}.json${this.config.enableCompression ? '.gz' : ''}`
      : `${service}_${timestamp}_${uuid}.json${this.config.enableCompression ? '.gz' : ''}`;

    return `raw/${service}/${year}/${month}/${day}/${filename}`;
  }

  /**
   * Encrypt data using KMS
   */
  private async encryptData(data: string): Promise<string> {
    if (!this.config.kmsKeyId) {
      throw new Error('KMS key ID is required for encryption');
    }

    const command = new EncryptCommand({
      KeyId: this.config.kmsKeyId,
      Plaintext: Buffer.from(data, 'utf8'),
    });

    const result = await this.kmsClient.send(command);
    return Buffer.from(result.CiphertextBlob!).toString('base64');
  }

  /**
   * Upload to S3 with retry logic
   */
  private async uploadWithRetry(key: string, data: string): Promise<void> {
    let lastError: Error | null = null;
    const retryAttempts = this.config.retryAttempts || 3;
    const retryDelay = this.config.retryDelay || 1000;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.config.bucketName,
            Key: key,
            Body: data,
            ContentType: this.config.enableCompression ? 'application/gzip' : 'application/json',
            ServerSideEncryption: this.config.enableEncryption ? 'aws:kms' : undefined,
            SSEKMSKeyId: this.config.enableEncryption ? this.config.kmsKeyId : undefined,
            Metadata: {
              'mindlyf-data-lake': 'true',
              'upload-timestamp': new Date().toISOString(),
              'compression': this.config.enableCompression ? 'gzip' : 'none',
              'encryption': this.config.enableEncryption ? 'kms' : 'none',
            },
          },
        });

        await upload.done();
        this.logger.debug(`Successfully uploaded ${key} to S3`);
        return;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown upload error');
        this.logger.warn(`Upload attempt ${attempt} failed for ${key}: ${lastError.message}`);

        if (attempt < retryAttempts) {
          await this.delay(retryDelay * attempt);
        }
      }
    }

    throw new Error(`Failed to upload ${key} after ${retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      try {
        await this.flush();
      } catch (error) {
        this.logger.error('Failed to flush buffer', error);
      }
    }, this.config.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down DataLakeLogger...');
    
    this.stopFlushTimer();
    
    // Flush any remaining entries
    if (this.buffer.length > 0) {
      try {
        await this.flush();
        this.logger.info('Final flush completed');
      } catch (error) {
        this.logger.error('Failed to flush during shutdown', error);
      }
    }

    this.logger.info('DataLakeLogger shutdown complete');
  }

  /**
   * Get buffer status
   */
  getBufferStatus(): { size: number; maxSize: number } {
    return {
      size: this.buffer.length,
      maxSize: this.config.bufferSize || 100,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: Record<string, any> }> {
    try {
      // Test S3 connectivity
      const testKey = `health-check/${uuidv4()}.json`;
      const testData = JSON.stringify({ test: true, timestamp: new Date().toISOString() });
      
      await this.uploadWithRetry(testKey, testData);
      
      return {
        status: 'healthy',
        details: {
          bufferSize: this.buffer.length,
          maxBufferSize: this.config.bufferSize,
          s3Connectivity: 'ok',
          lastFlush: new Date().toISOString(),
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          bufferSize: this.buffer.length,
          maxBufferSize: this.config.bufferSize,
        },
      };
    }
  }
} 
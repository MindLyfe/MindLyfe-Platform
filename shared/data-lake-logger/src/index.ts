// Main exports for the MindLyfe Data Lake Logger
export { DataLakeLogger } from './logger/DataLakeLogger';
export { PIIDetector } from './utils/PIIDetector';
export { ConsentManager } from './utils/ConsentManager';

// Type exports
export * from './types';

// Re-export commonly used types for convenience
export type {
  DataLakeConfig,
  LogEntry,
  LoggingOptions,
  UserConsent,
  PIIField,
  TrainingDataEntry,
  EmbeddingData,
  AnalyticsExport,
  DataLakeError,
} from './types';

// Import the required types for the factory functions
import { DataLakeLogger } from './logger/DataLakeLogger';
import { DataLakeConfig } from './types';

// Factory function for easy logger creation
export function createDataLakeLogger(config: DataLakeConfig): DataLakeLogger {
  return new DataLakeLogger(config);
}

// Utility function to create a logger with environment-based configuration
export function createDataLakeLoggerFromEnv(): DataLakeLogger {
  const config: DataLakeConfig = {
    bucketName: process.env.DATA_LAKE_BUCKET_NAME || 'mindlyf-data-lake',
    region: process.env.AWS_REGION || 'us-east-1',
    ...(process.env.DATA_LAKE_KMS_KEY_ID && { kmsKeyId: process.env.DATA_LAKE_KMS_KEY_ID }),
    ...(process.env.AWS_ACCESS_KEY_ID && { accessKeyId: process.env.AWS_ACCESS_KEY_ID }),
    ...(process.env.AWS_SECRET_ACCESS_KEY && { secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }),
    ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN }),
    enableLocalBuffer: process.env.DATA_LAKE_ENABLE_BUFFER !== 'false',
    bufferSize: parseInt(process.env.DATA_LAKE_BUFFER_SIZE || '100'),
    flushInterval: parseInt(process.env.DATA_LAKE_FLUSH_INTERVAL || '30000'),
    enableCompression: process.env.DATA_LAKE_ENABLE_COMPRESSION !== 'false',
    enableEncryption: process.env.DATA_LAKE_ENABLE_ENCRYPTION !== 'false',
    retryAttempts: parseInt(process.env.DATA_LAKE_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.DATA_LAKE_RETRY_DELAY || '1000'),
  };

  return new DataLakeLogger(config);
}

// Version information
export const VERSION = '1.0.0';

// Default configuration
export const DEFAULT_CONFIG: Partial<DataLakeConfig> = {
  enableLocalBuffer: true,
  bufferSize: 100,
  flushInterval: 30000,
  enableCompression: true,
  enableEncryption: true,
  retryAttempts: 3,
  retryDelay: 1000,
};
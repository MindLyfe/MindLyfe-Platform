// Main exports for MindLyf AI Training Export Pipeline
export { TrainingDataExporter } from './exporters/TrainingDataExporter';
export type { ExportConfig, ExportStats } from './exporters/TrainingDataExporter';

// Re-export types from data lake logger for convenience
export type {
  TrainingDataEntry,
  LogEntry,
  UserConsent,
  DataLakeError,
} from '@mindlyf/data-lake-logger';

// Import the required types for the utility functions
import { TrainingDataExporter, ExportConfig, ExportStats } from './exporters/TrainingDataExporter';

// Utility functions for common export operations
export async function exportLastDays(
  days: number,
  services: string[] = ['lyfbot-service', 'ai-service', 'journal-service'],
  options: Partial<ExportConfig> = {}
): Promise<ExportStats> {
  return TrainingDataExporter.exportLastDays(days, services, options);
}

export async function exportDateRange(
  startDate: Date,
  endDate: Date,
  services: string[] = ['lyfbot-service', 'ai-service', 'journal-service'],
  options: Partial<ExportConfig> = {}
): Promise<ExportStats> {
  return TrainingDataExporter.exportDateRange(startDate, endDate, services, options);
}

// Version information
export const VERSION = '1.0.0';

// Default export configurations
export const DEFAULT_SERVICES = [
  'lyfbot-service',
  'ai-service', 
  'journal-service',
  'recommendation-service'
];

export const DEFAULT_EXPORT_CONFIG: Partial<ExportConfig> = {
  qualityThreshold: 0.6,
  maxTokens: 4096,
  includeMetadata: true,
  anonymizeData: true,
  filterCrisisContent: true,
  enableQualityScoring: true,
  outputPath: 'processed/training-data',
}; 
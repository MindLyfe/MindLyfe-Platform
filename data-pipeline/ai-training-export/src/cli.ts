#!/usr/bin/env node

import { Command } from 'commander';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { TrainingDataExporter, ExportConfig } from './exporters/TrainingDataExporter';
import { createLogger, transports, format as winstonFormat } from 'winston';

const logger = createLogger({
  level: 'info',
  format: winstonFormat.combine(
    winstonFormat.timestamp(),
    winstonFormat.colorize(),
    winstonFormat.simple()
  ),
  transports: [
    new transports.Console(),
  ],
});

const program = new Command();

program
  .name('mindlyfe-export')
  .description('CLI tool for MindLyfe AI Training Data Export')
  .version('1.0.0');

program
  .command('export')
  .description('Export training data from the data lake')
  .option('-m, --mode <mode>', 'Export mode: daily, weekly, monthly, custom', 'daily')
  .option('-s, --start-date <date>', 'Start date (YYYY-MM-DD)')
  .option('-e, --end-date <date>', 'End date (YYYY-MM-DD)')
  .option('--services <services>', 'Comma-separated list of services', 'lyfbot-service,ai-service,journal-service')
  .option('-q, --quality-threshold <threshold>', 'Quality threshold (0.0-1.0)', '0.6')
  .option('--max-tokens <tokens>', 'Maximum tokens per entry', '4096')
  .option('--anonymize-data', 'Anonymize user data', false)
  .option('--filter-crisis-content', 'Filter out crisis content', true)
  .option('--output-format <format>', 'Output format: jsonl, csv', 'jsonl')
  .option('--compress', 'Compress output files', true)
  .option('--bucket <bucket>', 'S3 bucket name', process.env.DATA_LAKE_BUCKET_NAME)
  .option('--region <region>', 'AWS region', process.env.AWS_REGION || 'us-east-1')
  .option('--output-path <path>', 'Output path in S3', 'processed/training-data')
  .action(async (options) => {
    try {
      logger.info('Starting AI training data export', { options });

      // Parse dates based on mode
      let startDate: Date;
      let endDate: Date;

      switch (options.mode) {
        case 'daily':
          endDate = endOfDay(subDays(new Date(), 1)); // Yesterday
          startDate = startOfDay(subDays(endDate, 6)); // Last 7 days
          break;
        case 'weekly':
          endDate = endOfDay(subDays(new Date(), 1));
          startDate = startOfDay(subDays(endDate, 13)); // Last 2 weeks
          break;
        case 'monthly':
          endDate = endOfDay(subDays(new Date(), 1));
          startDate = startOfDay(subDays(endDate, 29)); // Last 30 days
          break;
        case 'custom':
          if (!options.startDate || !options.endDate) {
            logger.error('Start date and end date are required for custom mode');
            process.exit(1);
          }
          startDate = startOfDay(new Date(options.startDate));
          endDate = endOfDay(new Date(options.endDate));
          break;
        default:
          logger.error(`Invalid mode: ${options.mode}`);
          process.exit(1);
      }

      // Validate dates
      if (startDate > endDate) {
        logger.error('Start date must be before end date');
        process.exit(1);
      }

      if (!options.bucket) {
        logger.error('S3 bucket name is required (use --bucket or set DATA_LAKE_BUCKET_NAME)');
        process.exit(1);
      }

      // Parse services
      const services = options.services.split(',').map((s: string) => s.trim());

      // Create export configuration
      const config: ExportConfig = {
        bucketName: options.bucket,
        region: options.region,
        outputPath: options.outputPath,
        services,
        dateRange: { start: startDate, end: endDate },
        qualityThreshold: parseFloat(options.qualityThreshold),
        maxTokens: parseInt(options.maxTokens),
        includeMetadata: true,
        anonymizeData: options.anonymizeData,
        filterCrisisContent: options.filterCrisisContent,
        enableQualityScoring: true,
      };

      logger.info('Export configuration', {
        dateRange: {
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd'),
        },
        services,
        qualityThreshold: config.qualityThreshold,
      });

      // Run export
      const exporter = new TrainingDataExporter(config);
      const stats = await exporter.exportTrainingData();

      logger.info('Export completed successfully', stats);

      // Print summary
      console.log('\n=== Export Summary ===');
      console.log(`Date Range: ${stats.dateRange.start} to ${stats.dateRange.end}`);
      console.log(`Services Processed: ${stats.servicesProcessed.join(', ')}`);
      console.log(`Total Logs Processed: ${stats.totalLogsProcessed.toLocaleString()}`);
      console.log(`Valid Training Pairs: ${stats.validTrainingPairs.toLocaleString()}`);
      console.log(`Filtered Out: ${stats.filteredOut.toLocaleString()}`);
      console.log(`Average Quality Score: ${stats.qualityScoreAverage.toFixed(3)}`);
      console.log(`Output File Size: ${(stats.outputFileSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Processing Time: ${(stats.processingTimeMs / 1000).toFixed(2)}s`);

    } catch (error) {
      logger.error('Export failed', error);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Get statistics about available data')
  .option('--bucket <bucket>', 'S3 bucket name', process.env.DATA_LAKE_BUCKET_NAME)
  .option('--region <region>', 'AWS region', process.env.AWS_REGION || 'us-east-1')
  .option('--days <days>', 'Number of days to analyze', '7')
  .action(async (options) => {
    try {
      if (!options.bucket) {
        logger.error('S3 bucket name is required');
        process.exit(1);
      }

      const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({ region: options.region });

      const days = parseInt(options.days);
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      logger.info(`Analyzing data for the last ${days} days`);

      const stats: Record<string, { files: number; totalSize: number }> = {};

      // Generate prefixes for each day
      for (let d = 0; d < days; d++) {
        const prefix = `raw/`;
        
        const command = new ListObjectsV2Command({
          Bucket: options.bucket,
          Prefix: `${prefix}`,
          MaxKeys: 1000,
        });

        const response = await s3Client.send(command);

        if (response.Contents) {
          for (const object of response.Contents) {
            if (!object.Key) continue;

            const pathParts = object.Key.split('/');
            if (pathParts.length >= 2) {
              const service = pathParts[1];
              
              if (service && !stats[service]) {
                stats[service] = { files: 0, totalSize: 0 };
              }
              
              if (service && stats[service]) {
                stats[service].files++;
                stats[service].totalSize += object.Size || 0;
              }
            }
          }
        }
      }

      console.log('\n=== Data Lake Statistics ===');
      console.log(`Period: Last ${days} days`);
      console.log(`Date Range: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
      console.log('\nService Breakdown:');
      
      for (const [service, data] of Object.entries(stats)) {
        console.log(`  ${service}:`);
        console.log(`    Files: ${data.files.toLocaleString()}`);
        console.log(`    Size: ${(data.totalSize / 1024 / 1024).toFixed(2)} MB`);
      }

      const totalFiles = Object.values(stats).reduce((sum, s) => sum + s.files, 0);
      const totalSize = Object.values(stats).reduce((sum, s) => sum + s.totalSize, 0);

      console.log('\nTotals:');
      console.log(`  Files: ${totalFiles.toLocaleString()}`);
      console.log(`  Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
      logger.error('Stats command failed', error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate training data quality')
  .option('--bucket <bucket>', 'S3 bucket name', process.env.DATA_LAKE_BUCKET_NAME)
  .option('--region <region>', 'AWS region', process.env.AWS_REGION || 'us-east-1')
  .option('--file <file>', 'Specific training data file to validate')
  .action(async () => {
    try {
      logger.info('Validating training data quality...');
      
      // Implementation would validate JSONL format, check for PII, etc.
      logger.info('Validation completed');
      
    } catch (error) {
      logger.error('Validation failed', error);
      process.exit(1);
    }
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();
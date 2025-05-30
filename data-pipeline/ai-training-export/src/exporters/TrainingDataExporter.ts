import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createLogger, Logger, transports, format as winstonFormat } from 'winston';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { DataLakeLogger, LogEntry, TrainingData } from '@mindlyfe/data-lake-logger';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export interface ExportConfig {
  bucketName: string;
  region: string;
  outputPath: string;
  services: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  qualityThreshold?: number;
  maxTokens?: number;
  includeMetadata?: boolean;
  anonymizeData?: boolean;
  filterCrisisContent?: boolean;
  enableQualityScoring?: boolean;
}

export interface ExportStats {
  totalLogsProcessed: number;
  validTrainingPairs: number;
  filteredOut: number;
  qualityScoreAverage: number;
  outputFileSize: number;
  processingTimeMs: number;
  servicesProcessed: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export class TrainingDataExporter {
  private s3Client: S3Client;
  private logger: Logger;
  private consentManager: ConsentManager;

  constructor(private config: ExportConfig) {
    this.s3Client = new S3Client({
      region: config.region,
    });

    this.consentManager = new ConsentManager();

    this.logger = createLogger({
      level: 'info',
      format: winstonFormat.combine(
        winstonFormat.timestamp(),
        winstonFormat.json()
      ),
      transports: [
        new transports.Console(),
      ],
    });
  }

  /**
   * Export training data for the specified date range and services
   */
  async exportTrainingData(): Promise<ExportStats> {
    const startTime = Date.now();
    this.logger.info('Starting training data export', {
      dateRange: this.config.dateRange,
      services: this.config.services,
      outputPath: this.config.outputPath,
    });

    const stats: ExportStats = {
      totalLogsProcessed: 0,
      validTrainingPairs: 0,
      filteredOut: 0,
      qualityScoreAverage: 0,
      outputFileSize: 0,
      processingTimeMs: 0,
      servicesProcessed: [],
      dateRange: {
        start: this.config.dateRange.start.toISOString(),
        end: this.config.dateRange.end.toISOString(),
      },
    };

    try {
      // Get eligible users for AI training
      const eligibleUsers = await this.consentManager.getEligibleUsersForAITraining();
      this.logger.info(`Found ${eligibleUsers.length} users eligible for AI training`);

      // Process each service
      const trainingData: TrainingDataEntry[] = [];
      
      for (const service of this.config.services) {
        this.logger.info(`Processing service: ${service}`);
        const serviceData = await this.processService(service, eligibleUsers);
        trainingData.push(...serviceData);
        stats.servicesProcessed.push(service);
      }

      // Apply quality filtering
      const filteredData = this.config.enableQualityScoring 
        ? this.applyQualityFiltering(trainingData)
        : trainingData;

      // Calculate statistics
      stats.totalLogsProcessed = trainingData.length;
      stats.validTrainingPairs = filteredData.length;
      stats.filteredOut = trainingData.length - filteredData.length;
      stats.qualityScoreAverage = this.calculateAverageQuality(filteredData);

      // Export to JSONL
      const outputKey = await this.exportToJSONL(filteredData);
      stats.outputFileSize = await this.getFileSize(outputKey);

      stats.processingTimeMs = Date.now() - startTime;

      this.logger.info('Training data export completed', stats);
      return stats;

    } catch (error) {
      this.logger.error('Training data export failed', error);
      throw error;
    }
  }

  /**
   * Process logs for a specific service
   */
  private async processService(service: string, eligibleUsers: string[]): Promise<TrainingDataEntry[]> {
    const trainingData: TrainingDataEntry[] = [];
    
    // Generate S3 prefixes for the date range
    const prefixes = this.generateS3Prefixes(service, this.config.dateRange.start, this.config.dateRange.end);
    
    for (const prefix of prefixes) {
      this.logger.debug(`Processing prefix: ${prefix}`);
      
      // List objects in S3
      const objects = await this.listS3Objects(prefix);
      
      for (const object of objects) {
        if (!object.Key) continue;
        
        try {
          // Download and parse log file
          const logs = await this.downloadAndParseLogs(object.Key);
          
          // Process logs for training data
          const serviceTrainingData = await this.extractTrainingData(logs, service, eligibleUsers);
          trainingData.push(...serviceTrainingData);
          
        } catch (error) {
          this.logger.warn(`Failed to process object ${object.Key}:`, error);
        }
      }
    }
    
    return trainingData;
  }

  /**
   * Generate S3 prefixes for the date range
   */
  private generateS3Prefixes(service: string, startDate: Date, endDate: Date): string[] {
    const prefixes: string[] = [];
    let currentDate = startOfDay(startDate);
    
    while (currentDate <= endDate) {
      const year = format(currentDate, 'yyyy');
      const month = format(currentDate, 'MM');
      const day = format(currentDate, 'dd');
      
      prefixes.push(`raw/${service}/${year}/${month}/${day}/`);
      currentDate = subDays(currentDate, -1); // Add one day
    }
    
    return prefixes;
  }

  /**
   * List objects in S3 with a given prefix
   */
  private async listS3Objects(prefix: string): Promise<any[]> {
    const objects: any[] = [];
    let continuationToken: string | undefined;
    
    do {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });
      
      const response = await this.s3Client.send(command);
      
      if (response.Contents) {
        objects.push(...response.Contents);
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    return objects;
  }

  /**
   * Download and parse logs from S3
   */
  private async downloadAndParseLogs(key: string): Promise<LogEntry[]> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });
    
    const response = await this.s3Client.send(command);
    
    if (!response.Body) {
      throw new Error(`No body in S3 response for key: ${key}`);
    }
    
    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body as any;
    
    for await (const chunk of reader) {
      chunks.push(chunk);
    }
    
    let data = Buffer.concat(chunks);
    
    // Decompress if needed
    if (key.endsWith('.gz')) {
      data = await gunzipAsync(data);
    }
    
    // Parse JSONL
    const logs: LogEntry[] = [];
    const lines = data.toString('utf8').split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const log = JSON.parse(line);
          logs.push(log);
        } catch (error) {
          this.logger.warn(`Failed to parse log line: ${line}`);
        }
      }
    }
    
    return logs;
  }

  /**
   * Extract training data from logs
   */
  private async extractTrainingData(
    logs: LogEntry[], 
    service: string, 
    eligibleUsers: string[]
  ): Promise<TrainingDataEntry[]> {
    const trainingData: TrainingDataEntry[] = [];
    
    for (const log of logs) {
      // Check if user is eligible for AI training
      if (log.user_id && !eligibleUsers.includes(log.user_id)) {
        continue;
      }
      
      // Extract training pairs based on service type
      const pairs = await this.extractServiceSpecificPairs(log, service);
      trainingData.push(...pairs);
    }
    
    return trainingData;
  }

  /**
   * Extract service-specific training pairs
   */
  private async extractServiceSpecificPairs(log: LogEntry, service: string): Promise<TrainingDataEntry[]> {
    const pairs: TrainingDataEntry[] = [];
    
    switch (service) {
      case 'lyfbot-service':
        if ('prompt' in log && 'response' in log && log.prompt && log.response) {
          // Filter crisis content if enabled
          if (this.config.filterCrisisContent && 'crisis_detected' in log && log.crisis_detected) {
            break;
          }
          
          const qualityScore = this.calculateQualityScore(log.prompt, log.response);
          pairs.push({
            id: uuidv4(),
            prompt: log.prompt,
            completion: log.response,
            source: 'lyfbot',
            timestamp: log.timestamp,
            quality_score: qualityScore,
            ...(this.config.anonymizeData ? {} : log.user_id ? { user_id: log.user_id } : {}),
            metadata: {
              source: 'lyfbot',
              user_id: this.config.anonymizeData ? undefined : log.user_id,
              timestamp: log.timestamp,
              quality_score: qualityScore,
              tags: ['conversation', 'mental-health', 'support'],
            },
          });
        }
        break;
        
      case 'ai-service':
        if ('prompt' in log && 'response' in log && log.prompt && log.response) {
          const qualityScore = this.calculateQualityScore(log.prompt, log.response);
          pairs.push({
            id: uuidv4(),
            prompt: log.prompt,
            completion: log.response,
            source: 'ai-service',
            timestamp: log.timestamp,
            quality_score: qualityScore,
            ...(this.config.anonymizeData ? {} : log.user_id ? { user_id: log.user_id } : {}),
            metadata: {
              source: 'ai-service',
              user_id: this.config.anonymizeData ? undefined : log.user_id,
              timestamp: log.timestamp,
              quality_score: qualityScore,
              tags: ['ai-interaction', 'general'],
            },
          });
        }
        break;
        
      case 'journal-service':
        if ('entry_content' in log && log.entry_content) {
          // Create training pairs from journal entries and analysis
          if ('analysis_results' in log && log.analysis_results) {
            const analysis = log.analysis_results as any;
            if (analysis.insights) {
              const qualityScore = this.calculateQualityScore(log.entry_content, analysis.insights);
              pairs.push({
                id: uuidv4(),
                prompt: `Analyze this journal entry: ${log.entry_content}`,
                completion: analysis.insights,
                source: 'journal',
                timestamp: log.timestamp,
                quality_score: qualityScore,
                ...(this.config.anonymizeData ? {} : log.user_id ? { user_id: log.user_id } : {}),
                metadata: {
                  source: 'journal',
                  user_id: this.config.anonymizeData ? undefined : log.user_id,
                  timestamp: log.timestamp,
                  quality_score: qualityScore,
                  tags: ['journal', 'analysis', 'reflection'],
                },
              });
            }
          }
        }
        break;
        
      case 'recommendation-service':
        if ('recommendation_type' in log && 'user_feedback' in log && log.user_feedback === 'positive') {
          // Use positive recommendations as training data
          const qualityScore = 0.8; // Positive feedback indicates good quality
          pairs.push({
            id: uuidv4(),
            prompt: `Recommend ${log.recommendation_type} for mental health support`,
            completion: `Based on your profile, I recommend this ${log.recommendation_type}`,
            source: 'recommendations',
            timestamp: log.timestamp,
            quality_score: qualityScore,
            ...(this.config.anonymizeData ? {} : log.user_id ? { user_id: log.user_id } : {}),
            metadata: {
              source: 'recommendations',
              user_id: this.config.anonymizeData ? undefined : log.user_id,
              timestamp: log.timestamp,
              quality_score: qualityScore,
              tags: ['recommendations', 'personalization'],
            },
          });
        }
        break;
    }
    
    return pairs;
  }

  /**
   * Calculate quality score for a prompt-completion pair
   */
  private calculateQualityScore(prompt: string, completion: string): number {
    let score = 0.5; // Base score
    
    // Length checks
    if (prompt.length > 10 && prompt.length < 1000) score += 0.1;
    if (completion.length > 20 && completion.length < 2000) score += 0.1;
    
    // Content quality checks
    if (completion.includes('I understand') || completion.includes('I can help')) score += 0.1;
    if (!completion.includes('I don\'t know') && !completion.includes('I can\'t help')) score += 0.1;
    
    // Avoid repetitive content
    const words = completion.split(' ');
    const uniqueWords = new Set(words);
    if (uniqueWords.size / words.length > 0.7) score += 0.1;
    
    // Check for appropriate mental health language
    const positiveIndicators = ['support', 'understand', 'help', 'care', 'listen', 'validate'];
    const hasPositiveLanguage = positiveIndicators.some(word => 
      completion.toLowerCase().includes(word)
    );
    if (hasPositiveLanguage) score += 0.1;
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Apply quality filtering to training data
   */
  private applyQualityFiltering(data: TrainingDataEntry[]): TrainingDataEntry[] {
    const threshold = this.config.qualityThreshold || 0.6;
    
    return data.filter(entry => {
      if (!entry.metadata?.quality_score) return true;
      return entry.metadata.quality_score >= threshold;
    });
  }

  /**
   * Calculate average quality score
   */
  private calculateAverageQuality(data: TrainingDataEntry[]): number {
    const scores = data
      .map(entry => entry.metadata?.quality_score)
      .filter((score): score is number => typeof score === 'number');
    
    if (scores.length === 0) return 0;
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Export training data to JSONL format
   */
  private async exportToJSONL(data: TrainingDataEntry[]): Promise<string> {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const filename = `ai_training_data_${timestamp}_${uuidv4().substring(0, 8)}.jsonl`;
    const key = `${this.config.outputPath}/${filename}`;
    
    // Convert to JSONL
    const jsonlContent = data
      .map(entry => JSON.stringify(entry))
      .join('\n');
    
    // Compress
    const compressedContent = await gzipAsync(Buffer.from(jsonlContent, 'utf8'));
    
    // Upload to S3
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.config.bucketName,
        Key: `${key}.gz`,
        Body: compressedContent,
        ContentType: 'application/gzip',
        Metadata: {
          'mindlyf-export': 'ai-training-data',
          'export-timestamp': new Date().toISOString(),
          'record-count': data.length.toString(),
          'services': this.config.services.join(','),
        },
      },
    });
    
    await upload.done();
    
    this.logger.info(`Exported ${data.length} training records to ${key}.gz`);
    return `${key}.gz`;
  }

  /**
   * Get file size from S3
   */
  private async getFileSize(key: string): Promise<number> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: key,
      });
      
      const response = await this.s3Client.send(command);
      
      if (response.Contents && response.Contents.length > 0) {
        const firstObject = response.Contents[0];
        if (firstObject) {
          return firstObject.Size || 0;
        }
      }
      
      return 0;
    } catch (error) {
      this.logger.warn(`Failed to get file size for ${key}:`, error);
      return 0;
    }
  }

  /**
   * Export training data for a specific date range
   */
  static async exportDateRange(
    startDate: Date,
    endDate: Date,
    services: string[] = ['lyfbot-service', 'ai-service', 'journal-service'],
    options: Partial<ExportConfig> = {}
  ): Promise<ExportStats> {
    const config: ExportConfig = {
      bucketName: process.env.DATA_LAKE_BUCKET_NAME || 'mindlyf-data-lake',
      region: process.env.AWS_REGION || 'us-east-1',
      outputPath: 'processed/training-data',
      services,
      dateRange: { start: startDate, end: endDate },
      qualityThreshold: 0.6,
      maxTokens: 4096,
      includeMetadata: true,
      anonymizeData: true,
      filterCrisisContent: true,
      enableQualityScoring: true,
      ...options,
    };
    
    const exporter = new TrainingDataExporter(config);
    return await exporter.exportTrainingData();
  }

  /**
   * Export training data for the last N days
   */
  static async exportLastDays(
    days: number,
    services: string[] = ['lyfbot-service', 'ai-service', 'journal-service'],
    options: Partial<ExportConfig> = {}
  ): Promise<ExportStats> {
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days));
    
    return this.exportDateRange(startDate, endDate, services, options);
  }
}
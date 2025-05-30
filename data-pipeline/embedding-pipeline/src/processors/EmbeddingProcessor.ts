import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createLogger, Logger, transports, format as winstonFormat } from 'winston';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { ConsentManager, LogEntry, EmbeddingData } from '@mindlyfe/data-lake-logger';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export interface EmbeddingConfig {
  bucketName: string;
  region: string;
  outputPath: string;
  services: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  batchSize: number;
  vectorDatabase: 'qdrant' | 'weaviate' | 's3-only';
  backupToS3: boolean;
  filterByConsent: boolean;
}

export interface EmbeddingStats {
  totalTextsProcessed: number;
  totalChunks: number;
  totalEmbeddings: number;
  averageChunkSize: number;
  processingTimeMs: number;
  servicesProcessed: string[];
  vectorsStored: number;
  backupFileSize: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TextChunk {
  id: string;
  text: string;
  source: string;
  userId?: string;
  timestamp: string;
  metadata: Record<string, any>;
  tokenCount: number;
}

export class EmbeddingProcessor {
  private s3Client: S3Client;
  private openai: OpenAI;
  private logger: Logger;
  private consentManager: ConsentManager;

  constructor(private config: EmbeddingConfig) {
    this.s3Client = new S3Client({
      region: config.region,
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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
   * Process embeddings for the configured date range and services
   */
  async processEmbeddings(): Promise<EmbeddingStats> {
    const startTime = Date.now();
    this.logger.info('Starting embedding processing', {
      dateRange: this.config.dateRange,
      services: this.config.services,
      embeddingModel: this.config.embeddingModel,
    });

    const stats: EmbeddingStats = {
      totalTextsProcessed: 0,
      totalChunks: 0,
      totalEmbeddings: 0,
      averageChunkSize: 0,
      processingTimeMs: 0,
      servicesProcessed: [],
      vectorsStored: 0,
      backupFileSize: 0,
      dateRange: {
        start: this.config.dateRange.start.toISOString(),
        end: this.config.dateRange.end.toISOString(),
      },
    };

    try {
      // Get eligible users if consent filtering is enabled
      let eligibleUsers: string[] = [];
      if (this.config.filterByConsent) {
        eligibleUsers = await this.consentManager.getEligibleUsersForAITraining();
        this.logger.info(`Found ${eligibleUsers.length} users eligible for embedding processing`);
      }

      // Process each service
      const allEmbeddings: EmbeddingData[] = [];
      
      for (const service of this.config.services) {
        this.logger.info(`Processing service: ${service}`);
        const serviceEmbeddings = await this.processService(service, eligibleUsers);
        allEmbeddings.push(...serviceEmbeddings);
        stats.servicesProcessed.push(service);
      }

      // Calculate statistics
      stats.totalTextsProcessed = allEmbeddings.length;
      stats.totalChunks = allEmbeddings.length; // Each embedding represents one chunk
      stats.totalEmbeddings = allEmbeddings.length;
      stats.averageChunkSize = this.calculateAverageChunkSize(allEmbeddings);

      // Store embeddings in vector database
      if (this.config.vectorDatabase !== 's3-only') {
        stats.vectorsStored = await this.storeInVectorDatabase(allEmbeddings);
      }

      // Backup to S3 if enabled
      if (this.config.backupToS3) {
        const backupKey = await this.backupToS3(allEmbeddings);
        stats.backupFileSize = await this.getFileSize(backupKey);
      }

      stats.processingTimeMs = Date.now() - startTime;

      this.logger.info('Embedding processing completed', stats);
      return stats;

    } catch (error) {
      this.logger.error('Embedding processing failed', error);
      throw error;
    }
  }

  /**
   * Process embeddings for a specific service
   */
  private async processService(service: string, eligibleUsers: string[]): Promise<EmbeddingData[]> {
    const embeddings: EmbeddingData[] = [];
    
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
          
          // Extract text chunks from logs
          const chunks = await this.extractTextChunks(logs, service, eligibleUsers);
          
          // Process chunks in batches
          const batchEmbeddings = await this.processBatches(chunks);
          embeddings.push(...batchEmbeddings);
          
        } catch (error) {
          this.logger.warn(`Failed to process object ${object.Key}:`, error);
        }
      }
    }
    
    return embeddings;
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
   * Extract text chunks from logs
   */
  private async extractTextChunks(
    logs: LogEntry[], 
    service: string, 
    eligibleUsers: string[]
  ): Promise<TextChunk[]> {
    const chunks: TextChunk[] = [];
    
    for (const log of logs) {
      // Check if user is eligible if consent filtering is enabled
      if (this.config.filterByConsent && log.user_id && !eligibleUsers.includes(log.user_id)) {
        continue;
      }
      
      // Extract text based on service type
      const serviceChunks = await this.extractServiceSpecificText(log, service);
      chunks.push(...serviceChunks);
    }
    
    return chunks;
  }

  /**
   * Extract service-specific text for embedding
   */
  private async extractServiceSpecificText(log: LogEntry, service: string): Promise<TextChunk[]> {
    const chunks: TextChunk[] = [];
    
    switch (service) {
      case 'lyfbot-service':
        if ('prompt' in log && 'response' in log && log.prompt && log.response) {
          // Create chunks for both prompt and response
          chunks.push(
            this.createTextChunk(log.prompt, 'lyfbot-prompt', log),
            this.createTextChunk(log.response, 'lyfbot-response', log)
          );
        }
        break;
        
      case 'journal-service':
        if ('entry_content' in log && log.entry_content) {
          // Split long journal entries into chunks
          const journalChunks = this.splitTextIntoChunks(log.entry_content);
          for (const chunk of journalChunks) {
            chunks.push(this.createTextChunk(chunk, 'journal-entry', log));
          }
        }
        break;
        
      case 'chat-service':
        if ('message_type' in log && log.message_type === 'text' && 'message_content' in log) {
          chunks.push(this.createTextChunk(log.message_content as string, 'chat-message', log));
        }
        break;
        
      case 'community-service':
        if ('content_type' in log && log.content_type === 'post' && 'content' in log) {
          chunks.push(this.createTextChunk(log.content as string, 'community-post', log));
        }
        break;
    }
    
    return chunks;
  }

  /**
   * Create a text chunk from extracted text
   */
  private createTextChunk(text: string, source: string, log: LogEntry): TextChunk {
    return {
      id: uuidv4(),
      text,
      source,
      timestamp: log.timestamp,
      tokenCount: this.countTokens(text),
      ...(log.user_id ? { userId: log.user_id } : {}),
      metadata: {
        service: log.service,
        interaction_type: log.interaction_type,
        session_id: log.session_id,
      },
    };
  }

  /**
   * Split text into chunks with overlap
   */
  private splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    const chunkSize = this.config.chunkSize;
    const overlap = this.config.chunkOverlap;
    
    // Simple character-based chunking
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize);
      chunks.push(chunk);
      
      if (i + chunkSize >= text.length) break;
    }
    
    return chunks;
  }

  /**
   * Count tokens in text (simplified approximation)
   */
  private countTokens(text: string): number {
    // Simple approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Process chunks in batches to create embeddings
   */
  private async processBatches(chunks: TextChunk[]): Promise<EmbeddingData[]> {
    const embeddings: EmbeddingData[] = [];
    
    for (let i = 0; i < chunks.length; i += this.config.batchSize) {
      const batch = chunks.slice(i, i + this.config.batchSize);
      const batchEmbeddings = await this.createEmbeddings(batch);
      embeddings.push(...batchEmbeddings);
      
      // Add delay to respect rate limits
      if (i + this.config.batchSize < chunks.length) {
        await this.delay(100); // 100ms delay between batches
      }
    }
    
    return embeddings;
  }

  /**
   * Create embeddings for a batch of text chunks
   */
  private async createEmbeddings(chunks: TextChunk[]): Promise<EmbeddingData[]> {
    try {
      const texts = chunks.map(chunk => chunk.text);
      
      const response = await this.openai.embeddings.create({
        model: this.config.embeddingModel,
        input: texts,
      });

      return chunks.map((chunk, index) => ({
        user_id: chunk.userId || 'anonymous',
        text: chunk.text,
        embedding: response.data[index].embedding,
        source: chunk.source,
        timestamp: chunk.timestamp,
        metadata: {
          ...chunk.metadata,
          chunk_id: chunk.id,
          token_count: chunk.tokenCount,
          embedding_model: this.config.embeddingModel,
        },
      }));

    } catch (error) {
      this.logger.error('Failed to create embeddings for batch', error);
      throw error;
    }
  }

  /**
   * Store embeddings in vector database
   */
  private async storeInVectorDatabase(embeddings: EmbeddingData[]): Promise<number> {
    // This would integrate with Qdrant or Weaviate
    // For now, return the count as if stored
    this.logger.info(`Would store ${embeddings.length} embeddings in ${this.config.vectorDatabase}`);
    return embeddings.length;
  }

  /**
   * Backup embeddings to S3
   */
  private async backupToS3(embeddings: EmbeddingData[]): Promise<string> {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const filename = `embeddings_backup_${timestamp}_${uuidv4().substring(0, 8)}.json`;
    const key = `${this.config.outputPath}/${filename}`;
    
    // Convert to JSON
    const jsonContent = JSON.stringify(embeddings, null, 2);
    
    // Compress
    const compressedContent = await gzipAsync(Buffer.from(jsonContent, 'utf8'));
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: `${key}.gz`,
      Body: compressedContent,
      ContentType: 'application/gzip',
      Metadata: {
        'mindlyf-embeddings': 'backup',
        'backup-timestamp': new Date().toISOString(),
        'embedding-count': embeddings.length.toString(),
        'embedding-model': this.config.embeddingModel,
      },
    });
    
    await this.s3Client.send(command);
    
    this.logger.info(`Backed up ${embeddings.length} embeddings to ${key}.gz`);
    return `${key}.gz`;
  }

  /**
   * Calculate average chunk size
   */
  private calculateAverageChunkSize(embeddings: EmbeddingData[]): number {
    if (embeddings.length === 0) return 0;
    
    const totalTokens = embeddings.reduce((sum, emb) => 
      sum + (emb.metadata?.token_count || 0), 0
    );
    
    return totalTokens / embeddings.length;
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
        return response.Contents[0].Size || 0;
      }
      
      return 0;
    } catch (error) {
      this.logger.warn(`Failed to get file size for ${key}:`, error);
      return 0;
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Static method to process embeddings for a date range
   */
  static async processDateRange(
    startDate: Date,
    endDate: Date,
    services: string[] = ['lyfbot-service', 'journal-service', 'chat-service'],
    options: Partial<EmbeddingConfig> = {}
  ): Promise<EmbeddingStats> {
    const config: EmbeddingConfig = {
      bucketName: process.env.DATA_LAKE_BUCKET_NAME || 'mindlyf-data-lake',
      region: process.env.AWS_REGION || 'us-east-1',
      outputPath: 'embeddings',
      services,
      dateRange: { start: startDate, end: endDate },
      embeddingModel: 'text-embedding-ada-002',
      chunkSize: 1000,
      chunkOverlap: 200,
      batchSize: 100,
      vectorDatabase: 'qdrant',
      backupToS3: true,
      filterByConsent: true,
      ...options,
    };
    
    const processor = new EmbeddingProcessor(config);
    return await processor.processEmbeddings();
  }

  /**
   * Static method to process embeddings for the last N days
   */
  static async processLastDays(
    days: number,
    services: string[] = ['lyfbot-service', 'journal-service', 'chat-service'],
    options: Partial<EmbeddingConfig> = {}
  ): Promise<EmbeddingStats> {
    const endDate = endOfDay(subDays(new Date(), 1));
    const startDate = startOfDay(subDays(endDate, days - 1));
    
    return this.processDateRange(startDate, endDate, services, options);
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

export interface UploadOptions {
  filePath: string;
  bucket: string;
  key: string;
  metadata?: Record<string, any>;
  contentType?: string;
  acl?: 'private' | 'public-read';
  expiresIn?: number;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  metadata: Record<string, any>;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    // Initialize AWS S3 client
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
      endpoint: this.configService.get<string>('AWS_ENDPOINT'),
      s3ForcePathStyle: true, // Required for custom endpoints
    });

    // Ensure required configuration is present
    if (!this.configService.get<string>('AWS_ACCESS_KEY_ID') ||
        !this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
        !this.configService.get<string>('AWS_REGION')) {
      this.logger.warn('AWS credentials not fully configured. Storage operations may fail.');
    }
  }

  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    try {
      const {
        filePath,
        bucket,
        key,
        metadata = {},
        contentType,
        acl = 'private',
        expiresIn,
      } = options;

      // Read file
      const fileStream = fs.createReadStream(filePath);
      const fileStats = fs.statSync(filePath);

      // Determine content type if not provided
      const detectedContentType = contentType || mime.lookup(filePath) || 'application/octet-stream';

      // Prepare upload parameters
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: detectedContentType,
        ContentLength: fileStats.size,
        Metadata: metadata,
        ACL: acl,
      };

      // Add expiration if specified
      if (expiresIn) {
        uploadParams.Expires = new Date(Date.now() + expiresIn * 1000);
      }

      // Upload file
      const result = await this.s3.upload(uploadParams).promise();

      this.logger.log(`Successfully uploaded file to ${bucket}/${key}`);

      return {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        metadata: {
          ...metadata,
          contentType: detectedContentType,
          size: fileStats.size,
          uploadTime: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${options.filePath}:`, error);
      throw error;
    }
  }

  async downloadFile(bucket: string, key: string, destinationPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const dir = path.dirname(destinationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Download file
      const result = await this.s3.getObject({
        Bucket: bucket,
        Key: key,
      }).promise();

      // Write to file
      fs.writeFileSync(destinationPath, result.Body as Buffer);

      this.logger.log(`Successfully downloaded file from ${bucket}/${key}`);
    } catch (error) {
      this.logger.error(`Failed to download file ${bucket}/${key}:`, error);
      throw error;
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      await this.s3.deleteObject({
        Bucket: bucket,
        Key: key,
      }).promise();

      this.logger.log(`Successfully deleted file ${bucket}/${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${bucket}/${key}:`, error);
      throw error;
    }
  }

  async getSignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const url = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: expiresIn,
      });

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for ${bucket}/${key}:`, error);
      throw error;
    }
  }

  async listFiles(bucket: string, prefix?: string): Promise<AWS.S3.ObjectList> {
    try {
      const result = await this.s3.listObjectsV2({
        Bucket: bucket,
        Prefix: prefix,
      }).promise();

      return result.Contents || [];
    } catch (error) {
      this.logger.error(`Failed to list files in ${bucket}:`, error);
      throw error;
    }
  }

  async getFileMetadata(bucket: string, key: string): Promise<AWS.S3.HeadObjectOutput> {
    try {
      const result = await this.s3.headObject({
        Bucket: bucket,
        Key: key,
      }).promise();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get metadata for ${bucket}/${key}:`, error);
      throw error;
    }
  }

  async copyFile(
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string,
  ): Promise<void> {
    try {
      await this.s3.copyObject({
        Bucket: destinationBucket,
        Key: destinationKey,
        CopySource: `${sourceBucket}/${sourceKey}`,
      }).promise();

      this.logger.log(`Successfully copied file from ${sourceBucket}/${sourceKey} to ${destinationBucket}/${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to copy file from ${sourceBucket}/${sourceKey}:`, error);
      throw error;
    }
  }

  async createBucket(bucket: string, region?: string): Promise<void> {
    try {
      await this.s3.createBucket({
        Bucket: bucket,
        CreateBucketConfiguration: region ? { LocationConstraint: region } : undefined,
      }).promise();

      // Configure bucket settings
      await this.s3.putBucketCors({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      }).promise();

      this.logger.log(`Successfully created bucket ${bucket}`);
    } catch (error) {
      this.logger.error(`Failed to create bucket ${bucket}:`, error);
      throw error;
    }
  }

  async deleteBucket(bucket: string): Promise<void> {
    try {
      // List and delete all objects
      const objects = await this.listFiles(bucket);
      if (objects.length > 0) {
        await this.s3.deleteObjects({
          Bucket: bucket,
          Delete: {
            Objects: objects.map(obj => ({ Key: obj.Key! })),
          },
        }).promise();
      }

      // Delete bucket
      await this.s3.deleteBucket({ Bucket: bucket }).promise();

      this.logger.log(`Successfully deleted bucket ${bucket}`);
    } catch (error) {
      this.logger.error(`Failed to delete bucket ${bucket}:`, error);
      throw error;
    }
  }
} 
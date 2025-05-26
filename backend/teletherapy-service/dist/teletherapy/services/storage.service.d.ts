import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
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
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private s3;
    constructor(configService: ConfigService);
    uploadFile(options: UploadOptions): Promise<UploadResult>;
    downloadFile(bucket: string, key: string, destinationPath: string): Promise<void>;
    deleteFile(bucket: string, key: string): Promise<void>;
    getSignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>;
    listFiles(bucket: string, prefix?: string): Promise<AWS.S3.ObjectList>;
    getFileMetadata(bucket: string, key: string): Promise<AWS.S3.HeadObjectOutput>;
    copyFile(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void>;
    createBucket(bucket: string, region?: string): Promise<void>;
    deleteBucket(bucket: string): Promise<void>;
}

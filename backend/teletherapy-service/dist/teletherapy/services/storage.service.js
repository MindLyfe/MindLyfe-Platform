"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.s3 = new AWS.S3({
            accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            region: this.configService.get('AWS_REGION'),
            endpoint: this.configService.get('AWS_ENDPOINT'),
            s3ForcePathStyle: true,
        });
        if (!this.configService.get('AWS_ACCESS_KEY_ID') ||
            !this.configService.get('AWS_SECRET_ACCESS_KEY') ||
            !this.configService.get('AWS_REGION')) {
            this.logger.warn('AWS credentials not fully configured. Storage operations may fail.');
        }
    }
    async uploadFile(options) {
        try {
            const { filePath, bucket, key, metadata = {}, contentType, acl = 'private', expiresIn, } = options;
            const fileStream = fs.createReadStream(filePath);
            const fileStats = fs.statSync(filePath);
            const detectedContentType = contentType || mime.lookup(filePath) || 'application/octet-stream';
            const uploadParams = {
                Bucket: bucket,
                Key: key,
                Body: fileStream,
                ContentType: detectedContentType,
                ContentLength: fileStats.size,
                Metadata: metadata,
                ACL: acl,
            };
            if (expiresIn) {
                uploadParams.Expires = new Date(Date.now() + expiresIn * 1000);
            }
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
        }
        catch (error) {
            this.logger.error(`Failed to upload file ${options.filePath}:`, error);
            throw error;
        }
    }
    async downloadFile(bucket, key, destinationPath) {
        try {
            const dir = path.dirname(destinationPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const result = await this.s3.getObject({
                Bucket: bucket,
                Key: key,
            }).promise();
            fs.writeFileSync(destinationPath, result.Body);
            this.logger.log(`Successfully downloaded file from ${bucket}/${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to download file ${bucket}/${key}:`, error);
            throw error;
        }
    }
    async deleteFile(bucket, key) {
        try {
            await this.s3.deleteObject({
                Bucket: bucket,
                Key: key,
            }).promise();
            this.logger.log(`Successfully deleted file ${bucket}/${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file ${bucket}/${key}:`, error);
            throw error;
        }
    }
    async getSignedUrl(bucket, key, expiresIn = 3600) {
        try {
            const url = await this.s3.getSignedUrlPromise('getObject', {
                Bucket: bucket,
                Key: key,
                Expires: expiresIn,
            });
            return url;
        }
        catch (error) {
            this.logger.error(`Failed to generate signed URL for ${bucket}/${key}:`, error);
            throw error;
        }
    }
    async listFiles(bucket, prefix) {
        try {
            const result = await this.s3.listObjectsV2({
                Bucket: bucket,
                Prefix: prefix,
            }).promise();
            return result.Contents || [];
        }
        catch (error) {
            this.logger.error(`Failed to list files in ${bucket}:`, error);
            throw error;
        }
    }
    async getFileMetadata(bucket, key) {
        try {
            const result = await this.s3.headObject({
                Bucket: bucket,
                Key: key,
            }).promise();
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to get metadata for ${bucket}/${key}:`, error);
            throw error;
        }
    }
    async copyFile(sourceBucket, sourceKey, destinationBucket, destinationKey) {
        try {
            await this.s3.copyObject({
                Bucket: destinationBucket,
                Key: destinationKey,
                CopySource: `${sourceBucket}/${sourceKey}`,
            }).promise();
            this.logger.log(`Successfully copied file from ${sourceBucket}/${sourceKey} to ${destinationBucket}/${destinationKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to copy file from ${sourceBucket}/${sourceKey}:`, error);
            throw error;
        }
    }
    async createBucket(bucket, region) {
        try {
            await this.s3.createBucket({
                Bucket: bucket,
                CreateBucketConfiguration: region ? { LocationConstraint: region } : undefined,
            }).promise();
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
        }
        catch (error) {
            this.logger.error(`Failed to create bucket ${bucket}:`, error);
            throw error;
        }
    }
    async deleteBucket(bucket) {
        try {
            const objects = await this.listFiles(bucket);
            if (objects.length > 0) {
                await this.s3.deleteObjects({
                    Bucket: bucket,
                    Delete: {
                        Objects: objects.map(obj => ({ Key: obj.Key })),
                    },
                }).promise();
            }
            await this.s3.deleteBucket({ Bucket: bucket }).promise();
            this.logger.log(`Successfully deleted bucket ${bucket}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete bucket ${bucket}:`, error);
            throw error;
        }
    }
};
StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
exports.StorageService = StorageService;
//# sourceMappingURL=storage.service.js.map
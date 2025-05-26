import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsEnum, IsNumber, IsUUID, ValidateNested, IsObject, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class FileAccessControlDto {
  @ApiProperty({ description: 'List of user IDs allowed to access the file' })
  @IsArray()
  @IsUUID('4', { each: true })
  allowedUsers: string[];

  @ApiProperty({ description: 'Password protection for the file', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Expiration date for the file access', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}

export class FileMetadataDto {
  @ApiProperty({ description: 'File description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Thumbnail URL for the file', required: false })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Duration in seconds for media files', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Number of pages for documents', required: false })
  @IsOptional()
  @IsNumber()
  pages?: number;
}

export class UploadFileDto {
  @ApiProperty({ description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File type' })
  @IsString()
  fileType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ description: 'File content as base64 string' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'File category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'File tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ description: 'Access control settings', type: FileAccessControlDto })
  @ValidateNested()
  @Type(() => FileAccessControlDto)
  accessControl: FileAccessControlDto;

  @ApiProperty({ description: 'File metadata', type: FileMetadataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileMetadataDto)
  metadata?: FileMetadataDto;
}

export class ResourceLinkDto {
  @ApiProperty({ description: 'Link title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Link URL' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Link description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Link category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Link tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class UpdateResourceDto {
  @ApiProperty({ description: 'Resource name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Resource category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Resource tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Access control settings', type: FileAccessControlDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileAccessControlDto)
  accessControl?: FileAccessControlDto;

  @ApiProperty({ description: 'Resource metadata', type: FileMetadataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileMetadataDto)
  metadata?: FileMetadataDto;
}

export class ResourceSearchDto {
  @ApiProperty({ description: 'Search query', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ description: 'Resource category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Resource tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Resource type', enum: ['file', 'link'], required: false })
  @IsOptional()
  @IsEnum(['file', 'link'])
  type?: 'file' | 'link';

  @ApiProperty({ description: 'Start date for resource creation', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ description: 'End date for resource creation', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
} 
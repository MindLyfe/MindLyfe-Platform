import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsNumber, IsEnum, IsBoolean, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordingChapterDto {
  @ApiProperty({ description: 'Chapter title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Start time in seconds' })
  @IsNumber()
  startTime: number;

  @ApiProperty({ description: 'End time in seconds' })
  @IsNumber()
  endTime: number;

  @ApiProperty({ description: 'Chapter description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class RecordingAccessControlDto {
  @ApiProperty({ description: 'List of user IDs allowed to access the recording' })
  @IsArray()
  @IsUUID('4', { each: true })
  allowedUsers: string[];

  @ApiProperty({ description: 'Password protection for the recording', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Expiration date for the recording access', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}

export class StartRecordingDto {
  @ApiProperty({ description: 'Whether to record audio', default: true })
  @IsBoolean()
  @IsOptional()
  recordAudio?: boolean;

  @ApiProperty({ description: 'Whether to record video', default: true })
  @IsBoolean()
  @IsOptional()
  recordVideo?: boolean;

  @ApiProperty({ description: 'Recording quality', enum: ['high', 'medium', 'low'], default: 'medium' })
  @IsEnum(['high', 'medium', 'low'])
  @IsOptional()
  quality?: 'high' | 'medium' | 'low';

  @ApiProperty({ description: 'Recording format', enum: ['mp4', 'webm'], default: 'mp4' })
  @IsEnum(['mp4', 'webm'])
  @IsOptional()
  format?: 'mp4' | 'webm';
}

export class UpdateRecordingDto {
  @ApiProperty({ description: 'Recording chapters', type: [RecordingChapterDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordingChapterDto)
  chapters?: RecordingChapterDto[];

  @ApiProperty({ description: 'Access control settings', type: RecordingAccessControlDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecordingAccessControlDto)
  accessControl?: RecordingAccessControlDto;

  @ApiProperty({ description: 'Recording thumbnail URL', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}

export class RecordingPlaybackDto {
  @ApiProperty({ description: 'Recording URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Recording duration in seconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Recording format' })
  @IsString()
  format: string;

  @ApiProperty({ description: 'Recording chapters', type: [RecordingChapterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordingChapterDto)
  chapters: RecordingChapterDto[];

  @ApiProperty({ description: 'Access control settings', type: RecordingAccessControlDto })
  @ValidateNested()
  @Type(() => RecordingAccessControlDto)
  accessControl: RecordingAccessControlDto;
} 
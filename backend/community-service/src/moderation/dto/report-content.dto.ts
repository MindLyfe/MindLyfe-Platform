import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ModerationContentType {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
  MESSAGE = 'message',
}

export class ReportContentDto {
  @ApiProperty({ description: 'ID of the content being reported' })
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @ApiProperty({ 
    description: 'Type of content being reported',
    enum: ModerationContentType 
  })
  @IsEnum(ModerationContentType)
  contentType: ModerationContentType;

  @ApiProperty({ description: 'Reason for reporting the content' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Additional details about the report' })
  @IsOptional()
  @IsString()
  details?: string;
} 
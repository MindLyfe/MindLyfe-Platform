import { IsNotEmpty, IsString, IsUUID, IsOptional, ValidateNested, IsObject, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AttachmentType } from '../entities/chat-message.entity';

export class AttachmentDto {
  @ApiProperty({
    description: 'The unique identifier for the attachment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The type of attachment',
    enum: AttachmentType,
    example: AttachmentType.IMAGE,
  })
  @IsEnum(AttachmentType)
  @IsNotEmpty()
  type: AttachmentType;

  @ApiProperty({
    description: 'The URL to access the attachment',
    example: 'https://storage.example.com/attachments/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'The original filename of the attachment',
    example: 'vacation_photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The size of the attachment in bytes',
    example: 1024000,
  })
  @IsNotEmpty()
  size: number;

  @ApiProperty({
    description: 'The MIME type of the attachment',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiPropertyOptional({
    description: 'URL to a thumbnail of the attachment (for images and videos)',
    example: 'https://storage.example.com/attachments/image_thumb.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the attachment',
    example: { width: 1920, height: 1080, duration: 120 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'The ID of the chat room',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, how are you doing today?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Whether the message should be sent anonymously',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the message this message is replying to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  replyToMessageId?: string;

  @ApiPropertyOptional({
    description: 'Attachments to include with the message',
    type: [AttachmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({
    description: 'Additional metadata for the message',
    example: { mentions: ['user123'], formattedText: true },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
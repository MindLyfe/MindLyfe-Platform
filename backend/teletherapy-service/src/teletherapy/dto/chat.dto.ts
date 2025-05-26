import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsEnum, IsBoolean, IsUUID, ValidateNested, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  PRIVATE = 'private'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export class ChatMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Message type', enum: MessageType })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ description: 'Recipient ID for private messages', required: false })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiProperty({ description: 'Message attachments', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ description: 'Additional message metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ChatSettingsDto {
  @ApiProperty({ description: 'Whether to allow private chat between participants' })
  @IsBoolean()
  allowPrivateChat: boolean;

  @ApiProperty({ description: 'Whether to allow file sharing in chat' })
  @IsBoolean()
  allowFileSharing: boolean;

  @ApiProperty({ description: 'Whether to enable chat moderation' })
  @IsBoolean()
  moderationEnabled: boolean;

  @ApiProperty({ description: 'Whether to automatically archive old messages' })
  @IsBoolean()
  autoArchive: boolean;

  @ApiProperty({ description: 'Number of days after which to archive messages' })
  @IsNumber()
  archiveAfterDays: number;
}

export class UpdateChatSettingsDto {
  @ApiProperty({ description: 'Updated chat settings', type: ChatSettingsDto })
  @ValidateNested()
  @Type(() => ChatSettingsDto)
  settings: ChatSettingsDto;
}

export class ChatHistoryDto {
  @ApiProperty({ description: 'Start date for chat history' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date for chat history' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'Message type filter', enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ description: 'User ID filter', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class ModerationActionDto {
  @ApiProperty({ description: 'Message ID to moderate' })
  @IsUUID()
  messageId: string;

  @ApiProperty({ description: 'Action to take', enum: ['delete', 'warn', 'mute'] })
  @IsEnum(['delete', 'warn', 'mute'])
  action: 'delete' | 'warn' | 'mute';

  @ApiProperty({ description: 'Reason for moderation', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Duration of mute in minutes', required: false })
  @IsOptional()
  @IsNumber()
  muteDuration?: number;
}

export class ChatAttachmentDto {
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
} 
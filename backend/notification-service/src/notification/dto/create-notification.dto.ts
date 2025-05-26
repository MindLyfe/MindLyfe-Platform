import { IsNotEmpty, IsString, IsUUID, IsOptional, IsObject, IsEnum, IsEmail, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';
import { ChannelType } from '../entities/notification-channel.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'The ID of the user to send the notification to' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'The email of the recipient if different from user email' })
  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @ApiProperty({ description: 'The type of notification', enum: NotificationType })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({ description: 'The title of the notification' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The message content of the notification' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Any additional metadata for the notification' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'The ID of a notification template to use' })
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ description: 'The notification channels to use', enum: ChannelType, isArray: true })
  @IsEnum(ChannelType, { each: true })
  @IsArray()
  @IsOptional()
  channels?: ChannelType[];

  @ApiPropertyOptional({ description: 'When to schedule the notification' })
  @IsString()
  @IsOptional()
  scheduledAt?: string;
} 
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsEnum, IsNumber, IsUUID, ValidateNested, IsObject, IsEmail, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app'
}

export enum NotificationType {
  SESSION_REMINDER = 'session_reminder',
  SESSION_CANCELLED = 'session_cancelled',
  SESSION_RESCHEDULED = 'session_rescheduled',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  RECORDING_AVAILABLE = 'recording_available',
  FEEDBACK_REQUEST = 'feedback_request',
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',
  BREAKOUT_ROOM_INVITATION = 'breakout_room_invitation',
  RESOURCE_SHARED = 'resource_shared',
  CUSTOM = 'custom'
}

export class ReminderSettingsDto {
  @ApiProperty({ description: 'Whether to send session reminders' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Minutes before session to send reminder' })
  @IsNumber()
  reminderMinutes: number;

  @ApiProperty({ description: 'Whether to send follow-up reminders' })
  @IsBoolean()
  @IsOptional()
  sendFollowUp?: boolean;

  @ApiProperty({ description: 'Follow-up reminder minutes', required: false })
  @IsOptional()
  @IsNumber()
  followUpMinutes?: number;

  @ApiProperty({ description: 'Maximum number of reminders' })
  @IsNumber()
  maxReminders: number;
}

export class ChannelPreferenceDto {
  @ApiProperty({ description: 'Notification channel', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Whether channel is enabled' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Channel-specific settings', required: false })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class CustomRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Channels to use', enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({ description: 'Whether rule is active' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Rule conditions', required: false })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;
}

export class QuietHoursDto {
  @ApiProperty({ description: 'Start time (24-hour format)' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time (24-hour format)' })
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'Days of week (0-6, where 0 is Sunday)' })
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek: number[];

  @ApiProperty({ description: 'Whether to respect quiet hours' })
  @IsBoolean()
  enabled: boolean;
}

export class NotificationTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Template type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Template subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Template body' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'Available channels', enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({ description: 'Template variables', type: [String] })
  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @ApiProperty({ description: 'Whether template is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Template metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class NotificationSettingsDto {
  @ApiProperty({ description: 'Session reminder settings' })
  @ValidateNested()
  @Type(() => ReminderSettingsDto)
  reminders: ReminderSettingsDto;

  @ApiProperty({ description: 'Channel preferences', type: [ChannelPreferenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelPreferenceDto)
  channelPreferences: ChannelPreferenceDto[];

  @ApiProperty({ description: 'Custom notification rules', type: [CustomRuleDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomRuleDto)
  customRules?: CustomRuleDto[];

  @ApiProperty({ description: 'Quiet hours settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Recipient email' })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification channels', enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({ description: 'Template variables', required: false })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiProperty({ description: 'Custom content', required: false })
  @IsOptional()
  @IsString()
  customContent?: string;

  @ApiProperty({ description: 'Priority level', enum: ['high', 'normal', 'low'], default: 'normal' })
  @IsEnum(['high', 'normal', 'low'])
  @IsOptional()
  priority?: 'high' | 'normal' | 'low';

  @ApiProperty({ description: 'Scheduled send time', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledFor?: Date;
}

export class NotificationHistoryDto {
  @ApiProperty({ description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'Notification type filter', enum: NotificationType, required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ description: 'Channel filter', enum: NotificationChannel, required: false })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiProperty({ description: 'Recipient email filter', required: false })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;
} 
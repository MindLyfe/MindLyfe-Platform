import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsEnum, IsNumber, IsUUID, ValidateNested, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum CalendarProvider {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  ICAL = 'ical'
}

export enum CalendarEventStatus {
  CONFIRMED = 'confirmed',
  TENTATIVE = 'tentative',
  CANCELLED = 'cancelled'
}

export class CalendarAvailabilityDto {
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

  @ApiProperty({ description: 'Timezone', example: 'America/New_York' })
  @IsString()
  timezone: string;

  @ApiProperty({ description: 'Buffer time before sessions in minutes', required: false })
  @IsOptional()
  @IsNumber()
  bufferBefore?: number;

  @ApiProperty({ description: 'Buffer time after sessions in minutes', required: false })
  @IsOptional()
  @IsOptional()
  @IsNumber()
  bufferAfter?: number;

  @ApiProperty({ description: 'Maximum sessions per day', required: false })
  @IsOptional()
  @IsNumber()
  maxSessionsPerDay?: number;

  @ApiProperty({ description: 'Minimum notice period in hours', required: false })
  @IsOptional()
  @IsNumber()
  minNoticeHours?: number;

  @ApiProperty({ description: 'Maximum advance booking in days', required: false })
  @IsOptional()
  @IsNumber()
  maxAdvanceDays?: number;
}

export class CalendarReminderDto {
  @ApiProperty({ description: 'Reminder type', enum: ['email', 'popup', 'sms'] })
  @IsEnum(['email', 'popup', 'sms'])
  type: 'email' | 'popup' | 'sms';

  @ApiProperty({ description: 'Minutes before event' })
  @IsNumber()
  minutes: number;

  @ApiProperty({ description: 'Whether reminder is enabled' })
  @IsBoolean()
  enabled: boolean;
}

export class CalendarExceptionDto {
  @ApiProperty({ description: 'Exception date' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: 'Whether the date is available' })
  @IsBoolean()
  available: boolean;

  @ApiProperty({ description: 'Reason for exception', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Alternative availability', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CalendarAvailabilityDto)
  alternativeAvailability?: CalendarAvailabilityDto;
}

export class CalendarSyncDto {
  @ApiProperty({ description: 'Calendar provider', enum: CalendarProvider })
  @IsEnum(CalendarProvider)
  provider: CalendarProvider;

  @ApiProperty({ description: 'Provider-specific credentials' })
  @IsObject()
  credentials: Record<string, any>;

  @ApiProperty({ description: 'Calendar ID' })
  @IsString()
  calendarId: string;

  @ApiProperty({ description: 'Whether to sync in both directions' })
  @IsBoolean()
  twoWaySync: boolean;

  @ApiProperty({ description: 'Sync frequency in minutes' })
  @IsNumber()
  syncFrequency: number;

  @ApiProperty({ description: 'Whether to sync past events' })
  @IsBoolean()
  @IsOptional()
  syncPastEvents?: boolean;

  @ApiProperty({ description: 'Maximum days to sync in the future' })
  @IsNumber()
  @IsOptional()
  maxFutureDays?: number;
}

export class CalendarEventDto {
  @ApiProperty({ description: 'Event ID in the calendar system' })
  @IsString()
  eventId: string;

  @ApiProperty({ description: 'Session ID' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Event title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Event description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Start time' })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'End time' })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ description: 'Event status', enum: CalendarEventStatus })
  @IsEnum(CalendarEventStatus)
  status: CalendarEventStatus;

  @ApiProperty({ description: 'Location or meeting link' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Attendees', type: [String] })
  @IsArray()
  @IsString({ each: true })
  attendees: string[];

  @ApiProperty({ description: 'Reminders', type: [CalendarReminderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalendarReminderDto)
  reminders: CalendarReminderDto[];

  @ApiProperty({ description: 'Recurrence rule', required: false })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiProperty({ description: 'Event metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CalendarConflictDto {
  @ApiProperty({ description: 'Conflicting event ID' })
  @IsString()
  eventId: string;

  @ApiProperty({ description: 'Conflicting session ID' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Start time of conflict' })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'End time of conflict' })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ description: 'Conflict type', enum: ['overlap', 'adjacent', 'buffer'] })
  @IsEnum(['overlap', 'adjacent', 'buffer'])
  type: 'overlap' | 'adjacent' | 'buffer';

  @ApiProperty({ description: 'Conflict resolution', enum: ['reschedule', 'cancel', 'ignore'] })
  @IsEnum(['reschedule', 'cancel', 'ignore'])
  resolution: 'reschedule' | 'cancel' | 'ignore';
}

export class CalendarSyncStatusDto {
  @ApiProperty({ description: 'Last sync time' })
  @IsDate()
  @Type(() => Date)
  lastSyncedAt: Date;

  @ApiProperty({ description: 'Sync status', enum: ['success', 'failed', 'in_progress'] })
  @IsEnum(['success', 'failed', 'in_progress'])
  status: 'success' | 'failed' | 'in_progress';

  @ApiProperty({ description: 'Number of events synced' })
  @IsNumber()
  eventsSynced: number;

  @ApiProperty({ description: 'Number of conflicts detected' })
  @IsNumber()
  conflictsDetected: number;

  @ApiProperty({ description: 'Error message if sync failed', required: false })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({ description: 'Next sync time' })
  @IsDate()
  @Type(() => Date)
  nextSyncAt: Date;
} 
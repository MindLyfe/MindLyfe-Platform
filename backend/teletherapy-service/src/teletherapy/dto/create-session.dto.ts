import { IsNotEmpty, IsUUID, IsDate, IsEnum, IsString, IsOptional, IsBoolean, ValidateNested, IsArray, MinLength, MaxLength, IsObject, IsNumber, IsEmail, Min, Max, IsInt, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SessionType, SessionCategory, SessionFocus } from '../entities/therapy-session.entity';

class RecurringScheduleDto {
  @ApiProperty({
    description: 'Frequency of recurring sessions',
    enum: ['weekly', 'biweekly', 'monthly'],
    example: 'weekly',
  })
  @IsEnum(['weekly', 'biweekly', 'monthly'])
  frequency: 'weekly' | 'biweekly' | 'monthly';

  @ApiProperty({
    description: 'End date for recurring sessions',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: 'Maximum number of occurrences',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxOccurrences?: number;

  @ApiProperty({
    description: 'Dates to skip in the recurring schedule',
    type: [Date],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  skipDates?: Date[];
}

class PricingDto {
  @ApiProperty({
    description: 'Session price amount',
    example: 99.99,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiProperty({
    description: 'Whether the price is per participant',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  perParticipant?: boolean;

  @ApiProperty({
    description: 'Discount code for the session',
    example: 'EARLYBIRD2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiProperty({
    description: 'Early bird price',
    example: 79.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  earlyBirdPrice?: number;

  @ApiProperty({
    description: 'Early bird price end date',
    example: '2024-03-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  earlyBirdEndDate?: Date;
}

class RequirementsDto {
  @ApiProperty({
    description: 'Minimum age requirement',
    example: 18,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAge?: number;

  @ApiProperty({
    description: 'Maximum age requirement',
    example: 65,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAge?: number;

  @ApiProperty({
    description: 'Prerequisites for attending the session',
    example: ['Previous therapy experience', 'Completed intake form'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiProperty({
    description: 'Required documents for the session',
    example: ['Consent form', 'Medical history'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredDocuments?: string[];

  @ApiProperty({
    description: 'Whether consent is required',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  consentRequired?: boolean;
}

export class CreateSessionDto {
  @ApiProperty({
    description: 'ID of the therapist conducting the session',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  therapistId: string;

  @ApiProperty({
    description: 'ID of the primary client (for individual sessions)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({
    description: 'IDs of participants (for group sessions)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];

  @ApiProperty({
    description: 'Start time of the session',
    example: '2024-03-20T14:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    description: 'End time of the session',
    example: '2024-03-20T15:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({
    description: 'Type of therapy session',
    enum: SessionType,
    example: SessionType.GROUP_VIDEO,
  })
  @IsEnum(SessionType)
  @IsNotEmpty()
  type: SessionType;

  @ApiProperty({
    description: 'Category of the session',
    enum: SessionCategory,
    example: SessionCategory.GROUP,
  })
  @IsEnum(SessionCategory)
  @IsNotEmpty()
  category: SessionCategory;

  @ApiProperty({
    description: 'Focus areas of the session',
    enum: SessionFocus,
    isArray: true,
    example: [SessionFocus.ANXIETY, SessionFocus.MINDFULNESS],
  })
  @IsArray()
  @IsEnum(SessionFocus, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  focus: SessionFocus[];

  @ApiProperty({
    description: 'Title or topic of the session',
    example: 'Group Mindfulness Workshop',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Description of the session',
    example: 'A group workshop focused on mindfulness techniques for stress management',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @ApiProperty({
    description: 'Whether this is a recurring session',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Schedule for recurring sessions',
    type: RecurringScheduleDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => RecurringScheduleDto)
  @IsOptional()
  recurringSchedule?: RecurringScheduleDto;

  @ApiProperty({
    description: 'Whether the session is private (invitation only)',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiProperty({
    description: 'Email addresses of invited participants',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  invitedEmails?: string[];

  @ApiProperty({
    description: 'Pricing information for the session',
    type: PricingDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => PricingDto)
  @IsOptional()
  pricing?: PricingDto;

  @ApiProperty({
    description: 'Requirements for attending the session',
    type: RequirementsDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => RequirementsDto)
  @IsOptional()
  requirements?: RequirementsDto;

  @ApiProperty({
    description: 'Additional metadata for the session',
    example: {
      meetingLink: 'https://zoom.us/j/123456789',
      waitingRoomEnabled: true,
      chatEnabled: true,
      recordingEnabled: false,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 
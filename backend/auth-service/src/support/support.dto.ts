import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  IsPhoneNumber,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftType, ShiftStatus } from '../entities/support-shift.entity';
import { RequestType, Priority, RoutingStatus } from '../entities/support-routing.entity';
import { UserRole } from '../entities/user.entity';

// Support Team Registration DTO
export class RegisterSupportTeamDto {
  @ApiProperty({
    description: 'First name of the support team member',
    example: 'John',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the support team member',
    example: 'Doe',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email address for the support team member',
    example: 'john.doe@mindlyf.com',
    format: 'email'
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the support team member account',
    example: 'SecurePassword123!',
    minLength: 8,
    format: 'password'
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Phone number in international format',
    example: '+1234567890',
    pattern: '^\\+[1-9]\\d{1,14}$'
  })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Department or team the member belongs to',
    example: 'Customer Support',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: 'Preferred shift types for the support team member',
    example: ['MORNING', 'EVENING'],
    enum: ShiftType,
    isArray: true
  })
  @IsArray()
  @IsEnum(ShiftType, { each: true })
  preferredShifts: ShiftType[];
}

// Shift Management DTOs
export class CreateShiftDto {
  @ApiProperty({
    description: 'Type of shift to create',
    example: 'MORNING',
    enum: ShiftType
  })
  @IsEnum(ShiftType)
  shiftType: ShiftType;

  @ApiProperty({
    description: 'Date for the shift in ISO format',
    example: '2024-01-15T00:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  shiftDate: string;

  @ApiProperty({
    description: 'UUID of the user assigned to this shift',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  assignedUserId: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the shift',
    example: 'Special instructions for this shift',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateShiftDto {
  @ApiPropertyOptional({
    description: 'New status for the shift',
    example: 'ACTIVE',
    enum: ShiftStatus
  })
  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;

  @ApiPropertyOptional({
    description: 'UUID of the new user to assign to this shift',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;

  @ApiPropertyOptional({
    description: 'Updated notes for the shift',
    example: 'Updated instructions',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ShiftQueryDto {
  @ApiPropertyOptional({
    description: 'Filter shifts from this date onwards',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter shifts up to this date',
    example: '2024-01-31T23:59:59.999Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by shift type',
    example: 'MORNING',
    enum: ShiftType
  })
  @IsEnum(ShiftType)
  @IsOptional()
  shiftType?: ShiftType;

  @ApiPropertyOptional({
    description: 'Filter by shift status',
    example: 'ACTIVE',
    enum: ShiftStatus
  })
  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;

  @ApiPropertyOptional({
    description: 'Filter by assigned user UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;
}

// Support Routing DTOs
export class CreateSupportRequestDto {
  @ApiProperty({
    description: 'Type of support request',
    example: 'TECHNICAL_SUPPORT',
    enum: RequestType
  })
  @IsEnum(RequestType)
  requestType: RequestType;

  @ApiPropertyOptional({
    description: 'Priority level of the request',
    example: 'MEDIUM',
    enum: Priority,
    default: 'MEDIUM'
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({
    description: 'Detailed description of the support request',
    example: 'Unable to access my account after password reset',
    minLength: 10,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the request',
    example: { 'browser': 'Chrome', 'version': '91.0' },
    type: 'object'
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateSupportRequestDto {
  @ApiPropertyOptional({
    description: 'New status for the support request',
    example: 'IN_PROGRESS',
    enum: RoutingStatus
  })
  @IsEnum(RoutingStatus)
  @IsOptional()
  status?: RoutingStatus;

  @ApiPropertyOptional({
    description: 'Updated priority level',
    example: 'HIGH',
    enum: Priority
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Resolution details for the request',
    example: 'Issue resolved by resetting user permissions',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  resolution?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the request',
    example: 'User contacted via phone for verification',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Updated metadata for the request',
    example: { 'resolution_method': 'phone_support' },
    type: 'object'
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AssignSupportRequestDto {
  @ApiProperty({
    description: 'UUID of the support team member to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  assignedSupportUserId: string;

  @ApiPropertyOptional({
    description: 'Notes about the assignment',
    example: 'Assigned to specialist for technical issues',
    maxLength: 300
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SupportRequestQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by request status',
    example: 'IN_PROGRESS',
    enum: RoutingStatus
  })
  @IsEnum(RoutingStatus)
  @IsOptional()
  status?: RoutingStatus;

  @ApiPropertyOptional({
    description: 'Filter by request type',
    example: 'TECHNICAL_SUPPORT',
    enum: RequestType
  })
  @IsEnum(RequestType)
  @IsOptional()
  requestType?: RequestType;

  @ApiPropertyOptional({
    description: 'Filter by priority level',
    example: 'HIGH',
    enum: Priority
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Filter by assigned support user UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  assignedSupportUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter by requester UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  requesterId?: string;

  @ApiPropertyOptional({
    description: 'Filter requests from this date onwards',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter requests up to this date',
    example: '2024-01-31T23:59:59.999Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 50,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip',
    example: 0,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number;
}

// Notification DTOs
export class NotificationPreferencesDto {
  @ApiPropertyOptional({
    description: 'Enable or disable SMS notifications',
    example: true,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable or disable email notifications',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'SMS number for notifications',
    example: '+1234567890',
    pattern: '^\\+[1-9]\\d{1,14}$'
  })
  @IsString()
  @IsOptional()
  smsNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address for notifications',
    example: 'user@example.com',
    format: 'email'
  })
  @IsString()
  @IsOptional()
  emailAddress?: string;
}

// Response DTOs
export class SupportTeamMemberResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the support team member',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'First name of the support team member',
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the support team member',
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    description: 'Email address of the support team member',
    example: 'john.doe@mindlyf.com'
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1234567890'
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'SUPPORT_AGENT',
    enum: UserRole
  })
  role: UserRole;

  @ApiProperty({
    description: 'Current status of the support team member',
    example: 'ACTIVE'
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Department or team the member belongs to',
    example: 'Customer Support'
  })
  department?: string;

  @ApiPropertyOptional({
    description: 'Preferred shift types',
    example: ['MORNING', 'EVENING'],
    enum: ShiftType,
    isArray: true
  })
  preferredShifts?: ShiftType[];

  @ApiPropertyOptional({
    description: 'Current shift information if on duty',
    type: 'object'
  })
  currentShift?: {
    id: string;
    shiftType: ShiftType;
    shiftDate: Date;
    status: ShiftStatus;
  };

  @ApiProperty({
    description: 'When the record was created',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the record was last updated',
    example: '2024-01-15T14:30:00.000Z'
  })
  updatedAt: Date;
}

export class ShiftResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the shift',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Type of shift',
    example: 'MORNING',
    enum: ShiftType
  })
  shiftType: ShiftType;

  @ApiProperty({
    description: 'Date of the shift',
    example: '2024-01-15T00:00:00.000Z'
  })
  shiftDate: Date;

  @ApiProperty({
    description: 'Start time of the shift',
    example: '08:00'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the shift',
    example: '16:00'
  })
  endTime: string;

  @ApiProperty({
    description: 'Current status of the shift',
    example: 'ACTIVE',
    enum: ShiftStatus
  })
  status: ShiftStatus;

  @ApiProperty({
    description: 'User assigned to this shift',
    type: 'object'
  })
  assignedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };

  @ApiProperty({
    description: 'Whether SMS notification was sent',
    example: true
  })
  smsNotificationSent: boolean;

  @ApiProperty({
    description: 'Whether email notification was sent',
    example: true
  })
  emailNotificationSent: boolean;

  @ApiPropertyOptional({
    description: 'When SMS notification was sent',
    example: '2024-01-15T07:30:00.000Z'
  })
  smsNotificationSentAt?: Date;

  @ApiPropertyOptional({
    description: 'When email notification was sent',
    example: '2024-01-15T07:30:00.000Z'
  })
  emailNotificationSentAt?: Date;

  @ApiPropertyOptional({
    description: 'Additional notes for the shift',
    example: 'Special instructions for this shift'
  })
  notes?: string;

  @ApiProperty({
    description: 'When the shift was created',
    example: '2024-01-14T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the shift was last updated',
    example: '2024-01-15T14:30:00.000Z'
  })
  updatedAt: Date;
}

export class SupportRequestResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the support request',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Type of support request',
    example: 'TECHNICAL_SUPPORT',
    enum: RequestType
  })
  requestType: RequestType;

  @ApiProperty({
    description: 'Priority level of the request',
    example: 'HIGH',
    enum: Priority
  })
  priority: Priority;

  @ApiProperty({
    description: 'Current status of the request',
    example: 'IN_PROGRESS',
    enum: RoutingStatus
  })
  status: RoutingStatus;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'Unable to access my account after password reset'
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Resolution details if request is resolved',
    example: 'Issue resolved by resetting user permissions'
  })
  resolution?: string;

  @ApiProperty({
    description: 'User who created the request',
    type: 'object'
  })
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiPropertyOptional({
    description: 'Support team member assigned to this request',
    type: 'object'
  })
  assignedSupportUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };

  @ApiPropertyOptional({
    description: 'Shift during which this request was handled',
    type: 'object'
  })
  shift?: {
    id: string;
    shiftType: ShiftType;
    shiftDate: Date;
  };

  @ApiPropertyOptional({
    description: 'When the request was assigned',
    example: '2024-01-15T10:45:00.000Z'
  })
  assignedAt?: Date;

  @ApiPropertyOptional({
    description: 'When work on the request started',
    example: '2024-01-15T11:00:00.000Z'
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'When the request was resolved',
    example: '2024-01-15T16:30:00.000Z'
  })
  resolvedAt?: Date;

  @ApiPropertyOptional({
    description: 'When the request was escalated',
    example: '2024-01-15T14:00:00.000Z'
  })
  escalatedAt?: Date;

  @ApiPropertyOptional({
    description: 'Response time in minutes',
    example: 15
  })
  responseTime?: number;

  @ApiPropertyOptional({
    description: 'Resolution time in minutes',
    example: 330
  })
  resolutionTime?: number;

  @ApiProperty({
    description: 'Whether the request is overdue',
    example: false
  })
  isOverdue: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the request',
    example: { 'browser': 'Chrome', 'version': '91.0' }
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional notes about the request',
    example: 'User contacted via phone for verification'
  })
  notes?: string;

  @ApiProperty({
    description: 'When the request was created',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the request was last updated',
    example: '2024-01-15T14:30:00.000Z'
  })
  updatedAt: Date;
}

export class SupportDashboardDto {
  @ApiProperty({
    description: 'Total number of support requests',
    example: 150
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Number of pending requests',
    example: 25
  })
  pendingRequests: number;

  @ApiProperty({
    description: 'Number of requests currently in progress',
    example: 45
  })
  inProgressRequests: number;

  @ApiProperty({
    description: 'Number of resolved requests',
    example: 75
  })
  resolvedRequests: number;

  @ApiProperty({
    description: 'Number of escalated requests',
    example: 5
  })
  escalatedRequests: number;

  @ApiProperty({
    description: 'Average response time in minutes',
    example: 15.5
  })
  averageResponseTime: number;

  @ApiProperty({
    description: 'Average resolution time in minutes',
    example: 240.8
  })
  averageResolutionTime: number;

  @ApiProperty({
    description: 'Number of currently active shifts',
    example: 8
  })
  activeShifts: number;

  @ApiProperty({
    description: 'Number of available support agents',
    example: 12
  })
  availableAgents: number;

  @ApiProperty({
    description: 'Breakdown of requests by type',
    example: {
      'general_inquiry': 35,
      'technical_support': 60,
      'billing_inquiry': 30,
      'therapist_support': 25,
      'emergency': 5,
      'other': 15
    }
  })
  requestsByType: Record<RequestType, number>;

  @ApiProperty({
    description: 'Breakdown of requests by priority',
    example: {
      'low': 50,
      'medium': 70,
      'high': 25,
      'urgent': 5
    }
  })
  requestsByPriority: Record<Priority, number>;

  @ApiProperty({
    description: 'List of recent support requests',
    type: [SupportRequestResponseDto]
  })
  recentRequests: SupportRequestResponseDto[];

  @ApiProperty({
    description: 'List of overdue support requests',
    type: [SupportRequestResponseDto]
  })
  overdueRequests: SupportRequestResponseDto[];
}
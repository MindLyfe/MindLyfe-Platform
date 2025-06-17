import { IsEnum, IsOptional, IsString, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TherapistStatus, LicenseStatus } from '../../entities/therapist.entity';

export class ApproveTherapistDto {
  @ApiProperty({
    description: 'Approval notes from admin/support team',
    example: 'License verified and credentials approved',
  })
  @IsString()
  approvalNotes: string;

  @ApiPropertyOptional({
    description: 'License state to set upon approval',
    example: 'CA',
  })
  @IsOptional()
  @IsString()
  licenseState?: string;

  @ApiPropertyOptional({
    description: 'License status to set upon approval',
    enum: LicenseStatus,
    default: LicenseStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(LicenseStatus)
  licenseStatus?: LicenseStatus;
}

export class RejectTherapistDto {
  @ApiProperty({
    description: 'Reason for rejection/suspension',
    example: 'Invalid license number provided',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the therapist',
    example: 'Please resubmit with valid documentation',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTherapistStatusDto {
  @ApiProperty({
    description: 'New therapist status',
    enum: TherapistStatus,
  })
  @IsEnum(TherapistStatus)
  status: TherapistStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change',
    example: 'Manual status update by admin',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'License status update',
    enum: LicenseStatus,
  })
  @IsOptional()
  @IsEnum(LicenseStatus)
  licenseStatus?: LicenseStatus;
}

export class TherapistQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by therapist status',
    enum: TherapistStatus,
  })
  @IsOptional()
  @IsEnum(TherapistStatus)
  status?: TherapistStatus;

  @ApiPropertyOptional({
    description: 'Filter by license status',
    enum: LicenseStatus,
  })
  @IsOptional()
  @IsEnum(LicenseStatus)
  licenseStatus?: LicenseStatus;

  @ApiPropertyOptional({
    description: 'Search by specialization',
    example: 'anxiety',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Search by license state',
    example: 'CA',
  })
  @IsOptional()
  @IsString()
  licenseState?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class TherapistApprovalHistoryDto {
  @ApiProperty({
    description: 'Action performed',
    example: 'approved',
  })
  action: string;

  @ApiProperty({
    description: 'Admin user ID who performed the action',
  })
  @IsUUID()
  adminUserId: string;

  @ApiProperty({
    description: 'Reason or notes for the action',
  })
  reason: string;

  @ApiProperty({
    description: 'Timestamp of the action',
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Previous status before the action',
    enum: TherapistStatus,
  })
  @IsOptional()
  @IsEnum(TherapistStatus)
  previousStatus?: TherapistStatus;

  @ApiPropertyOptional({
    description: 'New status after the action',
    enum: TherapistStatus,
  })
  @IsOptional()
  @IsEnum(TherapistStatus)
  newStatus?: TherapistStatus;
}
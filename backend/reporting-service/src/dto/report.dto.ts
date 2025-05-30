import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsObject,
  IsBoolean,
  ValidateNested,
  IsUUID,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ReportType, ExportFormat, TimePeriod } from '../enums';
import { DateRangeDto, FilterDto } from './analytics-query.dto';

export class CreateReportDto {
  @ApiProperty({
    description: 'Report title',
    example: 'Monthly User Engagement Report',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Report description',
    example: 'Comprehensive analysis of user engagement metrics for the past month',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Type of report to generate',
    enum: ReportType,
    example: ReportType.ENGAGEMENT,
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    description: 'Export format for the report',
    enum: ExportFormat,
    example: ExportFormat.PDF,
  })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiPropertyOptional({
    description: 'Organization ID (for organization-specific reports)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({ description: 'Report generation parameters' })
  @ValidateNested()
  @Type(() => ReportParametersDto)
  parameters: ReportParametersDto;

  @ApiPropertyOptional({
    description: 'Schedule the report for recurring generation',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isScheduled?: boolean = false;

  @ApiPropertyOptional({
    description: 'Schedule frequency (if scheduled)',
    enum: ['daily', 'weekly', 'monthly', 'quarterly'],
    example: 'monthly',
  })
  @IsOptional()
  @IsString()
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';

  @ApiPropertyOptional({
    description: 'Make report publicly accessible',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean = false;

  @ApiPropertyOptional({
    description: 'Share report with specific users',
    type: [String],
    example: ['user1-uuid', 'user2-uuid'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sharedWith?: string[];

  @ApiPropertyOptional({
    description: 'Report tags for categorization',
    type: [String],
    example: ['engagement', 'monthly', 'executive'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Report category',
    example: 'Executive Dashboard',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Department or team',
    example: 'Analytics Team',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: 'Project name',
    example: 'Q1 2024 Analysis',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  project?: string;

  @ApiPropertyOptional({
    description: 'Auto-delete report after specified days',
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  retentionDays?: number;
}

export class ReportParametersDto {
  @ApiProperty({ description: 'Date range for the report' })
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Time period for data aggregation',
    enum: TimePeriod,
    default: TimePeriod.DAILY,
  })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod?: TimePeriod = TimePeriod.DAILY;

  @ApiProperty({
    description: 'Metrics to include in the report',
    type: [String],
    example: ['totalUsers', 'activeUsers', 'revenue', 'conversionRate'],
  })
  @IsArray()
  @IsString({ each: true })
  metrics: string[];

  @ApiPropertyOptional({
    description: 'Filters to apply to the data',
    type: [FilterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[];

  @ApiPropertyOptional({
    description: 'Fields to group data by',
    type: [String],
    example: ['service', 'userRole', 'region'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({
    description: 'Aggregation method',
    example: 'sum',
  })
  @IsOptional()
  @IsString()
  aggregation?: string;

  @ApiPropertyOptional({
    description: 'Services to include in the report',
    type: [String],
    example: ['auth-service', 'payment-service', 'chat-service'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({
    description: 'User segments to include',
    type: [String],
    example: ['premium', 'trial', 'free'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userSegments?: string[];

  @ApiPropertyOptional({
    description: 'Include charts in the report',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCharts?: boolean = true;

  @ApiPropertyOptional({
    description: 'Types of charts to include',
    type: [String],
    example: ['line', 'bar', 'pie'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chartTypes?: string[];

  @ApiPropertyOptional({
    description: 'Custom report template to use',
    example: 'executive-summary',
  })
  @IsOptional()
  @IsString()
  customTemplate?: string;

  @ApiPropertyOptional({
    description: 'Additional custom parameters',
    type: 'object',
    example: { includeComparisons: true, compareWithPreviousPeriod: true },
  })
  @IsOptional()
  @IsObject()
  customParams?: Record<string, any>;
}

export class UpdateReportDto {
  @ApiPropertyOptional({
    description: 'Report title',
    minLength: 3,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Report description',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Make report publicly accessible',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Share report with specific users',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sharedWith?: string[];

  @ApiPropertyOptional({
    description: 'Report tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Report category',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Department or team',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: 'Project name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  project?: string;
}

export class ShareReportDto {
  @ApiProperty({
    description: 'User IDs to share the report with',
    type: [String],
    example: ['user1-uuid', 'user2-uuid'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiPropertyOptional({
    description: 'Expiration date for the share link',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Allow shared users to download the report',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  allowDownload?: boolean = true;
}

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by report type',
    enum: ReportType,
  })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by creator user ID',
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Filter by organization ID',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Filter by category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by department',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Filter by project',
  })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional({
    description: 'Search in title and description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Page offset',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'updatedAt', 'title', 'type', 'status'],
    default: 'createdAt',
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

export class ReportResponseDto {
  @ApiProperty({ description: 'Report ID' })
  id: string;

  @ApiProperty({ description: 'Report title' })
  title: string;

  @ApiPropertyOptional({ description: 'Report description' })
  description?: string;

  @ApiProperty({ description: 'Report type', enum: ReportType })
  type: ReportType;

  @ApiProperty({ description: 'Report status' })
  status: string;

  @ApiProperty({ description: 'Export format', enum: ExportFormat })
  format: ExportFormat;

  @ApiProperty({ description: 'Creator user ID' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  organizationId?: string;

  @ApiProperty({ description: 'Report parameters' })
  parameters: any;

  @ApiPropertyOptional({ description: 'Download URL' })
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiProperty({ description: 'Generation started at' })
  generationStartedAt?: Date;

  @ApiProperty({ description: 'Generation completed at' })
  generationCompletedAt?: Date;

  @ApiProperty({ description: 'Generation duration in milliseconds' })
  generationDurationMs?: number;

  @ApiProperty({ description: 'Total records processed' })
  totalRecords: number;

  @ApiProperty({ description: 'Total pages in report' })
  totalPages: number;

  @ApiProperty({ description: 'Total charts in report' })
  totalCharts: number;

  @ApiPropertyOptional({ description: 'Report summary' })
  summary?: {
    keyMetrics: Record<string, number>;
    insights: string[];
    recommendations: string[];
  };

  @ApiProperty({ description: 'Is report public' })
  isPublic: boolean;

  @ApiProperty({ description: 'Is report shared' })
  isShared: boolean;

  @ApiProperty({ description: 'Shared with user IDs' })
  sharedWith: string[];

  @ApiProperty({ description: 'Download count' })
  downloadCount: number;

  @ApiProperty({ description: 'Last downloaded at' })
  lastDownloadedAt?: Date;

  @ApiProperty({ description: 'Is scheduled report' })
  isScheduled: boolean;

  @ApiProperty({ description: 'Schedule frequency' })
  scheduleFrequency?: string;

  @ApiProperty({ description: 'Next scheduled generation' })
  nextScheduledAt?: Date;

  @ApiProperty({ description: 'Report tags' })
  tags: string[];

  @ApiProperty({ description: 'Report category' })
  category?: string;

  @ApiProperty({ description: 'Department' })
  department?: string;

  @ApiProperty({ description: 'Project' })
  project?: string;

  @ApiProperty({ description: 'Report version' })
  version: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Expires at' })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  errorMessage?: string;
} 
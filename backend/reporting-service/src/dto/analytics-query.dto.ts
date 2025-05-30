import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsDateString,
  IsObject,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TimePeriod, AggregationFunction, MetricType } from '../enums';

export class DateRangeDto {
  @ApiProperty({ description: 'Start date in ISO format', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date in ISO format', example: '2024-01-31T23:59:59Z' })
  @IsDateString()
  endDate: string;
}

export class FilterDto {
  @ApiPropertyOptional({ description: 'Field name to filter on' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({ description: 'Filter operator', enum: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'LIKE'] })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiPropertyOptional({ description: 'Filter value' })
  @IsOptional()
  value?: any;

  @ApiPropertyOptional({ description: 'Logical operator for multiple filters', enum: ['AND', 'OR'] })
  @IsOptional()
  @IsString()
  logic?: 'AND' | 'OR';
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Date range for the query' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Time period for aggregation',
    enum: TimePeriod,
    default: TimePeriod.DAILY,
  })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod?: TimePeriod = TimePeriod.DAILY;

  @ApiPropertyOptional({
    description: 'Metrics to include in the query',
    type: [String],
    example: ['totalUsers', 'activeUsers', 'revenue'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({
    description: 'Services to include in the query',
    type: [String],
    example: ['auth-service', 'payment-service', 'chat-service'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({
    description: 'Fields to group results by',
    type: [String],
    example: ['service', 'date'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({
    description: 'Aggregation function to apply',
    enum: AggregationFunction,
    default: AggregationFunction.SUM,
  })
  @IsOptional()
  @IsEnum(AggregationFunction)
  aggregation?: AggregationFunction = AggregationFunction.SUM;

  @ApiPropertyOptional({
    description: 'Filters to apply to the query',
    type: [FilterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[];

  @ApiPropertyOptional({
    description: 'Organization ID to filter by',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

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
    description: 'Limit number of results',
    minimum: 1,
    maximum: 10000,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'timestamp',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Include metadata in response',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeMetadata?: boolean = false;

  @ApiPropertyOptional({
    description: 'Enable data caching',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  enableCaching?: boolean = true;

  @ApiPropertyOptional({
    description: 'Cache TTL in seconds',
    minimum: 60,
    maximum: 3600,
    default: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  @Transform(({ value }) => parseInt(value))
  cacheTtl?: number = 300;

  @ApiPropertyOptional({
    description: 'Custom query parameters',
    type: 'object',
    example: { customFilter: 'value' },
  })
  @IsOptional()
  @IsObject()
  customParams?: Record<string, any>;
}

export class RealTimeQueryDto {
  @ApiPropertyOptional({
    description: 'Real-time window in seconds',
    minimum: 30,
    maximum: 3600,
    default: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(3600)
  @Transform(({ value }) => parseInt(value))
  windowSeconds?: number = 300;

  @ApiPropertyOptional({
    description: 'Metrics to track in real-time',
    type: [String],
    example: ['activeUsers', 'newEvents', 'errorRate'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({
    description: 'Services to monitor',
    type: [String],
    example: ['auth-service', 'payment-service'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({
    description: 'Update interval in seconds',
    minimum: 5,
    maximum: 300,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(300)
  @Transform(({ value }) => parseInt(value))
  updateInterval?: number = 30;
}

export class CohortAnalysisDto {
  @ApiProperty({
    description: 'Cohort type',
    enum: ['registration', 'first_purchase', 'first_session'],
    example: 'registration',
  })
  @IsString()
  cohortType: 'registration' | 'first_purchase' | 'first_session';

  @ApiPropertyOptional({
    description: 'Cohort period',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'monthly',
  })
  @IsOptional()
  @IsString()
  cohortPeriod?: 'daily' | 'weekly' | 'monthly' = 'monthly';

  @ApiPropertyOptional({ description: 'Date range for cohort analysis' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Number of periods to analyze',
    minimum: 1,
    maximum: 24,
    default: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  @Transform(({ value }) => parseInt(value))
  periods?: number = 12;

  @ApiPropertyOptional({
    description: 'Metric to analyze',
    example: 'retention_rate',
  })
  @IsOptional()
  @IsString()
  metric?: string = 'retention_rate';
}

export class FunnelAnalysisDto {
  @ApiProperty({
    description: 'Funnel steps in order',
    type: [String],
    example: ['signup', 'profile_complete', 'first_session', 'subscription'],
  })
  @IsArray()
  @IsString({ each: true })
  steps: string[];

  @ApiPropertyOptional({ description: 'Date range for funnel analysis' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Time window for funnel completion in days',
    minimum: 1,
    maximum: 365,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  timeWindowDays?: number = 30;

  @ApiPropertyOptional({
    description: 'Conversion event to track',
    example: 'purchase',
  })
  @IsOptional()
  @IsString()
  conversionEvent?: string;

  @ApiPropertyOptional({
    description: 'Group funnel by dimension',
    example: 'source',
  })
  @IsOptional()
  @IsString()
  groupByDimension?: string;
} 
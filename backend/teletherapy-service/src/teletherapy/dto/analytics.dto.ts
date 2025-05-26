import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsEnum, IsNumber, IsUUID, ValidateNested, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsDateRangeDto {
  @ApiProperty({ description: 'Start date for analytics' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date for analytics' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class AnalyticsFilterDto extends AnalyticsDateRangeDto {
  @ApiProperty({ description: 'Therapist ID filter', required: false })
  @IsOptional()
  @IsUUID()
  therapistId?: string;

  @ApiProperty({ description: 'Session category filter', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Session type filter', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Session focus filter', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focus?: string[];
}

export class AttendanceMetricsDto {
  @ApiProperty({ description: 'Total number of sessions' })
  @IsNumber()
  totalSessions: number;

  @ApiProperty({ description: 'Total number of participants invited' })
  @IsNumber()
  totalInvited: number;

  @ApiProperty({ description: 'Total number of participants who attended' })
  @IsNumber()
  totalAttended: number;

  @ApiProperty({ description: 'Average attendance rate' })
  @IsNumber()
  averageAttendanceRate: number;

  @ApiProperty({ description: 'Number of late joins' })
  @IsNumber()
  lateJoins: number;

  @ApiProperty({ description: 'Number of early leaves' })
  @IsNumber()
  earlyLeaves: number;

  @ApiProperty({ description: 'Average session duration in minutes' })
  @IsNumber()
  averageDuration: number;
}

export class EngagementMetricsDto {
  @ApiProperty({ description: 'Total number of chat messages' })
  @IsNumber()
  totalChatMessages: number;

  @ApiProperty({ description: 'Total number of reactions' })
  @IsNumber()
  totalReactions: number;

  @ApiProperty({ description: 'Total number of resource downloads' })
  @IsNumber()
  totalResourceDownloads: number;

  @ApiProperty({ description: 'Average participation score' })
  @IsNumber()
  averageParticipationScore: number;

  @ApiProperty({ description: 'Active participants percentage' })
  @IsNumber()
  activeParticipantsPercentage: number;

  @ApiProperty({ description: 'Breakout room usage statistics' })
  @IsObject()
  breakoutRoomStats: {
    totalRooms: number;
    averageDuration: number;
    participantDistribution: Record<string, number>;
  };
}

export class FeedbackMetricsDto {
  @ApiProperty({ description: 'Average session rating' })
  @IsNumber()
  averageRating: number;

  @ApiProperty({ description: 'Total number of ratings' })
  @IsNumber()
  totalRatings: number;

  @ApiProperty({ description: 'Rating distribution' })
  @IsObject()
  ratingDistribution: Record<string, number>;

  @ApiProperty({ description: 'Average sentiment score' })
  @IsNumber()
  sentimentScore: number;

  @ApiProperty({ description: 'Common feedback topics' })
  @IsArray()
  @IsString({ each: true })
  commonTopics: string[];

  @ApiProperty({ description: 'Feedback trends over time' })
  @IsObject()
  trends: {
    ratings: Record<string, number>;
    sentiment: Record<string, number>;
  };
}

export class TechnicalMetricsDto {
  @ApiProperty({ description: 'Average connection quality score' })
  @IsNumber()
  averageConnectionQuality: number;

  @ApiProperty({ description: 'Total number of disconnections' })
  @IsNumber()
  totalDisconnections: number;

  @ApiProperty({ description: 'Device type distribution' })
  @IsObject()
  deviceTypes: Record<string, number>;

  @ApiProperty({ description: 'Browser type distribution' })
  @IsObject()
  browserTypes: Record<string, number>;

  @ApiProperty({ description: 'Average bandwidth usage' })
  @IsNumber()
  averageBandwidthUsage: number;

  @ApiProperty({ description: 'Technical issues by type' })
  @IsObject()
  technicalIssues: Record<string, number>;
}

export class ReportGenerationDto extends AnalyticsFilterDto {
  @ApiProperty({ description: 'Report type', enum: ['summary', 'detailed', 'custom'] })
  @IsEnum(['summary', 'detailed', 'custom'])
  type: 'summary' | 'detailed' | 'custom';

  @ApiProperty({ description: 'Metrics to include', type: [String] })
  @IsArray()
  @IsString({ each: true })
  metrics: string[];

  @ApiProperty({ description: 'Format', enum: ['pdf', 'csv', 'excel'] })
  @IsEnum(['pdf', 'csv', 'excel'])
  format: 'pdf' | 'csv' | 'excel';

  @ApiProperty({ description: 'Include charts and graphs', default: true })
  @IsBoolean()
  @IsOptional()
  includeCharts?: boolean;

  @ApiProperty({ description: 'Custom report template', required: false })
  @IsOptional()
  @IsString()
  template?: string;
}

export class AnalyticsExportDto extends AnalyticsFilterDto {
  @ApiProperty({ description: 'Export format', enum: ['json', 'csv', 'excel'] })
  @IsEnum(['json', 'csv', 'excel'])
  format: 'json' | 'csv' | 'excel';

  @ApiProperty({ description: 'Include raw data', default: false })
  @IsBoolean()
  @IsOptional()
  includeRawData?: boolean;

  @ApiProperty({ description: 'Compress export file', default: true })
  @IsBoolean()
  @IsOptional()
  compress?: boolean;
} 
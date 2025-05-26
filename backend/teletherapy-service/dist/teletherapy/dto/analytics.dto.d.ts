export declare class AnalyticsDateRangeDto {
    startDate: Date;
    endDate: Date;
}
export declare class AnalyticsFilterDto extends AnalyticsDateRangeDto {
    therapistId?: string;
    category?: string;
    type?: string;
    focus?: string[];
}
export declare class AttendanceMetricsDto {
    totalSessions: number;
    totalInvited: number;
    totalAttended: number;
    averageAttendanceRate: number;
    lateJoins: number;
    earlyLeaves: number;
    averageDuration: number;
}
export declare class EngagementMetricsDto {
    totalChatMessages: number;
    totalReactions: number;
    totalResourceDownloads: number;
    averageParticipationScore: number;
    activeParticipantsPercentage: number;
    breakoutRoomStats: {
        totalRooms: number;
        averageDuration: number;
        participantDistribution: Record<string, number>;
    };
}
export declare class FeedbackMetricsDto {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: Record<string, number>;
    sentimentScore: number;
    commonTopics: string[];
    trends: {
        ratings: Record<string, number>;
        sentiment: Record<string, number>;
    };
}
export declare class TechnicalMetricsDto {
    averageConnectionQuality: number;
    totalDisconnections: number;
    deviceTypes: Record<string, number>;
    browserTypes: Record<string, number>;
    averageBandwidthUsage: number;
    technicalIssues: Record<string, number>;
}
export declare class ReportGenerationDto extends AnalyticsFilterDto {
    type: 'summary' | 'detailed' | 'custom';
    metrics: string[];
    format: 'pdf' | 'csv' | 'excel';
    includeCharts?: boolean;
    template?: string;
}
export declare class AnalyticsExportDto extends AnalyticsFilterDto {
    format: 'json' | 'csv' | 'excel';
    includeRawData?: boolean;
    compress?: boolean;
}

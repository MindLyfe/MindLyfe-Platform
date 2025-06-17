import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ReportingService } from '../services/reporting.service';

@ApiTags('reporting')
@Controller('reporting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  // ==================== ANALYTICS ENDPOINTS ====================

  @Get('analytics/overview')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get platform overview analytics', description: 'Admin only - Get comprehensive platform analytics overview' })
  @ApiResponse({ status: 200, description: 'Platform overview analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe (7d, 30d, 90d, 1y)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  async getPlatformOverview(
    @Query('timeframe') timeframe?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportingService.getPlatformOverview({ timeframe, startDate, endDate });
  }

  @Get('analytics/engagement')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get user engagement metrics', description: 'Admin only - Get detailed user engagement analytics' })
  @ApiResponse({ status: 200, description: 'User engagement metrics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by (day, week, month)' })
  async getUserEngagementMetrics(
    @Query('timeframe') timeframe?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.reportingService.getUserEngagementMetrics({ timeframe, groupBy });
  }

  @Get('analytics/features')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get feature usage analytics', description: 'Admin only - Get analytics for specific features' })
  @ApiResponse({ status: 200, description: 'Feature usage analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'feature', required: false, description: 'Specific feature to analyze' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  async getFeatureUsageAnalytics(
    @Query('feature') feature?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.reportingService.getFeatureUsageAnalytics({ feature, timeframe });
  }

  @Get('analytics/notifications/performance')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get notification performance analytics', description: 'Admin only - Get notification delivery and engagement metrics' })
  @ApiResponse({ status: 200, description: 'Notification performance analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'channel', required: false, description: 'Notification channel (email, push, in-app)' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  async getNotificationPerformance(
    @Query('channel') channel?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.reportingService.getNotificationPerformance({ channel, timeframe });
  }

  @Get('analytics/notifications/channels')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get notification channel comparison', description: 'Admin only - Compare performance across notification channels' })
  @ApiResponse({ status: 200, description: 'Notification channel comparison retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'metric', required: false, description: 'Metric to compare (engagement, delivery, conversion)' })
  async getNotificationChannelComparison(
    @Query('metric') metric?: string,
  ) {
    return this.reportingService.getNotificationChannelComparison({ metric });
  }

  @Get('analytics/gamification/overview')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get gamification overview analytics', description: 'Admin only - Get gamification system analytics' })
  @ApiResponse({ status: 200, description: 'Gamification overview analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  async getGamificationOverview(
    @Query('timeframe') timeframe?: string,
  ) {
    return this.reportingService.getGamificationOverview({ timeframe });
  }

  @Get('analytics/gamification/streaks')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get streak analytics', description: 'Admin only - Get user streak analytics' })
  @ApiResponse({ status: 200, description: 'Streak analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'type', required: false, description: 'Streak type (daily-login, journaling, meditation)' })
  async getStreakAnalytics(
    @Query('type') type?: string,
  ) {
    return this.reportingService.getStreakAnalytics({ type });
  }

  @Get('analytics/users/cohorts')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get user cohort analytics', description: 'Admin only - Get user cohort analysis' })
  @ApiResponse({ status: 200, description: 'User cohort analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'cohortType', required: false, description: 'Cohort type (registration, subscription)' })
  @ApiQuery({ name: 'period', required: false, description: 'Cohort period (weekly, monthly)' })
  async getUserCohorts(
    @Query('cohortType') cohortType?: string,
    @Query('period') period?: string,
  ) {
    return this.reportingService.getUserCohorts({ cohortType, period });
  }

  @Get('analytics/users/retention')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get user retention analytics', description: 'Admin only - Get user retention analysis' })
  @ApiResponse({ status: 200, description: 'User retention analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'cohortDate', required: false, description: 'Cohort date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'period', required: false, description: 'Retention period (daily, weekly, monthly)' })
  async getUserRetention(
    @Query('cohortDate') cohortDate?: string,
    @Query('period') period?: string,
  ) {
    return this.reportingService.getUserRetention({ cohortDate, period });
  }

  @Get('analytics/payments/revenue')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get revenue analytics', description: 'Admin only - Get revenue and financial analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by (day, week, month)' })
  async getRevenueAnalytics(
    @Query('timeframe') timeframe?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.reportingService.getRevenueAnalytics({ timeframe, groupBy });
  }

  @Get('analytics/payments/subscriptions')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get subscription metrics', description: 'Admin only - Get subscription analytics including churn' })
  @ApiResponse({ status: 200, description: 'Subscription metrics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'metric', required: false, description: 'Metric type (churn, growth, conversion)' })
  async getSubscriptionMetrics(
    @Query('metric') metric?: string,
  ) {
    return this.reportingService.getSubscriptionMetrics({ metric });
  }

  // ==================== REPORTS ENDPOINTS ====================

  @Post('reports/generate')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate custom report', description: 'Admin only - Generate a custom analytics report' })
  @ApiResponse({ status: 201, description: 'Report generation started successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async generateReport(@Body() reportDto: any, @Req() req: any) {
    return this.reportingService.generateReport(reportDto, req.user.userId);
  }

  @Get('reports')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get reports list', description: 'Admin only - Get list of generated reports' })
  @ApiResponse({ status: 200, description: 'Reports list retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by report status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by report type' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getReports(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reportingService.getReports({
      status,
      type,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('reports/:reportId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiOperation({ summary: 'Get report details', description: 'Admin only - Get details of a specific report' })
  @ApiResponse({ status: 200, description: 'Report details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getReport(@Param('reportId') reportId: string) {
    return this.reportingService.getReport(reportId);
  }

  @Get('reports/:reportId/status')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiOperation({ summary: 'Get report status', description: 'Admin only - Get generation status of a report' })
  @ApiResponse({ status: 200, description: 'Report status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getReportStatus(@Param('reportId') reportId: string) {
    return this.reportingService.getReportStatus(reportId);
  }

  @Get('reports/:reportId/download')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiOperation({ summary: 'Download report', description: 'Admin only - Download a completed report' })
  @ApiResponse({ status: 200, description: 'Report downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Report not found or not ready' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async downloadReport(@Param('reportId') reportId: string, @Req() req: any) {
    return this.reportingService.downloadReport(reportId, req.user.userId);
  }

  @Delete('reports/:reportId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete report', description: 'Admin only - Delete a report' })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async deleteReport(@Param('reportId') reportId: string) {
    return this.reportingService.deleteReport(reportId);
  }

  @Post('reports/:reportId/share')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Share report', description: 'Admin only - Share a report with specific users' })
  @ApiResponse({ status: 201, description: 'Report shared successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async shareReport(@Param('reportId') reportId: string, @Body() shareDto: any) {
    return this.reportingService.shareReport(reportId, shareDto);
  }

  // ==================== DASHBOARDS ENDPOINTS ====================

  @Get('dashboards/config')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get dashboard configuration', description: 'Admin only - Get dashboard widget configuration' })
  @ApiResponse({ status: 200, description: 'Dashboard configuration retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getDashboardConfig() {
    return this.reportingService.getDashboardConfig();
  }

  @Post('dashboards/config')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create dashboard configuration', description: 'Admin only - Create custom dashboard configuration' })
  @ApiResponse({ status: 201, description: 'Dashboard configuration created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createDashboardConfig(@Body() configDto: any, @Req() req: any) {
    return this.reportingService.createDashboardConfig(configDto, req.user.userId);
  }

  @Patch('dashboards/config/:configId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'configId', description: 'Configuration ID' })
  @ApiOperation({ summary: 'Update dashboard configuration', description: 'Admin only - Update dashboard configuration' })
  @ApiResponse({ status: 200, description: 'Dashboard configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async updateDashboardConfig(@Param('configId') configId: string, @Body() updateDto: any) {
    return this.reportingService.updateDashboardConfig(configId, updateDto);
  }

  @Get('dashboards/widgets')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get dashboard widgets data', description: 'Admin only - Get data for dashboard widgets' })
  @ApiResponse({ status: 200, description: 'Dashboard widgets data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'widget', required: false, description: 'Specific widget ID' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Data timeframe' })
  async getDashboardWidgets(
    @Query('widget') widget?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.reportingService.getDashboardWidgets({ widget, timeframe });
  }

  // ==================== DATA EXPORT ENDPOINTS ====================

  @Post('export/data')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Export platform data', description: 'Admin only - Export platform data in various formats' })
  @ApiResponse({ status: 201, description: 'Data export started successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async exportData(@Body() exportDto: any, @Req() req: any) {
    return this.reportingService.exportData(exportDto, req.user.userId);
  }

  @Get('export/jobs')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get export jobs status', description: 'Admin only - Get status of data export jobs' })
  @ApiResponse({ status: 200, description: 'Export jobs status retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getExportJobs() {
    return this.reportingService.getExportJobs();
  }

  @Get('export/jobs/:jobId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'jobId', description: 'Export job ID' })
  @ApiOperation({ summary: 'Get export job details', description: 'Admin only - Get details of a specific export job' })
  @ApiResponse({ status: 200, description: 'Export job details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Export job not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getExportJob(@Param('jobId') jobId: string) {
    return this.reportingService.getExportJob(jobId);
  }

  @Get('export/jobs/:jobId/download')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'jobId', description: 'Export job ID' })
  @ApiOperation({ summary: 'Download exported data', description: 'Admin only - Download completed data export' })
  @ApiResponse({ status: 200, description: 'Exported data downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Export job not found or not ready' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async downloadExportedData(@Param('jobId') jobId: string, @Req() req: any) {
    return this.reportingService.downloadExportedData(jobId, req.user.userId);
  }

  // ==================== REAL-TIME ANALYTICS ENDPOINTS ====================

  @Get('analytics/real-time/overview')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get real-time platform overview', description: 'Admin only - Get real-time platform metrics' })
  @ApiResponse({ status: 200, description: 'Real-time overview retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getRealTimeOverview() {
    return this.reportingService.getRealTimeOverview();
  }

  @Get('analytics/real-time/users')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get real-time user activity', description: 'Admin only - Get real-time user activity metrics' })
  @ApiResponse({ status: 200, description: 'Real-time user activity retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getRealTimeUserActivity() {
    return this.reportingService.getRealTimeUserActivity();
  }

  @Get('analytics/real-time/errors')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get real-time error metrics', description: 'Admin only - Get real-time system error metrics' })
  @ApiResponse({ status: 200, description: 'Real-time error metrics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getRealTimeErrorMetrics() {
    return this.reportingService.getRealTimeErrorMetrics();
  }

  // ==================== HEALTH CHECK ENDPOINTS ====================

  @Get('health')
  @ApiOperation({ summary: 'Reporting service health check', description: 'Check reporting service health and availability' })
  @ApiResponse({ status: 200, description: 'Reporting service is healthy' })
  async getHealth() {
    return this.reportingService.getHealth();
  }

  @Get('health/data-sources')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Check data sources health', description: 'Admin only - Check health of all data sources' })
  @ApiResponse({ status: 200, description: 'Data sources health retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getDataSourcesHealth() {
    return this.reportingService.getDataSourcesHealth();
  }
} 
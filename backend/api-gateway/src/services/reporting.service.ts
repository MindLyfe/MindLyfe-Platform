import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);
  private readonly reportingServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.reportingServiceUrl = this.configService.get<string>('services.reporting.url');
  }

  // ==================== ANALYTICS ====================

  async getPlatformOverview(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/overview?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get platform overview failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get platform overview error: ${error.message}`);
      throw error;
    }
  }

  async getUserEngagementMetrics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/engagement?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user engagement metrics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user engagement metrics error: ${error.message}`);
      throw error;
    }
  }

  async getFeatureUsageAnalytics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/features?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get feature usage analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get feature usage analytics error: ${error.message}`);
      throw error;
    }
  }

  async getNotificationPerformance(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/notifications/performance?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get notification performance failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get notification performance error: ${error.message}`);
      throw error;
    }
  }

  async getNotificationChannelComparison(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/notifications/channels?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get notification channel comparison failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get notification channel comparison error: ${error.message}`);
      throw error;
    }
  }

  async getGamificationOverview(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/gamification/overview?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get gamification overview failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get gamification overview error: ${error.message}`);
      throw error;
    }
  }

  async getStreakAnalytics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/gamification/streaks?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get streak analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get streak analytics error: ${error.message}`);
      throw error;
    }
  }

  async getUserCohorts(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/users/cohorts?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user cohorts failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user cohorts error: ${error.message}`);
      throw error;
    }
  }

  async getUserRetention(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/users/retention?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user retention failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user retention error: ${error.message}`);
      throw error;
    }
  }

  async getRevenueAnalytics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/payments/revenue?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get revenue analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get revenue analytics error: ${error.message}`);
      throw error;
    }
  }

  async getSubscriptionMetrics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/payments/subscriptions?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get subscription metrics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get subscription metrics error: ${error.message}`);
      throw error;
    }
  }

  // ==================== REPORTS ====================

  async generateReport(reportDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.reportingServiceUrl}/api/v1/reports/generate`, reportDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Generate report failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Generate report error: ${error.message}`);
      throw error;
    }
  }

  async getReports(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/reports?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get reports failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get reports error: ${error.message}`);
      throw error;
    }
  }

  async getReport(reportId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/reports/${reportId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get report failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get report error: ${error.message}`);
      throw error;
    }
  }

  async getReportStatus(reportId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/reports/${reportId}/status`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get report status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get report status error: ${error.message}`);
      throw error;
    }
  }

  async downloadReport(reportId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/reports/${reportId}/download`, {
          headers: { 'x-user-id': userId },
          responseType: 'stream'
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Download report failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Download report error: ${error.message}`);
      throw error;
    }
  }

  async deleteReport(reportId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.reportingServiceUrl}/api/v1/reports/${reportId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete report failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete report error: ${error.message}`);
      throw error;
    }
  }

  async shareReport(reportId: string, shareDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.reportingServiceUrl}/api/v1/reports/${reportId}/share`, shareDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Share report failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Share report error: ${error.message}`);
      throw error;
    }
  }

  // ==================== DASHBOARDS ====================

  async getDashboardConfig() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/dashboards/config`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get dashboard config failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get dashboard config error: ${error.message}`);
      throw error;
    }
  }

  async createDashboardConfig(configDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.reportingServiceUrl}/api/v1/dashboards/config`, configDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create dashboard config failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create dashboard config error: ${error.message}`);
      throw error;
    }
  }

  async updateDashboardConfig(configId: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.reportingServiceUrl}/api/v1/dashboards/config/${configId}`, updateDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update dashboard config failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update dashboard config error: ${error.message}`);
      throw error;
    }
  }

  async getDashboardWidgets(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/dashboards/widgets?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get dashboard widgets failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get dashboard widgets error: ${error.message}`);
      throw error;
    }
  }

  // ==================== DATA EXPORT ====================

  async exportData(exportDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.reportingServiceUrl}/api/v1/export/data`, exportDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Export data failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Export data error: ${error.message}`);
      throw error;
    }
  }

  async getExportJobs() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/export/jobs`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get export jobs failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get export jobs error: ${error.message}`);
      throw error;
    }
  }

  async getExportJob(jobId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/export/jobs/${jobId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get export job failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get export job error: ${error.message}`);
      throw error;
    }
  }

  async downloadExportedData(jobId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/export/jobs/${jobId}/download`, {
          headers: { 'x-user-id': userId },
          responseType: 'stream'
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Download exported data failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Download exported data error: ${error.message}`);
      throw error;
    }
  }

  // ==================== REAL-TIME ANALYTICS ====================

  async getRealTimeOverview() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/real-time/overview`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get real-time overview failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get real-time overview error: ${error.message}`);
      throw error;
    }
  }

  async getRealTimeUserActivity() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/real-time/users`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get real-time user activity failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get real-time user activity error: ${error.message}`);
      throw error;
    }
  }

  async getRealTimeErrorMetrics() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/analytics/real-time/errors`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get real-time error metrics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get real-time error metrics error: ${error.message}`);
      throw error;
    }
  }

  // ==================== HEALTH ====================

  async getHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/health`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get reporting health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get reporting health error: ${error.message}`);
      throw error;
    }
  }

  async getDataSourcesHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportingServiceUrl}/api/v1/health/data-sources`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get data sources health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get data sources health error: ${error.message}`);
      throw error;
    }
  }
} 
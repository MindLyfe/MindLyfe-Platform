import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class RecommenderService {
  private readonly logger = new Logger(RecommenderService.name);
  private readonly recommenderServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.recommenderServiceUrl = this.configService.get<string>('services.recommender.url');
  }

  // ==================== RECOMMENDATIONS ====================

  async getRecommendations(userId: string, requestDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/recommendations`, requestDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get recommendations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get recommendations error: ${error.message}`);
      throw error;
    }
  }

  async analyzeAndRecommend(userId: string, analysisDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/recommendations/analyze`, analysisDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Analyze and recommend failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Analyze and recommend error: ${error.message}`);
      throw error;
    }
  }

  async getRecommendation(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/recommendations/${id}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get recommendation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get recommendation error: ${error.message}`);
      throw error;
    }
  }

  async createRecommendation(createDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/recommendations/create`, createDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create recommendation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create recommendation error: ${error.message}`);
      throw error;
    }
  }

  async getRecommendationHistory(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/history?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get recommendation history failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get recommendation history error: ${error.message}`);
      throw error;
    }
  }

  async provideFeedback(userId: string, feedbackDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/feedback`, feedbackDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Provide feedback failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Provide feedback error: ${error.message}`);
      throw error;
    }
  }

  // ==================== CATEGORIES ====================

  async getCategories() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/categories`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get categories failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get categories error: ${error.message}`);
      throw error;
    }
  }

  async getCategoryDetails(category: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/categories/${category}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get category details failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get category details error: ${error.message}`);
      throw error;
    }
  }

  async getCategoryRecommendations(userId: string, category: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/categories/${category}/recommendations?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get category recommendations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get category recommendations error: ${error.message}`);
      throw error;
    }
  }

  // ==================== ACTIVITIES ====================

  async getActivities(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/activities?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get activities failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get activities error: ${error.message}`);
      throw error;
    }
  }

  async getActivity(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/activities/${id}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get activity failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get activity error: ${error.message}`);
      throw error;
    }
  }

  async trackActivityEngagement(id: string, userId: string, trackingDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/activities/${id}/track`, trackingDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Track activity engagement failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Track activity engagement error: ${error.message}`);
      throw error;
    }
  }

  // ==================== SCHEDULE ====================

  async getRecommendationSchedule(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/schedule?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get recommendation schedule failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get recommendation schedule error: ${error.message}`);
      throw error;
    }
  }

  async scheduleRecommendations(userId: string, scheduleDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/schedule`, scheduleDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Schedule recommendations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Schedule recommendations error: ${error.message}`);
      throw error;
    }
  }

  async updateScheduledRecommendation(id: string, userId: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.recommenderServiceUrl}/api/v1/schedule/${id}`, updateDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update scheduled recommendation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update scheduled recommendation error: ${error.message}`);
      throw error;
    }
  }

  async deleteScheduledRecommendation(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.recommenderServiceUrl}/api/v1/schedule/${id}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete scheduled recommendation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete scheduled recommendation error: ${error.message}`);
      throw error;
    }
  }

  // ==================== WELLNESS PLANS ====================

  async getWellnessPlans(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/plans?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get wellness plans failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get wellness plans error: ${error.message}`);
      throw error;
    }
  }

  async createWellnessPlan(userId: string, planDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/plans`, planDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create wellness plan failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create wellness plan error: ${error.message}`);
      throw error;
    }
  }

  async getWellnessPlan(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/plans/${id}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get wellness plan failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get wellness plan error: ${error.message}`);
      throw error;
    }
  }

  async updateWellnessPlan(id: string, userId: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.recommenderServiceUrl}/api/v1/plans/${id}`, updateDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update wellness plan failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update wellness plan error: ${error.message}`);
      throw error;
    }
  }

  async deleteWellnessPlan(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.recommenderServiceUrl}/api/v1/plans/${id}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete wellness plan failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete wellness plan error: ${error.message}`);
      throw error;
    }
  }

  async activateWellnessPlan(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/plans/${id}/activate`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Activate wellness plan failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Activate wellness plan error: ${error.message}`);
      throw error;
    }
  }

  // ==================== PREFERENCES ====================

  async getRecommendationPreferences(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/preferences`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get recommendation preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get recommendation preferences error: ${error.message}`);
      throw error;
    }
  }

  async updateRecommendationPreferences(userId: string, preferencesDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.recommenderServiceUrl}/api/v1/preferences`, preferencesDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update recommendation preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update recommendation preferences error: ${error.message}`);
      throw error;
    }
  }

  // ==================== ADMIN ====================

  async getRecommendationAnalytics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/admin/analytics?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get recommendation analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get recommendation analytics error: ${error.message}`);
      throw error;
    }
  }

  async manageCategoriesAdmin() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/api/v1/admin/categories/manage`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Manage categories admin failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Manage categories admin error: ${error.message}`);
      throw error;
    }
  }

  async bulkImportActivities(importDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.recommenderServiceUrl}/api/v1/admin/activities/bulk-import`, importDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Bulk import activities failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Bulk import activities error: ${error.message}`);
      throw error;
    }
  }

  // ==================== HEALTH ====================

  async getHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.recommenderServiceUrl}/health`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get recommender health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get recommender health error: ${error.message}`);
      throw error;
    }
  }
}

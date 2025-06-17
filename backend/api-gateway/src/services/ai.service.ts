import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('services.ai.url');
  }

  // ==================== PERSONALIZATION METHODS ====================

  async getPersonalizationProfile(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/personalization/profile`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get personalization profile failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get personalization profile error: ${error.message}`);
      throw error;
    }
  }

  async createPersonalizationProfile(userId: string, profileDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/personalization/profile`, profileDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create personalization profile failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create personalization profile error: ${error.message}`);
      throw error;
    }
  }

  async updatePersonalizationProfile(userId: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.aiServiceUrl}/api/v1/personalization/profile`, updateDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update personalization profile failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update personalization profile error: ${error.message}`);
      throw error;
    }
  }

  async provideFeedback(userId: string, feedbackDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/personalization/feedback`, feedbackDto, {
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

  // ==================== LYFBOT METHODS ====================

  async startLyfBotConversation(userId: string, conversationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/lyfbot/conversation`, conversationDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Start LyfBot conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Start LyfBot conversation error: ${error.message}`);
      throw error;
    }
  }

  async getLyfBotConversations(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/lyfbot/conversations?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get LyfBot conversations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get LyfBot conversations error: ${error.message}`);
      throw error;
    }
  }

  async getLyfBotConversation(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/lyfbot/conversations/${conversationId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get LyfBot conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get LyfBot conversation error: ${error.message}`);
      throw error;
    }
  }

  async sendLyfBotMessage(conversationId: string, userId: string, messageDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/lyfbot/conversations/${conversationId}/messages`, messageDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Send LyfBot message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Send LyfBot message error: ${error.message}`);
      throw error;
    }
  }

  async deleteLyfBotConversation(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.aiServiceUrl}/api/v1/lyfbot/conversations/${conversationId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete LyfBot conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete LyfBot conversation error: ${error.message}`);
      throw error;
    }
  }

  // ==================== RECOMMENDATIONS METHODS ====================

  async getContentRecommendations(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/recommendations/content?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get content recommendations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get content recommendations error: ${error.message}`);
      throw error;
    }
  }

  async getActivityRecommendations(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/recommendations/activities?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get activity recommendations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get activity recommendations error: ${error.message}`);
      throw error;
    }
  }

  async getTherapistRecommendations(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/recommendations/therapists?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get therapist recommendations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get therapist recommendations error: ${error.message}`);
      throw error;
    }
  }

  async provideRecommendationFeedback(userId: string, feedbackDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/recommendations/feedback`, feedbackDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Provide recommendation feedback failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Provide recommendation feedback error: ${error.message}`);
      throw error;
    }
  }

  // ==================== JOURNAL AI METHODS ====================

  async analyzeJournalEntry(userId: string, analysisDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/journal/analyze`, analysisDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Analyze journal entry failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Analyze journal entry error: ${error.message}`);
      throw error;
    }
  }

  async getJournalInsights(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/journal/insights?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get journal insights failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get journal insights error: ${error.message}`);
      throw error;
    }
  }

  async getMoodPatterns(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/journal/mood-patterns?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get mood patterns failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get mood patterns error: ${error.message}`);
      throw error;
    }
  }

  async getJournalSuggestions(userId: string, requestDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/journal/suggestions`, requestDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get journal suggestions failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get journal suggestions error: ${error.message}`);
      throw error;
    }
  }

  // ==================== ADMIN METHODS ====================

  async getAiAnalytics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/admin/analytics?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get AI analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get AI analytics error: ${error.message}`);
      throw error;
    }
  }

  async getModelStatus() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/admin/model-status`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get model status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get model status error: ${error.message}`);
      throw error;
    }
  }

  async triggerModelRetraining(retrainDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/admin/retrain-models`, retrainDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Trigger model retraining failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Trigger model retraining error: ${error.message}`);
      throw error;
    }
  }

  async getUserAiInteractions(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/admin/user-interactions/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user AI interactions failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user AI interactions error: ${error.message}`);
      throw error;
    }
  }

  // ==================== HEALTH CHECK METHODS ====================

  async getHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/health`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get AI health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get AI health error: ${error.message}`);
      throw error;
    }
  }

  async getModelsHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/v1/health/models`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get models health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get models health error: ${error.message}`);
      throw error;
    }
  }
} 
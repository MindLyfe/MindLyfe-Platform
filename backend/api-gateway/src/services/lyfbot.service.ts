import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class LyfbotService {
  private readonly logger = new Logger(LyfbotService.name);
  private readonly lyfbotServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.lyfbotServiceUrl = this.configService.get<string>('services.lyfbot.url');
  }

  // ==================== CONVERSATIONS ====================

  async startConversation(userId: string, conversationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations`, conversationDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Start conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Start conversation error: ${error.message}`);
      throw error;
    }
  }

  async getUserConversations(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/conversations?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user conversations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user conversations error: ${error.message}`);
      throw error;
    }
  }

  async getConversation(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get conversation error: ${error.message}`);
      throw error;
    }
  }

  async deleteConversation(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete conversation error: ${error.message}`);
      throw error;
    }
  }

  async archiveConversation(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/archive`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Archive conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Archive conversation error: ${error.message}`);
      throw error;
    }
  }

  async unarchiveConversation(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/unarchive`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Unarchive conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Unarchive conversation error: ${error.message}`);
      throw error;
    }
  }

  // ==================== MESSAGING ====================

  async sendMessage(conversationId: string, userId: string, messageDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/messages`, messageDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Send message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      throw error;
    }
  }

  async getConversationMessages(conversationId: string, userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/messages?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get conversation messages failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get conversation messages error: ${error.message}`);
      throw error;
    }
  }

  async updateMessage(conversationId: string, messageId: string, userId: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/messages/${messageId}`, updateDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update message error: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(conversationId: string, messageId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/messages/${messageId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete message error: ${error.message}`);
      throw error;
    }
  }

  // ==================== FEEDBACK AND RATING ====================

  async provideConversationFeedback(conversationId: string, userId: string, feedbackDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/feedback`, feedbackDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Provide conversation feedback failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Provide conversation feedback error: ${error.message}`);
      throw error;
    }
  }

  async provideMessageFeedback(conversationId: string, messageId: string, userId: string, feedbackDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/messages/${messageId}/feedback`, feedbackDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Provide message feedback failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Provide message feedback error: ${error.message}`);
      throw error;
    }
  }

  async rateMessage(conversationId: string, messageId: string, userId: string, ratingDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/messages/${messageId}/rate`, ratingDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Rate message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Rate message error: ${error.message}`);
      throw error;
    }
  }

  // ==================== QUICK CHAT ====================

  async quickChat(userId: string, messageDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/quick-chat`, messageDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Quick chat failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Quick chat error: ${error.message}`);
      throw error;
    }
  }

  async emergencyChat(userId: string, messageDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/emergency-chat`, messageDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Emergency chat failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Emergency chat error: ${error.message}`);
      throw error;
    }
  }

  // ==================== CONVERSATION SETTINGS ====================

  async getConversationSettings(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/settings`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get conversation settings failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get conversation settings error: ${error.message}`);
      throw error;
    }
  }

  async updateConversationSettings(conversationId: string, userId: string, settingsDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/settings`, settingsDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update conversation settings failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update conversation settings error: ${error.message}`);
      throw error;
    }
  }

  // ==================== PREFERENCES ====================

  async getLyfBotPreferences(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/preferences`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get LyfBot preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get LyfBot preferences error: ${error.message}`);
      throw error;
    }
  }

  async updateLyfBotPreferences(userId: string, preferencesDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.lyfbotServiceUrl}/api/v1/preferences`, preferencesDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update LyfBot preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update LyfBot preferences error: ${error.message}`);
      throw error;
    }
  }

  // ==================== EXPORT ====================

  async exportConversation(conversationId: string, userId: string, exportDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/export`, exportDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Export conversation failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Export conversation error: ${error.message}`);
      throw error;
    }
  }

  async downloadConversationExport(conversationId: string, exportId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/export/${exportId}`, {
          headers: { 'x-user-id': userId },
          responseType: 'stream'
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Download conversation export failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Download conversation export error: ${error.message}`);
      throw error;
    }
  }

  // ==================== INSIGHTS ====================

  async getConversationInsights(conversationId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/conversations/${conversationId}/insights`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get conversation insights failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get conversation insights error: ${error.message}`);
      throw error;
    }
  }

  async getConversationSummaryInsights(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/insights/summary?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get conversation summary insights failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get conversation summary insights error: ${error.message}`);
      throw error;
    }
  }

  // ==================== ADMIN ====================

  async getAllConversations(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/admin/conversations?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get all conversations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get all conversations error: ${error.message}`);
      throw error;
    }
  }

  async getLyfBotAnalytics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/admin/analytics?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get LyfBot analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get LyfBot analytics error: ${error.message}`);
      throw error;
    }
  }

  async getAllFeedback(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/admin/feedback?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get all feedback failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get all feedback error: ${error.message}`);
      throw error;
    }
  }

  async triggerModelRetraining(retrainDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.lyfbotServiceUrl}/api/v1/admin/model/retrain`, retrainDto).pipe(
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

  // ==================== HEALTH ====================

  async getHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/health`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get LyfBot health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get LyfBot health error: ${error.message}`);
      throw error;
    }
  }

  async getModelHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lyfbotServiceUrl}/api/v1/health/model`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get LyfBot model health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get LyfBot model health error: ${error.message}`);
      throw error;
    }
  }
} 
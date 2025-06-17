import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);
  private readonly journalServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.journalServiceUrl = this.configService.get<string>('services.journal.url');
  }

  // Journal Entries Management
  async createEntry(createEntryDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.journalServiceUrl}/api/journal/entries`, createEntryDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create entry failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create entry error: ${error.message}`);
      throw error;
    }
  }

  async getEntries(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/entries?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get entries failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get entries error: ${error.message}`);
      throw error;
    }
  }

  async getEntry(entryId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/entries/${entryId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get entry failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get entry error: ${error.message}`);
      throw error;
    }
  }

  async updateEntry(entryId: string, updateEntryDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.journalServiceUrl}/api/journal/entries/${entryId}`, updateEntryDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update entry failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update entry error: ${error.message}`);
      throw error;
    }
  }

  async deleteEntry(entryId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.journalServiceUrl}/api/journal/entries/${entryId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete entry failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete entry error: ${error.message}`);
      throw error;
    }
  }

  // Mood Tracking
  async logMood(moodDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.journalServiceUrl}/api/journal/mood`, moodDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Log mood failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Log mood error: ${error.message}`);
      throw error;
    }
  }

  async getMoodHistory(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/mood?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get mood history failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get mood history error: ${error.message}`);
      throw error;
    }
  }

  async getMoodAnalytics(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/mood/analytics?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get mood analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get mood analytics error: ${error.message}`);
      throw error;
    }
  }

  // Tags Management
  async getUserTags(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/tags`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user tags failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user tags error: ${error.message}`);
      throw error;
    }
  }

  async createTag(tagDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.journalServiceUrl}/api/journal/tags`, tagDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create tag failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create tag error: ${error.message}`);
      throw error;
    }
  }

  async deleteTag(tagId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.journalServiceUrl}/api/journal/tags/${tagId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete tag failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete tag error: ${error.message}`);
      throw error;
    }
  }

  // Templates Management
  async getTemplates(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/templates`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get templates failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get templates error: ${error.message}`);
      throw error;
    }
  }

  async createTemplate(templateDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.journalServiceUrl}/api/journal/templates`, templateDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create template failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create template error: ${error.message}`);
      throw error;
    }
  }

  async getTemplate(templateId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/templates/${templateId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get template failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get template error: ${error.message}`);
      throw error;
    }
  }

  async updateTemplate(templateId: string, updateTemplateDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.journalServiceUrl}/api/journal/templates/${templateId}`, updateTemplateDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update template failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update template error: ${error.message}`);
      throw error;
    }
  }

  async deleteTemplate(templateId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.journalServiceUrl}/api/journal/templates/${templateId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete template failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete template error: ${error.message}`);
      throw error;
    }
  }

  // Goals Management
  async getGoals(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/goals`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get goals failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get goals error: ${error.message}`);
      throw error;
    }
  }

  async createGoal(goalDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.journalServiceUrl}/api/journal/goals`, goalDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create goal failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create goal error: ${error.message}`);
      throw error;
    }
  }

  async updateGoal(goalId: string, updateGoalDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.journalServiceUrl}/api/journal/goals/${goalId}`, updateGoalDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update goal failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update goal error: ${error.message}`);
      throw error;
    }
  }

  // Insights and Analytics
  async getInsights(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/insights?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get insights failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get insights error: ${error.message}`);
      throw error;
    }
  }

  async getAnalyticsSummary(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/analytics/summary`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get analytics summary failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get analytics summary error: ${error.message}`);
      throw error;
    }
  }

  // Export/Import
  async exportJournal(userId: string, options: any) {
    try {
      const queryString = new URLSearchParams(options).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/export?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Export journal failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Export journal error: ${error.message}`);
      throw error;
    }
  }

  // Admin endpoints
  async getJournalStatistics() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.journalServiceUrl}/api/journal/admin/statistics`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get journal statistics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get journal statistics error: ${error.message}`);
      throw error;
    }
  }
} 
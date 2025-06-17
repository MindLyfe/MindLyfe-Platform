import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly authServiceUrl: string; // User management is typically handled by auth service

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url');
  }

  // ==================== PROFILE ====================

  async getCurrentUserProfile(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/profile`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get current user profile failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get current user profile error: ${error.message}`);
      throw error;
    }
  }

  async updateCurrentUserProfile(userId: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/users/profile`, updateDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update current user profile failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update current user profile error: ${error.message}`);
      throw error;
    }
  }

  async deleteUserAccount(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.authServiceUrl}/api/users/profile`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete user account failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete user account error: ${error.message}`);
      throw error;
    }
  }

  // ==================== PREFERENCES ====================

  async getUserPreferences(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/preferences`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user preferences error: ${error.message}`);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferencesDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/users/preferences`, preferencesDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update user preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update user preferences error: ${error.message}`);
      throw error;
    }
  }

  async getPrivacySettings(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/preferences/privacy`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get privacy settings failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get privacy settings error: ${error.message}`);
      throw error;
    }
  }

  async updatePrivacySettings(userId: string, privacyDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/users/preferences/privacy`, privacyDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update privacy settings failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update privacy settings error: ${error.message}`);
      throw error;
    }
  }

  async getNotificationPreferences(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/preferences/notifications`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get notification preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get notification preferences error: ${error.message}`);
      throw error;
    }
  }

  async updateNotificationPreferences(userId: string, notificationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/users/preferences/notifications`, notificationDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update notification preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update notification preferences error: ${error.message}`);
      throw error;
    }
  }

  // ==================== PROFILE PICTURE ====================

  async uploadProfilePicture(userId: string, uploadDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/users/profile/picture`, uploadDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Upload profile picture failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Upload profile picture error: ${error.message}`);
      throw error;
    }
  }

  async deleteProfilePicture(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.authServiceUrl}/api/users/profile/picture`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete profile picture failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete profile picture error: ${error.message}`);
      throw error;
    }
  }

  // ==================== ACTIVITY AND ANALYTICS ====================

  async getUserActivity(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/activity?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user activity failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user activity error: ${error.message}`);
      throw error;
    }
  }

  async getUserStatistics(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/statistics?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user statistics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user statistics error: ${error.message}`);
      throw error;
    }
  }

  async getUserAchievements(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/achievements`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user achievements failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user achievements error: ${error.message}`);
      throw error;
    }
  }

  async getUserStreaks(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/streaks`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user streaks failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user streaks error: ${error.message}`);
      throw error;
    }
  }

  // ==================== DATA EXPORT ====================

  async requestDataExport(userId: string, exportDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/users/export`, exportDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Request data export failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Request data export error: ${error.message}`);
      throw error;
    }
  }

  async getDataExportStatus(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/export/status`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get data export status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get data export status error: ${error.message}`);
      throw error;
    }
  }

  async downloadDataExport(exportId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/export/${exportId}/download`, {
          headers: { 'x-user-id': userId },
          responseType: 'stream'
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Download data export failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Download data export error: ${error.message}`);
      throw error;
    }
  }

  // ==================== CONNECTIONS ====================

  async getUserConnections(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/connections`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user connections failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user connections error: ${error.message}`);
      throw error;
    }
  }

  async createConnection(userId: string, connectionDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/users/connections`, connectionDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create connection failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create connection error: ${error.message}`);
      throw error;
    }
  }

  async removeConnection(connectionId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.authServiceUrl}/api/users/connections/${connectionId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Remove connection failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Remove connection error: ${error.message}`);
      throw error;
    }
  }

  // ==================== ACCOUNT MANAGEMENT ====================

  async deactivateAccount(userId: string, reasonDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/users/account/deactivate`, reasonDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Deactivate account failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Deactivate account error: ${error.message}`);
      throw error;
    }
  }

  async reactivateAccount(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/users/account/reactivate`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Reactivate account failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Reactivate account error: ${error.message}`);
      throw error;
    }
  }

  async getAccountSecurity(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/account/security`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get account security failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get account security error: ${error.message}`);
      throw error;
    }
  }

  async enableTwoFactorAuth(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/users/account/security/enable-2fa`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Enable two-factor auth failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Enable two-factor auth error: ${error.message}`);
      throw error;
    }
  }

  async disableTwoFactorAuth(userId: string, verificationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/users/account/security/disable-2fa`, verificationDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Disable two-factor auth failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Disable two-factor auth error: ${error.message}`);
      throw error;
    }
  }

  // ==================== ADMIN USER MANAGEMENT ====================

  async getAllUsers(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/admin/users?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get all users failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get all users error: ${error.message}`);
      throw error;
    }
  }

  async getUserDetails(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/admin/users/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user details failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user details error: ${error.message}`);
      throw error;
    }
  }

  async updateUser(userId: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/admin/users/${userId}`, updateDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update user failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update user error: ${error.message}`);
      throw error;
    }
  }

  async suspendUser(userId: string, suspensionDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/admin/users/${userId}/suspend`, suspensionDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Suspend user failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Suspend user error: ${error.message}`);
      throw error;
    }
  }

  async unsuspendUser(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/admin/users/${userId}/unsuspend`, {}).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Unsuspend user failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Unsuspend user error: ${error.message}`);
      throw error;
    }
  }

  async getUserAnalytics(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/admin/analytics/users?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user analytics failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user analytics error: ${error.message}`);
      throw error;
    }
  }

  // ==================== HEALTH ====================

  async getHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/health`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user health failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user health error: ${error.message}`);
      throw error;
    }
  }
} 
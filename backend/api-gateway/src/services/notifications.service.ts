import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly notificationServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>('services.notification.url');
  }

  async createNotification(createNotificationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/api/notification`, createNotificationDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create notification failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create notification error: ${error.message}`);
      throw error;
    }
  }

  async findAllForUser(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.notificationServiceUrl}/api/notification/my?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Find notifications for user failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Find notifications for user error: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.notificationServiceUrl}/api/notification/${id}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Find notification failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Find notification error: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.notificationServiceUrl}/api/notification/${id}/read`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Mark as read failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Mark as read error: ${error.message}`);
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.notificationServiceUrl}/api/notification/mark-all-read`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Mark all as read failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Mark all as read error: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.notificationServiceUrl}/api/notification/${id}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Remove notification failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Remove notification error: ${error.message}`);
      throw error;
    }
  }

  async sendNotification(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/api/notification/send/${id}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Send notification failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Send notification error: ${error.message}`);
      throw error;
    }
  }

  async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.notificationServiceUrl}/api/notification/user-status`, { isOnline }, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update user online status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update user online status error: ${error.message}`);
      throw error;
    }
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly userServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.userServiceUrl = this.configService.get<string>('services.user.url');
  }

  async findById(id: string, token: string) {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService
          .get(`${this.userServiceUrl}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Failed to find user: ${error.message}`);
              throw error;
            }),
          ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error finding user: ${error.message}`);
      throw error;
    }
  }

  async findAll(token: string) {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService
          .get(`${this.userServiceUrl}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Failed to find users: ${error.message}`);
              throw error;
            }),
          ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error finding users: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateDto: any, token: string) {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService
          .patch(`${this.userServiceUrl}/users/${id}`, updateDto, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Failed to update user: ${error.message}`);
              throw error;
            }),
          ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string, token: string) {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService
          .delete(`${this.userServiceUrl}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Failed to delete user: ${error.message}`);
              throw error;
            }),
          ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }

  async updatePassword(id: string, passwordDto: any, token: string) {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService
          .patch(`${this.userServiceUrl}/users/${id}/password`, passwordDto, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Failed to update password: ${error.message}`);
              throw error;
            }),
          ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error updating password: ${error.message}`);
      throw error;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly authServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url');
  }

  async getAllUsers() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users`).pipe(
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

  async getUserById(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/${id}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user by ID failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user by ID error: ${error.message}`);
      throw error;
    }
  }

  async updateUser(id: string, updateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/users/${id}`, updateDto).pipe(
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

  async deleteUser(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.authServiceUrl}/api/users/${id}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete user failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete user error: ${error.message}`);
      throw error;
    }
  }

  async updateUserPassword(id: string, passwordDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/users/${id}/password`, passwordDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update user password failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update user password error: ${error.message}`);
      throw error;
    }
  }
}

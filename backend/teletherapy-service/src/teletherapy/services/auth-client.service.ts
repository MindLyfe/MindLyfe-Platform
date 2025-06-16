import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly authServiceUrl: string;
  private readonly serviceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>(
      'services.authServiceUrl',
      'http://auth-service:3001'
    );
    this.serviceToken = this.configService.get<string>(
      'JWT_SERVICE_SECRET',
      'mindlyf-service-secret-key-dev'
    );
  }

  private getServiceHeaders() {
    return {
      'Authorization': `Bearer ${this.serviceToken}`,
      'X-Service-Name': 'teletherapy-service',
      'Content-Type': 'application/json',
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.authServiceUrl}/api/auth/users/${userId}`,
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to validate user ${userId}: ${error.message}`);
      if (error.response?.status === 404) {
        return null;
      }
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getUsers(filters: { role?: string; active?: boolean } = {}): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.active !== undefined) queryParams.append('active', filters.active.toString());

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.authServiceUrl}/api/auth/users?${queryParams.toString()}`,
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get users: ${error.message}`);
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/api/auth/users/batch`,
          { userIds },
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get users by IDs: ${error.message}`);
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async validateServiceToken(token: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/api/auth/validate-service-token`,
          { token },
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data.valid;
    } catch (error) {
      this.logger.error(`Failed to validate service token: ${error.message}`);
      return false;
    }
  }

  async checkTherapistClientRelationship(therapistId: string, clientId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.authServiceUrl}/api/auth/relationships/therapist/${therapistId}/client/${clientId}`,
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data.hasRelationship;
    } catch (error) {
      this.logger.error(`Failed to check therapist-client relationship: ${error.message}`);
      return false;
    }
  }

  async getUserSubscriptionStatus(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.authServiceUrl}/api/subscriptions/status/${userId}`,
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get subscription status for user ${userId}: ${error.message}`);
      throw new HttpException(
        'Failed to get subscription status',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async validateSessionBooking(userId: string): Promise<{ canBook: boolean; reason?: string; availableSessions?: number }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.authServiceUrl}/api/subscriptions/validate-booking/${userId}`,
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to validate session booking for user ${userId}: ${error.message}`);
      throw new HttpException(
        'Failed to validate session booking',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async consumeSession(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/api/subscriptions/consume-session/${userId}`,
          {},
          { headers: this.getServiceHeaders() }
        )
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to consume session for user ${userId}: ${error.message}`);
      throw new HttpException(
        'Failed to consume session',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.patch(
          `${this.authServiceUrl}/api/auth/users/${userId}/metadata`,
          { metadata },
          { headers: this.getServiceHeaders() }
        )
      );
    } catch (error) {
      this.logger.error(`Failed to update user metadata for ${userId}: ${error.message}`);
      throw new HttpException(
        'Failed to update user metadata',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly authServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url');
  }

  async getAvailablePlans(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/subscriptions/plans`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get available plans failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get available plans error: ${error.message}`);
      throw error;
    }
  }

  async getUserSubscriptionStatus(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/subscriptions/status`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user subscription status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user subscription status error: ${error.message}`);
      throw error;
    }
  }

  async createSubscription(createDto: any, userId: string) {
    try {
      const fullDto = { ...createDto, userId };
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/subscriptions/create`, fullDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create subscription failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create subscription error: ${error.message}`);
      throw error;
    }
  }

  async purchaseCredits(purchaseDto: any, userId: string) {
    try {
      const fullDto = { ...purchaseDto, userId };
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/subscriptions/credits/purchase`, fullDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Purchase credits failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Purchase credits error: ${error.message}`);
      throw error;
    }
  }

  async confirmPayment(paymentId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/subscriptions/payment/${paymentId}/confirm`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Confirm payment failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Confirm payment error: ${error.message}`);
      throw error;
    }
  }

  async validateUserCanBookSession(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/subscriptions/validate-booking/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Validate user can book session failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Validate user can book session error: ${error.message}`);
      throw error;
    }
  }

  async consumeSession(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/subscriptions/consume-session/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Consume session failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Consume session error: ${error.message}`);
      throw error;
    }
  }
} 
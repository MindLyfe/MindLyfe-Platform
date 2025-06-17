import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authServiceUrl: string;

  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url');
  }

  async validateUserById(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to validate user: ${error.message}`);
            return Promise.reject(new UnauthorizedException('Invalid user'));
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      return null;
    }
  }

  async login(loginDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/login`, loginDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Login failed: ${error.message}`);
            throw new UnauthorizedException('Invalid credentials');
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  async register(registerDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/register`, registerDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Registration failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  async registerTherapist(registerDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/register/therapist`, registerDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Therapist registration failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Therapist registration error: ${error.message}`);
      throw error;
    }
  }

  async registerOrganizationUser(registerDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/register/organization-user`, registerDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Organization user registration failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Organization user registration error: ${error.message}`);
      throw error;
    }
  }

  async registerSupportTeam(registerDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/register/support-team`, registerDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Support team registration failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Support team registration error: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(refreshDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/refresh-token`, refreshDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Token refresh failed: ${error.message}`);
            throw new UnauthorizedException('Invalid refresh token');
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(forgotDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/forgot-password`, forgotDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Forgot password failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Forgot password error: ${error.message}`);
      throw error;
    }
  }

  async resetPassword(resetDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/reset-password`, resetDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Reset password failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Reset password error: ${error.message}`);
      throw error;
    }
  }

  async verifyEmail(verifyDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/verify-email`, verifyDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Email verification failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Email verification error: ${error.message}`);
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/auth/me`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get profile failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get profile error: ${error.message}`);
      throw error;
    }
  }

  async changePassword(userId: string, changePasswordDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api/auth/change-password`, changePasswordDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Change password failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Change password error: ${error.message}`);
      throw error;
    }
  }

  async logout(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/logout`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Logout failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  }

  async revokeToken(revokeDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/revoke-token`, revokeDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Revoke token failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Revoke token error: ${error.message}`);
      throw error;
    }
  }

  async validateToken(user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/validate-token`, { user }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Validate token failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Validate token error: ${error.message}`);
      throw error;
    }
  }

  async validateServiceToken(tokenDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/validate-service-token`, tokenDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Validate service token failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Validate service token error: ${error.message}`);
      throw error;
    }
  }

  async validatePaymentAccess(userId: string, paymentDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/validate-payment-access`, paymentDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Validate payment access failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Validate payment access error: ${error.message}`);
      throw error;
    }
  }
} 
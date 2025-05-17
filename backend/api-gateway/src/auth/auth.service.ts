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
        this.httpService.get(`${this.authServiceUrl}/users/${userId}`).pipe(
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
        this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto).pipe(
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
        this.httpService.post(`${this.authServiceUrl}/auth/register`, registerDto).pipe(
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

  async refreshToken(token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/refresh-token`, { token }).pipe(
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

  async forgotPassword(email: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/forgot-password`, { email }).pipe(
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
        this.httpService.post(`${this.authServiceUrl}/auth/reset-password`, resetDto).pipe(
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
} 
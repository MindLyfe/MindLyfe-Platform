import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  roles?: string[];
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  name?: string;
  username?: string;
}

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly authServiceUrl: string;
  private readonly serviceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url');
    this.serviceToken = this.configService.get<string>('services.auth.serviceToken');
    
    if (!this.authServiceUrl || !this.serviceToken) {
      throw new Error('Auth service URL and service token must be configured');
    }
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.serviceToken}`,
      'X-Service-Name': this.configService.get<string>('SERVICE_NAME', 'unknown'),
    };
  }

  async validateToken(token: string): Promise<AuthUser> {
    try {
      const response: AxiosResponse<{ user: AuthUser }> = await firstValueFrom(
        this.httpService.post<{ user: AuthUser }>(
          `${this.authServiceUrl}/auth/validate-token`,
          { token },
          { headers: this.getAuthHeaders() }
        ).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Token validation failed: ${error.message}`);
            throw new UnauthorizedException('Invalid token');
          }),
        ),
      );
      return response.data.user;
    } catch (error) {
      this.logger.error(`Error validating token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateUser(userId: string): Promise<AuthUser> {
    try {
      const response: AxiosResponse<{ user: AuthUser }> = await firstValueFrom(
        this.httpService.get<{ user: AuthUser }>(
          `${this.authServiceUrl}/auth/users/${userId}`,
          { headers: this.getAuthHeaders() }
        ).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`User validation failed: ${error.message}`);
            throw new UnauthorizedException('Invalid user');
          }),
        ),
      );
      return response.data.user;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      throw new UnauthorizedException('Invalid user');
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/revoke-token`,
          { token },
          { headers: this.getAuthHeaders() }
        ).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Token revocation failed: ${error.message}`);
            throw new UnauthorizedException('Failed to revoke token');
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Error revoking token: ${error.message}`);
      throw new UnauthorizedException('Failed to revoke token');
    }
  }

  async validateServiceToken(serviceName: string, token: string): Promise<boolean> {
    try {
      const response: AxiosResponse<{ valid: boolean }> = await firstValueFrom(
        this.httpService.post<{ valid: boolean }>(
          `${this.authServiceUrl}/auth/validate-service-token`,
          { serviceName, token },
          { headers: this.getAuthHeaders() }
        ).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Service token validation failed: ${error.message}`);
            return Promise.resolve({ data: { valid: false } } as AxiosResponse<{ valid: boolean }>);
          }),
        ),
      );
      return response.data.valid;
    } catch (error) {
      this.logger.error(`Error validating service token: ${error.message}`);
      return false;
    }
  }
} 
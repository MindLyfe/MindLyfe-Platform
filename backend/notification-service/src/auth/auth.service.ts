import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { JwtUser } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.authServiceUrl');
  }

  /**
   * Validate an access token with the Auth Service
   */
  async validateToken(payload: any): Promise<JwtUser> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      // First try to validate locally
      const decodedToken = this.jwtService.verify(
        payload.raw || payload, 
        { secret: this.configService.get('jwt.secret') }
      );
      
      // If we can decode locally, create a user object
      const user: JwtUser = {
        id: decodedToken.sub || decodedToken.id,
        email: decodedToken.email,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        role: decodedToken.role,
        roles: decodedToken.roles || [decodedToken.role],
        token: payload.raw,
      };
      
      return user;
    } catch (error) {
      // If local validation fails, check with auth service
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.authServiceUrl}/api/auth/validate-token`, {
            token: payload.raw || payload,
          })
        );
        
        if (response.data?.user) {
          return {
            ...response.data.user,
            token: payload.raw,
          };
        }
        
        throw new UnauthorizedException('Token validation failed');
      } catch (httpError) {
        console.error('Token validation error:', httpError.message);
        throw new UnauthorizedException('Invalid token or auth service unavailable');
      }
    }
  }
  
  /**
   * Get a user's information by ID from the Auth Service
   */
  async getUserById(userId: string, token: string): Promise<JwtUser> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/auth/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      
      if (response.data?.user) {
        return response.data.user;
      }
      
      throw new UnauthorizedException('User not found');
    } catch (error) {
      console.error('Get user error:', error.message);
      throw new UnauthorizedException('Unable to get user information');
    }
  }
} 
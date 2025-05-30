import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly authServiceUrl: string;
  private readonly serviceToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url');
    this.serviceToken = this.configService.get<string>('services.auth.serviceToken');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/validate-token`,
          { token },
          {
            headers: {
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Service-Name': 'payment-service',
            },
          },
        ),
      );

      request.user = response.data.user;
      return true;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 
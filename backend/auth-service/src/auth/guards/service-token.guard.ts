import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const serviceToken = request.headers.authorization?.split(' ')[1];
    const serviceName = request.headers['x-service-name'];

    if (!serviceToken || !serviceName) {
      throw new UnauthorizedException('Missing service token or service name');
    }

    // Get the expected service token from configuration
    const expectedToken = this.configService.get<string>(`services.${serviceName}.token`);

    if (!expectedToken || serviceToken !== expectedToken) {
      throw new UnauthorizedException('Invalid service token');
    }

    return true;
  }
} 
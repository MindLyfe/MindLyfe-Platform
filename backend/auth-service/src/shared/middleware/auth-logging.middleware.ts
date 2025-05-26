import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Middleware that logs all auth-related route accesses
 * Includes detailed information for security auditing
 */
@Injectable()
export class AuthLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuthSecurity');
  private readonly sensitiveRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh-token',
    '/api/mfa/verify',
    '/api/mfa/enable',
    '/api/mfa/disable',
  ];
  
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || 'unknown';
    
    // Log basic request info
    this.logger.debug(
      `${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    // Log request completion
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;

      if (statusCode >= 400) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} - ${contentLength}`,
        );
      } else {
        this.logger.debug(
          `${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} - ${contentLength}`,
        );
      }
    });

    next();
  }
} 
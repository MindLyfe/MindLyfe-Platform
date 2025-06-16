import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../services/logger.service';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
  requestId?: string;
  startTime?: number;
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('RequestLoggingMiddleware');
  }

  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    // Generate unique request ID
    req.requestId = uuidv4();
    req.startTime = Date.now();

    // Set response headers
    res.setHeader('X-Request-ID', req.requestId);
    res.setHeader('X-Service-Name', 'chat-service');

    // Extract request information
    const requestInfo = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
      headers: this.sanitizeHeaders(req.headers),
      query: req.query,
      body: this.sanitizeBody(req.body, req.method),
    };

    // Log incoming request
    this.logger.logWithContext('info', `Incoming ${req.method} ${req.originalUrl}`, requestInfo);

    // Security logging for sensitive endpoints
    if (this.isSensitiveEndpoint(req.originalUrl)) {
      this.logger.security('Sensitive endpoint accessed', {
        ...requestInfo,
        endpoint: req.originalUrl,
        userId: req.user?.id || 'anonymous'
      });
    }

    // Capture response
    const originalSend = res.send;
    res.send = function (body) {
      const responseTime = Date.now() - req.startTime!;
      
      const responseInfo = {
        requestId: req.requestId,
        statusCode: res.statusCode,
        responseTime: responseTime,
        responseTimeFormatted: `${responseTime}ms`,
        contentLength: res.get('Content-Length'),
        userId: req.user?.id,
      };

      // Log response based on status code
      if (res.statusCode >= 400) {
        logger.error(`${req.method} ${req.originalUrl} - ${res.statusCode}`, null, 'RequestLoggingMiddleware');
        logger.logWithContext('error', 'Request failed', {
          ...responseInfo,
          error: body ? JSON.stringify(body) : 'No error details'
        });
      } else {
        logger.logWithContext('info', `${req.method} ${req.originalUrl} - ${res.statusCode}`, responseInfo);
      }

      // Performance monitoring
      if (responseTime > 1000) {
        logger.performance('Slow request detected', responseTime, {
          ...requestInfo,
          ...responseInfo
        });
      }

      // Business metrics
      logger.business('HTTP request completed', {
        ...requestInfo,
        ...responseInfo,
        successful: res.statusCode < 400
      });

      return originalSend.call(this, body);
    };

    const logger = this.logger;
    next();
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token'
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any, method: string): any {
    if (!body || method === 'GET') {
      return undefined;
    }

    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'creditCard',
      'ssn',
      'personalData'
    ];

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      const result = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          result[key] = sanitizeObject(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }

      return result;
    };

    return sanitizeObject(sanitized);
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = [
      '/auth/',
      '/admin/',
      '/api/auth/',
      '/calling/sessions',
      '/messages',
      '/rooms',
      '/users'
    ];

    return sensitivePatterns.some(pattern => url.includes(pattern));
  }
} 
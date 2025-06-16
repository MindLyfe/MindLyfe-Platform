import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as compression from 'compression';
import * as timeout from 'connect-timeout';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Security: Request size limits
  const securityConfig = configService.get('security');
  app.use(require('express').json({ 
    limit: securityConfig.maxRequestSize,
    verify: (req: any, res: any, buf: Buffer) => {
      // Additional validation for JSON payloads
      if (buf.length > 0) {
        try {
          JSON.parse(buf.toString());
        } catch (error) {
          logger.warn(`Invalid JSON payload from ${req.ip}: ${error.message}`);
          throw new Error('Invalid JSON payload');
        }
      }
    }
  }));
  
  app.use(require('express').urlencoded({ 
    limit: securityConfig.maxRequestSize,
    extended: true,
    parameterLimit: securityConfig.maxFields
  }));

  // Security: Request timeout
  app.use(timeout(securityConfig.requestTimeout));
  
  // Security: Compression with safety limits
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req: any, res: any) => {
      // Don't compress responses with this request header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Fallback to standard filter function
      return compression.filter(req, res);
    }
  }));

  // Security: Enhanced Helmet configuration
  const helmetConfig = configService.get('helmet');
  app.use(helmet(helmetConfig));

  // Security: Rate limiting
  const rateLimitConfig = configService.get('security.rateLimit');
  app.use(rateLimit({
    ...rateLimitConfig,
    keyGenerator: (req: any) => {
      // Use X-Forwarded-For header if behind proxy, otherwise use connection IP
      return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    },
    handler: (req: any, res: any) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: rateLimitConfig.message,
        retryAfter: Math.round(rateLimitConfig.windowMs / 1000),
      });
    },
  }));

  // Security: Auth-specific rate limiting
  const authRateLimitConfig = configService.get('security.authRateLimit');
  app.use('/api/auth', rateLimit({
    ...authRateLimitConfig,
    keyGenerator: (req: any) => {
      return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    },
    handler: (req: any, res: any) => {
      logger.error(`Auth rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
      res.status(429).json({
        error: 'Too Many Authentication Attempts',
        message: authRateLimitConfig.message,
        retryAfter: Math.round(authRateLimitConfig.windowMs / 1000),
      });
    },
  }));

  // Security: Payment-specific rate limiting
  const paymentRateLimitConfig = configService.get('security.paymentRateLimit');
  app.use('/api/payments', rateLimit({
    ...paymentRateLimitConfig,
    keyGenerator: (req: any) => {
      // For payments, also consider user ID if available
      const userId = req.headers['x-user-id'] || req.user?.id;
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
      return userId ? `${ip}:${userId}` : ip;
    },
    handler: (req: any, res: any) => {
      logger.error(`Payment rate limit exceeded for IP: ${req.ip}, user: ${req.user?.id || 'anonymous'}`);
      res.status(429).json({
        error: 'Too Many Payment Requests',
        message: paymentRateLimitConfig.message,
        retryAfter: Math.round(paymentRateLimitConfig.windowMs / 1000),
      });
    },
  }));

  // Security: CORS with strict configuration
  const corsConfig = configService.get('cors');
  app.enableCors({
    ...corsConfig,
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (Array.isArray(corsConfig.origin)) {
        if (corsConfig.origin.includes(origin)) {
          return callback(null, true);
        }
      } else if (corsConfig.origin === '*' || corsConfig.origin === origin) {
        return callback(null, true);
      }
      
      logger.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
  });

  // Security: Additional security headers
  app.use((req: any, res: any, next: any) => {
    // Add request ID for tracking
    req.requestId = require('crypto').randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    next();
  });

  // Security: Request logging middleware
  if (configService.get('logging.enableRequestLogging')) {
    app.use((req: any, res: any, next: any) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id,
        };
        
        if (res.statusCode >= 400) {
          logger.warn(`Request failed: ${JSON.stringify(logData)}`);
        } else {
          logger.log(`Request completed: ${JSON.stringify(logData)}`);
        }
      });
      
      next();
    });
  }

  // Validation with enhanced security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: configService.get('environment') === 'production',
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors) => {
        logger.warn(`Validation failed: ${JSON.stringify(errors)}`);
        return new Error('Validation failed');
      },
    }),
  );
  
  // Swagger documentation with security
  if (configService.get('environment') !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('MindLyf API Gateway')
    .setDescription('The MindLyf Mental Health Platform API Gateway')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('ai', 'AI and ML endpoints')
    .addTag('journal', 'Journal management endpoints')
    .addTag('lyfbot', 'LyfBot chat endpoints')
    .addTag('recommender', 'Recommendation endpoints')
    .addTag('chat', 'Chat and messaging endpoints')
    .addTag('teletherapy', 'Teletherapy session endpoints')
    .addTag('community', 'Community and social endpoints')
    .addTag('notifications', 'Notification endpoints')
      .addTag('payments', 'Payment and subscription endpoints')
      .addTag('resources', 'Resource management endpoints')
      .addTag('health', 'Health check endpoints')
      .addTag('admin', 'Admin management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Configure server timeouts
  const server = await app.listen(configService.get('port'));
  server.keepAliveTimeout = securityConfig.keepAliveTimeout;
  server.headersTimeout = securityConfig.headersTimeout;
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  // Error handling
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  
  // Start the server
  const port = configService.get('port');
  const environment = configService.get('environment');
  
  logger.log(`🚀 MindLyf API Gateway is running on port ${port}`);
  
  if (environment !== 'production') {
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  }
  
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`🔐 JWT Secret configured: ${!!configService.get('jwt.secret')}`);
  logger.log(`🛡️ Security hardening enabled: CORS, Rate Limiting, Helmet, Request Limits`);
  
  // Log service URLs
  const services = configService.get('services');
  logger.log('📡 Configured services:');
  Object.keys(services).forEach(serviceName => {
    logger.log(`  - ${serviceName}: ${services[serviceName].url} (timeout: ${services[serviceName].timeout}ms)`);
  });

  // Log security configuration
  logger.log('🔒 Security Configuration:');
  logger.log(`  - Max Request Size: ${securityConfig.maxRequestSize}`);
  logger.log(`  - Request Timeout: ${securityConfig.requestTimeout}ms`);
  logger.log(`  - Rate Limit: ${rateLimitConfig.max} requests per ${rateLimitConfig.windowMs}ms`);
  logger.log(`  - Auth Rate Limit: ${authRateLimitConfig.max} requests per ${authRateLimitConfig.windowMs}ms`);
  logger.log(`  - CORS Origins: ${Array.isArray(corsConfig.origin) ? corsConfig.origin.join(', ') : corsConfig.origin}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { CustomLoggerService } from './common/services/logger.service';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { join } from 'path';

async function bootstrap() {
  // Create NestJS application with Express adapter
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false, // We'll configure CORS manually for better control
    bodyParser: true,
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Set up custom logger
  const logger = await app.resolve(CustomLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  // Global prefix for all routes
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/metrics', '/']
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'ws:', 'wss:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
  }));

  // Rate Limiting
  const rateLimitConfig = {
    windowMs: configService.get<number>('rateLimit.windowMs', 60000),
    max: configService.get<number>('rateLimit.max', 100),
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
  };

  // Apply different rate limits to different endpoints
  app.use('/api/auth', rateLimit({ ...rateLimitConfig, max: 5 })); // Stricter for auth
  app.use('/api/calling', rateLimit({ ...rateLimitConfig, max: 20 })); // Moderate for calling
  app.use('/api', rateLimit(rateLimitConfig)); // General rate limit

  // CORS Configuration
  const corsOrigins = configService.get<string[]>('cors.origin', []);
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:4200',
      'https://mindlyf.app',
      'https://app.mindlyf.app',
      'https://admin.mindlyf.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
      'X-User-ID',
      'X-Session-ID'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Service-Name',
      'X-Response-Time',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining'
    ],
    credentials: true,
    maxAge: 3600, // 1 hour
  });

  // File Upload Configuration
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      // Security headers for uploaded files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
    },
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: configService.get<string>('environment') === 'production',
    validationError: {
      target: false,
      value: false,
    },
  }));

  // Request logging middleware is configured in AppModule

  // Socket.IO Configuration for Real-time Features
  const socketCorsOrigin = configService.get<string>('socketio.cors.origin', '*');
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger Documentation Setup
  if (configService.get<string>('environment') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MindLyf Chat Service API')
      .setDescription(`
        ## 🧠 MindLyf Chat Service API
        
        The Chat Service provides comprehensive messaging, calling, and community interaction features for the MindLyf platform.
        
        ### 🔥 Key Features
        - **Real-time Messaging** - WebSocket-powered instant messaging
        - **Video/Audio Calling** - WebRTC-based calling with MediaSoup integration
        - **Content Moderation** - AI-powered message filtering and community safety
        - **Anonymous Identities** - Privacy-focused communication
        - **Therapist Integration** - Seamless connection with teletherapy services
        
        ### 🔐 Authentication
        All endpoints require JWT authentication unless marked as public.
        Include your JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ### 🌐 Real-time Events
        Connect to WebSocket endpoint: \`ws://localhost:3003\`
        
        ### 📁 File Uploads
        Maximum file size: 10MB
        Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
        
        ### 🔄 Service Integration
        - **Auth Service**: User authentication and authorization
        - **Teletherapy Service**: Video calling and session management  
        - **Notification Service**: Real-time alerts and notifications
        - **Community Service**: User relationships and anonymous identities
        
        ### 📊 Monitoring
        - **Health Check**: \`GET /health\`
        - **Metrics**: \`GET /metrics\`
        - **API Documentation**: \`GET /api-docs\`
      `)
      .setVersion('1.0')
      .setContact(
        'MindLyf Support',
        'https://mindlyf.app/support',
        'support@mindlyf.app'
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer('http://localhost:3003', 'Development')
      .addServer('https://api-dev.mindlyf.app', 'Development Cloud')
      .addServer('https://api-staging.mindlyf.app', 'Staging')
      .addServer('https://api.mindlyf.app', 'Production')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API key for service-to-service communication',
        },
        'API-Key'
      )
      .addTag('Health', 'Health check and service status endpoints')
      .addTag('Chat', 'Messaging and chat room management')
      .addTag('Calling', 'Video/audio calling functionality')
      .addTag('Moderation', 'Content moderation and safety features')
      .addTag('Notifications', 'Real-time notification management')
      .addTag('WebSocket', 'Real-time event documentation')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      extraModels: [],
      deepScanRoutes: true,
    });

    SwaggerModule.setup('api-docs', app, document, {
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
      ],
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'MindLyf Chat Service API Documentation',
      customfavIcon: 'https://mindlyf.app/favicon.ico',
    });

    logger.log('📚 Swagger documentation available at: http://localhost:3003/api-docs');
  }

  // Graceful Shutdown Handling
  const gracefulShutdown = async (signal: string) => {
    logger.log(`🛑 Received ${signal}. Starting graceful shutdown...`);
    
    try {
      // Close HTTP server
      await app.close();
      
      // Close logger
      await logger.close();
      
      logger.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown', error.stack);
      process.exit(1);
    }
  };

  // Register shutdown handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception', error.stack);
    gracefulShutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('🚫 Unhandled Rejection', `${reason}`);
    gracefulShutdown('unhandledRejection');
  });

  // Start the server
  const port = configService.get<number>('port', 3003);
  const environment = configService.get<string>('environment', 'development');
  
  await app.listen(port);

  // Startup logging
  logger.log(`🚀 MindLyf Chat Service started successfully!`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`📡 Server running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  logger.log(`🔍 Health Check: http://localhost:${port}/health`);
  logger.log(`📊 Metrics: http://localhost:${port}/metrics`);
  
  // Log service URLs for debugging
  logger.log('🔗 Service Integration URLs:');
  logger.log(`   Auth Service: ${configService.get('services.auth.url')}`);
  logger.log(`   Teletherapy Service: ${configService.get('services.teletherapy.url')}`);
  logger.log(`   Notification Service: ${configService.get('services.notification.url')}`);
  logger.log(`   Community Service: ${configService.get('services.community.url')}`);
  
  // Performance monitoring
  logger.performance('Application startup', Date.now() - (process.env.STARTUP_TIME ? parseInt(process.env.STARTUP_TIME) : Date.now()));
}

// Set startup time for performance monitoring
process.env.STARTUP_TIME = Date.now().toString();

// Bootstrap the application
bootstrap().catch((error) => {
  console.error('💥 Failed to start MindLyf Chat Service:', error);
  process.exit(1);
});
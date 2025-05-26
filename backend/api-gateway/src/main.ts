import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS with configuration
  const corsConfig = configService.get('cors');
  app.enableCors({
    origin: corsConfig.origin,
    methods: corsConfig.methods,
    preflightContinue: corsConfig.preflightContinue,
    optionsSuccessStatus: corsConfig.optionsSuccessStatus,
    credentials: true,
  });
  
  // Use helmet for security headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Swagger documentation
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
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Start the server
  const port = configService.get('port');
  const environment = configService.get('environment');
  
  await app.listen(port);
  
  logger.log(`🚀 MindLyf API Gateway is running on port ${port}`);
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`🔐 JWT Secret configured: ${!!configService.get('jwt.secret')}`);
  
  // Log service URLs
  const services = configService.get('services');
  logger.log('📡 Configured services:');
  Object.keys(services).forEach(serviceName => {
    logger.log(`  - ${serviceName}: ${services[serviceName].url}`);
  });
}

bootstrap();
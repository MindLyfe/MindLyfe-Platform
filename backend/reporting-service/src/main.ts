import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ReportingService');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    methods: configService.get('cors.methods'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  if (configService.get('environment') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('MindLyfe Reporting Service')
      .setDescription('Analytics and reporting API for MindLyfe platform data insights')
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
      .addTag('analytics', 'Analytics data queries and real-time metrics')
      .addTag('reports', 'Report generation and management')
      .addTag('dashboards', 'Dashboard widgets and configurations')
      .addTag('notifications', 'Notification analytics endpoints')
      .addTag('gamification', 'Gamification analytics endpoints')
      .addTag('users', 'User analytics endpoints')
      .addTag('payments', 'Payment analytics endpoints')
      .addTag('export', 'Data export endpoints')
      .addTag('health', 'Service health and status')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'reporting-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const port = configService.get('port') || 3009;
  await app.listen(port);

  logger.log(`📊 MindLyfe Reporting Service is running on port ${port}`);
  
  if (configService.get('environment') !== 'production') {
    logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    logger.log(`❤️  Health check available at http://localhost:${port}/health`);
  }
  
  logger.log(`🌍 Environment: ${configService.get('environment')}`);
  logger.log(`🔐 JWT Secret configured: ${!!configService.get('jwt.secret')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start reporting service:', error);
  process.exit(1);
}); 
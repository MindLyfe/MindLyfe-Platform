import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  if (configService.get('environment') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('MindLyf Gamification Service')
      .setDescription('Gamification API for streaks, badges, achievements, and rewards')
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
      .addTag('streaks', 'Streak management endpoints')
      .addTag('badges', 'Badge system endpoints')
      .addTag('achievements', 'Achievement tracking endpoints')
      .addTag('rewards', 'Reward management endpoints')
      .addTag('activities', 'Activity tracking endpoints')
      .addTag('leaderboards', 'Leaderboard endpoints')
      .addTag('health', 'Health check endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get('port', 3008);
  await app.listen(port);

  logger.log(`🎮 MindLyf Gamification Service is running on port ${port}`);
  
  if (configService.get('environment') !== 'production') {
    logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  }
  
  logger.log(`🌍 Environment: ${configService.get('environment')}`);
  logger.log(`🔐 JWT Secret configured: ${!!configService.get('jwt.secret')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start gamification service:', error);
  process.exit(1);
}); 
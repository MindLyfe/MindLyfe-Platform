import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create HTTP application
  const app = await NestFactory.create(AppModule);
  
  // Global middlewares
  app.use(compression());
  app.use(helmet());
  app.enableCors();
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Connect microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });
  
  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('MindLyf Auth Service API')
    .setDescription('Authentication and user management APIs')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Start services
  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Auth Service running on port ${port}`);
}

bootstrap(); 
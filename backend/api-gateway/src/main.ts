import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
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
  
  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('MindLyf API Gateway')
    .setDescription('The MindLyf platform API')
    .setVersion('1.0')
    .addTag('mindlyf')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway running on port ${port}`);
}

bootstrap(); 
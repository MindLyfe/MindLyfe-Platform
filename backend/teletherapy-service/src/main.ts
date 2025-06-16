import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Apply security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
          connectSrc: ["'self'", 'https:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'self'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
  
  // Enable compression
  app.use(compression());

  // Use validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MindLyf Teletherapy Service API')
    .setDescription(`
## 🧠 MindLyf Teletherapy Service API

Professional video therapy sessions with advanced WebRTC technology, powered by MediaSoup SFU for high-quality, secure communication.

### 🎥 Key Features
- **High-Quality Video Calls** - MediaSoup SFU architecture for optimal media routing
- **Session Recording** - Secure session recordings with consent management
- **Real-time Communication** - Low-latency WebRTC with adaptive bitrate
- **Professional Tools** - Screen sharing, virtual backgrounds, session notes
- **Security & Privacy** - End-to-end encryption and HIPAA compliance

### 🔐 Authentication
All endpoints require JWT authentication with therapist or client role validation.

### 📡 WebRTC Architecture
- **MediaSoup SFU**: Selective Forwarding Unit for efficient media routing
- **RTC Ports**: 10000-10100 (UDP) for media transmission
- **Adaptive Quality**: Dynamic bitrate and resolution adjustment
- **Multi-device Support**: Desktop, tablet, and mobile compatibility

### 🏥 Professional Features
- **Session Management**: Scheduled and on-demand therapy sessions
- **Participant Management**: Therapist and client role enforcement
- **Recording & Notes**: Secure session documentation
- **Crisis Management**: Emergency protocols and safety features
    `)
    .setVersion('1.0')
    .setContact('MindLyf Support', 'https://mindlyf.app/support', 'support@mindlyf.app')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('sessions', 'Therapy session management and scheduling')
    .addTag('video', 'Video calling and WebRTC endpoints')
    .addTag('recording', 'Session recording and playback')
    .addTag('participants', 'Session participant management')
    .addTag('health', 'Health check and service monitoring')
    .addBearerAuth(
      { 
        type: 'http', 
        scheme: 'bearer', 
        bearerFormat: 'JWT',
        description: 'Enter your JWT token here',
        name: 'Authorization',
        in: 'header' 
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key for service-to-service communication'
      },
      'API-Key'
    )
    .addServer('http://localhost:3002', 'Development')
    .addServer('https://api-dev.mindlyf.app', 'Development Cloud')
    .addServer('https://api-staging.mindlyf.app', 'Staging')
    .addServer('https://api.mindlyf.app', 'Production')
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });
  
  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      syntaxHighlight: { activate: true, theme: 'agate' },
      tryItOutEnabled: true
    },
    customSiteTitle: 'MindLyf Teletherapy API Documentation',
    customfavIcon: 'https://mindlyf.app/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 30px 0 }
      .swagger-ui .scheme-container { background-color: #f8f9fa; box-shadow: none }
      .swagger-ui .btn.authorize { background-color: #4caf50; color: white; border-color: #4caf50 }
      .swagger-ui .btn.authorize svg { fill: white }
      body { margin: 0; padding: 0 }
      .swagger-ui .info .title { color: #333; font-family: 'Helvetica Neue', sans-serif }
      .swagger-ui .opblock-tag { font-size: 18px; border-bottom: 1px solid #eee }
    `
  });

  // Add JSON endpoint for API Gateway aggregation
  app.use('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // Start the server
  const port = configService.get<number>('PORT', 3002);
  await app.listen(port);
  console.log(`Teletherapy service running on port ${port}`);
}

bootstrap();
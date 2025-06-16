"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const config_1 = require("@nestjs/config");
const compression = require("compression");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    app.enableCors();
    app.use((0, helmet_1.default)({
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
    }));
    app.use(compression());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
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
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token here',
        name: 'Authorization',
        in: 'header'
    }, 'JWT-auth')
        .addApiKey({
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key for service-to-service communication'
    }, 'API-Key')
        .addServer('http://localhost:3002', 'Development')
        .addServer('https://api-dev.mindlyf.app', 'Development Cloud')
        .addServer('https://api-staging.mindlyf.app', 'Staging')
        .addServer('https://api.mindlyf.app', 'Production')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey, methodKey) => methodKey,
        deepScanRoutes: true,
    });
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
    app.use('/api-docs-json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(document);
    });
    const port = configService.get('PORT', 3002);
    await app.listen(port);
    console.log(`Teletherapy service running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
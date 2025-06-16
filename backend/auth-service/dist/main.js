"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const config_1 = require("@nestjs/config");
const compression = require("compression");
if (!global.crypto) {
    global.crypto = require('crypto').webcrypto;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    const port = configService.get('port', 3001);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('🔐 MindLyf Auth Service API')
        .setDescription(`
## 🔐 MindLyf Authentication Service

**Production-ready authentication and user management API** for the MindLyf mental health platform.

### 🚀 **Key Features**
- **Secure Authentication** - JWT-based with RS256 signing
- **Multi-Factor Authentication** - TOTP and SMS support
- **Role-Based Access Control** - User, therapist, admin roles
- **Session Management** - Multiple device sessions
- **Password Security** - bcrypt hashing with strength validation
- **Rate Limiting** - Protection against brute force attacks

### 🔒 **Security & Compliance**
- **HIPAA Compliant** - Healthcare data protection
- **GDPR Compliant** - European privacy regulations
- **Audit Logging** - Comprehensive security event tracking
- **Data Encryption** - At-rest and in-transit encryption

### 🔗 **Service Integration**
This service integrates with:
- **Teletherapy Service** - Therapist-client relationship validation
- **Chat Service** - User identity and permission management
- **Notification Service** - Account alerts and security notifications
- **Payment Service** - Subscription and billing integration

### 📊 **API Usage**
- **Base URL**: \`http://localhost:3001/api\`
- **Authentication**: Bearer JWT tokens
- **Rate Limits**: Varies by endpoint (see individual endpoint docs)
- **Response Format**: JSON

### 🧪 **Testing**
Use the "Try it out" feature below to test endpoints. For protected endpoints, first:
1. Register a new user with \`POST /auth/register\`
2. Login with \`POST /auth/login\` to get a JWT token
3. Use the "Authorize" button to set your Bearer token
    `)
        .setVersion('1.0.0')
        .setContact('MindLyf Support', 'https://mindlyf.app/support', 'support@mindlyf.app')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addTag('🔐 auth', 'Core authentication endpoints - registration, login, logout, password management')
        .addTag('🔄 sessions', 'Session management - refresh tokens, device tracking, session cleanup')
        .addTag('🛡️ mfa', 'Multi-factor authentication - TOTP setup, verification, backup codes')
        .addTag('👤 users', 'User profile management - account details, preferences, privacy settings')
        .addTag('🏢 organizations', 'Organization management - multi-tenant features, admin controls')
        .addTag('💳 subscriptions', 'Subscription and billing - payment integration, plan management')
        .addTag('❤️ health', 'Health checks and monitoring - service status, database connectivity')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token here',
        name: 'Authorization',
        in: 'header'
    }, 'access-token')
        .addApiKey({
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API key for service-to-service communication'
    }, 'api-key')
        .addSecurityRequirements('access-token')
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
        customSiteTitle: 'MindLyf Auth API Documentation',
        customfavIcon: 'https://mindlyf.com/favicon.ico',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
        ],
        customCssUrl: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
        ],
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 30px 0 }
      .swagger-ui .scheme-container { background-color: #f8f9fa; box-shadow: none }
      .swagger-ui .btn.authorize { background-color: #4caf50; color: white; border-color: #4caf50 }
      .swagger-ui .btn.authorize svg { fill: white }
      body { margin: 0; padding: 0 }
      .swagger-ui .info .title { color: #333; font-family: 'Helvetica Neue', sans-serif }
      .swagger-ui .opblock-tag { font-size: 18px; border-bottom: 1px solid #eee }
      .swagger-ui .opblock .opblock-summary-operation-id, .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-method { font-size: 14px }
    `
    });
    app.use('/api-docs-json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(document);
    });
    await app.listen(port, '0.0.0.0');
    console.log(`Auth service is running on port ${port} and bound to all interfaces`);
}
bootstrap().catch(err => {
    console.error('Failed to start Auth Service:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
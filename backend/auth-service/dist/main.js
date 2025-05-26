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
        .setTitle('MindLyf Authentication API')
        .setDescription(`
      <h2>API Documentation for MindLyf Authentication Service</h2>
      <p>This service handles all authentication-related functionality for the MindLyf mental health platform, including:</p>
      <ul>
        <li>User registration and account verification</li>
        <li>Secure login and token management</li>
        <li>Password reset and recovery</li>
        <li>Two-factor authentication (MFA)</li>
        <li>Session management</li>
      </ul>
      <p>For more details about the MindLyf platform architecture, please refer to our <a href="https://docs.mindlyf.com" target="_blank">official documentation</a>.</p>
    `)
        .setVersion('1.0')
        .setContact('MindLyf Support', 'https://mindlyf.com/support', 'support@mindlyf.com')
        .setLicense('Proprietary', 'https://mindlyf.com/terms')
        .addTag('auth', 'Authentication endpoints for login, registration, password reset, etc.')
        .addTag('sessions', 'Manage user sessions and refresh tokens')
        .addTag('mfa', 'Multi-factor authentication endpoints')
        .addTag('users', 'User profile and account management endpoints')
        .addTag('health', 'Health check and monitoring endpoints')
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
    await app.listen(port, '0.0.0.0');
    console.log(`Auth service is running on port ${port} and bound to all interfaces`);
}
bootstrap().catch(err => {
    console.error('Failed to start Auth Service:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
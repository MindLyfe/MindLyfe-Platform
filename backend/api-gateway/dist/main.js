"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    const corsConfig = configService.get('cors');
    app.enableCors({
        origin: corsConfig.origin,
        methods: corsConfig.methods,
        preflightContinue: corsConfig.preflightContinue,
        optionsSuccessStatus: corsConfig.optionsSuccessStatus,
        credentials: true,
    });
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('MindLyf API Gateway')
        .setDescription('The MindLyf Mental Health Platform API Gateway')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('port');
    const environment = configService.get('environment');
    await app.listen(port);
    logger.log(`🚀 MindLyf API Gateway is running on port ${port}`);
    logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`🔐 JWT Secret configured: ${!!configService.get('jwt.secret')}`);
    const services = configService.get('services');
    logger.log('📡 Configured services:');
    Object.keys(services).forEach(serviceName => {
        logger.log(`  - ${serviceName}: ${services[serviceName].url}`);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map
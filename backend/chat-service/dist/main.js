"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const helmet_1 = require("helmet");
const express_rate_limit_1 = require("express-rate-limit");
const compression = require("compression");
const app_module_1 = require("./app.module");
const logger_service_1 = require("./common/services/logger.service");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: false,
        bodyParser: true,
    });
    const configService = app.get(config_1.ConfigService);
    const logger = await app.resolve(logger_service_1.CustomLoggerService);
    logger.setContext('Bootstrap');
    app.useLogger(logger);
    app.setGlobalPrefix('api', {
        exclude: ['/health', '/metrics', '/']
    });
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", 'ws:', 'wss:'],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(compression({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        },
        level: 6,
        threshold: 1024,
    }));
    const rateLimitConfig = {
        windowMs: configService.get('rateLimit.windowMs', 60000),
        max: configService.get('rateLimit.max', 100),
        message: {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            statusCode: 429,
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return req.ip || req.connection.remoteAddress || 'unknown';
        },
    };
    app.use('/api/auth', (0, express_rate_limit_1.default)({ ...rateLimitConfig, max: 5 }));
    app.use('/api/calling', (0, express_rate_limit_1.default)({ ...rateLimitConfig, max: 20 }));
    app.use('/api', (0, express_rate_limit_1.default)(rateLimitConfig));
    const corsOrigins = configService.get('cors.origin', []);
    app.enableCors({
        origin: corsOrigins.length > 0 ? corsOrigins : [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:4200',
            'https://mindlyf.app',
            'https://app.mindlyf.app',
            'https://admin.mindlyf.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-API-Key',
            'X-Request-ID',
            'X-User-ID',
            'X-Session-ID'
        ],
        exposedHeaders: [
            'X-Request-ID',
            'X-Service-Name',
            'X-Response-Time',
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining'
        ],
        credentials: true,
        maxAge: 3600,
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
        setHeaders: (res, path) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: configService.get('environment') === 'production',
        validationError: {
            target: false,
            value: false,
        },
    }));
    const socketCorsOrigin = configService.get('socketio.cors.origin', '*');
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    if (configService.get('environment') !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('MindLyf Chat Service API')
            .setDescription(`
        ## 🧠 MindLyf Chat Service API
        
        The Chat Service provides comprehensive messaging, calling, and community interaction features for the MindLyf platform.
        
        ### 🔥 Key Features
        - **Real-time Messaging** - WebSocket-powered instant messaging
        - **Video/Audio Calling** - WebRTC-based calling with MediaSoup integration
        - **Content Moderation** - AI-powered message filtering and community safety
        - **Anonymous Identities** - Privacy-focused communication
        - **Therapist Integration** - Seamless connection with teletherapy services
        
        ### 🔐 Authentication
        All endpoints require JWT authentication unless marked as public.
        Include your JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ### 🌐 Real-time Events
        Connect to WebSocket endpoint: \`ws://localhost:3003\`
        
        ### 📁 File Uploads
        Maximum file size: 10MB
        Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
        
        ### 🔄 Service Integration
        - **Auth Service**: User authentication and authorization
        - **Teletherapy Service**: Video calling and session management  
        - **Notification Service**: Real-time alerts and notifications
        - **Community Service**: User relationships and anonymous identities
        
        ### 📊 Monitoring
        - **Health Check**: \`GET /health\`
        - **Metrics**: \`GET /metrics\`
        - **API Documentation**: \`GET /api-docs\`
      `)
            .setVersion('1.0')
            .setContact('MindLyf Support', 'https://mindlyf.app/support', 'support@mindlyf.app')
            .setLicense('MIT', 'https://opensource.org/licenses/MIT')
            .addServer('http://localhost:3003', 'Development')
            .addServer('https://api-dev.mindlyf.app', 'Development Cloud')
            .addServer('https://api-staging.mindlyf.app', 'Staging')
            .addServer('https://api.mindlyf.app', 'Production')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addApiKey({
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API key for service-to-service communication',
        }, 'API-Key')
            .addTag('Health', 'Health check and service status endpoints')
            .addTag('Chat', 'Messaging and chat room management')
            .addTag('Calling', 'Video/audio calling functionality')
            .addTag('Moderation', 'Content moderation and safety features')
            .addTag('Notifications', 'Real-time notification management')
            .addTag('WebSocket', 'Real-time event documentation')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig, {
            extraModels: [],
            deepScanRoutes: true,
        });
        swagger_1.SwaggerModule.setup('api-docs', app, document, {
            customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            customJs: [
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
            ],
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                docExpansion: 'none',
                defaultModelsExpandDepth: 2,
                defaultModelExpandDepth: 2,
                tryItOutEnabled: true,
            },
            customSiteTitle: 'MindLyf Chat Service API Documentation',
            customfavIcon: 'https://mindlyf.app/favicon.ico',
        });
        logger.log('📚 Swagger documentation available at: http://localhost:3003/api-docs');
    }
    const gracefulShutdown = async (signal) => {
        logger.log(`🛑 Received ${signal}. Starting graceful shutdown...`);
        try {
            await app.close();
            await logger.close();
            logger.log('✅ Graceful shutdown completed');
            process.exit(0);
        }
        catch (error) {
            logger.error('❌ Error during graceful shutdown', error.stack);
            process.exit(1);
        }
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
        logger.error('💥 Uncaught Exception', error.stack);
        gracefulShutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('🚫 Unhandled Rejection', `${reason}`);
        gracefulShutdown('unhandledRejection');
    });
    const port = configService.get('port', 3003);
    const environment = configService.get('environment', 'development');
    await app.listen(port);
    logger.log(`🚀 MindLyf Chat Service started successfully!`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`📡 Server running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
    logger.log(`🔍 Health Check: http://localhost:${port}/health`);
    logger.log(`📊 Metrics: http://localhost:${port}/metrics`);
    logger.log('🔗 Service Integration URLs:');
    logger.log(`   Auth Service: ${configService.get('services.auth.url')}`);
    logger.log(`   Teletherapy Service: ${configService.get('services.teletherapy.url')}`);
    logger.log(`   Notification Service: ${configService.get('services.notification.url')}`);
    logger.log(`   Community Service: ${configService.get('services.community.url')}`);
    logger.performance('Application startup', Date.now() - (process.env.STARTUP_TIME ? parseInt(process.env.STARTUP_TIME) : Date.now()));
}
process.env.STARTUP_TIME = Date.now().toString();
bootstrap().catch((error) => {
    console.error('💥 Failed to start MindLyf Chat Service:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
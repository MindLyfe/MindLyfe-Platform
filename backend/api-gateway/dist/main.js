"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const express_rate_limit_1 = require("express-rate-limit");
const compression = require("compression");
const timeout = require("connect-timeout");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    const securityConfig = configService.get('security');
    app.use(require('express').json({
        limit: securityConfig.maxRequestSize,
        verify: (req, res, buf) => {
            if (buf.length > 0) {
                try {
                    JSON.parse(buf.toString());
                }
                catch (error) {
                    logger.warn(`Invalid JSON payload from ${req.ip}: ${error.message}`);
                    throw new Error('Invalid JSON payload');
                }
            }
        }
    }));
    app.use(require('express').urlencoded({
        limit: securityConfig.maxRequestSize,
        extended: true,
        parameterLimit: securityConfig.maxFields
    }));
    app.use(timeout(securityConfig.requestTimeout));
    app.use(compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    }));
    const helmetConfig = configService.get('helmet');
    app.use((0, helmet_1.default)(helmetConfig));
    const rateLimitConfig = configService.get('security.rateLimit');
    app.use((0, express_rate_limit_1.default)(Object.assign(Object.assign({}, rateLimitConfig), { keyGenerator: (req) => {
            return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
        }, handler: (req, res) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
            res.status(429).json({
                error: 'Too Many Requests',
                message: rateLimitConfig.message,
                retryAfter: Math.round(rateLimitConfig.windowMs / 1000),
            });
        } })));
    const authRateLimitConfig = configService.get('security.authRateLimit');
    app.use('/api/auth', (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, authRateLimitConfig), { keyGenerator: (req) => {
            return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
        }, handler: (req, res) => {
            logger.error(`Auth rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
            res.status(429).json({
                error: 'Too Many Authentication Attempts',
                message: authRateLimitConfig.message,
                retryAfter: Math.round(authRateLimitConfig.windowMs / 1000),
            });
        } })));
    const paymentRateLimitConfig = configService.get('security.paymentRateLimit');
    app.use('/api/payments', (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, paymentRateLimitConfig), { keyGenerator: (req) => {
            var _a;
            const userId = req.headers['x-user-id'] || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
            return userId ? `${ip}:${userId}` : ip;
        }, handler: (req, res) => {
            var _a;
            logger.error(`Payment rate limit exceeded for IP: ${req.ip}, user: ${((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'anonymous'}`);
            res.status(429).json({
                error: 'Too Many Payment Requests',
                message: paymentRateLimitConfig.message,
                retryAfter: Math.round(paymentRateLimitConfig.windowMs / 1000),
            });
        } })));
    const corsConfig = configService.get('cors');
    app.enableCors(Object.assign(Object.assign({}, corsConfig), { origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (Array.isArray(corsConfig.origin)) {
                if (corsConfig.origin.includes(origin)) {
                    return callback(null, true);
                }
            }
            else if (corsConfig.origin === '*' || corsConfig.origin === origin) {
                return callback(null, true);
            }
            logger.warn(`CORS blocked request from origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        } }));
    app.use((req, res, next) => {
        req.requestId = require('crypto').randomUUID();
        res.setHeader('X-Request-ID', req.requestId);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');
        next();
    });
    if (configService.get('logging.enableRequestLogging')) {
        app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                var _a;
                const duration = Date.now() - start;
                const logData = {
                    requestId: req.requestId,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                };
                if (res.statusCode >= 400) {
                    logger.warn(`Request failed: ${JSON.stringify(logData)}`);
                }
                else {
                    logger.log(`Request completed: ${JSON.stringify(logData)}`);
                }
            });
            next();
        });
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: configService.get('environment') === 'production',
        validationError: {
            target: false,
            value: false,
        },
        exceptionFactory: (errors) => {
            logger.warn(`Validation failed: ${JSON.stringify(errors)}`);
            return new Error('Validation failed');
        },
    }));
    if (configService.get('environment') !== 'production') {
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
            .addTag('payments', 'Payment and subscription endpoints')
            .addTag('resources', 'Resource management endpoints')
            .addTag('health', 'Health check endpoints')
            .addTag('admin', 'Admin management endpoints')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    const server = await app.listen(configService.get('port'));
    server.keepAliveTimeout = securityConfig.keepAliveTimeout;
    server.headersTimeout = securityConfig.headersTimeout;
    process.on('SIGTERM', async () => {
        logger.log('SIGTERM received, shutting down gracefully');
        await app.close();
        process.exit(0);
    });
    process.on('SIGINT', async () => {
        logger.log('SIGINT received, shutting down gracefully');
        await app.close();
        process.exit(0);
    });
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
    const port = configService.get('port');
    const environment = configService.get('environment');
    logger.log(`🚀 MindLyf API Gateway is running on port ${port}`);
    if (environment !== 'production') {
        logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    }
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`🔐 JWT Secret configured: ${!!configService.get('jwt.secret')}`);
    logger.log(`🛡️ Security hardening enabled: CORS, Rate Limiting, Helmet, Request Limits`);
    const services = configService.get('services');
    logger.log('📡 Configured services:');
    Object.keys(services).forEach(serviceName => {
        logger.log(`  - ${serviceName}: ${services[serviceName].url} (timeout: ${services[serviceName].timeout}ms)`);
    });
    logger.log('🔒 Security Configuration:');
    logger.log(`  - Max Request Size: ${securityConfig.maxRequestSize}`);
    logger.log(`  - Request Timeout: ${securityConfig.requestTimeout}ms`);
    logger.log(`  - Rate Limit: ${rateLimitConfig.max} requests per ${rateLimitConfig.windowMs}ms`);
    logger.log(`  - Auth Rate Limit: ${authRateLimitConfig.max} requests per ${authRateLimitConfig.windowMs}ms`);
    logger.log(`  - CORS Origins: ${Array.isArray(corsConfig.origin) ? corsConfig.origin.join(', ') : corsConfig.origin}`);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
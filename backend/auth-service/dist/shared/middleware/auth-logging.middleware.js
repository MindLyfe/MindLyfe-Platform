"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthLoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AuthLoggingMiddleware = class AuthLoggingMiddleware {
    configService;
    logger = new common_1.Logger('AuthSecurity');
    sensitiveRoutes = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh-token',
        '/api/mfa/verify',
        '/api/mfa/enable',
        '/api/mfa/disable',
    ];
    constructor(configService) {
        this.configService = configService;
    }
    use(req, res, next) {
        const { ip, method, originalUrl } = req;
        const userAgent = req.get('user-agent') || 'unknown';
        this.logger.debug(`${method} ${originalUrl} - ${ip} - ${userAgent}`);
        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length') || 0;
            if (statusCode >= 400) {
                this.logger.warn(`${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} - ${contentLength}`);
            }
            else {
                this.logger.debug(`${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} - ${contentLength}`);
            }
        });
        next();
    }
};
exports.AuthLoggingMiddleware = AuthLoggingMiddleware;
exports.AuthLoggingMiddleware = AuthLoggingMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthLoggingMiddleware);
//# sourceMappingURL=auth-logging.middleware.js.map
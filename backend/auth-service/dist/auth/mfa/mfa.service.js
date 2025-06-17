"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MfaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const speakeasy = __importStar(require("speakeasy"));
const QRCode = __importStar(require("qrcode"));
const user_entity_1 = require("../../entities/user.entity");
const session_service_1 = require("../session/session.service");
const event_service_1 = require("../../shared/events/event.service");
let MfaService = MfaService_1 = class MfaService {
    userRepository;
    jwtService;
    configService;
    sessionService;
    eventService;
    logger = new common_1.Logger(MfaService_1.name);
    constructor(userRepository, jwtService, configService, sessionService, eventService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.sessionService = sessionService;
        this.eventService = eventService;
    }
    async generateMfaSecret(userId, metadata) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const secret = speakeasy.generateSecret({
            name: `${this.configService.get('mfa.issuer', 'MindLyf')}:${user.email}`,
            issuer: this.configService.get('mfa.issuer', 'MindLyf'),
        });
        user.twoFactorSecret = secret.base32;
        await this.userRepository.save(user);
        this.logger.log(`Generated MFA secret for user: ${userId}`);
        const otpAuthUrl = secret.otpauth_url;
        const qrCode = await QRCode.toDataURL(otpAuthUrl);
        this.eventService.emit(event_service_1.EventType.MFA_ENABLED, { userId, step: 'secret_generated' }, {
            userId,
            metadata
        });
        return {
            secret: secret.base32,
            qrCode,
        };
    }
    async verifyAndEnableMfa(userId, token, metadata) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.twoFactorSecret) {
            this.logger.warn(`MFA verification attempted without generated secret: ${userId}`);
            throw new common_1.BadRequestException('MFA secret not generated');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: this.configService.get('mfa.window', 1),
        });
        if (!verified) {
            this.logger.warn(`Failed MFA verification for user: ${userId}`);
            this.eventService.emit(event_service_1.EventType.MFA_VERIFICATION_FAILED, { userId, attemptType: 'enable_mfa' }, {
                userId,
                metadata
            });
            throw new common_1.UnauthorizedException('Invalid MFA token');
        }
        user.twoFactorEnabled = true;
        await this.userRepository.save(user);
        this.logger.log(`MFA enabled for user: ${userId}`);
        await this.sessionService.revokeAllUserSessions(userId, 'MFA enabled');
        this.eventService.emit(event_service_1.EventType.MFA_ENABLED, { userId, step: 'completed' }, {
            userId,
            metadata
        });
        return {
            message: 'Two-factor authentication has been enabled. Please log in again.',
        };
    }
    async disableMfa(userId, password, metadata) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            this.logger.warn(`Invalid password attempt for MFA disable: ${userId}`);
            throw new common_1.UnauthorizedException('Invalid password');
        }
        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await this.userRepository.save(user);
        this.logger.log(`MFA disabled for user: ${userId}`);
        await this.sessionService.revokeAllUserSessions(userId, 'MFA disabled');
        this.eventService.emit(event_service_1.EventType.MFA_DISABLED, { userId }, {
            userId,
            metadata
        });
        return {
            message: 'Two-factor authentication has been disabled. Please log in again.',
        };
    }
    async verifyMfaToken(userId, token, metadata) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            this.logger.warn(`MFA verification attempted for user without MFA: ${userId}`);
            throw new common_1.BadRequestException('MFA is not enabled for this user');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: this.configService.get('mfa.window', 1),
        });
        if (!verified) {
            this.logger.warn(`Failed MFA login verification for user: ${userId}`);
            this.eventService.emit(event_service_1.EventType.MFA_VERIFICATION_FAILED, { userId, attemptType: 'login' }, {
                userId,
                metadata
            });
            throw new common_1.UnauthorizedException('Invalid MFA token');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('jwt.expiresIn'),
        });
        const refreshExpiresInMs = this.parseTimeToMs(this.configService.get('jwt.refreshExpiresIn', '7d'));
        const expiresAt = new Date(Date.now() + refreshExpiresInMs);
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: this.configService.get('jwt.refreshExpiresIn') });
        const session = await this.sessionService.createSession(user.id, refreshToken, metadata?.ipAddress, metadata?.userAgent, metadata?.deviceInfo);
        user.lastLogin = new Date();
        await this.userRepository.save(user);
        this.logger.log(`Successful MFA verification for user: ${userId}`);
        this.eventService.emit(event_service_1.EventType.MFA_VERIFICATION_SUCCESS, { userId, sessionId: session.id }, {
            userId,
            metadata
        });
        this.eventService.emit(event_service_1.EventType.AUTH_LOGIN_SUCCESS, { userId, sessionId: session.id, withMfa: true }, {
            userId,
            metadata
        });
        return {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            accessToken,
            refreshToken,
            sessionId: session.id,
        };
    }
    parseTimeToMs(timeString) {
        const unit = timeString.charAt(timeString.length - 1);
        const value = parseInt(timeString.substring(0, timeString.length - 1), 10);
        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 7 * 24 * 60 * 60 * 1000;
        }
    }
    async generateTotpSecret(email) {
        const secret = 'ABCDEFGHIJKLMNOP';
        const otpauthUrl = `otpauth://totp/MindLyf:${email}?secret=${secret}&issuer=MindLyf`;
        this.logger.debug(`Generated TOTP secret for ${email}`);
        return { secret, otpauthUrl };
    }
    async verifyTotpToken(userSecret, token) {
        const isDev = this.configService.get('environment') === 'development';
        if (isDev && token === '123456') {
            this.logger.debug('Development mode: Accepting mock token 123456');
            return true;
        }
        this.logger.debug('Verifying TOTP token');
        return false;
    }
};
exports.MfaService = MfaService;
exports.MfaService = MfaService = MfaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        session_service_1.SessionService,
        event_service_1.EventService])
], MfaService);
//# sourceMappingURL=mfa.service.js.map
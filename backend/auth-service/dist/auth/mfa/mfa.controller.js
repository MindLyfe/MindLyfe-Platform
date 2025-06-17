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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const mfa_service_1 = require("./mfa.service");
const mfa_dto_1 = require("./dto/mfa.dto");
let MfaController = class MfaController {
    mfaService;
    constructor(mfaService) {
        this.mfaService = mfaService;
    }
    async generateMfaSecret(req) {
        return this.mfaService.generateTotpSecret(req.user.email);
    }
    async enableMfa(req, verifyMfaDto, userAgent, ipAddress) {
        return this.mfaService.verifyAndEnableMfa(req.user.sub, verifyMfaDto.token, { ipAddress, userAgent });
    }
    async disableMfa(req, disableMfaDto, userAgent, ipAddress) {
        return this.mfaService.disableMfa(req.user.sub, disableMfaDto.password, { ipAddress, userAgent });
    }
    async verifyMfaToken(body) {
        const isValid = await this.mfaService.verifyTotpToken(body.secret, body.token);
        return { isValid };
    }
};
exports.MfaController = MfaController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate MFA secret for user',
        description: 'Creates a new TOTP (Time-based One-Time Password) secret for the authenticated user. Returns the secret and a QR code for setting up authenticator apps.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'MFA secret generated successfully',
        schema: {
            type: 'object',
            properties: {
                otpAuthUrl: { type: 'string', example: 'otpauth://totp/MindLyf:user@mindlyf.com?secret=HXDMVJECJJWSRB3HWIZR4MKVGIYUC43PNZXW' },
                secret: { type: 'string', example: 'HXDMVJECJJWSRB3HWIZR4MKVGIYUC43PNZXW' },
                qrCodeDataUrl: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQA...' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or expired token' }),
    (0, swagger_1.ApiProduces)('application/json'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "generateMfaSecret", null);
__decorate([
    (0, common_1.Post)('enable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify token and enable MFA',
        description: 'Validates the provided TOTP token and enables multi-factor authentication for the user. The user must have previously generated a secret.'
    }),
    (0, swagger_1.ApiBody)({
        type: mfa_dto_1.VerifyMfaDto,
        description: 'The TOTP token to verify before enabling MFA'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'MFA enabled successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Two-factor authentication has been enabled successfully' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized or invalid token' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'MFA secret not generated or invalid verification code' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.VerifyMfaDto, String, String]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "enableMfa", null);
__decorate([
    (0, common_1.Post)('disable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Disable MFA (requires password)',
        description: 'Disables multi-factor authentication for the user. Requires password verification for security.'
    }),
    (0, swagger_1.ApiBody)({
        type: mfa_dto_1.DisableMfaDto,
        description: 'The user\'s password for verification before disabling MFA'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'MFA disabled successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Two-factor authentication has been disabled successfully' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized or invalid password' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Headers)('x-forwarded-for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.DisableMfaDto, String, String]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "disableMfa", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify MFA token',
        description: 'Validates a TOTP token against a provided secret. This is used during login for MFA verification.'
    }),
    (0, swagger_1.ApiBody)({
        description: 'The TOTP token and secret to verify',
        schema: {
            type: 'object',
            required: ['secret', 'token'],
            properties: {
                secret: { type: 'string', example: 'HXDMVJECJJWSRB3HWIZR4MKVGIYUC43PNZXW' },
                token: { type: 'string', example: '123456' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token verified successfully',
        schema: {
            type: 'object',
            properties: {
                isValid: { type: 'boolean', example: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token or secret' }),
    (0, swagger_1.ApiProduces)('application/json'),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "verifyMfaToken", null);
exports.MfaController = MfaController = __decorate([
    (0, swagger_1.ApiTags)('mfa'),
    (0, common_1.Controller)('mfa'),
    __metadata("design:paramtypes", [mfa_service_1.MfaService])
], MfaController);
//# sourceMappingURL=mfa.controller.js.map
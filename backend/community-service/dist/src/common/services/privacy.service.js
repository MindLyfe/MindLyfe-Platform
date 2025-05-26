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
var PrivacyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let PrivacyService = PrivacyService_1 = class PrivacyService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PrivacyService_1.name);
        this.algorithm = this.configService.get('encryption.algorithm');
        this.key = Buffer.from(this.configService.get('encryption.key'), 'hex');
        this.ivLength = this.configService.get('encryption.ivLength');
        this.saltLength = this.configService.get('encryption.saltLength');
    }
    encrypt(data) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const salt = crypto.randomBytes(this.saltLength);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            const encrypted = Buffer.concat([
                cipher.update(data, 'utf8'),
                cipher.final(),
            ]);
            const authTag = cipher.getAuthTag();
            const result = Buffer.concat([iv, salt, authTag, encrypted]);
            return result.toString('base64');
        }
        catch (error) {
            this.logger.error(`Encryption failed: ${error.message}`, error.stack);
            throw new Error('Encryption failed');
        }
    }
    decrypt(encryptedData) {
        try {
            const buffer = Buffer.from(encryptedData, 'base64');
            const iv = buffer.subarray(0, this.ivLength);
            const salt = buffer.subarray(this.ivLength, this.ivLength + this.saltLength);
            const authTag = buffer.subarray(this.ivLength + this.saltLength, this.ivLength + this.saltLength + 16);
            const encrypted = buffer.subarray(this.ivLength + this.saltLength + 16);
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final(),
            ]);
            return decrypted.toString('utf8');
        }
        catch (error) {
            this.logger.error(`Decryption failed: ${error.message}`, error.stack);
            throw new Error('Decryption failed');
        }
    }
    generatePseudonym(userId, type) {
        const prefix = type.charAt(0).toUpperCase();
        const hash = crypto
            .createHash('sha256')
            .update(userId + type + Date.now().toString())
            .digest('hex')
            .substring(0, 6);
        return `${prefix}${hash}`;
    }
    anonymizeUserData(user) {
        if (!user)
            return null;
        const anonymized = { ...user };
        delete anonymized.email;
        delete anonymized.phone;
        delete anonymized.address;
        delete anonymized.metadata?.lastLoginIp;
        delete anonymized.metadata?.lastLoginLocation;
        if (user.privacySettings?.isAnonymousByDefault) {
            anonymized.displayName = this.generatePseudonym(user.id, 'post');
        }
        return anonymized;
    }
    anonymizeContent(content, type) {
        if (!content)
            return null;
        const anonymized = { ...content };
        if (content.isAnonymous) {
            delete anonymized.author;
            delete anonymized.authorId;
            if (!anonymized.pseudonym) {
                anonymized.pseudonym = this.generatePseudonym(content.id, type);
            }
        }
        return anonymized;
    }
    async shouldAutoModerate(content) {
        return false;
    }
    sanitizeContent(content) {
        return content.trim();
    }
};
exports.PrivacyService = PrivacyService;
exports.PrivacyService = PrivacyService = PrivacyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrivacyService);
//# sourceMappingURL=privacy.service.js.map
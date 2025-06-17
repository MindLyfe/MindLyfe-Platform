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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    isDev;
    frontendUrl;
    fromEmail;
    constructor(configService) {
        this.configService = configService;
        this.isDev = configService.get('environment') === 'development';
        this.frontendUrl = configService.get('frontend.url');
        this.fromEmail = configService.get('email.from');
    }
    async sendVerificationEmail(email, token) {
        const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
        if (this.isDev) {
            this.logger.debug(`[DEV MODE] Sending verification email to ${email}`);
            this.logger.debug(`Verification URL: ${verificationUrl}`);
            return;
        }
        this.logger.log(`Sending verification email to ${email}`);
    }
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
        if (this.isDev) {
            this.logger.debug(`[DEV MODE] Sending password reset email to ${email}`);
            this.logger.debug(`Reset URL: ${resetUrl}`);
            return;
        }
        this.logger.log(`Sending password reset email to ${email}`);
    }
    async sendLoginNotificationEmail(email, ipAddress, userAgent) {
        if (this.isDev) {
            this.logger.debug(`[DEV MODE] Sending login notification to ${email}`);
            this.logger.debug(`Login details: IP=${ipAddress}, UA=${userAgent}`);
            return;
        }
        this.logger.log(`Sending login notification to ${email}`);
    }
    async sendGuardianNotification(guardianEmail, userName, userEmail) {
        if (this.isDev) {
            this.logger.debug(`[DEV] Guardian notification email to ${guardianEmail} for user ${userName} (${userEmail})`);
            return;
        }
        this.logger.log(`Guardian notification email sent to ${guardianEmail} for user ${userName}`);
    }
    async sendTherapistApprovalEmail(email, therapistName, approvalNotes) {
        if (this.isDev) {
            this.logger.debug(`[DEV MODE] Sending therapist approval email to ${email}`);
            this.logger.debug(`Therapist: ${therapistName}`);
            this.logger.debug(`Approval notes: ${approvalNotes || 'None'}`);
            return;
        }
        this.logger.log(`Sending therapist approval email to ${email}`);
    }
    async sendTherapistRejectionEmail(email, therapistName, reason, notes) {
        if (this.isDev) {
            this.logger.debug(`[DEV MODE] Sending therapist rejection email to ${email}`);
            this.logger.debug(`Therapist: ${therapistName}`);
            this.logger.debug(`Rejection reason: ${reason}`);
            this.logger.debug(`Additional notes: ${notes || 'None'}`);
            return;
        }
        this.logger.log(`Sending therapist rejection email to ${email}`);
    }
    async sendTherapistSuspensionEmail(email, therapistName, reason, notes) {
        if (this.isDev) {
            this.logger.debug(`[DEV MODE] Sending therapist suspension email to ${email}`);
            this.logger.debug(`Therapist: ${therapistName}`);
            this.logger.debug(`Suspension reason: ${reason}`);
            this.logger.debug(`Additional notes: ${notes || 'None'}`);
            return;
        }
        this.logger.log(`Sending therapist suspension email to ${email}`);
    }
    async sendTherapistReactivationEmail(email, therapistName) {
        if (this.isDev) {
            this.logger.debug(`[DEV MODE] Sending therapist reactivation email to ${email}`);
            this.logger.debug(`Therapist: ${therapistName}`);
            return;
        }
        this.logger.log(`Sending therapist reactivation email to ${email}`);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map
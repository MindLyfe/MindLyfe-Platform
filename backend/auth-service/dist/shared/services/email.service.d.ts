import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly isDev;
    private readonly frontendUrl;
    private readonly fromEmail;
    constructor(configService: ConfigService);
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    sendLoginNotificationEmail(email: string, ipAddress: string, userAgent: string): Promise<void>;
    sendGuardianNotification(guardianEmail: string, userName: string, userEmail: string): Promise<void>;
    sendTherapistApprovalEmail(email: string, therapistName: string, approvalNotes?: string): Promise<void>;
    sendTherapistRejectionEmail(email: string, therapistName: string, reason: string, notes?: string): Promise<void>;
    sendTherapistSuspensionEmail(email: string, therapistName: string, reason: string, notes?: string): Promise<void>;
    sendTherapistReactivationEmail(email: string, therapistName: string): Promise<void>;
}

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
}

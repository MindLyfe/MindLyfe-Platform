import { ConfigService } from '@nestjs/config';
export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    template?: string;
    templateData?: Record<string, any>;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }[];
}
export declare class EmailService {
    private readonly configService;
    private readonly ses;
    private readonly sourceEmail;
    private readonly logger;
    private readonly templates;
    constructor(configService: ConfigService);
    private loadTemplates;
    sendEmail(options: EmailOptions): Promise<void>;
    sendTemplatedEmail(options: {
        to: string | string[];
        templateName: string;
        templateData: Record<string, any>;
        subject?: string;
        from?: string;
        cc?: string | string[];
        bcc?: string | string[];
    }): Promise<void>;
    sendBulkTemplatedEmail(options: {
        destinations: Array<{
            to: string;
            templateData: Record<string, any>;
        }>;
        templateName: string;
        subject?: string;
        from?: string;
    }): Promise<void>;
    private getTextFromHtml;
}

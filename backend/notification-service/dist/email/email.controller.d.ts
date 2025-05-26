import { EmailService, EmailOptions } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmail(emailOptions: EmailOptions): Promise<{
        success: boolean;
        message: string;
    }>;
    sendTemplatedEmail(options: {
        to: string | string[];
        templateName: string;
        templateData: Record<string, any>;
        subject?: string;
        from?: string;
        cc?: string | string[];
        bcc?: string | string[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendBulkTemplatedEmail(options: {
        destinations: Array<{
            to: string;
            templateData: Record<string, any>;
        }>;
        templateName: string;
        subject?: string;
        from?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}

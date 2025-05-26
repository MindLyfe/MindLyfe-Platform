import { ConfigService } from '@nestjs/config';
export declare class PrivacyService {
    private readonly configService;
    private readonly logger;
    private readonly algorithm;
    private readonly key;
    private readonly ivLength;
    private readonly saltLength;
    constructor(configService: ConfigService);
    encrypt(data: string): string;
    decrypt(encryptedData: string): string;
    generatePseudonym(userId: string, type: 'post' | 'comment' | 'reaction'): string;
    anonymizeUserData(user: any): any;
    anonymizeContent(content: any, type: 'post' | 'comment' | 'reaction'): any;
    shouldAutoModerate(content: string): Promise<boolean>;
    sanitizeContent(content: string): string;
}

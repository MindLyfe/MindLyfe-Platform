import { MfaService } from './mfa.service';
import { VerifyMfaDto, DisableMfaDto } from './dto/mfa.dto';
export declare class MfaController {
    private readonly mfaService;
    constructor(mfaService: MfaService);
    generateMfaSecret(req: any): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    enableMfa(req: any, verifyMfaDto: VerifyMfaDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
    }>;
    disableMfa(req: any, disableMfaDto: DisableMfaDto, userAgent: string, ipAddress: string): Promise<{
        message: string;
    }>;
    verifyMfaToken(body: {
        secret: string;
        token: string;
    }): Promise<{
        isValid: boolean;
    }>;
}

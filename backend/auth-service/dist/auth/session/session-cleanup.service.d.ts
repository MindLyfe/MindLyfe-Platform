import { ConfigService } from '@nestjs/config';
import { SessionRepository } from './session.repository';
export declare class SessionCleanupService {
    private readonly sessionRepository;
    private readonly configService;
    private readonly logger;
    constructor(sessionRepository: SessionRepository, configService: ConfigService);
    handleSessionCleanup(): Promise<void>;
}

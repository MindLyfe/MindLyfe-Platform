import { SessionService } from './session.service';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    getUserSessions(req: any): Promise<import("./session.service").SessionData[]>;
    revokeSession(req: any, sessionId: string): Promise<void>;
    revokeAllSessions(req: any): Promise<void>;
    getUserSessionsByAdmin(userId: string): Promise<import("./session.service").SessionData[]>;
    revokeAllSessionsByAdmin(userId: string): Promise<void>;
}

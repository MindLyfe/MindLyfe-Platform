import { ConfigService } from '@nestjs/config';
import { SessionRepository } from './session.repository';
export interface SessionData {
    id: string;
    userId: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    lastUsedAt: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    revokedReason?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}
export declare class SessionService {
    private configService;
    private sessionRepository;
    private readonly logger;
    constructor(configService: ConfigService, sessionRepository: SessionRepository);
    private toSessionData;
    findSessionsByUserId(userId: string): Promise<SessionData[]>;
    findSessionById(id: string): Promise<SessionData>;
    findSessionByToken(refreshToken: string): Promise<SessionData | null>;
    getUserActiveSessions(userId: string): Promise<SessionData[]>;
    createSession(userId: string, refreshToken: string, ipAddress?: string, userAgent?: string, deviceInfo?: string): Promise<SessionData>;
    updateSession(id: string, data: Partial<SessionData>): Promise<SessionData>;
    updateSessionLastUsed(id: string): Promise<SessionData>;
    revokeSession(id: string, reason: string): Promise<SessionData>;
    revokeAllUserSessions(userId: string, reason: string, exceptSessionId?: string): Promise<void>;
    cleanupExpiredSessions(): Promise<number>;
    invalidateSession(sessionId: string): Promise<void>;
    invalidateAllUserSessions(userId: string, excludeSessionId?: string): Promise<void>;
}

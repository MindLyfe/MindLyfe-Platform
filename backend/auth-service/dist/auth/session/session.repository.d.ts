import { Repository, FindOptionsWhere } from 'typeorm';
import { UserSession } from '../../entities/user-session.entity';
export declare class SessionRepository {
    private readonly userSessionRepository;
    constructor(userSessionRepository: Repository<UserSession>);
    find(): Promise<UserSession[]>;
    findOne(options: {
        where: FindOptionsWhere<UserSession>;
    }): Promise<UserSession | null>;
    findByUserId(userId: string, includeExpired?: boolean, includeRevoked?: boolean): Promise<UserSession[]>;
    findByRefreshToken(refreshToken: string): Promise<UserSession | null>;
    findById(id: string): Promise<UserSession | null>;
    save(sessionData: Partial<UserSession> | UserSession | UserSession[]): Promise<UserSession | UserSession[]>;
    remove(session: UserSession): Promise<UserSession>;
    revokeSession(id: string, reason: string): Promise<UserSession>;
    revokeAllUserSessions(userId: string, reason: string, exceptSessionId?: string): Promise<void>;
    deleteExpiredSessions(): Promise<import("typeorm").DeleteResult>;
    deleteInactiveSessions(days: number): Promise<import("typeorm").DeleteResult>;
    cleanupExpiredSessions(): Promise<number>;
}

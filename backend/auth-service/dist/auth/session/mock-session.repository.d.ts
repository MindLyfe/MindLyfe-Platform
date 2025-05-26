import { UserSession } from '../../entities/user-session.entity';
export declare class MockSessionRepository {
    private sessions;
    find(): Promise<UserSession[]>;
    findOne(options: {
        where: Partial<UserSession>;
    }): Promise<UserSession | null>;
    save(sessionData: Partial<UserSession>): Promise<UserSession>;
    remove(session: UserSession): Promise<UserSession>;
    private createSession;
}

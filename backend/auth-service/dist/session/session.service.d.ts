import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { TherapySession } from '../entities/therapy-session.entity';
import { Subscription } from '../entities/subscription.entity';
import { CreateSessionDto, UpdateSessionDto } from '../dto/session.dto';
export declare class TherapySessionService {
    private userRepository;
    private sessionRepository;
    private subscriptionRepository;
    private dataSource;
    constructor(userRepository: Repository<User>, sessionRepository: Repository<TherapySession>, subscriptionRepository: Repository<Subscription>, dataSource: DataSource);
    createSession(userId: string, createDto: CreateSessionDto): Promise<TherapySession>;
    getUserSessions(userId: string, limit?: number): Promise<{
        sessions: TherapySession[];
        totalCount: number;
        upcomingSessions: number;
        completedSessions: number;
    }>;
    getTherapistSessions(therapistId: string, date?: Date): Promise<TherapySession[]>;
    updateSession(sessionId: string, userId: string, updateDto: UpdateSessionDto): Promise<TherapySession>;
    cancelSession(sessionId: string, userId: string, reason?: string): Promise<TherapySession>;
    startSession(sessionId: string, therapistId: string): Promise<TherapySession>;
    completeSession(sessionId: string, therapistId: string, notes?: string): Promise<TherapySession>;
    private canUserBookSession;
    private validateStatusTransition;
    private generateMeetingId;
    private generateMeetingLink;
}

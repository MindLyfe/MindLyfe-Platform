import { TherapySessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto } from '../dto/session.dto';
export declare class TherapySessionController {
    private readonly sessionService;
    constructor(sessionService: TherapySessionService);
    bookSession(req: any, createDto: CreateSessionDto): Promise<import("../entities/therapy-session.entity").TherapySession>;
    getMySessions(req: any, limit?: number): Promise<{
        sessions: import("../entities/therapy-session.entity").TherapySession[];
        totalCount: number;
        upcomingSessions: number;
        completedSessions: number;
    }>;
    getTherapistSchedule(req: any, date?: string): Promise<import("../entities/therapy-session.entity").TherapySession[]>;
    updateSession(req: any, sessionId: string, updateDto: UpdateSessionDto): Promise<import("../entities/therapy-session.entity").TherapySession>;
    cancelSession(req: any, sessionId: string, reason?: string): Promise<import("../entities/therapy-session.entity").TherapySession>;
    startSession(req: any, sessionId: string): Promise<import("../entities/therapy-session.entity").TherapySession>;
    completeSession(req: any, sessionId: string, notes?: string): Promise<import("../entities/therapy-session.entity").TherapySession>;
    getAvailableTherapists(): Promise<{
        message: string;
    }>;
    getAvailableSlots(therapistId: string, date?: string): Promise<{
        message: string;
        therapistId: string;
        date: string;
    }>;
}

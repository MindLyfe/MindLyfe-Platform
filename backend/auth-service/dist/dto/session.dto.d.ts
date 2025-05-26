import { SessionType, SessionStatus } from '../entities/therapy-session.entity';
export declare class CreateSessionDto {
    therapistId: string;
    scheduledAt: Date;
    type: SessionType;
    durationMinutes?: number;
    notes?: string;
}
export declare class UpdateSessionDto {
    status?: SessionStatus;
    notes?: string;
    cancellationReason?: string;
}

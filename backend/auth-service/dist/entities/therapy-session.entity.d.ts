import { User } from './user.entity';
import { Subscription } from './subscription.entity';
export declare enum SessionStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
export declare enum SessionType {
    INDIVIDUAL = "individual",
    GROUP = "group",
    EMERGENCY = "emergency"
}
export declare class TherapySession {
    id: string;
    userId: string;
    user: User;
    therapistId: string;
    therapist: User;
    subscriptionId?: string;
    subscription?: Subscription;
    status: SessionStatus;
    type: SessionType;
    scheduledAt: Date;
    startedAt?: Date;
    endedAt?: Date;
    durationMinutes: number;
    cost: number;
    paidFromCredit: boolean;
    paidFromSubscription: boolean;
    paymentReference?: string;
    notes?: string;
    cancellationReason?: string;
    meetingLink?: string;
    meetingId?: string;
    createdAt: Date;
    updatedAt: Date;
    get isCompleted(): boolean;
    get canCancel(): boolean;
    get actualDuration(): number | null;
}

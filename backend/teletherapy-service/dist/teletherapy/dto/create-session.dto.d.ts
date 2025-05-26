import { SessionType, SessionCategory, SessionFocus } from '../entities/therapy-session.entity';
declare class RecurringScheduleDto {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    endDate: Date;
    maxOccurrences?: number;
    skipDates?: Date[];
}
declare class PricingDto {
    amount: number;
    currency: string;
    perParticipant?: boolean;
    discountCode?: string;
    earlyBirdPrice?: number;
    earlyBirdEndDate?: Date;
}
declare class RequirementsDto {
    minAge?: number;
    maxAge?: number;
    prerequisites?: string[];
    requiredDocuments?: string[];
    consentRequired?: boolean;
}
export declare class CreateSessionDto {
    therapistId: string;
    clientId?: string;
    participantIds?: string[];
    startTime: Date;
    endTime: Date;
    type: SessionType;
    category: SessionCategory;
    focus: SessionFocus[];
    title: string;
    description?: string;
    maxParticipants?: number;
    isRecurring?: boolean;
    recurringSchedule?: RecurringScheduleDto;
    isPrivate?: boolean;
    invitedEmails?: string[];
    pricing?: PricingDto;
    requirements?: RequirementsDto;
    metadata?: Record<string, any>;
}
export {};

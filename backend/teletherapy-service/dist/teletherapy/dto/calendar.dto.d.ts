export declare enum CalendarProvider {
    GOOGLE = "google",
    OUTLOOK = "outlook",
    ICAL = "ical"
}
export declare enum CalendarEventStatus {
    CONFIRMED = "confirmed",
    TENTATIVE = "tentative",
    CANCELLED = "cancelled"
}
export declare class CalendarAvailabilityDto {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timezone: string;
    bufferBefore?: number;
    bufferAfter?: number;
    maxSessionsPerDay?: number;
    minNoticeHours?: number;
    maxAdvanceDays?: number;
}
export declare class CalendarExceptionDto {
    date: Date;
    available: boolean;
    reason?: string;
    alternativeAvailability?: CalendarAvailabilityDto;
}
export declare class CalendarSyncDto {
    provider: CalendarProvider;
    credentials: Record<string, any>;
    calendarId: string;
    twoWaySync: boolean;
    syncFrequency: number;
    syncPastEvents?: boolean;
    maxFutureDays?: number;
}
export declare class CalendarEventDto {
    eventId: string;
    sessionId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    status: CalendarEventStatus;
    location: string;
    attendees: string[];
    reminders: CalendarReminderDto[];
    recurrenceRule?: string;
    metadata?: Record<string, any>;
}
export declare class CalendarReminderDto {
    type: 'email' | 'popup' | 'sms';
    minutes: number;
    enabled: boolean;
}
export declare class CalendarConflictDto {
    eventId: string;
    sessionId: string;
    startTime: Date;
    endTime: Date;
    type: 'overlap' | 'adjacent' | 'buffer';
    resolution: 'reschedule' | 'cancel' | 'ignore';
}
export declare class CalendarSyncStatusDto {
    lastSyncedAt: Date;
    status: 'success' | 'failed' | 'in_progress';
    eventsSynced: number;
    conflictsDetected: number;
    error?: string;
    nextSyncAt: Date;
}

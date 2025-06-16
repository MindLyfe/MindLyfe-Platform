import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TherapySession } from '../entities/therapy-session.entity';
import { CalendarAvailabilityDto, CalendarExceptionDto, CalendarSyncDto, CalendarEventDto, CalendarConflictDto, CalendarSyncStatusDto } from '../dto/calendar.dto';
export declare class CalendarService {
    private readonly sessionRepository;
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly googleCalendar;
    constructor(sessionRepository: Repository<TherapySession>, httpService: HttpService, configService: ConfigService);
    private getUserFromAuthService;
    private updateUserInAuthService;
    setAvailability(userId: string, availability: CalendarAvailabilityDto): Promise<void>;
    addException(userId: string, exception: CalendarExceptionDto): Promise<void>;
    syncCalendar(userId: string, syncSettings: CalendarSyncDto): Promise<CalendarSyncStatusDto>;
    createCalendarEvent(sessionId: string): Promise<CalendarEventDto>;
    checkAvailability(userId: string, startTime: Date, endTime: Date, excludeSessionId?: string): Promise<{
        available: boolean;
        conflicts: CalendarConflictDto[];
    }>;
    private findSchedulingConflicts;
    private determineConflictType;
    private validateTimeFormat;
    private validateTimeRange;
    private createEventFromSession;
    private mapSessionStatusToEventStatus;
    private generateRecurrenceRule;
    private syncGoogleCalendar;
    private syncOutlookCalendar;
    private syncICalCalendar;
    private processGoogleEvents;
    private createOrUpdateSessionFromEvent;
    private determineSessionType;
    private createGoogleCalendarEvent;
    private createOutlookCalendarEvent;
    private createICalCalendarEvent;
}

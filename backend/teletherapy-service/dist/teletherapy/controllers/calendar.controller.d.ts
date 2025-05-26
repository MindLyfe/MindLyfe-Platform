import { CalendarService } from '../services/calendar.service';
import { CalendarAvailabilityDto, CalendarExceptionDto, CalendarSyncDto, CalendarEventDto, CalendarSyncStatusDto } from '../dto/calendar.dto';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    setAvailability(req: any, availability: CalendarAvailabilityDto): Promise<void>;
    addException(req: any, exception: CalendarExceptionDto): Promise<void>;
    syncCalendar(req: any, syncSettings: CalendarSyncDto): Promise<CalendarSyncStatusDto>;
    createCalendarEvent(sessionId: string): Promise<CalendarEventDto>;
    checkAvailability(req: any, startTimeStr: string, endTimeStr: string, excludeSessionId?: string): Promise<{
        available: boolean;
        conflicts: import("../dto/calendar.dto").CalendarConflictDto[];
    }>;
    getSyncStatus(req: any): Promise<CalendarSyncStatusDto>;
}

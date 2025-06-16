"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
const calendar_dto_1 = require("../dto/calendar.dto");
const therapy_session_entity_2 = require("../entities/therapy-session.entity");
const moment = require("moment-timezone");
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
let CalendarService = CalendarService_1 = class CalendarService {
    constructor(sessionRepository, httpService, configService) {
        this.sessionRepository = sessionRepository;
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(CalendarService_1.name);
        this.googleCalendar = googleapis_1.google.calendar({ version: 'v3' });
    }
    async getUserFromAuthService(userId) {
        try {
            const authServiceUrl = this.configService.get('services.authServiceUrl');
            const response = await this.httpService.get(`${authServiceUrl}/api/auth/users/${userId}`).toPromise();
            return response.data.user;
        }
        catch (error) {
            this.logger.error(`Failed to get user ${userId}: ${error.message}`);
            throw new common_1.NotFoundException('User not found');
        }
    }
    async updateUserInAuthService(userId, updates) {
        try {
            const authServiceUrl = this.configService.get('services.authServiceUrl');
            await this.httpService.patch(`${authServiceUrl}/api/auth/users/${userId}`, updates).toPromise();
        }
        catch (error) {
            this.logger.error(`Failed to update user ${userId}: ${error.message}`);
            throw new common_1.BadRequestException('Failed to update user');
        }
    }
    async setAvailability(userId, availability) {
        const user = await this.getUserFromAuthService(userId);
        this.validateTimeFormat(availability.startTime);
        this.validateTimeFormat(availability.endTime);
        this.validateTimeRange(availability.startTime, availability.endTime);
        await this.updateUserInAuthService(userId, {
            metadata: {
                ...user.metadata,
                calendarAvailability: availability,
            },
        });
    }
    async addException(userId, exception) {
        const user = await this.getUserFromAuthService(userId);
        const availability = user.metadata?.calendarAvailability;
        if (!availability) {
            throw new common_1.BadRequestException('User has no availability settings');
        }
        const exceptions = availability.exceptions || [];
        exceptions.push(exception);
        await this.updateUserInAuthService(userId, {
            metadata: {
                ...user.metadata,
                calendarAvailability: {
                    ...availability,
                    exceptions,
                },
            },
        });
    }
    async syncCalendar(userId, syncSettings) {
        const user = await this.getUserFromAuthService(userId);
        try {
            switch (syncSettings.provider) {
                case calendar_dto_1.CalendarProvider.GOOGLE:
                    return await this.syncGoogleCalendar(userId, syncSettings);
                case calendar_dto_1.CalendarProvider.OUTLOOK:
                    return await this.syncOutlookCalendar(userId, syncSettings);
                case calendar_dto_1.CalendarProvider.ICAL:
                    return await this.syncICalCalendar(userId, syncSettings);
                default:
                    throw new common_1.BadRequestException('Unsupported calendar provider');
            }
        }
        catch (error) {
            this.logger.error(`Calendar sync failed for user ${userId}: ${error.message}`);
            throw new common_1.BadRequestException(`Calendar sync failed: ${error.message}`);
        }
    }
    async createCalendarEvent(sessionId) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
            relations: ['therapist', 'client', 'participants'],
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const therapistId = session.therapistId;
        const calendarProvider = 'google';
        const event = this.createEventFromSession(session);
        let calendarEvent;
        try {
            const therapistCalendarProvider = calendarProvider;
            switch (therapistCalendarProvider) {
                case 'google':
                    calendarEvent = await this.createGoogleCalendarEvent(therapistId, event);
                    break;
                default:
                    throw new common_1.BadRequestException('Unsupported calendar provider');
            }
            await this.sessionRepository.update(sessionId, {
                metadata: {
                    ...session.metadata,
                    calendar: {
                        ...session.metadata?.calendar,
                        eventId: calendarEvent.eventId,
                        provider: therapistCalendarProvider,
                        syncStatus: 'synced',
                        lastSyncedAt: new Date(),
                    },
                },
            });
            return calendarEvent;
        }
        catch (error) {
            this.logger.error(`Failed to create calendar event for session ${sessionId}: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create calendar event: ${error.message}`);
        }
    }
    async checkAvailability(userId, startTime, endTime, excludeSessionId) {
        const user = await this.getUserFromAuthService(userId);
        const availability = user.metadata?.calendarAvailability;
        if (!availability) {
            throw new common_1.BadRequestException('User has no availability settings');
        }
        const startMoment = moment(startTime).tz(availability.timezone);
        const endMoment = moment(endTime).tz(availability.timezone);
        const dayOfWeek = startMoment.day();
        if (!availability.daysOfWeek.includes(dayOfWeek)) {
            return { available: false, conflicts: [] };
        }
        const startTimeStr = startMoment.format('HH:mm');
        const endTimeStr = endMoment.format('HH:mm');
        if (startTimeStr < availability.startTime || endTimeStr > availability.endTime) {
            return { available: false, conflicts: [] };
        }
        const exception = availability.exceptions?.find((e) => moment(e.date).isSame(startMoment, 'day'));
        if (exception && !exception.available) {
            return { available: false, conflicts: [] };
        }
        const conflicts = await this.findSchedulingConflicts(userId, startTime, endTime, excludeSessionId);
        return {
            available: conflicts.length === 0,
            conflicts,
        };
    }
    async findSchedulingConflicts(userId, startTime, endTime, excludeSessionId) {
        const query = this.sessionRepository
            .createQueryBuilder('session')
            .where('(session.therapistId = :userId OR :userId = ANY(session.participantIds))', { userId })
            .andWhere('session.status != :cancelled', { cancelled: therapy_session_entity_2.SessionStatus.CANCELLED })
            .andWhere('(session.startTime, session.endTime) OVERLAPS (:startTime, :endTime)', { startTime, endTime });
        if (excludeSessionId) {
            query.andWhere('session.id != :excludeSessionId', { excludeSessionId });
        }
        const conflictingSessions = await query.getMany();
        return conflictingSessions.map((session) => ({
            eventId: session.metadata?.calendar?.eventId,
            sessionId: session.id,
            startTime: session.startTime,
            endTime: session.endTime,
            type: this.determineConflictType(startTime, endTime, session.startTime, session.endTime),
            resolution: 'reschedule',
        }));
    }
    determineConflictType(newStart, newEnd, existingStart, existingEnd) {
        const newStartMoment = moment(newStart);
        const newEndMoment = moment(newEnd);
        const existingStartMoment = moment(existingStart);
        const existingEndMoment = moment(existingEnd);
        if (newStartMoment.isBefore(existingEndMoment) &&
            newEndMoment.isAfter(existingStartMoment)) {
            return 'overlap';
        }
        const bufferMinutes = 15;
        if (Math.abs(newStartMoment.diff(existingEndMoment, 'minutes')) <= bufferMinutes ||
            Math.abs(newEndMoment.diff(existingStartMoment, 'minutes')) <= bufferMinutes) {
            return 'buffer';
        }
        return 'adjacent';
    }
    validateTimeFormat(time) {
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            throw new common_1.BadRequestException('Invalid time format. Use HH:mm format.');
        }
    }
    validateTimeRange(startTime, endTime) {
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('Start time must be before end time');
        }
    }
    createEventFromSession(session) {
        return {
            eventId: session.metadata?.calendar?.eventId,
            sessionId: session.id,
            title: session.title || `Therapy Session - ${session.category}`,
            description: session.description,
            startTime: session.startTime,
            endTime: session.endTime,
            status: this.mapSessionStatusToEventStatus(session.status),
            location: session.metadata?.meetingLink || 'Online Session',
            attendees: [
                `therapist-${session.therapistId}@placeholder.com`,
                ...session.participantIds.map((id) => `participant-${id}@placeholder.com`),
            ],
            reminders: [
                {
                    type: 'email',
                    minutes: 30,
                    enabled: true,
                },
                {
                    type: 'popup',
                    minutes: 15,
                    enabled: true,
                },
            ],
            recurrenceRule: session.isRecurring ? this.generateRecurrenceRule(session.recurringSchedule) : undefined,
            metadata: {
                sessionType: session.type,
                sessionCategory: session.category,
                sessionFocus: session.focus,
            },
        };
    }
    mapSessionStatusToEventStatus(sessionStatus) {
        switch (sessionStatus) {
            case therapy_session_entity_2.SessionStatus.SCHEDULED:
                return calendar_dto_1.CalendarEventStatus.CONFIRMED;
            case therapy_session_entity_2.SessionStatus.CANCELLED:
                return calendar_dto_1.CalendarEventStatus.CANCELLED;
            default:
                return calendar_dto_1.CalendarEventStatus.TENTATIVE;
        }
    }
    generateRecurrenceRule(schedule) {
        if (!schedule)
            return undefined;
        const rule = ['FREQ=' + schedule.frequency.toUpperCase()];
        if (schedule.daysOfWeek) {
            rule.push('BYDAY=' + schedule.daysOfWeek.map(d => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][d]).join(','));
        }
        if (schedule.dayOfMonth) {
            rule.push('BYMONTHDAY=' + schedule.dayOfMonth);
        }
        if (schedule.endDate) {
            rule.push('UNTIL=' + moment(schedule.endDate).format('YYYYMMDD'));
        }
        if (schedule.maxOccurrences) {
            rule.push('COUNT=' + schedule.maxOccurrences);
        }
        return rule.join(';');
    }
    async syncGoogleCalendar(userId, syncSettings) {
        const oauth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        oauth2Client.setCredentials(syncSettings.credentials);
        try {
            const events = await this.googleCalendar.events.list({
                auth: oauth2Client,
                calendarId: syncSettings.calendarId,
                timeMin: syncSettings.syncPastEvents ? undefined : new Date().toISOString(),
                timeMax: syncSettings.maxFutureDays
                    ? moment().add(syncSettings.maxFutureDays, 'days').toISOString()
                    : undefined,
                singleEvents: true,
            });
            const conflicts = await this.processGoogleEvents(userId, events.data.items, syncSettings.twoWaySync);
            return {
                lastSyncedAt: new Date(),
                status: 'success',
                eventsSynced: events.data.items.length,
                conflictsDetected: conflicts.length,
                nextSyncAt: moment().add(syncSettings.syncFrequency, 'minutes').toDate(),
            };
        }
        catch (error) {
            this.logger.error(`Google Calendar sync failed: ${error.message}`);
            return {
                lastSyncedAt: new Date(),
                status: 'failed',
                eventsSynced: 0,
                conflictsDetected: 0,
                error: error.message,
                nextSyncAt: moment().add(syncSettings.syncFrequency, 'minutes').toDate(),
            };
        }
    }
    async syncOutlookCalendar(userId, syncSettings) {
        throw new Error('Outlook calendar sync not implemented');
    }
    async syncICalCalendar(userId, syncSettings) {
        throw new Error('iCal calendar sync not implemented');
    }
    async processGoogleEvents(userId, events, twoWaySync) {
        const conflicts = [];
        for (const event of events) {
            if (!event.start?.dateTime || !event.end?.dateTime)
                continue;
            const { available, conflicts: eventConflicts } = await this.checkAvailability(userId, new Date(event.start.dateTime), new Date(event.end.dateTime));
            if (!available) {
                conflicts.push(...eventConflicts);
            }
            else if (twoWaySync) {
                await this.createOrUpdateSessionFromEvent(userId, event);
            }
        }
        return conflicts;
    }
    async createOrUpdateSessionFromEvent(userId, event) {
        const existingSession = await this.sessionRepository
            .createQueryBuilder('session')
            .where("session.metadata -> 'calendar' ->> 'eventId' = :eventId", { eventId: event.id })
            .getOne();
        if (existingSession) {
            await this.sessionRepository.update(existingSession.id, {
                startTime: new Date(event.start.dateTime),
                endTime: new Date(event.end.dateTime),
                title: event.summary,
                description: event.description,
                metadata: {
                    ...existingSession.metadata,
                    calendar: {
                        ...existingSession.metadata.calendar,
                        lastSyncedAt: new Date(),
                    },
                },
            });
        }
        else {
            const newSession = this.sessionRepository.create({
                therapistId: userId,
                startTime: new Date(event.start.dateTime),
                endTime: new Date(event.end.dateTime),
                title: event.summary,
                description: event.description,
                status: therapy_session_entity_2.SessionStatus.SCHEDULED,
                type: this.determineSessionType(event),
                category: therapy_session_entity_2.SessionCategory.INDIVIDUAL,
                metadata: {
                    calendar: {
                        eventId: event.id,
                        provider: calendar_dto_1.CalendarProvider.GOOGLE,
                        syncStatus: 'synced',
                        lastSyncedAt: new Date(),
                    },
                },
            });
            await this.sessionRepository.save(newSession);
        }
    }
    determineSessionType(event) {
        const description = event.description?.toLowerCase() || '';
        if (description.includes('group')) {
            return event.conferenceData ? therapy_session_entity_2.SessionType.GROUP_VIDEO : therapy_session_entity_2.SessionType.GROUP_CHAT;
        }
        return event.conferenceData ? therapy_session_entity_2.SessionType.VIDEO : therapy_session_entity_2.SessionType.CHAT;
    }
    async createGoogleCalendarEvent(userId, event) {
        const oauth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        const user = await this.getUserFromAuthService(userId);
        oauth2Client.setCredentials(user.metadata.calendarCredentials);
        const googleEvent = {
            summary: event.title,
            description: event.description,
            start: {
                dateTime: event.startTime.toISOString(),
                timeZone: user.metadata.calendarAvailability?.timezone,
            },
            end: {
                dateTime: event.endTime.toISOString(),
                timeZone: user.metadata.calendarAvailability?.timezone,
            },
            attendees: event.attendees.map((email) => ({ email })),
            reminders: {
                useDefault: false,
                overrides: event.reminders.map((r) => ({
                    method: r.type === 'email' ? 'email' : 'popup',
                    minutes: r.minutes,
                })),
            },
            conferenceData: {
                createRequest: {
                    requestId: event.sessionId,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
        };
        if (event.recurrenceRule) {
            googleEvent['recurrence'] = [`RRULE:${event.recurrenceRule}`];
        }
        const response = await this.googleCalendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            requestBody: googleEvent,
            conferenceDataVersion: 1,
        });
        return {
            ...event,
            eventId: response.data.id,
            location: response.data.hangoutLink || event.location,
        };
    }
    async createOutlookCalendarEvent(userId, event) {
        throw new Error('Outlook calendar event creation not implemented');
    }
    async createICalCalendarEvent(userId, event) {
        throw new Error('iCal calendar event creation not implemented');
    }
};
CalendarService = CalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(therapy_session_entity_1.TherapySession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        axios_1.HttpService,
        config_1.ConfigService])
], CalendarService);
exports.CalendarService = CalendarService;
//# sourceMappingURL=calendar.service.js.map
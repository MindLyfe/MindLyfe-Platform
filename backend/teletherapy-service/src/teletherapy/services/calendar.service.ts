import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TherapySession } from '../entities/therapy-session.entity';
import { User } from '../../auth/entities/user.entity';
import {
  CalendarAvailabilityDto,
  CalendarExceptionDto,
  CalendarSyncDto,
  CalendarEventDto,
  CalendarConflictDto,
  CalendarSyncStatusDto,
  CalendarProvider,
  CalendarEventStatus,
} from '../dto/calendar.dto';
import { SessionStatus } from '../entities/therapy-session.entity';
import * as moment from 'moment-timezone';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { OutlookCalendar } from 'outlook-calendar';
import * as ical from 'node-ical';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly googleCalendar: calendar_v3.Calendar;
  private readonly outlookCalendar: OutlookCalendar;

  constructor(
    @InjectRepository(TherapySession)
    private readonly sessionRepository: Repository<TherapySession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Initialize calendar clients
    this.googleCalendar = google.calendar({ version: 'v3' });
    this.outlookCalendar = new OutlookCalendar();
  }

  async setAvailability(userId: string, availability: CalendarAvailabilityDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate time format and ranges
    this.validateTimeFormat(availability.startTime);
    this.validateTimeFormat(availability.endTime);
    this.validateTimeRange(availability.startTime, availability.endTime);

    // Update user's availability settings
    await this.userRepository.update(userId, {
      metadata: {
        ...user.metadata,
        calendarAvailability: availability,
      },
    });
  }

  async addException(userId: string, exception: CalendarExceptionDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const availability = user.metadata?.calendarAvailability;
    if (!availability) {
      throw new BadRequestException('User has no availability settings');
    }

    // Add exception to user's calendar settings
    const exceptions = availability.exceptions || [];
    exceptions.push(exception);

    await this.userRepository.update(userId, {
      metadata: {
        ...user.metadata,
        calendarAvailability: {
          ...availability,
          exceptions,
        },
      },
    });
  }

  async syncCalendar(userId: string, syncSettings: CalendarSyncDto): Promise<CalendarSyncStatusDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      switch (syncSettings.provider) {
        case CalendarProvider.GOOGLE:
          return await this.syncGoogleCalendar(userId, syncSettings);
        case CalendarProvider.OUTLOOK:
          return await this.syncOutlookCalendar(userId, syncSettings);
        case CalendarProvider.ICAL:
          return await this.syncICalCalendar(userId, syncSettings);
        default:
          throw new BadRequestException('Unsupported calendar provider');
      }
    } catch (error) {
      this.logger.error(`Calendar sync failed for user ${userId}: ${error.message}`);
      throw new BadRequestException(`Calendar sync failed: ${error.message}`);
    }
  }

  async createCalendarEvent(sessionId: string): Promise<CalendarEventDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['therapist', 'client', 'participants'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const therapist = session.therapist;
    if (!therapist.metadata?.calendarProvider) {
      throw new BadRequestException('Therapist has no calendar provider configured');
    }

    const event = this.createEventFromSession(session);
    let calendarEvent: CalendarEventDto;

    try {
      switch (therapist.metadata.calendarProvider) {
        case CalendarProvider.GOOGLE:
          calendarEvent = await this.createGoogleCalendarEvent(therapist, event);
          break;
        case CalendarProvider.OUTLOOK:
          calendarEvent = await this.createOutlookCalendarEvent(therapist, event);
          break;
        case CalendarProvider.ICAL:
          calendarEvent = await this.createICalCalendarEvent(therapist, event);
          break;
        default:
          throw new BadRequestException('Unsupported calendar provider');
      }

      // Update session with calendar event information
      await this.sessionRepository.update(sessionId, {
        metadata: {
          ...session.metadata,
          calendar: {
            ...session.metadata?.calendar,
            eventId: calendarEvent.eventId,
            provider: therapist.metadata.calendarProvider,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          },
        },
      });

      return calendarEvent;
    } catch (error) {
      this.logger.error(`Failed to create calendar event for session ${sessionId}: ${error.message}`);
      throw new BadRequestException(`Failed to create calendar event: ${error.message}`);
    }
  }

  async checkAvailability(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeSessionId?: string,
  ): Promise<{ available: boolean; conflicts: CalendarConflictDto[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const availability = user.metadata?.calendarAvailability;
    if (!availability) {
      throw new BadRequestException('User has no availability settings');
    }

    // Check if time is within availability hours
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

    // Check for exceptions
    const exception = availability.exceptions?.find(
      (e) => moment(e.date).isSame(startMoment, 'day'),
    );
    if (exception && !exception.available) {
      return { available: false, conflicts: [] };
    }

    // Check for existing sessions
    const conflicts = await this.findSchedulingConflicts(userId, startTime, endTime, excludeSessionId);
    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  private async findSchedulingConflicts(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeSessionId?: string,
  ): Promise<CalendarConflictDto[]> {
    const query = this.sessionRepository
      .createQueryBuilder('session')
      .where('(session.therapistId = :userId OR :userId = ANY(session.participantIds))', { userId })
      .andWhere('session.status != :cancelled', { cancelled: SessionStatus.CANCELLED })
      .andWhere(
        '(session.startTime, session.endTime) OVERLAPS (:startTime, :endTime)',
        { startTime, endTime },
      );

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
      resolution: 'pending',
    }));
  }

  private determineConflictType(
    newStart: Date,
    newEnd: Date,
    existingStart: Date,
    existingEnd: Date,
  ): 'overlap' | 'adjacent' | 'buffer' {
    const newStartMoment = moment(newStart);
    const newEndMoment = moment(newEnd);
    const existingStartMoment = moment(existingStart);
    const existingEndMoment = moment(existingEnd);

    if (
      newStartMoment.isBefore(existingEndMoment) &&
      newEndMoment.isAfter(existingStartMoment)
    ) {
      return 'overlap';
    }

    const bufferMinutes = 15; // Default buffer time
    if (
      Math.abs(newStartMoment.diff(existingEndMoment, 'minutes')) <= bufferMinutes ||
      Math.abs(newEndMoment.diff(existingStartMoment, 'minutes')) <= bufferMinutes
    ) {
      return 'buffer';
    }

    return 'adjacent';
  }

  private validateTimeFormat(time: string): void {
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new BadRequestException('Invalid time format. Use HH:mm format.');
    }
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  private createEventFromSession(session: TherapySession): CalendarEventDto {
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
        session.therapist.email,
        ...session.participants.map((p) => p.email),
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

  private mapSessionStatusToEventStatus(sessionStatus: SessionStatus): CalendarEventStatus {
    switch (sessionStatus) {
      case SessionStatus.SCHEDULED:
        return CalendarEventStatus.CONFIRMED;
      case SessionStatus.CANCELLED:
        return CalendarEventStatus.CANCELLED;
      default:
        return CalendarEventStatus.TENTATIVE;
    }
  }

  private generateRecurrenceRule(schedule: TherapySession['recurringSchedule']): string {
    if (!schedule) return undefined;

    const rule: string[] = ['FREQ=' + schedule.frequency.toUpperCase()];
    
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

  private async syncGoogleCalendar(
    userId: string,
    syncSettings: CalendarSyncDto,
  ): Promise<CalendarSyncStatusDto> {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

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
    } catch (error) {
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

  private async syncOutlookCalendar(
    userId: string,
    syncSettings: CalendarSyncDto,
  ): Promise<CalendarSyncStatusDto> {
    // Implement Outlook calendar sync
    // Similar to Google Calendar sync but using Outlook API
    throw new Error('Outlook calendar sync not implemented');
  }

  private async syncICalCalendar(
    userId: string,
    syncSettings: CalendarSyncDto,
  ): Promise<CalendarSyncStatusDto> {
    // Implement iCal calendar sync
    // Similar to Google Calendar sync but using iCal format
    throw new Error('iCal calendar sync not implemented');
  }

  private async processGoogleEvents(
    userId: string,
    events: calendar_v3.Schema$Event[],
    twoWaySync: boolean,
  ): Promise<CalendarConflictDto[]> {
    const conflicts: CalendarConflictDto[] = [];

    for (const event of events) {
      if (!event.start?.dateTime || !event.end?.dateTime) continue;

      const { available, conflicts: eventConflicts } = await this.checkAvailability(
        userId,
        new Date(event.start.dateTime),
        new Date(event.end.dateTime),
      );

      if (!available) {
        conflicts.push(...eventConflicts);
      } else if (twoWaySync) {
        // Create or update session in our system
        await this.createOrUpdateSessionFromEvent(userId, event);
      }
    }

    return conflicts;
  }

  private async createOrUpdateSessionFromEvent(
    userId: string,
    event: calendar_v3.Schema$Event,
  ): Promise<void> {
    const existingSession = await this.sessionRepository.findOne({
      where: {
        'metadata.calendar.eventId': event.id,
      },
    });

    if (existingSession) {
      // Update existing session
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
    } else {
      // Create new session
      const newSession = this.sessionRepository.create({
        therapistId: userId,
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        title: event.summary,
        description: event.description,
        status: SessionStatus.SCHEDULED,
        type: this.determineSessionType(event),
        category: SessionCategory.INDIVIDUAL,
        metadata: {
          calendar: {
            eventId: event.id,
            provider: CalendarProvider.GOOGLE,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          },
        },
      });

      await this.sessionRepository.save(newSession);
    }
  }

  private determineSessionType(event: calendar_v3.Schema$Event): TherapySession['type'] {
    const description = event.description?.toLowerCase() || '';
    if (description.includes('group')) {
      return event.conferenceData ? SessionType.GROUP_VIDEO : SessionType.GROUP_CHAT;
    }
    return event.conferenceData ? SessionType.VIDEO : SessionType.CHAT;
  }

  private async createGoogleCalendarEvent(
    user: User,
    event: CalendarEventDto,
  ): Promise<CalendarEventDto> {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

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

  private async createOutlookCalendarEvent(
    user: User,
    event: CalendarEventDto,
  ): Promise<CalendarEventDto> {
    // Implement Outlook calendar event creation
    throw new Error('Outlook calendar event creation not implemented');
  }

  private async createICalCalendarEvent(
    user: User,
    event: CalendarEventDto,
  ): Promise<CalendarEventDto> {
    // Implement iCal calendar event creation
    throw new Error('iCal calendar event creation not implemented');
  }
} 
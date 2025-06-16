import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { TherapySession, SessionStatus, SessionType, SessionCategory } from './entities/therapy-session.entity';
import { SessionNote } from './entities/session-note.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtUser } from '../auth/interfaces/user.interface';
import { addDays, addWeeks, addMonths, isBefore, isAfter, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import { AddParticipantsDto, RemoveParticipantsDto, UpdateParticipantRoleDto, ManageBreakoutRoomsDto, ParticipantRole } from './dto/manage-participants.dto';
import { User, UserRole } from '../auth/entities/user.entity';
import { AuthClientService } from './services/auth-client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TeletherapyNotificationService } from './services/notification.service';
import { v4 as uuidv4 } from 'uuid'; // Added uuid import

interface ChatServiceResponse {
  data?: {
    id: string;
    // Add other expected properties from chat service response if known
  };
  // Add other top-level properties from chat service response if known
}

@Injectable()
export class TeletherapyService {
  private readonly logger = new Logger(TeletherapyService.name);
  private readonly chatServiceUrl: string;
  private readonly authServiceUrl: string;

  constructor(
    @InjectRepository(TherapySession)
    private readonly sessionRepository: Repository<TherapySession>,
    // User repository replaced with HTTP client calls to auth service
    @InjectRepository(SessionNote)
    private readonly sessionNoteRepository: Repository<SessionNote>,
    private readonly authClient: AuthClientService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly notificationService: TeletherapyNotificationService,
  ) {
    this.chatServiceUrl = this.configService.get<string>('services.chatServiceUrl', 'http://chat-service:3003');
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3001');
  }

  async createSession(createSessionDto: CreateSessionDto, user: JwtUser): Promise<TherapySession> {
    try {
      // Validate therapist exists and is available
      const therapist = await this.authClient.validateUser(createSessionDto.therapistId);

      if (!therapist) {
        throw new NotFoundException('Therapist not found or not available');
      }

      // Check for scheduling conflicts
      const conflictingSession = await this.sessionRepository.findOne({
        where: {
          therapistId: createSessionDto.therapistId,
          startTime: new Date(createSessionDto.startTime),
          status: SessionStatus.SCHEDULED
        }
      });

      if (conflictingSession) {
        await this.notificationService.notifySessionBookingFailed(
          user.id,
          'Time slot not available',
          new Date(createSessionDto.startTime),
          therapist.name
        );
        throw new BadRequestException('Time slot is not available');
      }

      // Create session entity
      const sessionEntity = {
        clientId: user.id,
        therapistId: createSessionDto.therapistId,
        startTime: new Date(createSessionDto.startTime),
        endTime: new Date(createSessionDto.endTime),
        type: createSessionDto.type,
        status: SessionStatus.SCHEDULED,
        duration: (new Date(createSessionDto.endTime).getTime() - new Date(createSessionDto.startTime).getTime()) / 60000, // Calculate duration in minutes
        notes: {
          clientNotes: createSessionDto.metadata?.notes as string, // Access from metadata
        },
        metadata: {
          bookingSource: 'api',
          meetingLink: this.generateMeetingLink(),
          isEmergency: createSessionDto.metadata?.isEmergency as boolean || false,
          // Spread DTO metadata if it exists to allow overriding meetingLink etc.
          ...(createSessionDto.metadata || {}),
        }
      };

      // Create and save the session
      const session = this.sessionRepository.create(sessionEntity);
      const saveResult = await this.sessionRepository.save(session);
      
      // Ensure we have a single TherapySession entity
      // Use type assertion to tell TypeScript this is a TherapySession
      const savedSession = Array.isArray(saveResult) 
        ? saveResult[0] as TherapySession 
        : saveResult as TherapySession;

      if (!savedSession) {
        // Handle case where session saving failed unexpectedly and didn't return an entity
        this.logger.error('Session saving failed and did not return a valid entity.');
        throw new InternalServerErrorException('Failed to save session.');
      }

      // NOTIFICATION: Send booking confirmation
      try {
        await this.notificationService.notifySessionBookingConfirmed(
          user.id,
          createSessionDto.therapistId,
          savedSession.id,
          savedSession.startTime,
          therapist.name || 'Therapist',
          createSessionDto.type,
          savedSession.duration
        );

        // Schedule session reminders
        await this.notificationService.scheduleSessionReminders(
          savedSession.id,
          user.id,
          createSessionDto.therapistId,
          savedSession.startTime,
          therapist.name || 'Therapist',
          createSessionDto.type
        );
      } catch (error) {
        // Log notification error but don't fail the session creation
        this.logger.error(`Failed to send session notifications: ${error.message}`, error.stack);
      }

      return savedSession;
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validateSessionTypeAndCategory(type: SessionType, category: SessionCategory): void {
    const validCombinations = {
      [SessionCategory.INDIVIDUAL]: [SessionType.VIDEO, SessionType.AUDIO, SessionType.CHAT],
      [SessionCategory.GROUP]: [SessionType.GROUP_VIDEO, SessionType.GROUP_AUDIO, SessionType.GROUP_CHAT],
      [SessionCategory.WORKSHOP]: [SessionType.GROUP_VIDEO, SessionType.GROUP_AUDIO],
      [SessionCategory.SUPPORT_GROUP]: [SessionType.GROUP_VIDEO, SessionType.GROUP_AUDIO, SessionType.GROUP_CHAT],
      [SessionCategory.COUPLES]: [SessionType.VIDEO, SessionType.AUDIO],
      [SessionCategory.FAMILY]: [SessionType.VIDEO, SessionType.AUDIO],
    };

    if (!validCombinations[category].includes(type)) {
      throw new BadRequestException(`Invalid session type ${type} for category ${category}`);
    }
  }

  async addParticipants(
    sessionId: string,
    addParticipantsDto: AddParticipantsDto,
    user: JwtUser,
  ): Promise<TherapySession> {
    const session = await this.getSessionById(sessionId, user);

    // Validate permissions
    if (user.id !== session.therapistId && user.role !== 'admin') {
      throw new ForbiddenException('Only the therapist or admin can add participants');
    }

    // Check participant limit
    const newParticipantCount = (addParticipantsDto.userIds?.length || 0) + (addParticipantsDto.emails?.length || 0);
    if (session.maxParticipants && session.currentParticipants + newParticipantCount > session.maxParticipants) {
      throw new BadRequestException('Adding these participants would exceed the maximum limit');
    }

    // Add existing users
    if (addParticipantsDto.userIds?.length) {
      const users = await this.authClient.getUsersByIds(addParticipantsDto.userIds);
      session.participantIds = [...(session.participantIds || []), ...addParticipantsDto.userIds];
    }

    // Handle email invitations
    if (addParticipantsDto.emails?.length) {
      session.invitedEmails = [...(session.invitedEmails || []), ...addParticipantsDto.emails];
      // TODO: Send email invitations
    }

    session.currentParticipants = session.participantIds.length;
    return this.sessionRepository.save(session);
  }

  async removeParticipants(
    sessionId: string,
    removeParticipantsDto: RemoveParticipantsDto,
    user: JwtUser,
  ): Promise<TherapySession> {
    const session = await this.getSessionById(sessionId, user);

    // Validate permissions
    if (user.id !== session.therapistId && user.role !== 'admin') {
      throw new ForbiddenException('Only the therapist or admin can remove participants');
    }

    // Remove participants
    session.participantIds = session.participantIds?.filter(id => !removeParticipantsDto.userIds.includes(id)) || [];
    session.participantIds = session.participantIds?.filter(id => !removeParticipantsDto.userIds.includes(id));
    session.currentParticipants = session.participantIds.length;

    // TODO: Send notifications if requested
    if (removeParticipantsDto.sendNotifications) {
      // Implement notification logic
    }

    return this.sessionRepository.save(session);
  }

  async updateParticipantRole(
    sessionId: string,
    updateRoleDto: UpdateParticipantRoleDto,
    user: JwtUser,
  ): Promise<TherapySession> {
    const session = await this.getSessionById(sessionId, user);

    // Validate permissions
    if (user.id !== session.therapistId && user.role !== 'admin') {
      throw new ForbiddenException('Only the therapist or admin can update participant roles');
    }

    // Update participant role in metadata
    const participantRoles = session.metadata?.participantRoles || {};
    participantRoles[updateRoleDto.userId] = updateRoleDto.role;
    session.metadata = { ...session.metadata, participantRoles };

    return this.sessionRepository.save(session);
  }

  async manageBreakoutRooms(
    sessionId: string,
    breakoutRoomsDto: ManageBreakoutRoomsDto,
    user: JwtUser,
  ): Promise<TherapySession> {
    const session = await this.getSessionById(sessionId, user);

    // Validate permissions
    if (user.id !== session.therapistId && user.role !== 'admin') {
      throw new ForbiddenException('Only the therapist or admin can manage breakout rooms');
    }

    // Validate session type
    if (![SessionType.GROUP_VIDEO, SessionType.GROUP_AUDIO].includes(session.type)) {
      throw new BadRequestException('Breakout rooms are only available for group video or audio sessions');
    }

    // Update breakout rooms configuration
    const duration = parseInt(breakoutRoomsDto.duration, 10);
    session.metadata = {
      ...session.metadata,
      breakoutRooms: breakoutRoomsDto.rooms.map(room => ({ ...room, id: uuidv4() })),
      breakoutRoomDuration: !isNaN(duration) ? duration : 0,
    };

    return this.sessionRepository.save(session);
  }

  async joinSession(sessionId: string, user: JwtUser): Promise<TherapySession> {
    const session = await this.getSessionById(sessionId, user);

    // Validate session status
    if (session.status !== SessionStatus.SCHEDULED && session.status !== SessionStatus.WAITING_ROOM) {
      throw new BadRequestException('Session is not available for joining');
    }

    // Check if user is already a participant
    if (session.participantIds?.includes(user.id)) {
      return session;
    }

    // Validate participant limit
    if (session.maxParticipants && session.currentParticipants >= session.maxParticipants) {
      throw new BadRequestException('Session has reached maximum participant limit');
    }

    // Add user to participants
    session.participantIds = [...(session.participantIds || []), user.id];
    session.participantIds = [...(session.participantIds || []), user.id];
    session.currentParticipants = session.participantIds.length;

    // Update status to waiting room if it's time
    const now = new Date();
    if (differenceInMinutes(session.startTime, now) <= 15) {
      session.status = SessionStatus.WAITING_ROOM;
    }

    return this.sessionRepository.save(session);
  }

  async leaveSession(sessionId: string, user: JwtUser): Promise<TherapySession> {
    const session = await this.getSessionById(sessionId, user);

    // Remove user from participants
    session.participantIds = session.participantIds?.filter(id => id !== user.id) || [];
    session.participantIds = session.participantIds?.filter(id => id !== user.id);
    session.currentParticipants = session.participantIds.length;

    // Update session status if needed
    if (session.status === SessionStatus.IN_PROGRESS && session.currentParticipants === 0) {
      session.status = SessionStatus.COMPLETED;
    }

    return this.sessionRepository.save(session);
  }

  private async createRecurringSessions(
    baseSession: TherapySession,
    schedule: CreateSessionDto['recurringSchedule'],
  ): Promise<TherapySession[]> {
    const sessions: TherapySession[] = [];
    let currentStart = new Date(baseSession.startTime);
    let currentEnd = new Date(baseSession.endTime);
    const duration = currentEnd.getTime() - currentStart.getTime();

    while (isBefore(currentStart, schedule.endDate)) {
      const session = this.sessionRepository.create({
        ...baseSession,
        startTime: new Date(currentStart),
        endTime: new Date(currentEnd),
        status: SessionStatus.SCHEDULED,
      });

      sessions.push(session);

      // Calculate next session time based on frequency
      switch (schedule.frequency) {
        case 'weekly':
          currentStart = addWeeks(currentStart, 1);
          break;
        case 'biweekly':
          currentStart = addWeeks(currentStart, 2);
          break;
        case 'monthly':
          currentStart = addMonths(currentStart, 1);
          break;
      }
      currentEnd = new Date(currentStart.getTime() + duration);
    }

    return this.sessionRepository.save(sessions);
  }

  async findSchedulingConflicts(
    therapistId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<TherapySession[]> {
    return this.sessionRepository.find({
      where: {
        therapistId,
        status: SessionStatus.SCHEDULED,
        startTime: LessThanOrEqual(endTime),
        endTime: MoreThanOrEqual(startTime),
      },
    });
  }

  async getSessionById(id: string, user: JwtUser): Promise<TherapySession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['therapist', 'client', 'participants'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    // Check if user has permission to view the session
    if (
      user.id !== session.therapistId &&
      !session.participantIds?.includes(user.id) &&
      user.role !== 'admin'
    ) {
      throw new ForbiddenException('You do not have permission to view this session');
    }

    return session;
  }

  async getUpcomingSessions(user: JwtUser): Promise<TherapySession[]> {
    const now = new Date();
    return this.sessionRepository.find({
      where: [
        { therapistId: user.id, startTime: MoreThanOrEqual(now) },
        { participantIds: user.id, startTime: MoreThanOrEqual(now) },
      ],
      order: { startTime: 'ASC' },
      relations: ['therapist', 'client', 'participants'],
    });
  }

  async getSessionsByDateRange(
    startDate: Date,
    endDate: Date,
    user: JwtUser,
  ): Promise<TherapySession[]> {
    return this.sessionRepository.find({
      where: [
        {
          therapistId: user.id,
          startTime: Between(startOfDay(startDate), endOfDay(endDate)),
        },
        {
          participantIds: user.id,
          startTime: Between(startOfDay(startDate), endOfDay(endDate)),
        },
      ],
      order: { startTime: 'ASC' },
      relations: ['therapist', 'client', 'participants'],
    });
  }

  async updateSessionStatus(
    id: string,
    status: SessionStatus,
    user: JwtUser,
  ): Promise<TherapySession> {
    // Validate user via auth service
    await this.authClient.validateUser(user.id);
    
    const session = await this.getSessionById(id, user);

    // Validate status transition
    this.validateStatusTransition(session.status, status);

    // If the session is ending, create a chat room for group sessions
    if (status === SessionStatus.COMPLETED && 
        [SessionCategory.GROUP, SessionCategory.SUPPORT_GROUP].includes(session.category)) {
      await this.createChatRoomForCompletedSession(session, user);
    }

    session.status = status;
    return this.sessionRepository.save(session);
  }

  private validateStatusTransition(currentStatus: SessionStatus, newStatus: SessionStatus): void {
    const validTransitions = {
      [SessionStatus.SCHEDULED]: [SessionStatus.IN_PROGRESS, SessionStatus.CANCELLED, SessionStatus.NO_SHOW],
      [SessionStatus.IN_PROGRESS]: [SessionStatus.COMPLETED, SessionStatus.CANCELLED],
      [SessionStatus.COMPLETED]: [],
      [SessionStatus.CANCELLED]: [],
      [SessionStatus.NO_SHOW]: [SessionStatus.SCHEDULED],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async updateSessionNotes(
    id: string,
    notes: { therapistNotes?: string; clientNotes?: string; sharedNotes?: string },
    user: JwtUser,
  ): Promise<TherapySession> {
    const session = await this.getSessionById(id, user);

    // Validate user permissions for note updates
    if (user.id === session.therapistId) {
      session.notes = { ...session.notes, therapistNotes: notes.therapistNotes };
    } else if (user.id === session.clientId) {
      session.notes = { ...session.notes, clientNotes: notes.clientNotes };
    } else if (user.role === 'admin') {
      session.notes = { ...session.notes, ...notes };
    } else {
      throw new ForbiddenException('You do not have permission to update session notes');
    }

    return this.sessionRepository.save(session);
  }

  async cancelSession(id: string, user: JwtUser, reason?: string): Promise<TherapySession> {
    const session = await this.getSessionById(id, user);

    // Only allow cancellation if the session hasn't started
    if (isBefore(new Date(), session.startTime)) {
      session.status = SessionStatus.CANCELLED;
      if (reason) {
        session.metadata = { ...session.metadata, cancellationReason: reason };
      }
      return this.sessionRepository.save(session);
    }

    throw new BadRequestException('Cannot cancel a session that has already started');
  }

  // Add the public method to create a chat room for a session
  async createChatRoomForSession(sessionId: string, user: JwtUser): Promise<void> {
    // Validate user via auth service
    await this.authClient.validateUser(user.id);
    
    // Get the session details
    const session = await this.getSessionById(sessionId, user);
    
    // Validate that the user is the therapist or an admin
    if (user.id !== session.therapistId && user.role !== 'admin') {
      throw new ForbiddenException('Only the session therapist or admin can create chat rooms');
    }
    
    // Create the chat room
    await this.createChatRoomForCompletedSession(session, user);
  }

  // Modify this to be more reusable
  private async createChatRoomForCompletedSession(session: TherapySession, user: JwtUser): Promise<void> {
    try {
      // Only create chat rooms for group sessions with participants
      if (!session.participantIds || session.participantIds.length <= 1) {
        throw new BadRequestException('Cannot create a chat room for a session with fewer than 2 participants');
      }

      const roomName = `${session.title} - Follow-up Group`;
      
      // Create chat room via Chat Service
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.chatServiceUrl}/api/chat/rooms`, 
          {
            name: roomName,
            description: `Follow-up chat room for therapy session: ${session.title}`,
            participants: session.participantIds,
            type: 'THERAPY',
            privacyLevel: 'PRIVATE',
            metadata: {
              therapySessionId: session.id,
              therapistId: session.therapistId,
              sessionTitle: session.title,
              sessionDate: session.startTime,
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            }
          }
        )
      ) as ChatServiceResponse; // Added type assertion here
      
      // Add the chat room ID to the session metadata
      session.metadata = {
        ...session.metadata,
        chatRoomId: response.data?.id,
        chatRoomCreatedAt: new Date(),
      };
      
      // Save the updated session
      await this.sessionRepository.save(session);
      
      // Log successful creation
      console.log(`Created chat room for therapy session: ${session.id}`);
      
    } catch (error) {
      console.error(`Failed to create chat room for therapy session ${session.id}:`, error.message);
      throw new BadRequestException(`Failed to create chat room: ${error.message}`);
    }
  }

  // Add the method for checking therapist-client relationship
  async checkTherapistClientRelationship(therapistId: string, clientId: string): Promise<boolean> {
    // Validate both users via auth service
    try {
      const therapistInfo = await this.authClient.validateUser(therapistId);
      const clientInfo = await this.authClient.validateUser(clientId);
      
      // Ensure the therapist is actually a therapist
      const isTherapist = therapistInfo.role === UserRole.THERAPIST;
      
      if (!isTherapist) {
        return false; // The specified therapist ID is not a therapist
      }
      
      // Find any sessions between the therapist and client (past, current, or scheduled)
      const sessions = await this.sessionRepository.find({
        where: [
          {
            therapistId: therapistId,
            participantIds: clientId
          },
          {
            therapistId: therapistId,
            clientId: clientId
          }
        ]
      });
      
      // Return true if they have at least one session
      return sessions.length > 0;
    } catch (error) {
      console.error('Error checking therapist-client relationship:', error.message);
      return false; // If error occurs (like invalid user IDs), return false
    }
  }

  async getSessionsByUser(userId: string): Promise<TherapySession[]> {
    return await this.sessionRepository.find({
      where: [
        { clientId: userId },
        { therapistId: userId },
        { participantIds: userId }
      ],
      order: { startTime: 'DESC' }, // Changed sessionDate to startTime
      take: 50
    });
  }

  async getAvailableTherapists(): Promise<any[]> {
    try {
      // Get therapists from auth service
      const response = await this.authClient.getUsers({ role: 'therapist' });
      return response.filter(user => user.isActive === true);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      return [];
    }
  }

  async getAvailableSlots(therapistId: string, startDate: string, endDate: string, durationMinutes: number, serviceType?: SessionType, timezone?: string): Promise<any[]> {
    const targetDate = startDate ? new Date(startDate) : new Date(); // Changed date to startDate
    const startOfTargetDay = startOfDay(targetDate);
    const endOfTargetDay = endOfDay(targetDate);

    // Get existing sessions for this therapist on this date
    const existingSessions = await this.sessionRepository.find({
      where: {
        therapistId,
        startTime: Between(startOfTargetDay, endOfTargetDay), // Changed sessionDate to startTime
        status: In([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS])
      }
    });

    // Generate available slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      const slotTime = new Date(startOfTargetDay);
      slotTime.setHours(hour, 0, 0, 0);

      // Check if this slot conflicts with existing sessions
      const hasConflict = existingSessions.some(session => {
        const sessionStart = new Date(session.startTime); // Changed session.sessionDate to session.startTime
        const sessionEnd = new Date(sessionStart.getTime() + (session.duration || 60) * 60000);
        const slotEnd = new Date(slotTime.getTime() + 60 * 60000);

        return (slotTime >= sessionStart && slotTime < sessionEnd) ||
               (slotEnd > sessionStart && slotEnd <= sessionEnd);
      });

      if (!hasConflict) {
        availableSlots.push({
          time: slotTime.toISOString(),
          duration: 60,
          available: true
        });
      }
    }

    return availableSlots;
  }

  async updateSessionPayment(sessionId: string, paymentInfo: any): Promise<TherapySession> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.subscriptionId = paymentInfo.subscriptionId;
    session.paidFromSubscription = paymentInfo.paidFromSubscription;
    session.paidFromCredit = paymentInfo.paidFromCredit;

    return await this.sessionRepository.save(session);
  }

  /**
   * Generate meeting link for session
   */
  private generateMeetingLink(): string {
    const sessionId = Math.random().toString(36).substring(2, 15);
    return `${this.configService.get('VIDEO_SERVICE_URL', 'https://meet.mindlyf.com')}/session/${sessionId}`;
  }
}
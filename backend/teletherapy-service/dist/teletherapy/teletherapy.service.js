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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeletherapyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const therapy_session_entity_1 = require("./entities/therapy-session.entity");
const date_fns_1 = require("date-fns");
const user_entity_1 = require("../auth/entities/user.entity");
const auth_client_1 = require("@mindlyf/shared/auth-client");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let TeletherapyService = class TeletherapyService {
    constructor(sessionRepository, userRepository, authClient, httpService, configService) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.authClient = authClient;
        this.httpService = httpService;
        this.configService = configService;
        this.chatServiceUrl = this.configService.get('services.chatServiceUrl', 'http://chat-service:3003');
    }
    async createSession(createSessionDto, user) {
        await this.authClient.validateUser(user.id);
        const therapistInfo = await this.authClient.validateUser(createSessionDto.therapistId);
        const isTherapist = therapistInfo.roles?.some(role => ['therapist', 'admin'].includes(role.toLowerCase()));
        if (!isTherapist) {
            throw new common_1.BadRequestException('The specified therapist ID does not belong to a valid therapist');
        }
        if (user.id !== createSessionDto.therapistId && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only the assigned therapist or admin can create sessions');
        }
        if ((0, date_fns_1.isBefore)(createSessionDto.endTime, createSessionDto.startTime)) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        if ((0, date_fns_1.isBefore)(createSessionDto.startTime, new Date())) {
            throw new common_1.BadRequestException('Cannot create sessions in the past');
        }
        this.validateSessionTypeAndCategory(createSessionDto.type, createSessionDto.category);
        if (createSessionDto.category !== therapy_session_entity_1.SessionCategory.INDIVIDUAL) {
            if (!createSessionDto.maxParticipants) {
                throw new common_1.BadRequestException('Maximum participants must be specified for group sessions');
            }
            if (createSessionDto.participantIds?.length > createSessionDto.maxParticipants) {
                throw new common_1.BadRequestException('Number of participants exceeds maximum limit');
            }
        }
        const conflicts = await this.findSchedulingConflicts(createSessionDto.therapistId, createSessionDto.startTime, createSessionDto.endTime);
        if (conflicts.length > 0) {
            throw new common_1.BadRequestException('Scheduling conflict detected');
        }
        if (createSessionDto.participantIds?.length) {
            await Promise.all(createSessionDto.participantIds.map(async (participantId) => {
                try {
                    await this.authClient.validateUser(participantId);
                }
                catch (error) {
                    throw new common_1.BadRequestException(`Invalid participant ID: ${participantId}`);
                }
            }));
        }
        const session = this.sessionRepository.create({
            ...createSessionDto,
            status: therapy_session_entity_1.SessionStatus.SCHEDULED,
            currentParticipants: createSessionDto.participantIds?.length || 0,
        });
        if (createSessionDto.isRecurring && createSessionDto.recurringSchedule) {
            const sessions = await this.createRecurringSessions(session, createSessionDto.recurringSchedule);
            return sessions[0];
        }
        return this.sessionRepository.save(session);
    }
    validateSessionTypeAndCategory(type, category) {
        const validCombinations = {
            [therapy_session_entity_1.SessionCategory.INDIVIDUAL]: [therapy_session_entity_1.SessionType.VIDEO, therapy_session_entity_1.SessionType.AUDIO, therapy_session_entity_1.SessionType.CHAT],
            [therapy_session_entity_1.SessionCategory.GROUP]: [therapy_session_entity_1.SessionType.GROUP_VIDEO, therapy_session_entity_1.SessionType.GROUP_AUDIO, therapy_session_entity_1.SessionType.GROUP_CHAT],
            [therapy_session_entity_1.SessionCategory.WORKSHOP]: [therapy_session_entity_1.SessionType.GROUP_VIDEO, therapy_session_entity_1.SessionType.GROUP_AUDIO],
            [therapy_session_entity_1.SessionCategory.SUPPORT_GROUP]: [therapy_session_entity_1.SessionType.GROUP_VIDEO, therapy_session_entity_1.SessionType.GROUP_AUDIO, therapy_session_entity_1.SessionType.GROUP_CHAT],
            [therapy_session_entity_1.SessionCategory.COUPLES]: [therapy_session_entity_1.SessionType.VIDEO, therapy_session_entity_1.SessionType.AUDIO],
            [therapy_session_entity_1.SessionCategory.FAMILY]: [therapy_session_entity_1.SessionType.VIDEO, therapy_session_entity_1.SessionType.AUDIO],
        };
        if (!validCombinations[category].includes(type)) {
            throw new common_1.BadRequestException(`Invalid session type ${type} for category ${category}`);
        }
    }
    async addParticipants(sessionId, addParticipantsDto, user) {
        const session = await this.getSessionById(sessionId, user);
        if (user.id !== session.therapistId && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only the therapist or admin can add participants');
        }
        const newParticipantCount = (addParticipantsDto.userIds?.length || 0) + (addParticipantsDto.emails?.length || 0);
        if (session.maxParticipants && session.currentParticipants + newParticipantCount > session.maxParticipants) {
            throw new common_1.BadRequestException('Adding these participants would exceed the maximum limit');
        }
        if (addParticipantsDto.userIds?.length) {
            const users = await this.userRepository.findBy({ id: (0, typeorm_2.In)(addParticipantsDto.userIds) });
            session.participants = [...(session.participants || []), ...users];
            session.participantIds = [...(session.participantIds || []), ...addParticipantsDto.userIds];
        }
        if (addParticipantsDto.emails?.length) {
            session.invitedEmails = [...(session.invitedEmails || []), ...addParticipantsDto.emails];
        }
        session.currentParticipants = session.participantIds.length;
        return this.sessionRepository.save(session);
    }
    async removeParticipants(sessionId, removeParticipantsDto, user) {
        const session = await this.getSessionById(sessionId, user);
        if (user.id !== session.therapistId && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only the therapist or admin can remove participants');
        }
        session.participants = session.participants?.filter(p => !removeParticipantsDto.userIds.includes(p.id));
        session.participantIds = session.participantIds?.filter(id => !removeParticipantsDto.userIds.includes(id));
        session.currentParticipants = session.participantIds.length;
        if (removeParticipantsDto.sendNotifications) {
        }
        return this.sessionRepository.save(session);
    }
    async updateParticipantRole(sessionId, updateRoleDto, user) {
        const session = await this.getSessionById(sessionId, user);
        if (user.id !== session.therapistId && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only the therapist or admin can update participant roles');
        }
        const participantRoles = session.metadata?.participantRoles || {};
        participantRoles[updateRoleDto.userId] = updateRoleDto.role;
        session.metadata = { ...session.metadata, participantRoles };
        return this.sessionRepository.save(session);
    }
    async manageBreakoutRooms(sessionId, breakoutRoomsDto, user) {
        const session = await this.getSessionById(sessionId, user);
        if (user.id !== session.therapistId && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only the therapist or admin can manage breakout rooms');
        }
        if (![therapy_session_entity_1.SessionType.GROUP_VIDEO, therapy_session_entity_1.SessionType.GROUP_AUDIO].includes(session.type)) {
            throw new common_1.BadRequestException('Breakout rooms are only available for group video or audio sessions');
        }
        session.metadata = {
            ...session.metadata,
            breakoutRooms: breakoutRoomsDto.rooms,
            breakoutRoomDuration: breakoutRoomsDto.duration,
        };
        return this.sessionRepository.save(session);
    }
    async joinSession(sessionId, user) {
        const session = await this.getSessionById(sessionId, user);
        if (session.status !== therapy_session_entity_1.SessionStatus.SCHEDULED && session.status !== therapy_session_entity_1.SessionStatus.WAITING_ROOM) {
            throw new common_1.BadRequestException('Session is not available for joining');
        }
        if (session.participantIds?.includes(user.id)) {
            return session;
        }
        if (session.maxParticipants && session.currentParticipants >= session.maxParticipants) {
            throw new common_1.BadRequestException('Session has reached maximum participant limit');
        }
        session.participants = [...(session.participants || []), user];
        session.participantIds = [...(session.participantIds || []), user.id];
        session.currentParticipants = session.participantIds.length;
        const now = new Date();
        if ((0, date_fns_1.differenceInMinutes)(session.startTime, now) <= 15) {
            session.status = therapy_session_entity_1.SessionStatus.WAITING_ROOM;
        }
        return this.sessionRepository.save(session);
    }
    async leaveSession(sessionId, user) {
        const session = await this.getSessionById(sessionId, user);
        session.participants = session.participants?.filter(p => p.id !== user.id);
        session.participantIds = session.participantIds?.filter(id => id !== user.id);
        session.currentParticipants = session.participantIds.length;
        if (session.status === therapy_session_entity_1.SessionStatus.IN_PROGRESS && session.currentParticipants === 0) {
            session.status = therapy_session_entity_1.SessionStatus.COMPLETED;
        }
        return this.sessionRepository.save(session);
    }
    async createRecurringSessions(baseSession, schedule) {
        const sessions = [];
        let currentStart = new Date(baseSession.startTime);
        let currentEnd = new Date(baseSession.endTime);
        const duration = currentEnd.getTime() - currentStart.getTime();
        while ((0, date_fns_1.isBefore)(currentStart, schedule.endDate)) {
            const session = this.sessionRepository.create({
                ...baseSession,
                startTime: new Date(currentStart),
                endTime: new Date(currentEnd),
                status: therapy_session_entity_1.SessionStatus.SCHEDULED,
            });
            sessions.push(session);
            switch (schedule.frequency) {
                case 'weekly':
                    currentStart = (0, date_fns_1.addWeeks)(currentStart, 1);
                    break;
                case 'biweekly':
                    currentStart = (0, date_fns_1.addWeeks)(currentStart, 2);
                    break;
                case 'monthly':
                    currentStart = (0, date_fns_1.addMonths)(currentStart, 1);
                    break;
            }
            currentEnd = new Date(currentStart.getTime() + duration);
        }
        return this.sessionRepository.save(sessions);
    }
    async findSchedulingConflicts(therapistId, startTime, endTime) {
        return this.sessionRepository.find({
            where: {
                therapistId,
                status: therapy_session_entity_1.SessionStatus.SCHEDULED,
                startTime: (0, typeorm_2.LessThanOrEqual)(endTime),
                endTime: (0, typeorm_2.MoreThanOrEqual)(startTime),
            },
        });
    }
    async getSessionById(id, user) {
        const session = await this.sessionRepository.findOne({
            where: { id },
            relations: ['therapist', 'client', 'participants'],
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        if (user.id !== session.therapistId &&
            !session.participantIds?.includes(user.id) &&
            user.role !== 'admin') {
            throw new common_1.ForbiddenException('You do not have permission to view this session');
        }
        return session;
    }
    async getUpcomingSessions(user) {
        const now = new Date();
        return this.sessionRepository.find({
            where: [
                { therapistId: user.id, startTime: (0, typeorm_2.MoreThanOrEqual)(now) },
                { participantIds: user.id, startTime: (0, typeorm_2.MoreThanOrEqual)(now) },
            ],
            order: { startTime: 'ASC' },
            relations: ['therapist', 'client', 'participants'],
        });
    }
    async getSessionsByDateRange(startDate, endDate, user) {
        return this.sessionRepository.find({
            where: [
                {
                    therapistId: user.id,
                    startTime: (0, typeorm_2.Between)((0, date_fns_1.startOfDay)(startDate), (0, date_fns_1.endOfDay)(endDate)),
                },
                {
                    participantIds: user.id,
                    startTime: (0, typeorm_2.Between)((0, date_fns_1.startOfDay)(startDate), (0, date_fns_1.endOfDay)(endDate)),
                },
            ],
            order: { startTime: 'ASC' },
            relations: ['therapist', 'client', 'participants'],
        });
    }
    async updateSessionStatus(id, status, user) {
        await this.authClient.validateUser(user.id);
        const session = await this.getSessionById(id, user);
        this.validateStatusTransition(session.status, status);
        if (status === therapy_session_entity_1.SessionStatus.COMPLETED &&
            [therapy_session_entity_1.SessionCategory.GROUP, therapy_session_entity_1.SessionCategory.SUPPORT_GROUP].includes(session.category)) {
            await this.createChatRoomForCompletedSession(session, user);
        }
        session.status = status;
        return this.sessionRepository.save(session);
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [therapy_session_entity_1.SessionStatus.SCHEDULED]: [therapy_session_entity_1.SessionStatus.IN_PROGRESS, therapy_session_entity_1.SessionStatus.CANCELLED, therapy_session_entity_1.SessionStatus.NO_SHOW],
            [therapy_session_entity_1.SessionStatus.IN_PROGRESS]: [therapy_session_entity_1.SessionStatus.COMPLETED, therapy_session_entity_1.SessionStatus.CANCELLED],
            [therapy_session_entity_1.SessionStatus.COMPLETED]: [],
            [therapy_session_entity_1.SessionStatus.CANCELLED]: [],
            [therapy_session_entity_1.SessionStatus.NO_SHOW]: [therapy_session_entity_1.SessionStatus.SCHEDULED],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
    async updateSessionNotes(id, notes, user) {
        const session = await this.getSessionById(id, user);
        if (user.id === session.therapistId) {
            session.notes = { ...session.notes, therapistNotes: notes.therapistNotes };
        }
        else if (user.id === session.clientId) {
            session.notes = { ...session.notes, clientNotes: notes.clientNotes };
        }
        else if (user.role === 'admin') {
            session.notes = { ...session.notes, ...notes };
        }
        else {
            throw new common_1.ForbiddenException('You do not have permission to update session notes');
        }
        return this.sessionRepository.save(session);
    }
    async cancelSession(id, user, reason) {
        const session = await this.getSessionById(id, user);
        if ((0, date_fns_1.isBefore)(new Date(), session.startTime)) {
            session.status = therapy_session_entity_1.SessionStatus.CANCELLED;
            if (reason) {
                session.metadata = { ...session.metadata, cancellationReason: reason };
            }
            return this.sessionRepository.save(session);
        }
        throw new common_1.BadRequestException('Cannot cancel a session that has already started');
    }
    async createChatRoomForSession(sessionId, user) {
        await this.authClient.validateUser(user.id);
        const session = await this.getSessionById(sessionId, user);
        if (user.id !== session.therapistId && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only the session therapist or admin can create chat rooms');
        }
        await this.createChatRoomForCompletedSession(session, user);
    }
    async createChatRoomForCompletedSession(session, user) {
        try {
            if (!session.participantIds || session.participantIds.length <= 1) {
                throw new common_1.BadRequestException('Cannot create a chat room for a session with fewer than 2 participants');
            }
            const roomName = `${session.title} - Follow-up Group`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.chatServiceUrl}/api/chat/rooms`, {
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
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                }
            }));
            session.metadata = {
                ...session.metadata,
                chatRoomId: response.data?.id,
                chatRoomCreatedAt: new Date(),
            };
            await this.sessionRepository.save(session);
            console.log(`Created chat room for therapy session: ${session.id}`);
        }
        catch (error) {
            console.error(`Failed to create chat room for therapy session ${session.id}:`, error.message);
            throw new common_1.BadRequestException(`Failed to create chat room: ${error.message}`);
        }
    }
    async checkTherapistClientRelationship(therapistId, clientId) {
        try {
            const therapistInfo = await this.authClient.validateUser(therapistId);
            const clientInfo = await this.authClient.validateUser(clientId);
            const isTherapist = therapistInfo.roles?.some(role => ['therapist', 'admin'].includes(role.toLowerCase()));
            if (!isTherapist) {
                return false;
            }
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
            return sessions.length > 0;
        }
        catch (error) {
            console.error('Error checking therapist-client relationship:', error.message);
            return false;
        }
    }
    async getSessionsByUser(userId) {
        return await this.sessionRepository.find({
            where: [
                { clientId: userId },
                { therapistId: userId },
                { participantIds: userId }
            ],
            order: { sessionDate: 'DESC' },
            take: 50
        });
    }
    async getAvailableTherapists() {
        try {
            const response = await this.authClient.getUsers({ role: 'therapist' });
            return response.filter(user => user.status === 'active');
        }
        catch (error) {
            console.error('Error fetching therapists:', error);
            return [];
        }
    }
    async getAvailableSlots(therapistId, date) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfTargetDay = (0, date_fns_1.startOfDay)(targetDate);
        const endOfTargetDay = (0, date_fns_1.endOfDay)(targetDate);
        const existingSessions = await this.sessionRepository.find({
            where: {
                therapistId,
                sessionDate: (0, typeorm_2.Between)(startOfTargetDay, endOfTargetDay),
                status: (0, typeorm_2.In)([therapy_session_entity_1.SessionStatus.SCHEDULED, therapy_session_entity_1.SessionStatus.IN_PROGRESS])
            }
        });
        const availableSlots = [];
        for (let hour = 9; hour < 17; hour++) {
            const slotTime = new Date(startOfTargetDay);
            slotTime.setHours(hour, 0, 0, 0);
            const hasConflict = existingSessions.some(session => {
                const sessionStart = new Date(session.sessionDate);
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
    async updateSessionPayment(sessionId, paymentInfo) {
        const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        session.subscriptionId = paymentInfo.subscriptionId;
        session.paidFromSubscription = paymentInfo.paidFromSubscription;
        session.paidFromCredit = paymentInfo.paidFromCredit;
        return await this.sessionRepository.save(session);
    }
};
TeletherapyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(therapy_session_entity_1.TherapySession)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof auth_client_1.AuthClientService !== "undefined" && auth_client_1.AuthClientService) === "function" ? _a : Object, typeof (_b = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _b : Object, config_1.ConfigService])
], TeletherapyService);
exports.TeletherapyService = TeletherapyService;
//# sourceMappingURL=teletherapy.service.js.map
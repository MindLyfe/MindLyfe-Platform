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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapySessionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
const subscription_entity_1 = require("../entities/subscription.entity");
let TherapySessionService = class TherapySessionService {
    constructor(userRepository, sessionRepository, subscriptionRepository, dataSource) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.dataSource = dataSource;
    }
    async createSession(userId, createDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['subscriptions']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const canBook = await this.canUserBookSession(userId);
        if (!canBook.allowed) {
            throw new common_1.ForbiddenException(canBook.reason);
        }
        const therapist = await this.userRepository.findOne({
            where: { id: createDto.therapistId, role: 'therapist' }
        });
        if (!therapist) {
            throw new common_1.NotFoundException('Therapist not found');
        }
        const conflictingSession = await this.sessionRepository.findOne({
            where: [
                {
                    therapistId: createDto.therapistId,
                    scheduledAt: (0, typeorm_2.Between)(new Date(createDto.scheduledAt.getTime() - 60 * 60 * 1000), new Date(createDto.scheduledAt.getTime() + 60 * 60 * 1000)),
                    status: therapy_session_entity_1.SessionStatus.SCHEDULED
                },
                {
                    userId: userId,
                    scheduledAt: (0, typeorm_2.Between)(new Date(createDto.scheduledAt.getTime() - 60 * 60 * 1000), new Date(createDto.scheduledAt.getTime() + 60 * 60 * 1000)),
                    status: therapy_session_entity_1.SessionStatus.SCHEDULED
                }
            ]
        });
        if (conflictingSession) {
            throw new common_1.BadRequestException('Time slot is not available');
        }
        return await this.dataSource.transaction(async (manager) => {
            const session = manager.create(therapy_session_entity_1.TherapySession, {
                userId,
                therapistId: createDto.therapistId,
                status: therapy_session_entity_1.SessionStatus.SCHEDULED,
                type: createDto.type,
                scheduledAt: createDto.scheduledAt,
                durationMinutes: createDto.durationMinutes || 60,
                cost: 76000,
                notes: createDto.notes,
                meetingId: this.generateMeetingId()
            });
            return await manager.save(session);
        });
    }
    async getUserSessions(userId, limit = 20) {
        const [sessions, totalCount] = await this.sessionRepository.findAndCount({
            where: { userId },
            order: { scheduledAt: 'DESC' },
            take: limit,
            relations: ['therapist']
        });
        const upcomingSessions = await this.sessionRepository.count({
            where: {
                userId,
                status: therapy_session_entity_1.SessionStatus.SCHEDULED,
                scheduledAt: new Date()
            }
        });
        const completedSessions = await this.sessionRepository.count({
            where: { userId, status: therapy_session_entity_1.SessionStatus.COMPLETED }
        });
        return {
            sessions,
            totalCount,
            upcomingSessions,
            completedSessions
        };
    }
    async getTherapistSessions(therapistId, date) {
        const startDate = date || new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        return await this.sessionRepository.find({
            where: {
                therapistId,
                scheduledAt: (0, typeorm_2.Between)(startDate, endDate)
            },
            order: { scheduledAt: 'ASC' },
            relations: ['user']
        });
    }
    async updateSession(sessionId, userId, updateDto) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
            relations: ['user', 'therapist']
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own sessions');
        }
        if (updateDto.status) {
            this.validateStatusTransition(session.status, updateDto.status);
        }
        if (updateDto.status === therapy_session_entity_1.SessionStatus.CANCELLED) {
            if (!session.canCancel) {
                throw new common_1.BadRequestException('Session cannot be cancelled within 24 hours of scheduled time');
            }
        }
        return await this.dataSource.transaction(async (manager) => {
            Object.assign(session, updateDto);
            if (updateDto.status === therapy_session_entity_1.SessionStatus.COMPLETED) {
                session.endedAt = new Date();
            }
            return await manager.save(session);
        });
    }
    async cancelSession(sessionId, userId, reason) {
        return await this.updateSession(sessionId, userId, {
            status: therapy_session_entity_1.SessionStatus.CANCELLED,
            cancellationReason: reason
        });
    }
    async startSession(sessionId, therapistId) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, therapistId }
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.status !== therapy_session_entity_1.SessionStatus.SCHEDULED) {
            throw new common_1.BadRequestException('Session is not scheduled');
        }
        return await this.dataSource.transaction(async (manager) => {
            session.status = therapy_session_entity_1.SessionStatus.IN_PROGRESS;
            session.startedAt = new Date();
            session.meetingLink = this.generateMeetingLink(session.meetingId);
            return await manager.save(session);
        });
    }
    async completeSession(sessionId, therapistId, notes) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, therapistId }
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.status !== therapy_session_entity_1.SessionStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Session is not in progress');
        }
        return await this.dataSource.transaction(async (manager) => {
            session.status = therapy_session_entity_1.SessionStatus.COMPLETED;
            session.endedAt = new Date();
            if (notes) {
                session.notes = notes;
            }
            return await manager.save(session);
        });
    }
    async canUserBookSession(userId) {
        const activeSubscriptions = await this.subscriptionRepository.find({
            where: {
                userId,
                status: subscription_entity_1.SubscriptionStatus.ACTIVE
            }
        });
        const totalAvailableSessions = activeSubscriptions.reduce((total, sub) => total + sub.totalAvailableSessions, 0);
        if (totalAvailableSessions <= 0) {
            return {
                allowed: false,
                reason: 'No available sessions. Please purchase a subscription or credits.'
            };
        }
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentSession = await this.sessionRepository.findOne({
            where: {
                userId,
                status: therapy_session_entity_1.SessionStatus.COMPLETED,
                scheduledAt: (0, typeorm_2.Between)(oneWeekAgo, new Date())
            },
            order: { scheduledAt: 'DESC' }
        });
        if (recentSession) {
            const nextAvailableDate = new Date(recentSession.scheduledAt);
            nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);
            return {
                allowed: false,
                reason: `Weekly limit reached. Next session can be booked after ${nextAvailableDate.toDateString()}`
            };
        }
        return { allowed: true };
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [therapy_session_entity_1.SessionStatus.SCHEDULED]: [therapy_session_entity_1.SessionStatus.IN_PROGRESS, therapy_session_entity_1.SessionStatus.CANCELLED, therapy_session_entity_1.SessionStatus.NO_SHOW],
            [therapy_session_entity_1.SessionStatus.IN_PROGRESS]: [therapy_session_entity_1.SessionStatus.COMPLETED, therapy_session_entity_1.SessionStatus.CANCELLED],
            [therapy_session_entity_1.SessionStatus.COMPLETED]: [],
            [therapy_session_entity_1.SessionStatus.CANCELLED]: [],
            [therapy_session_entity_1.SessionStatus.NO_SHOW]: []
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot change status from ${currentStatus} to ${newStatus}`);
        }
    }
    generateMeetingId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    generateMeetingLink(meetingId) {
        return `https://meet.mindlyf.com/session/${meetingId}`;
    }
};
exports.TherapySessionService = TherapySessionService;
exports.TherapySessionService = TherapySessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(therapy_session_entity_1.TherapySession)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], TherapySessionService);
//# sourceMappingURL=session.service.js.map
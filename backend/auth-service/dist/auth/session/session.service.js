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
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const session_repository_1 = require("./session.repository");
const common_2 = require("@nestjs/common");
let SessionService = SessionService_1 = class SessionService {
    constructor(configService, sessionRepository) {
        this.configService = configService;
        this.sessionRepository = sessionRepository;
        this.logger = new common_2.Logger(SessionService_1.name);
    }
    toSessionData(session) {
        return {
            id: session.id,
            userId: session.userId,
            refreshToken: session.refreshToken,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            deviceInfo: session.deviceInfo,
            lastUsedAt: session.lastUsedAt || session.createdAt,
            isRevoked: session.isRevoked,
            revokedAt: session.revokedAt,
            revokedReason: session.revokedReason,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            expiresAt: session.expiresAt,
        };
    }
    async findSessionsByUserId(userId) {
        const sessions = await this.sessionRepository.findByUserId(userId);
        return sessions.map(session => this.toSessionData(session));
    }
    async findSessionById(id) {
        const session = await this.sessionRepository.findById(id);
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        return this.toSessionData(session);
    }
    async findSessionByToken(refreshToken) {
        const session = await this.sessionRepository.findByRefreshToken(refreshToken);
        return session ? this.toSessionData(session) : null;
    }
    async getUserActiveSessions(userId) {
        const sessions = await this.sessionRepository.findByUserId(userId);
        return sessions.map(session => this.toSessionData(session));
    }
    async createSession(userId, refreshToken, ipAddress, userAgent, deviceInfo) {
        const now = new Date();
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn', '7d');
        const expiresAt = new Date();
        const unit = refreshExpiresIn.slice(-1);
        const value = parseInt(refreshExpiresIn.slice(0, -1), 10);
        if (unit === 'd') {
            expiresAt.setDate(expiresAt.getDate() + value);
        }
        else if (unit === 'h') {
            expiresAt.setHours(expiresAt.getHours() + value);
        }
        else if (unit === 'm') {
            expiresAt.setMinutes(expiresAt.getMinutes() + value);
        }
        const sessionData = {
            id: (0, uuid_1.v4)(),
            userId,
            refreshToken,
            ipAddress,
            userAgent,
            deviceInfo,
            lastUsedAt: now,
            isRevoked: false,
            createdAt: now,
            updatedAt: now,
            expiresAt,
        };
        const savedSession = await this.sessionRepository.save(sessionData);
        return this.toSessionData(savedSession);
    }
    async updateSession(id, data) {
        const session = await this.sessionRepository.findById(id);
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        const updatedSession = await this.sessionRepository.save(Object.assign(Object.assign(Object.assign({}, session), data), { updatedAt: new Date() }));
        return this.toSessionData(updatedSession);
    }
    async updateSessionLastUsed(id) {
        return this.updateSession(id, { lastUsedAt: new Date() });
    }
    async revokeSession(id, reason) {
        const updatedSession = await this.sessionRepository.revokeSession(id, reason);
        return this.toSessionData(updatedSession);
    }
    async revokeAllUserSessions(userId, reason, exceptSessionId) {
        await this.sessionRepository.revokeAllUserSessions(userId, reason, exceptSessionId);
    }
    async cleanupExpiredSessions() {
        return this.sessionRepository.cleanupExpiredSessions();
    }
    async invalidateSession(sessionId) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
        });
        if (session) {
            session.status = 'INVALIDATED';
            session.endedAt = new Date();
            await this.sessionRepository.save(session);
            this.logger.debug(`Session invalidated: ${sessionId}`);
        }
    }
    async invalidateAllUserSessions(userId, excludeSessionId) {
        const allSessions = await this.sessionRepository.findByUserId(userId, true, false);
        const sessions = excludeSessionId ?
            allSessions.filter(session => session.id !== excludeSessionId && session.status === 'ACTIVE') :
            allSessions.filter(session => session.status === 'ACTIVE');
        for (const session of sessions) {
            session.status = 'INVALIDATED';
            session.endedAt = new Date();
        }
        if (sessions.length > 0) {
            await this.sessionRepository.save(sessions);
            this.logger.debug(`Invalidated ${sessions.length} sessions for user ${userId}`);
        }
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_repository_1.SessionRepository])
], SessionService);
//# sourceMappingURL=session.service.js.map
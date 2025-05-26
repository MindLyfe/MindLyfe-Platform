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
exports.SessionRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_session_entity_1 = require("../../entities/user-session.entity");
let SessionRepository = class SessionRepository {
    constructor(userSessionRepository) {
        this.userSessionRepository = userSessionRepository;
    }
    async find() {
        return this.userSessionRepository.find();
    }
    async findOne(options) {
        return this.userSessionRepository.findOne(options);
    }
    async findByUserId(userId, includeExpired = false, includeRevoked = false) {
        const where = { userId };
        if (!includeExpired) {
            where.expiresAt = (0, typeorm_2.MoreThan)(new Date());
        }
        if (!includeRevoked) {
            where.isRevoked = false;
        }
        return this.userSessionRepository.find({ where });
    }
    async findByRefreshToken(refreshToken) {
        return this.userSessionRepository.findOne({
            where: {
                refreshToken,
                isRevoked: false,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
    }
    async findById(id) {
        return this.userSessionRepository.findOne({
            where: { id },
        });
    }
    async save(sessionData) {
        if (Array.isArray(sessionData)) {
            return this.userSessionRepository.save(sessionData);
        }
        if (sessionData.id) {
            const existingSession = await this.findById(sessionData.id);
            if (existingSession) {
                return this.userSessionRepository.save(Object.assign(Object.assign(Object.assign({}, existingSession), sessionData), { updatedAt: new Date() }));
            }
        }
        return this.userSessionRepository.save(sessionData);
    }
    async remove(session) {
        return this.userSessionRepository.remove(session);
    }
    async revokeSession(id, reason) {
        const session = await this.findById(id);
        if (!session) {
            throw new Error(`Session with ID ${id} not found`);
        }
        const now = new Date();
        session.isRevoked = true;
        session.revokedAt = now;
        session.revokedReason = reason;
        session.updatedAt = now;
        return this.userSessionRepository.save(session);
    }
    async revokeAllUserSessions(userId, reason, exceptSessionId) {
        const sessions = await this.findByUserId(userId, false, false);
        const now = new Date();
        for (const session of sessions) {
            if (!exceptSessionId || session.id !== exceptSessionId) {
                session.isRevoked = true;
                session.revokedAt = now;
                session.revokedReason = reason;
                session.updatedAt = now;
                await this.userSessionRepository.save(session);
            }
        }
    }
    async deleteExpiredSessions() {
        const now = new Date();
        return this.userSessionRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(now),
        });
    }
    async deleteInactiveSessions(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.userSessionRepository.delete({
            lastUsedAt: (0, typeorm_2.LessThan)(cutoffDate),
            isRevoked: false,
            expiresAt: (0, typeorm_2.MoreThan)(new Date()),
        });
    }
    async cleanupExpiredSessions() {
        const result = await this.userSessionRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
        return result.affected || 0;
    }
};
exports.SessionRepository = SessionRepository;
exports.SessionRepository = SessionRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SessionRepository);
//# sourceMappingURL=session.repository.js.map
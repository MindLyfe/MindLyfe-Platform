"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSessionRepository = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let MockSessionRepository = class MockSessionRepository {
    constructor() {
        this.sessions = [];
    }
    async find() {
        return this.sessions;
    }
    async findOne(options) {
        const where = options.where;
        return this.sessions.find(session => {
            return Object.keys(where).every(key => session[key] === where[key]);
        }) || null;
    }
    async save(sessionData) {
        if (sessionData.id) {
            const index = this.sessions.findIndex(s => s.id === sessionData.id);
            if (index >= 0) {
                const updatedSession = Object.assign(Object.assign({}, this.sessions[index]), sessionData);
                this.sessions[index] = updatedSession;
                return Object.assign({}, updatedSession);
            }
        }
        return this.createSession(sessionData);
    }
    async remove(session) {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index >= 0) {
            const removedSession = this.sessions[index];
            this.sessions.splice(index, 1);
            return removedSession;
        }
        return null;
    }
    createSession(sessionData) {
        const id = sessionData.id || (0, uuid_1.v4)();
        const now = new Date();
        const newSession = {
            id,
            userId: sessionData.userId,
            refreshToken: sessionData.refreshToken,
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
            deviceInfo: sessionData.deviceInfo,
            lastUsedAt: sessionData.lastUsedAt || now,
            isRevoked: sessionData.isRevoked || false,
            revokedAt: sessionData.revokedAt,
            revokedReason: sessionData.revokedReason,
            createdAt: sessionData.createdAt || now,
            updatedAt: sessionData.updatedAt || now,
            expiresAt: sessionData.expiresAt,
            user: null,
        };
        this.sessions.push(newSession);
        return Object.assign({}, newSession);
    }
};
exports.MockSessionRepository = MockSessionRepository;
exports.MockSessionRepository = MockSessionRepository = __decorate([
    (0, common_1.Injectable)()
], MockSessionRepository);
//# sourceMappingURL=mock-session.repository.js.map
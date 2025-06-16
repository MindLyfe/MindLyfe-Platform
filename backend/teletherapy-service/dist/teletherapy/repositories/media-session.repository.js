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
exports.MediaSessionRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_session_entity_1 = require("../entities/media-session.entity");
let MediaSessionRepository = class MediaSessionRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const session = this.repository.create(data);
        return this.repository.save(session);
    }
    async save(entity) {
        return this.repository.save(entity);
    }
    async findOne(options) {
        return this.repository.findOne(options);
    }
    async findById(id) {
        return this.repository.findOne({
            where: { id },
            relations: ['participants'],
        });
    }
    async findByContext(type, contextId) {
        return this.repository.find({
            where: { type, contextId },
            relations: ['participants'],
            order: { startedAt: 'DESC' },
        });
    }
    async findActiveByContext(type, contextId) {
        return this.repository.findOne({
            where: {
                type,
                contextId,
                status: media_session_entity_1.MediaSessionStatus.ACTIVE,
            },
            relations: ['participants'],
        });
    }
    async findByParticipant(userId) {
        return this.repository
            .createQueryBuilder('session')
            .innerJoin('session.participants', 'participant')
            .where('participant.id = :userId', { userId })
            .andWhere('session.status = :status', { status: media_session_entity_1.MediaSessionStatus.ACTIVE })
            .getMany();
    }
    async addParticipant(sessionId, userId) {
        const session = await this.findById(sessionId);
        if (!session) {
            throw new Error(`Media session not found: ${sessionId}`);
        }
        const participantExists = session.participants.includes(userId);
        if (!participantExists) {
            session.participants = [...session.participants, userId];
            return this.repository.save(session);
        }
        return session;
    }
    async removeParticipant(sessionId, userId) {
        const session = await this.findById(sessionId);
        if (!session) {
            throw new Error(`Media session not found: ${sessionId}`);
        }
        session.participants = session.participants.filter(id => id !== userId);
        return this.repository.save(session);
    }
    async updateStatus(id, status) {
        const session = await this.findById(id);
        if (!session) {
            throw new Error(`Media session not found: ${id}`);
        }
        const updateData = { status };
        if (status === media_session_entity_1.MediaSessionStatus.ENDED) {
            updateData.endedAt = new Date();
        }
        await this.repository.update(id, updateData);
        return this.findById(id);
    }
    async updateMetadata(id, metadata) {
        const session = await this.findById(id);
        if (!session) {
            throw new Error(`Media session not found: ${id}`);
        }
        await this.repository.update(id, {
            metadata: { ...session.metadata, ...metadata },
        });
        return this.findById(id);
    }
    async findActiveSessions() {
        return this.repository.find({
            where: { status: media_session_entity_1.MediaSessionStatus.ACTIVE },
            relations: ['participants'],
        });
    }
    async findSessionsInDateRange(startDate, endDate) {
        return this.repository.find({
            where: {
                startedAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['participants'],
            order: { startedAt: 'DESC' },
        });
    }
};
MediaSessionRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_session_entity_1.MediaSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MediaSessionRepository);
exports.MediaSessionRepository = MediaSessionRepository;
//# sourceMappingURL=media-session.repository.js.map
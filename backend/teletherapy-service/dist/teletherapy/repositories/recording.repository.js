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
exports.RecordingRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const recording_entity_1 = require("../entities/recording.entity");
let RecordingRepository = class RecordingRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const recording = this.repository.create(data);
        return this.repository.save(recording);
    }
    async findById(id) {
        return this.repository.findOne({
            where: { id, isDeleted: false },
            relations: ['session', 'starter'],
        });
    }
    async findBySessionId(sessionId) {
        return this.repository.find({
            where: { sessionId, isDeleted: false },
            relations: ['starter'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByUserId(userId) {
        return this.repository.find({
            where: { startedBy: userId, isDeleted: false },
            relations: ['session'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByStatus(status) {
        return this.repository.find({
            where: { status, isDeleted: false },
            relations: ['session', 'starter'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByQuality(quality) {
        return this.repository.find({
            where: { quality, isDeleted: false },
            relations: ['session', 'starter'],
            order: { createdAt: 'DESC' },
        });
    }
    async findExpired() {
        return this.repository.find({
            where: {
                expiresAt: (0, typeorm_2.LessThan)(new Date()),
                isDeleted: false,
            },
            relations: ['session'],
        });
    }
    async findActive() {
        return this.repository.find({
            where: {
                status: recording_entity_1.RecordingStatus.RECORDING,
                isDeleted: false,
            },
            relations: ['session', 'starter'],
        });
    }
    async findInDateRange(startDate, endDate) {
        return this.repository.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
                isDeleted: false,
            },
            relations: ['session', 'starter'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return this.findById(id);
    }
    async updateStatus(id, status) {
        const recording = await this.findById(id);
        if (!recording) {
            throw new Error(`Recording not found: ${id}`);
        }
        const updateData = { status };
        switch (status) {
            case recording_entity_1.RecordingStatus.RECORDING:
                updateData.startedAt = new Date();
                break;
            case recording_entity_1.RecordingStatus.COMPLETED:
                updateData.endedAt = new Date();
                updateData.duration = recording.endedAt.getTime() - recording.startedAt.getTime();
                break;
            case recording_entity_1.RecordingStatus.PROCESSING:
                updateData.processedAt = new Date();
                break;
            case recording_entity_1.RecordingStatus.FAILED:
                updateData.endedAt = new Date();
                break;
        }
        return this.update(id, updateData);
    }
    async softDelete(id) {
        await this.repository.update(id, {
            isDeleted: true,
            deletedAt: new Date(),
        });
    }
    async hardDelete(id) {
        await this.repository.delete(id);
    }
    async getAnalytics(startDate, endDate) {
        const recordings = await this.findInDateRange(startDate, endDate);
        const analytics = {
            totalRecordings: recordings.length,
            totalDuration: 0,
            averageDuration: 0,
            qualityDistribution: {
                [recording_entity_1.RecordingQuality.HIGH]: 0,
                [recording_entity_1.RecordingQuality.MEDIUM]: 0,
                [recording_entity_1.RecordingQuality.LOW]: 0,
            },
            statusDistribution: {
                [recording_entity_1.RecordingStatus.PENDING]: 0,
                [recording_entity_1.RecordingStatus.RECORDING]: 0,
                [recording_entity_1.RecordingStatus.PROCESSING]: 0,
                [recording_entity_1.RecordingStatus.COMPLETED]: 0,
                [recording_entity_1.RecordingStatus.FAILED]: 0,
            },
            storageUsage: 0,
            errorRate: 0,
        };
        let totalDuration = 0;
        let errorCount = 0;
        recordings.forEach(recording => {
            if (recording.duration) {
                totalDuration += recording.duration;
            }
            analytics.qualityDistribution[recording.quality]++;
            analytics.statusDistribution[recording.status]++;
            if (recording.fileSize) {
                analytics.storageUsage += recording.fileSize;
            }
            if (recording.status === recording_entity_1.RecordingStatus.FAILED || recording.metadata?.error) {
                errorCount++;
            }
        });
        analytics.totalDuration = totalDuration;
        analytics.averageDuration = recordings.length > 0 ? totalDuration / recordings.length : 0;
        analytics.errorRate = recordings.length > 0 ? errorCount / recordings.length : 0;
        return analytics;
    }
    async getParticipantStats(recordingId) {
        const recording = await this.findById(recordingId);
        if (!recording || !recording.analytics?.participantStats) {
            throw new Error(`Recording not found or no participant stats available: ${recordingId}`);
        }
        const stats = recording.analytics.participantStats;
        const totalParticipants = stats.length;
        const analytics = {
            totalParticipants,
            averageDuration: 0,
            videoEnabledPercentage: 0,
            audioEnabledPercentage: 0,
            screenSharePercentage: 0,
        };
        if (totalParticipants > 0) {
            let totalDuration = 0;
            let videoEnabledCount = 0;
            let audioEnabledCount = 0;
            let screenShareCount = 0;
            stats.forEach(participant => {
                totalDuration += participant.duration;
                if (participant.videoEnabled)
                    videoEnabledCount++;
                if (participant.audioEnabled)
                    audioEnabledCount++;
                if (participant.screenShared)
                    screenShareCount++;
            });
            analytics.averageDuration = totalDuration / totalParticipants;
            analytics.videoEnabledPercentage = (videoEnabledCount / totalParticipants) * 100;
            analytics.audioEnabledPercentage = (audioEnabledCount / totalParticipants) * 100;
            analytics.screenSharePercentage = (screenShareCount / totalParticipants) * 100;
        }
        return analytics;
    }
};
RecordingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(recording_entity_1.Recording)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RecordingRepository);
exports.RecordingRepository = RecordingRepository;
//# sourceMappingURL=recording.repository.js.map
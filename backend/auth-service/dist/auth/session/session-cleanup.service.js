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
var SessionCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionCleanupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const session_repository_1 = require("./session.repository");
let SessionCleanupService = SessionCleanupService_1 = class SessionCleanupService {
    constructor(sessionRepository, configService) {
        this.sessionRepository = sessionRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(SessionCleanupService_1.name);
    }
    async handleSessionCleanup() {
        const cleanupInterval = this.configService.get('session.cleanupInterval', '0 0 * * *');
        this.logger.log('Starting expired session cleanup task');
        try {
            const maxInactiveDays = this.configService.get('session.maxInactiveDays', 30);
            const result = await this.sessionRepository.deleteExpiredSessions();
            const inactiveResult = await this.sessionRepository.deleteInactiveSessions(maxInactiveDays);
            this.logger.log(`Session cleanup completed: ${result.affected || 0} expired sessions and ` +
                `${inactiveResult.affected || 0} inactive sessions removed`);
        }
        catch (error) {
            this.logger.error(`Error cleaning up sessions: ${error.message}`, error.stack);
        }
    }
};
exports.SessionCleanupService = SessionCleanupService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionCleanupService.prototype, "handleSessionCleanup", null);
exports.SessionCleanupService = SessionCleanupService = SessionCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [session_repository_1.SessionRepository,
        config_1.ConfigService])
], SessionCleanupService);
//# sourceMappingURL=session-cleanup.service.js.map
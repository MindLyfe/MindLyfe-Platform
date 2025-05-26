import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SessionRepository } from './session.repository';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 0 * * *') // Run at midnight every day
  async handleSessionCleanup() {
    // Get cleanup interval from config
    const cleanupInterval = this.configService.get<string>('session.cleanupInterval', '0 0 * * *');
    this.logger.log('Starting expired session cleanup task');
    
    try {
      // Get max inactive days from config
      const maxInactiveDays = this.configService.get<number>('session.maxInactiveDays', 30);
      
      // Delete expired sessions and inactive sessions
      const result = await this.sessionRepository.deleteExpiredSessions();
      const inactiveResult = await this.sessionRepository.deleteInactiveSessions(maxInactiveDays);
      
      this.logger.log(
        `Session cleanup completed: ${result.affected || 0} expired sessions and ` +
        `${inactiveResult.affected || 0} inactive sessions removed`
      );
    } catch (error) {
      this.logger.error(`Error cleaning up sessions: ${error.message}`, error.stack);
    }
  }
}
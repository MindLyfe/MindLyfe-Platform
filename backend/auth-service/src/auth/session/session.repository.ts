import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, FindOptionsWhere } from 'typeorm';
import { UserSession } from '../../entities/user-session.entity';
import { SessionData } from './session.service';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {}

  async find(): Promise<UserSession[]> {
    return this.userSessionRepository.find();
  }

  async findOne(options: { where: FindOptionsWhere<UserSession> }): Promise<UserSession | null> {
    return this.userSessionRepository.findOne(options);
  }


  async findByUserId(userId: string, includeExpired = false, includeRevoked = false): Promise<UserSession[]> {
    const where: FindOptionsWhere<UserSession> = { userId };
    
    if (!includeExpired) {
      where.expiresAt = MoreThan(new Date());
    }
    
    if (!includeRevoked) {
      where.isRevoked = false;
    }
    
    return this.userSessionRepository.find({ where });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.userSessionRepository.findOne({
      where: {
        refreshToken,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async findById(id: string): Promise<UserSession | null> {
    return this.userSessionRepository.findOne({
      where: { id },
    });
  }

  async save(sessionData: Partial<UserSession> | UserSession | UserSession[]): Promise<UserSession | UserSession[]> {
    if (Array.isArray(sessionData)) {
      return this.userSessionRepository.save(sessionData);
    }
    
    if (sessionData.id) {
      const existingSession = await this.findById(sessionData.id);
      if (existingSession) {
        return this.userSessionRepository.save({
          ...existingSession,
          ...sessionData,
          updatedAt: new Date(),
        });
      }
    }
    
    return this.userSessionRepository.save(sessionData);
  }

  async remove(session: UserSession): Promise<UserSession> {
    return this.userSessionRepository.remove(session);
  }

  async revokeSession(id: string, reason: string): Promise<UserSession> {
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

  async revokeAllUserSessions(userId: string, reason: string, exceptSessionId?: string): Promise<void> {
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

  /**
   * Delete all sessions that have expired
   * @returns The result of the delete operation
   */
  async deleteExpiredSessions() {
    const now = new Date();
    return this.userSessionRepository.delete({
      expiresAt: LessThan(now),
    });
  }

  /**
   * Delete sessions that haven't been used for a specified number of days
   * @param days Number of days of inactivity before a session is considered inactive
   * @returns The result of the delete operation
   */
  async deleteInactiveSessions(days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.userSessionRepository.delete({
      lastUsedAt: LessThan(cutoffDate),
      isRevoked: false,
      expiresAt: MoreThan(new Date()), // Only delete non-expired sessions
    });
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.userSessionRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    
    return result.affected || 0;
  }
}
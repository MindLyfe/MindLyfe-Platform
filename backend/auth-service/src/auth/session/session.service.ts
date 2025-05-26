import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserSession } from '../../entities/user-session.entity';
import { v4 as uuidv4 } from 'uuid';
import { SessionRepository } from './session.repository';
import { Logger } from '@nestjs/common';
import { Not } from 'typeorm';

// Session data interface
export interface SessionData {
  id: string;
  userId: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  lastUsedAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private configService: ConfigService,
    private sessionRepository: SessionRepository,
  ) {}
  
  // Helper method to convert UserSession entity to SessionData interface
  private toSessionData(session: UserSession): SessionData {
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

  async findSessionsByUserId(userId: string): Promise<SessionData[]> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    return sessions.map(session => this.toSessionData(session));
  }

  async findSessionById(id: string): Promise<SessionData> {
    const session = await this.sessionRepository.findById(id);

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return this.toSessionData(session);
  }

  async findSessionByToken(refreshToken: string): Promise<SessionData | null> {
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);
    return session ? this.toSessionData(session) : null;
  }

  async getUserActiveSessions(userId: string): Promise<SessionData[]> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    return sessions.map(session => this.toSessionData(session));
  }

  async createSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: string,
  ): Promise<SessionData> {
    const now = new Date();
    
    // Calculate expiration date based on refresh token expiration setting
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
    const expiresAt = new Date();
    
    // Parse the expiration string (e.g., '7d', '30d', '24h')
    const unit = refreshExpiresIn.slice(-1);
    const value = parseInt(refreshExpiresIn.slice(0, -1), 10);
    
    if (unit === 'd') {
      expiresAt.setDate(expiresAt.getDate() + value);
    } else if (unit === 'h') {
      expiresAt.setHours(expiresAt.getHours() + value);
    } else if (unit === 'm') {
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
    }
    
    const sessionData: Partial<UserSession> = {
      id: uuidv4(),
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
    return this.toSessionData(savedSession as UserSession);
  }

  async updateSession(id: string, data: Partial<SessionData>): Promise<SessionData> {
    const session = await this.sessionRepository.findById(id);
    
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    const updatedSession = await this.sessionRepository.save({
      ...session,
      ...data,
      updatedAt: new Date(),
    });

    return this.toSessionData(updatedSession as UserSession);
  }

  async updateSessionLastUsed(id: string): Promise<SessionData> {
    return this.updateSession(id, { lastUsedAt: new Date() });
  }

  async revokeSession(id: string, reason: string): Promise<SessionData> {
    const updatedSession = await this.sessionRepository.revokeSession(id, reason);
    return this.toSessionData(updatedSession);
  }

  async revokeAllUserSessions(userId: string, reason: string, exceptSessionId?: string): Promise<void> {
    await this.sessionRepository.revokeAllUserSessions(userId, reason, exceptSessionId);
  }

  async cleanupExpiredSessions(): Promise<number> {
    return this.sessionRepository.cleanupExpiredSessions();
  }

  async invalidateSession(sessionId: string): Promise<void> {
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

  async invalidateAllUserSessions(userId: string, excludeSessionId?: string): Promise<void> {
    // Get all active sessions for the user
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
}
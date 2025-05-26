import { Injectable } from '@nestjs/common';
import { UserSession } from '../../entities/user-session.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockSessionRepository {
  private sessions: UserSession[] = [];

  async find(): Promise<UserSession[]> {
    return this.sessions;
  }

  async findOne(options: { where: Partial<UserSession> }): Promise<UserSession | null> {
    const where = options.where;
    return this.sessions.find(session => {
      return Object.keys(where).every(key => session[key] === where[key]);
    }) || null;
  }

  async save(sessionData: Partial<UserSession>): Promise<UserSession> {
    if (sessionData.id) {
      // Update existing session
      const index = this.sessions.findIndex(s => s.id === sessionData.id);
      if (index >= 0) {
        const updatedSession = { ...this.sessions[index], ...sessionData };
        this.sessions[index] = updatedSession;
        return { ...updatedSession };
      }
    }
    
    // Create new session
    return this.createSession(sessionData);
  }

  async remove(session: UserSession): Promise<UserSession> {
    const index = this.sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      const removedSession = this.sessions[index];
      this.sessions.splice(index, 1);
      return removedSession;
    }
    return null;
  }

  private createSession(sessionData: Partial<UserSession>): UserSession {
    const id = sessionData.id || uuidv4();
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
      user: null, // We don't need full user objects for this mock
    } as UserSession;
    
    this.sessions.push(newSession);
    return { ...newSession };
  }
} 
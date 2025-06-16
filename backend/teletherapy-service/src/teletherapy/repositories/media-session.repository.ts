import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MediaSession, MediaSessionType, MediaSessionStatus } from '../entities/media-session.entity';

@Injectable()
export class MediaSessionRepository {
  constructor(
    @InjectRepository(MediaSession)
    private readonly repository: Repository<MediaSession>,
  ) {}

  async create(data: Partial<MediaSession>): Promise<MediaSession> {
    const session = this.repository.create(data);
    return this.repository.save(session);
  }

  async save(entity: MediaSession): Promise<MediaSession> {
    return this.repository.save(entity);
  }

  async findOne(options: any): Promise<MediaSession | null> {
    return this.repository.findOne(options);
  }

  async findById(id: string): Promise<MediaSession> {
    return this.repository.findOne({
      where: { id },
      relations: ['participants'],
    });
  }

  async findByContext(type: MediaSessionType, contextId: string): Promise<MediaSession[]> {
    return this.repository.find({
      where: { type, contextId },
      relations: ['participants'],
      order: { startedAt: 'DESC' },
    });
  }

  async findActiveByContext(type: MediaSessionType, contextId: string): Promise<MediaSession> {
    return this.repository.findOne({
      where: {
        type,
        contextId,
        status: MediaSessionStatus.ACTIVE,
      },
      relations: ['participants'],
    });
  }

  async findByParticipant(userId: string): Promise<MediaSession[]> {
    return this.repository
      .createQueryBuilder('session')
      .innerJoin('session.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .andWhere('session.status = :status', { status: MediaSessionStatus.ACTIVE })
      .getMany();
  }

  async addParticipant(sessionId: string, userId: string): Promise<MediaSession> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Media session not found: ${sessionId}`);
    }

    // Add participant if not already present
    const participantExists = session.participants.includes(userId);
    if (!participantExists) {
      session.participants = [...session.participants, userId];
      return this.repository.save(session);
    }

    return session;
  }

  async removeParticipant(sessionId: string, userId: string): Promise<MediaSession> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Media session not found: ${sessionId}`);
    }

    session.participants = session.participants.filter(id => id !== userId);
    return this.repository.save(session);
  }

  async updateStatus(id: string, status: MediaSessionStatus): Promise<MediaSession> {
    const session = await this.findById(id);
    if (!session) {
      throw new Error(`Media session not found: ${id}`);
    }

    const updateData: Partial<MediaSession> = { status };
    if (status === MediaSessionStatus.ENDED) {
      updateData.endedAt = new Date();
    }

    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateMetadata(id: string, metadata: Record<string, any>): Promise<MediaSession> {
    const session = await this.findById(id);
    if (!session) {
      throw new Error(`Media session not found: ${id}`);
    }

    await this.repository.update(id, {
      metadata: { ...session.metadata, ...metadata },
    });
    return this.findById(id);
  }

  async findActiveSessions(): Promise<MediaSession[]> {
    return this.repository.find({
      where: { status: MediaSessionStatus.ACTIVE },
      relations: ['participants'],
    });
  }

  async findSessionsInDateRange(startDate: Date, endDate: Date): Promise<MediaSession[]> {
    return this.repository.find({
      where: {
        startedAt: Between(startDate, endDate),
      },
      relations: ['participants'],
      order: { startedAt: 'DESC' },
    });
  }
} 
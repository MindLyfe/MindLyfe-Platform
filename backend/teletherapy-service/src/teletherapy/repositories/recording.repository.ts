import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Recording, RecordingStatus, RecordingQuality } from '../entities/recording.entity';

@Injectable()
export class RecordingRepository {
  constructor(
    @InjectRepository(Recording)
    private readonly repository: Repository<Recording>,
  ) {}

  async create(data: Partial<Recording>): Promise<Recording> {
    const recording = this.repository.create(data);
    return this.repository.save(recording);
  }

  async findById(id: string): Promise<Recording> {
    return this.repository.findOne({
      where: { id, isDeleted: false },
      relations: ['session', 'starter'],
    });
  }

  async findBySessionId(sessionId: string): Promise<Recording[]> {
    return this.repository.find({
      where: { sessionId, isDeleted: false },
      relations: ['starter'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Recording[]> {
    return this.repository.find({
      where: { startedBy: userId, isDeleted: false },
      relations: ['session'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: RecordingStatus): Promise<Recording[]> {
    return this.repository.find({
      where: { status, isDeleted: false },
      relations: ['session', 'starter'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByQuality(quality: RecordingQuality): Promise<Recording[]> {
    return this.repository.find({
      where: { quality, isDeleted: false },
      relations: ['session', 'starter'],
      order: { createdAt: 'DESC' },
    });
  }

  async findExpired(): Promise<Recording[]> {
    return this.repository.find({
      where: {
        expiresAt: LessThan(new Date()),
        isDeleted: false,
      },
      relations: ['session'],
    });
  }

  async findActive(): Promise<Recording[]> {
    return this.repository.find({
      where: {
        status: RecordingStatus.RECORDING,
        isDeleted: false,
      },
      relations: ['session', 'starter'],
    });
  }

  async findInDateRange(startDate: Date, endDate: Date): Promise<Recording[]> {
    return this.repository.find({
      where: {
        createdAt: Between(startDate, endDate),
        isDeleted: false,
      },
      relations: ['session', 'starter'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<Recording>): Promise<Recording> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateStatus(id: string, status: RecordingStatus): Promise<Recording> {
    const recording = await this.findById(id);
    if (!recording) {
      throw new Error(`Recording not found: ${id}`);
    }

    const updateData: Partial<Recording> = { status };
    
    // Update timestamps based on status
    switch (status) {
      case RecordingStatus.RECORDING:
        updateData.startedAt = new Date();
        break;
      case RecordingStatus.COMPLETED:
        updateData.endedAt = new Date();
        updateData.duration = recording.endedAt.getTime() - recording.startedAt.getTime();
        break;
      case RecordingStatus.PROCESSING:
        updateData.processedAt = new Date();
        break;
      case RecordingStatus.FAILED:
        updateData.endedAt = new Date();
        break;
    }

    return this.update(id, updateData);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<{
    totalRecordings: number;
    totalDuration: number;
    averageDuration: number;
    qualityDistribution: Record<RecordingQuality, number>;
    statusDistribution: Record<RecordingStatus, number>;
    storageUsage: number;
    errorRate: number;
  }> {
    const recordings = await this.findInDateRange(startDate, endDate);
    
    const analytics = {
      totalRecordings: recordings.length,
      totalDuration: 0,
      averageDuration: 0,
      qualityDistribution: {
        [RecordingQuality.HIGH]: 0,
        [RecordingQuality.MEDIUM]: 0,
        [RecordingQuality.LOW]: 0,
      },
      statusDistribution: {
        [RecordingStatus.PENDING]: 0,
        [RecordingStatus.RECORDING]: 0,
        [RecordingStatus.PROCESSING]: 0,
        [RecordingStatus.COMPLETED]: 0,
        [RecordingStatus.FAILED]: 0,
      },
      storageUsage: 0,
      errorRate: 0,
    };

    let totalDuration = 0;
    let errorCount = 0;

    recordings.forEach(recording => {
      // Calculate duration
      if (recording.duration) {
        totalDuration += recording.duration;
      }

      // Update quality distribution
      analytics.qualityDistribution[recording.quality]++;

      // Update status distribution
      analytics.statusDistribution[recording.status]++;

      // Update storage usage
      if (recording.fileSize) {
        analytics.storageUsage += recording.fileSize;
      }

      // Update error count
      if (recording.status === RecordingStatus.FAILED || recording.metadata?.error) {
        errorCount++;
      }
    });

    analytics.totalDuration = totalDuration;
    analytics.averageDuration = recordings.length > 0 ? totalDuration / recordings.length : 0;
    analytics.errorRate = recordings.length > 0 ? errorCount / recordings.length : 0;

    return analytics;
  }

  async getParticipantStats(recordingId: string): Promise<{
    totalParticipants: number;
    averageDuration: number;
    videoEnabledPercentage: number;
    audioEnabledPercentage: number;
    screenSharePercentage: number;
  }> {
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
        if (participant.videoEnabled) videoEnabledCount++;
        if (participant.audioEnabled) audioEnabledCount++;
        if (participant.screenShared) screenShareCount++;
      });

      analytics.averageDuration = totalDuration / totalParticipants;
      analytics.videoEnabledPercentage = (videoEnabledCount / totalParticipants) * 100;
      analytics.audioEnabledPercentage = (audioEnabledCount / totalParticipants) * 100;
      analytics.screenSharePercentage = (screenShareCount / totalParticipants) * 100;
    }

    return analytics;
  }
} 
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TherapySession } from './therapy-session.entity';
// User entity is managed by auth-service

export enum RecordingStatus {
  PENDING = 'pending',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RecordingQuality {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum RecordingFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
}

export enum RecordingResolution {
  P1080 = '1080p',
  P720 = '720p',
  P480 = '480p',
}

@Entity('recordings')
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @ManyToOne(() => TherapySession)
  @JoinColumn({ name: 'sessionId' })
  session: TherapySession;

  @Column()
  startedBy: string;

  // User relation replaced with user ID from auth service

  @Column({
    type: 'enum',
    enum: RecordingStatus,
    default: RecordingStatus.PENDING,
  })
  status: RecordingStatus;

  @Column({
    type: 'enum',
    enum: RecordingQuality,
    default: RecordingQuality.MEDIUM,
  })
  quality: RecordingQuality;

  @Column({
    type: 'enum',
    enum: RecordingFormat,
    default: RecordingFormat.MP4,
  })
  format: RecordingFormat;

  @Column({
    type: 'enum',
    enum: RecordingResolution,
    default: RecordingResolution.P720,
  })
  resolution: RecordingResolution;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'int', nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  storageUrl: string;

  @Column({ nullable: true })
  storageKey: string;

  @Column({ type: 'jsonb', nullable: true })
  streams: {
    video?: { url: string; type: 'screen' | 'camera' }[];
    audio?: { url: string; type: 'mic' | 'system' }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    videoBitrate?: number;
    audioBitrate?: number;
    fps?: number;
    audioChannels?: number;
    audioSampleRate?: number;
    error?: string;
    processingTime?: number;
    uploadTime?: Date;
    encryptionKey?: string;
    encryptionIv?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  analytics: {
    networkStats?: {
      averageBitrate: number;
      packetLoss: number;
      jitter: number;
      latency: number;
    };
    qualityMetrics?: {
      videoQuality: number;
      audioQuality: number;
      frameDrops: number;
      audioDrops: number;
    };
    participantStats?: {
      userId: string;
      joinTime: Date;
      leaveTime?: Date;
      duration: number;
      videoEnabled: boolean;
      audioEnabled: boolean;
      screenShared: boolean;
    }[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  uploadedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
} 
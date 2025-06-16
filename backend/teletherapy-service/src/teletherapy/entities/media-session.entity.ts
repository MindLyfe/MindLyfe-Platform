import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// User entity is managed by auth-service

export enum MediaSessionType {
  TELETHERAPY = 'teletherapy',
  CHAT = 'chat',
}

export enum MediaSessionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ENDED = 'ended',
}

@Entity('media_sessions')
export class MediaSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MediaSessionType })
  type: MediaSessionType;

  // contextId: teletherapy session ID or chat room ID
  @Column()
  contextId: string;

  @Column({ type: 'simple-array', default: [] })
  participants: string[]; // User IDs from auth service

  @Column({ type: 'enum', enum: MediaSessionStatus, default: MediaSessionStatus.PENDING })
  status: MediaSessionStatus;

  @Column()
  startedBy: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
} 
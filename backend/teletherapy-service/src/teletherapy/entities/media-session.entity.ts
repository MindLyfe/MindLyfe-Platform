import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

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

  @ManyToMany(() => User)
  @JoinTable({ name: 'media_session_participants' })
  participants: User[];

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
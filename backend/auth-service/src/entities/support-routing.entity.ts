import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { SupportShift } from './support-shift.entity';

export enum RoutingStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled',
}

export enum RequestType {
  GENERAL_INQUIRY = 'general_inquiry',
  TECHNICAL_SUPPORT = 'technical_support',
  BILLING_INQUIRY = 'billing_inquiry',
  THERAPIST_SUPPORT = 'therapist_support',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity()
export class SupportRouting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  requesterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column('uuid', { nullable: true })
  assignedSupportUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedSupportUserId' })
  assignedSupportUser?: User;

  @Column('uuid', { nullable: true })
  shiftId?: string;

  @ManyToOne(() => SupportShift, { nullable: true })
  @JoinColumn({ name: 'shiftId' })
  shift?: SupportShift;

  @Column({ type: 'enum', enum: RequestType })
  requestType: RequestType;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({ type: 'enum', enum: RoutingStatus, default: RoutingStatus.PENDING })
  status: RoutingStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt?: Date;

  @Column({ type: 'text', nullable: true })
  escalationReason?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculate response time in minutes
  getResponseTime(): number | null {
    if (!this.assignedAt) return null;
    return Math.floor((this.assignedAt.getTime() - this.createdAt.getTime()) / (1000 * 60));
  }

  // Calculate resolution time in minutes
  getResolutionTime(): number | null {
    if (!this.resolvedAt) return null;
    return Math.floor((this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60));
  }

  // Check if request is overdue based on priority
  isOverdue(): boolean {
    const now = new Date();
    const createdTime = this.createdAt.getTime();
    const elapsedMinutes = (now.getTime() - createdTime) / (1000 * 60);

    switch (this.priority) {
      case Priority.URGENT:
        return elapsedMinutes > 15; // 15 minutes
      case Priority.HIGH:
        return elapsedMinutes > 60; // 1 hour
      case Priority.MEDIUM:
        return elapsedMinutes > 240; // 4 hours
      case Priority.LOW:
        return elapsedMinutes > 1440; // 24 hours
      default:
        return false;
    }
  }
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum SessionType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
  EMERGENCY = 'emergency',
}

@Entity()
export class TherapySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.therapySessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  therapistId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'therapistId' })
  therapist: User;

  @Column({ nullable: true })
  subscriptionId?: string;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscriptionId' })
  subscription?: Subscription;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status: SessionStatus;

  @Column({ type: 'enum', enum: SessionType, default: SessionType.INDIVIDUAL })
  type: SessionType;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 76000 })
  cost: number;

  @Column({ default: false })
  paidFromCredit: boolean;

  @Column({ default: false })
  paidFromSubscription: boolean;

  @Column({ nullable: true })
  paymentReference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  meetingLink?: string;

  @Column({ nullable: true })
  meetingId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get isCompleted(): boolean {
    return this.status === SessionStatus.COMPLETED;
  }

  get canCancel(): boolean {
    if (this.status === SessionStatus.COMPLETED || this.status === SessionStatus.CANCELLED) {
      return false;
    }
    
    // Can cancel up to 24 hours before scheduled time
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);
    
    return this.scheduledAt > twentyFourHoursFromNow;
  }

  get actualDuration(): number | null {
    if (!this.startedAt || !this.endedAt) return null;
    return Math.round((this.endedAt.getTime() - this.startedAt.getTime()) / (1000 * 60));
  }
} 
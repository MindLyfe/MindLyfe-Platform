import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum SubscriptionType {
  MONTHLY = 'monthly',
  ORGANIZATION = 'organization',
  CREDIT = 'credit',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: SubscriptionType })
  type: SubscriptionType;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'int', default: 0 })
  sessionsIncluded: number;

  @Column({ type: 'int', default: 0 })
  sessionsUsed: number;

  @Column({ type: 'int', default: 0 })
  creditsAvailable: number;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'date', nullable: true })
  lastSessionDate?: Date;

  @Column({ default: true })
  autoRenew: boolean;

  @Column({ nullable: true })
  paymentReference?: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get remainingSessions(): number {
    return Math.max(0, this.sessionsIncluded - this.sessionsUsed);
  }

  get totalAvailableSessions(): number {
    return this.remainingSessions + this.creditsAvailable;
  }

  get isExpired(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }

  get canBookSession(): boolean {
    if (this.status !== SubscriptionStatus.ACTIVE) return false;
    if (this.isExpired) return false;
    
    // Check if user has available sessions or credits
    if (this.totalAvailableSessions <= 0) return false;
    
    // Check weekly limit - user can only book one session per week
    if (this.lastSessionDate) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (this.lastSessionDate > oneWeekAgo) return false;
    }
    
    return true;
  }
} 
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { StreakDefinition } from './streak-definition.entity';
import { StreakMilestone } from './streak-milestone.entity';

@Entity('user_streaks')
@Index(['userId', 'streakType'], { unique: true })
export class UserStreak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  streakType: string;

  @Column({ type: 'int', default: 0 })
  currentCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextActivityDeadline: Date;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'int', default: 0 })
  totalActivities: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastResetDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StreakDefinition, { eager: true })
  @JoinColumn({ name: 'streakType', referencedColumnName: 'type' })
  definition: StreakDefinition;

  @OneToMany(() => StreakMilestone, milestone => milestone.userStreak, { cascade: true })
  milestones: StreakMilestone[];
} 
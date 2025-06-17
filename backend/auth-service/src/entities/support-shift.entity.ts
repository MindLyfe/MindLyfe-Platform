import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum ShiftType {
  MORNING = 'morning', // 8am-1pm
  AFTERNOON = 'afternoon', // 1pm-6pm
  EVENING = 'evening', // 6pm-11pm
  NIGHT = 'night', // 11pm-8am
}

export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

@Entity()
export class SupportShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ShiftType })
  shiftType: ShiftType;

  @Column({ type: 'date' })
  shiftDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.SCHEDULED })
  status: ShiftStatus;

  @Column('uuid')
  assignedUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @Column({ type: 'boolean', default: false })
  smsNotificationSent: boolean;

  @Column({ type: 'boolean', default: false })
  emailNotificationSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  smsNotificationSentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailNotificationSentAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods to get shift times
  static getShiftTimes(shiftType: ShiftType): { start: string; end: string } {
    switch (shiftType) {
      case ShiftType.MORNING:
        return { start: '08:00', end: '13:00' };
      case ShiftType.AFTERNOON:
        return { start: '13:00', end: '18:00' };
      case ShiftType.EVENING:
        return { start: '18:00', end: '23:00' };
      case ShiftType.NIGHT:
        return { start: '23:00', end: '08:00' };
      default:
        throw new Error('Invalid shift type');
    }
  }

  // Get next shift type for auto-routing
  static getNextShift(currentShift: ShiftType): ShiftType {
    switch (currentShift) {
      case ShiftType.MORNING:
        return ShiftType.AFTERNOON;
      case ShiftType.AFTERNOON:
        return ShiftType.EVENING;
      case ShiftType.EVENING:
        return ShiftType.NIGHT;
      case ShiftType.NIGHT:
        return ShiftType.MORNING;
      default:
        throw new Error('Invalid shift type');
    }
  }

  // Check if shift is currently active
  isCurrentlyActive(): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if it's the same date
    if (this.shiftDate.toISOString().split('T')[0] !== today) {
      return false;
    }

    // Handle night shift that crosses midnight
    if (this.shiftType === ShiftType.NIGHT) {
      return currentTime >= this.startTime || currentTime < this.endTime;
    }

    return currentTime >= this.startTime && currentTime < this.endTime;
  }
}
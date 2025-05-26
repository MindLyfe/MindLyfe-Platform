import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';
import { NotificationType } from './notification.entity';

export interface TimeWindow {
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface ChannelPreference {
  enabled: boolean;
  timeWindows?: TimeWindow[];
  contentTypes?: NotificationType[];
  frequency?: 'immediate' | 'daily' | 'weekly';
  consentGiven?: boolean;
  consentTimestamp?: Date;
}

@Entity('notification_preferences')
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'jsonb', default: {} })
  channels: {
    email?: ChannelPreference;
    sms?: ChannelPreference;
    push?: ChannelPreference;
    in_app?: ChannelPreference;
  };

  @Column({ type: 'jsonb', default: {} })
  typePreferences: {
    [key in NotificationType]?: {
      enabled: boolean;
      preferredChannels?: string[];
    };
  };
  
  @Column({ type: 'jsonb', default: {} })
  frequency: {
    daily: number; // Max notifications per day
    weekly: number; // Max notifications per week
    byType?: {
      [key in NotificationType]?: {
        daily: number;
        weekly: number;
      };
    };
  };
  
  @Column({ type: 'jsonb', default: {} })
  doNotDisturb: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
  };

  @Column({ type: 'jsonb', default: {} })
  gamification: {
    streaks: boolean;
    achievements: boolean;
    challenges: boolean;
    milestones: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  lastActivity: Date;

  @Column({ default: true })
  receiveTransactional: boolean;

  @Column({ default: true })
  receiveMarketing: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
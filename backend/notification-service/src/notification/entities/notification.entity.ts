import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { NotificationTemplateEntity } from './notification-template.entity';
import { NotificationChannelEntity } from './notification-channel.entity';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum NotificationType {
  ACCOUNT = 'account',
  SYSTEM = 'system',
  THERAPY = 'therapy',
  COMMUNITY = 'community',
  CHAT = 'chat',
  MARKETING = 'marketing',
  PAYMENT = 'payment',
  SUBSCRIPTION = 'subscription',
}

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  type: NotificationType;
  
  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ nullable: true })
  errorMessage: string;

  @ManyToOne(() => NotificationTemplateEntity, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: NotificationTemplateEntity;

  @Column({ nullable: true })
  templateId: string;

  @ManyToOne(() => NotificationChannelEntity, { nullable: true })
  @JoinColumn({ name: 'channelId' })
  channel: NotificationChannelEntity;

  @Column({ nullable: true })
  channelId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  sentAt: Date;
} 
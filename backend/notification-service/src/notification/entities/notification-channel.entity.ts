import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { NotificationEntity } from './notification.entity';

export enum ChannelType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
}

@Entity('notification_channels')
export class NotificationChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ChannelType })
  type: ChannelType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  config: Record<string, any>;

  @OneToMany(() => NotificationEntity, notification => notification.channel)
  notifications: NotificationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
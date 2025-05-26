import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn, Index } from 'typeorm';
import { ChatMessage } from './chat-message.entity';

export enum RoomType {
  DIRECT = 'direct',
  GROUP = 'group',
  SUPPORT = 'support',
  THERAPY = 'therapy'
}

export enum RoomStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  HIDDEN = 'hidden',
  MODERATED = 'moderated'
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ENCRYPTED = 'encrypted'
}

@Entity('chat_rooms')
@Index(['status', 'type'])
@Index(['participants'])
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '[]' })
  participants: string[];

  @Column({ 
    type: 'enum', 
    enum: RoomStatus, 
    default: RoomStatus.ACTIVE 
  })
  status: RoomStatus;

  @Column({ 
    type: 'enum', 
    enum: RoomType, 
    default: RoomType.DIRECT 
  })
  type: RoomType;

  @Column({ 
    type: 'enum', 
    enum: PrivacyLevel, 
    default: PrivacyLevel.PRIVATE 
  })
  privacyLevel: PrivacyLevel;

  @Column({ default: false })
  isModerated: boolean;

  @Column({ nullable: true })
  moderatedBy: string;

  @Column({ nullable: true })
  moderatedAt: Date;

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  lastMessageId: string;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @Column({ nullable: true })
  lastMessagePreview: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @OneToMany(() => ChatMessage, message => message.room)
  messages: ChatMessage[];
}
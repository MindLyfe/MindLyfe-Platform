import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn, Index } from 'typeorm';
import { ChatRoom } from './chat-room.entity';

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other'
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

@Entity('chat_messages')
@Index(['roomId', 'createdAt'])
@Index(['senderId', 'roomId', 'createdAt'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  senderId: string;

  @Column({ type: 'uuid' })
  @Index()
  roomId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  attachments: Attachment[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  reactions: { userId: string; type: string; timestamp: Date }[];

  @Column({ nullable: true })
  replyToMessageId: string;

  @Column({ default: false })
  isModerated: boolean;

  @Column({ nullable: true })
  moderatedBy: string;

  @Column({ nullable: true })
  moderatedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => ChatRoom, room => room.messages)
  @JoinColumn({ name: 'roomId' })
  room: ChatRoom;
}
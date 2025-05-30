import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum FollowStatus {
  ACTIVE = 'active',
  MUTED = 'muted',
  BLOCKED = 'blocked',
}

@Entity('follows')
@Unique(['followerId', 'followingId']) // Prevent duplicate follows
@Index(['followerId', 'status'])
@Index(['followingId', 'status'])
export class Follow extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  followerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column({ type: 'uuid' })
  @Index()
  followingId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;

  @Column({
    type: 'enum',
    enum: FollowStatus,
    default: FollowStatus.ACTIVE,
  })
  status: FollowStatus;

  @Column({ type: 'boolean', default: false })
  isMutualFollow: boolean; // Computed field for quick lookup

  @Column({ type: 'timestamp with time zone', nullable: true })
  mutualFollowEstablishedAt: Date;

  @Column({ type: 'boolean', default: false })
  chatAccessGranted: boolean; // Whether chat access has been granted

  @Column({ type: 'timestamp with time zone', nullable: true })
  chatAccessGrantedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  privacySettings: {
    allowChatInvitation: boolean;
    notifyOnFollow: boolean;
    notifyOnMutualFollow: boolean;
    allowRealNameInChat: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    followSource?: string; // How they found each other (post, comment, etc.)
    sourceContentId?: string; // ID of the content that led to follow
    mutualInterests?: string[]; // Common interests/tags
  };
} 
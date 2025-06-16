import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';

export enum PostVisibility {
  PUBLIC = 'public',
  ANONYMOUS = 'anonymous',
  THERAPISTS_ONLY = 'therapists_only',
  PRIVATE = 'private',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  REPORTED = 'reported',
  UNDER_REVIEW = 'under_review',
  REMOVED = 'removed',
}

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status: PostStatus;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pseudonym: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 100, default: 'general' })
  category: string;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'integer', default: 0 })
  reportCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastModeratedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  lastModeratedBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reactions: Reaction[];

  @Column({ type: 'jsonb', nullable: true })
  moderationNotes: {
    reportedBy: string[];
    reviewNotes: string[];
    actionTaken: string;
    actionTakenBy: string;
    actionTakenAt: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  privacySettings: {
    allowComments: boolean;
    allowReactions: boolean;
    allowSharing: boolean;
    notifyOnComment: boolean;
    notifyOnReaction: boolean;
    notifyOnReport: boolean;
  };
} 
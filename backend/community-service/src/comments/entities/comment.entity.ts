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
import { Post } from '../../posts/entities/post.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';

export enum CommentStatus {
  ACTIVE = 'active',
  REPORTED = 'reported',
  UNDER_REVIEW = 'under_review',
  REMOVED = 'removed',
}

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'uuid' })
  @Index()
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentId: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.ACTIVE,
  })
  status: CommentStatus;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pseudonym: string;

  @Column({ type: 'integer', default: 0 })
  reportCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastModeratedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  lastModeratedBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  @OneToMany(() => Reaction, (reaction) => reaction.comment)
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
    allowReplies: boolean;
    allowReactions: boolean;
    notifyOnReply: boolean;
    notifyOnReaction: boolean;
    notifyOnReport: boolean;
  };
} 
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
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum ReactionType {
  LIKE = 'like',
  SUPPORT = 'support',
  HELPFUL = 'helpful',
  INSIGHTFUL = 'insightful',
  REPORT = 'report',
}

@Entity('reactions')
@Unique(['userId', 'postId', 'type'])
@Unique(['userId', 'commentId', 'type'])
export class Reaction extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  commentId: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  type: ReactionType;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pseudonym: string;

  @Column({ type: 'text', nullable: true })
  reportReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    deviceInfo?: string;
    location?: string;
    context?: string;
  };
} 
import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';

export enum UserRole {
  USER = 'user',
  THERAPIST = 'therapist',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  @Index()
  authId: string;

  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pseudonym: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  isVerifiedTherapist: boolean;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', array: true, default: [] })
  specialties: string[];

  @Column({ type: 'text', array: true, default: [] })
  certifications: string[];

  @Column({ type: 'integer', default: 0 })
  postCount: number;

  @Column({ type: 'integer', default: 0 })
  commentCount: number;

  @Column({ type: 'integer', default: 0 })
  reportCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastActiveAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  privacySettings: {
    isAnonymousByDefault: boolean;
    showActivityStatus: boolean;
    showPostHistory: boolean;
    showCommentHistory: boolean;
    showReactionHistory: boolean;
    allowDirectMessages: boolean;
    allowMentions: boolean;
    allowTags: boolean;
    notifyOnMention: boolean;
    notifyOnReply: boolean;
    notifyOnReaction: boolean;
    notifyOnReport: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  moderationSettings: {
    autoModerateContent: boolean;
    notifyOnReport: boolean;
    notifyOnReview: boolean;
    notifyOnAction: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  therapistProfile: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: Date;
    yearsOfExperience: number;
    education: string[];
    languages: string[];
    acceptedInsurance: string[];
    sessionTypes: string[];
    hourlyRate: number;
    availability: Record<string, any>;
  };

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    lastLoginIp?: string;
    lastLoginDevice?: string;
    lastLoginLocation?: string;
    accountCreatedFrom?: string;
    preferences?: Record<string, any>;
    verificationRequest?: {
      status?: string;
      requestedAt?: Date;
      verifiedAt?: Date;
      verifiedBy?: string;
      additionalNotes?: string;
      notes?: string;
      reason?: string;
    };
  };
} 
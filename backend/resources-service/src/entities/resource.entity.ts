import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ResourceType {
  ARTICLE = 'article',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  IMAGE = 'image',
  WORKSHEET = 'worksheet',
  GUIDE = 'guide',
  TEMPLATE = 'template',
}

export enum ResourceCategory {
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  STRESS = 'stress',
  MINDFULNESS = 'mindfulness',
  MEDITATION = 'meditation',
  THERAPY = 'therapy',
  SELF_HELP = 'self_help',
  COPING_STRATEGIES = 'coping_strategies',
  RELATIONSHIPS = 'relationships',
  SLEEP = 'sleep',
  NUTRITION = 'nutrition',
  EXERCISE = 'exercise',
  GENERAL = 'general',
}

export enum ResourceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review',
}

@Entity('resources')
@Index(['type'])
@Index(['category'])
@Index(['status'])
@Index(['createdBy'])
@Index(['isPublic'])
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  type: ResourceType;

  @Column({
    type: 'enum',
    enum: ResourceCategory,
  })
  category: ResourceCategory;

  @Column({
    type: 'enum',
    enum: ResourceStatus,
    default: ResourceStatus.DRAFT,
  })
  status: ResourceStatus;

  @Column({ name: 'file_path', nullable: true })
  filePath?: string;

  @Column({ name: 'file_name', nullable: true })
  fileName?: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize?: number;

  @Column({ name: 'mime_type', nullable: true })
  mimeType?: string;

  @Column({ name: 'thumbnail_path', nullable: true })
  thumbnailPath?: string;

  @Column({ name: 'download_url', nullable: true })
  downloadUrl?: string;

  @Column({ name: 'external_url', nullable: true })
  externalUrl?: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'created_by' })
  @Index()
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 
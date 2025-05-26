import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Comment, CommentStatus } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto, ReportCommentDto, ModerateCommentDto } from './dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';
import { CommunityGateway } from '../community.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    private readonly authClient: AuthClientService,
    private readonly gateway: CommunityGateway,
  ) {}

  async create(dto: CreateCommentDto, user: any) {
    // Rate limiting hook could go here
    // Only therapists can comment on therapist-only posts (if enforced at post level)
    // For now, allow all, but can add logic if needed
    const comment = this.commentRepo.create({
      ...dto,
      userId: user.id,
      isAnonymous: dto.isAnonymous ?? false,
      status: CommentStatus.PENDING,
    });
    await this.commentRepo.save(comment);
    this.gateway.emitEvent('commentCreated', { commentId: comment.id, postId: comment.postId, isAnonymous: comment.isAnonymous });
    return comment;
  }

  async list(query: any, user: any) {
    // List comments for a post, privacy filtering
    const where: any = { status: CommentStatus.APPROVED };
    if (query.postId) where.postId = query.postId;
    if (user) {
      where.userId = user.id; // User's own comments
    }
    const options: FindManyOptions<Comment> = { where, order: { createdAt: 'ASC' }, take: 100 };
    return this.commentRepo.find(options);
  }

  async get(id: string, user: any) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    // Privacy check: only owner, admin, or approved
    if (comment.status !== CommentStatus.APPROVED && comment.userId !== user?.id && !user?.roles?.includes('admin')) {
      throw new ForbiddenException('Not allowed to view this comment');
    }
    return comment;
  }

  async update(id: string, dto: UpdateCommentDto, user: any) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== user.id && !user?.roles?.includes('admin')) {
      throw new ForbiddenException('Not allowed to update this comment');
    }
    Object.assign(comment, dto);
    await this.commentRepo.save(comment);
    this.gateway.emitEvent('commentUpdated', { commentId: comment.id });
    return comment;
  }

  async delete(id: string, user: any) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== user.id && !user?.roles?.includes('admin')) {
      throw new ForbiddenException('Not allowed to delete this comment');
    }
    await this.commentRepo.softDelete(id);
    this.gateway.emitEvent('commentDeleted', { commentId: id });
    return { success: true };
  }

  async report(id: string, dto: ReportCommentDto, user: any) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    // Optionally: store report in a moderation table
    this.gateway.emitEvent('commentReported', { commentId: id, reason: dto.reason, reporterId: user.id });
    return { success: true };
  }

  async moderate(id: string, dto: ModerateCommentDto, user: any) {
    if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
      throw new ForbiddenException('Only moderators or admins can moderate comments');
    }
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.status = dto.status;
    if (dto.notes) comment.moderationNotes = dto.notes;
    await this.commentRepo.save(comment);
    this.gateway.emitEvent('commentModerated', { commentId: id, status: dto.status });
    return comment;
  }
} 
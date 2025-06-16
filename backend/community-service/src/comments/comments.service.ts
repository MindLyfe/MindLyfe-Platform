import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Comment, CommentStatus } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto, ReportCommentDto, ModerateCommentDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { PrivacyService } from '../common/services/privacy.service';
import { ModerationService } from '../common/services/moderation.service';
import { CommunityGateway } from '../community.gateway';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment) 
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly anonymityService: AnonymityService,
    private readonly privacyService: PrivacyService,
    private readonly moderationService: ModerationService,
    private readonly gateway: CommunityGateway,
  ) {}

  /**
   * Creates a new comment with enforced anonymity
   * All comments in community are anonymous by default
   */
  async create(dto: CreateCommentDto, user: any): Promise<any> {
    try {
      // Validate user exists
      const userEntity = await this.userRepo.findOne({ 
        where: { authId: user.id } 
      });
      
      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      // Validate post exists and is accessible
      const post = await this.postRepo.findOne({ 
        where: { id: dto.postId },
        relations: ['author']
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if comments are allowed on this post
      if (post.privacySettings && !post.privacySettings.allowComments) {
        throw new ForbiddenException('Comments are not allowed on this post');
      }

      // Validate parent comment if provided
      let parentComment = null;
      if (dto.parentId) {
        parentComment = await this.commentRepo.findOne({ 
          where: { id: dto.parentId, postId: dto.postId }
        });
        
        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }
      }

      // Generate anonymous identity for this user
      const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.id, 'comment');

      // Enforce anonymity - all community comments are anonymous
      const commentData = {
      ...dto,
        authorId: userEntity.id,
        isAnonymous: true, // Force anonymity in community
        pseudonym: anonymousIdentity.displayName,
        status: CommentStatus.ACTIVE, // Auto-approve in community context
        privacySettings: {
          allowReplies: true,
          allowReactions: true,
          notifyOnReply: true,
          notifyOnReaction: true,
          notifyOnReport: false // Don't notify to maintain anonymity
        }
      };

      // Sanitize content
      commentData.content = this.privacyService.sanitizeContent(commentData.content);

      // Create comment
      const comment = this.commentRepo.create(commentData);
      const savedComment = await this.commentRepo.save(comment);

      // Update user's comment count
      await this.userRepo.update(userEntity.id, {
        commentCount: userEntity.commentCount + 1,
        lastActiveAt: new Date()
      });

      // Load comment with relations for response
      const commentWithRelations = await this.commentRepo.findOne({
        where: { id: savedComment.id },
        relations: ['author', 'post', 'parent']
      });

      // Anonymize response
      const anonymizedComment = this.anonymityService.anonymizeContentResponse(
        commentWithRelations, 
        anonymousIdentity
      );

      // Emit real-time event
      this.gateway.emitEvent('commentCreated', {
        id: savedComment.id,
        postId: savedComment.postId,
        authorName: anonymousIdentity.displayName,
        parentId: savedComment.parentId,
        isAnonymous: true
      });

      this.logger.log(`Anonymous comment created: ${savedComment.id} by ${anonymousIdentity.displayName}`);
      return anonymizedComment;

    } catch (error) {
      this.logger.error(`Failed to create comment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lists comments for a post with anonymization
   */
  async list(query: any, user: any): Promise<any> {
    try {
      if (!query.postId) {
        throw new BadRequestException('postId is required');
      }

      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
      const skip = (page - 1) * limit;

      // Build query
      const queryBuilder = this.commentRepo.createQueryBuilder('comment')
        .leftJoinAndSelect('comment.author', 'author')
        .leftJoinAndSelect('comment.parent', 'parent')
        .leftJoinAndSelect('comment.replies', 'replies')
        .where('comment.postId = :postId', { postId: query.postId })
        .andWhere('comment.status = :status', { status: CommentStatus.ACTIVE });

      // Order by creation date
      queryBuilder.orderBy('comment.createdAt', 'ASC');

      // If requesting root comments only (default for threaded display)
      if (query.rootOnly !== 'false') {
        queryBuilder.andWhere('comment.parentId IS NULL');
      }

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [comments, total] = await queryBuilder.getManyAndCount();

      // Anonymize all comments
      const anonymizedComments = comments.map(comment => {
        const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(
          comment.author.authId, 
          'comment'
        );
        const anonymized = this.anonymityService.anonymizeContentResponse(comment, anonymousIdentity);
        
        // Anonymize replies as well
        if (anonymized.replies) {
          anonymized.replies = anonymized.replies.map(reply => {
            const replyAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
              reply.author?.authId, 
              'comment'
            );
            return this.anonymityService.anonymizeContentResponse(reply, replyAnonymousIdentity);
          });
        }
        
        return anonymized;
      });

      return {
        items: anonymizedComments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      this.logger.error(`Failed to list comments: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets a specific comment with anonymization
   */
  async get(id: string, user: any): Promise<any> {
    try {
      const comment = await this.commentRepo.findOne({
        where: { id },
        relations: ['author', 'post', 'parent', 'replies', 'reactions']
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if comment is accessible (based on post visibility)
      if (comment.status !== CommentStatus.ACTIVE) {
        throw new NotFoundException('Comment not found');
      }

      // Generate anonymous identity for the author
      const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(
        comment.author.authId, 
        'comment'
      );

      // Anonymize the comment response
      const anonymizedComment = this.anonymityService.anonymizeContentResponse(comment, anonymousIdentity);

      // Anonymize replies and reactions
      if (anonymizedComment.replies) {
        anonymizedComment.replies = anonymizedComment.replies.map(reply => {
          const replyAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
            reply.author?.authId, 
            'comment'
          );
          return this.anonymityService.anonymizeContentResponse(reply, replyAnonymousIdentity);
        });
      }

      if (anonymizedComment.reactions) {
        anonymizedComment.reactions = anonymizedComment.reactions.map(reaction => {
          const reactionAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
            reaction.user?.authId, 
            'reaction'
          );
          return this.anonymityService.anonymizeContentResponse(reaction, reactionAnonymousIdentity);
        });
      }

      return anonymizedComment;

    } catch (error) {
      this.logger.error(`Failed to get comment ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates a comment (only by author or moderators)
   */
  async update(id: string, dto: UpdateCommentDto, user: any): Promise<any> {
    try {
      const comment = await this.commentRepo.findOne({
        where: { id },
        relations: ['author']
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if user can update this comment
      const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
      const isAuthor = comment.author.authId === user.id;
      const isModerator = userEntity?.role === UserRole.MODERATOR || userEntity?.role === UserRole.ADMIN;

      if (!isAuthor && !isModerator) {
        throw new ForbiddenException('You can only update your own comments');
      }

      // Sanitize content if provided
      if (dto.content) {
        dto.content = this.privacyService.sanitizeContent(dto.content);
      }

      // Update comment
      await this.commentRepo.update(id, {
        ...dto,
        // Maintain anonymity settings
        isAnonymous: true,
        updatedAt: new Date()
      });

      // Get updated comment
      const updatedComment = await this.get(id, user);

      // Emit real-time event
      this.gateway.emitEvent('commentUpdated', {
        id: comment.id,
        postId: comment.postId,
        authorName: updatedComment.author.displayName
      });

      this.logger.log(`Comment updated: ${id}`);
      return updatedComment;

    } catch (error) {
      this.logger.error(`Failed to update comment ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes a comment (only by author or moderators)
   */
  async delete(id: string, user: any): Promise<void> {
    try {
      const comment = await this.commentRepo.findOne({
        where: { id },
        relations: ['author']
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if user can delete this comment
      const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
      const isAuthor = comment.author.authId === user.id;
      const isModerator = userEntity?.role === UserRole.MODERATOR || userEntity?.role === UserRole.ADMIN;

      if (!isAuthor && !isModerator) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      // Soft delete by changing status
      await this.commentRepo.update(id, {
        status: CommentStatus.REMOVED,
        updatedAt: new Date()
      });

      // Update user's comment count
      if (isAuthor) {
        await this.userRepo.update(comment.author.id, {
          commentCount: Math.max(0, comment.author.commentCount - 1)
        });
      }

      // Emit real-time event
      this.gateway.emitEvent('commentDeleted', {
        id: comment.id,
        postId: comment.postId,
        authorName: comment.pseudonym || 'Anonymous User'
      });

      this.logger.log(`Comment deleted: ${id}`);

    } catch (error) {
      this.logger.error(`Failed to delete comment ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reports a comment for moderation
   */
  async report(id: string, dto: ReportCommentDto, user: any): Promise<void> {
    try {
    const comment = await this.commentRepo.findOne({ where: { id } });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Use moderation service to handle reporting
      await this.moderationService.reportComment(id, user.id, dto.reason);

      // Emit moderation event (anonymized)
      this.gateway.emitEvent('contentReported', {
        type: 'comment',
        id: comment.id,
        postId: comment.postId,
        reason: dto.reason
      });

      this.logger.log(`Comment reported: ${id} by user ${user.id}`);

    } catch (error) {
      this.logger.error(`Failed to report comment ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Moderates a comment (moderators/admins only)
   */
  async moderate(id: string, dto: ModerateCommentDto, user: any): Promise<any> {
    try {
      const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
      
      if (!userEntity || (userEntity.role !== UserRole.MODERATOR && userEntity.role !== UserRole.ADMIN)) {
        throw new ForbiddenException('Only moderators and admins can moderate comments');
      }

    const comment = await this.commentRepo.findOne({ where: { id } });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Update comment status
      await this.commentRepo.update(id, {
        status: dto.status,
        lastModeratedAt: new Date(),
        lastModeratedBy: userEntity.id
      });

      // Use moderation service for comprehensive handling
      await this.moderationService.reviewContent(
        id, 
        'comment', 
        userEntity.id, 
        dto.status === CommentStatus.ACTIVE ? 'approve' : 'remove',
        dto.notes || 'Moderated via API'
      );

      // Get updated comment
      const updatedComment = await this.get(id, user);

      // Emit moderation event
      this.gateway.emitEvent('contentModerated', {
        type: 'comment',
        id: comment.id,
        postId: comment.postId,
        status: dto.status,
        moderatorId: userEntity.id
      });

      this.logger.log(`Comment moderated: ${id} status: ${dto.status}`);
      return updatedComment;

    } catch (error) {
      this.logger.error(`Failed to moderate comment ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets comment thread (all replies) for a specific comment
   */
  async getThread(id: string, user: any): Promise<any> {
    try {
      const rootComment = await this.commentRepo.findOne({
        where: { id },
        relations: ['author']
      });

      if (!rootComment) {
        throw new NotFoundException('Comment not found');
      }

      // Get all replies in this thread
      const allReplies = await this.commentRepo.find({
        where: { parentId: id },
        relations: ['author', 'replies'],
        order: { createdAt: 'ASC' }
      });

      // Recursively anonymize the thread
      const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(
        rootComment.author.authId, 
        'comment'
      );
      
      const anonymizedRoot = this.anonymityService.anonymizeContentResponse(rootComment, anonymousIdentity);
      
      const anonymizedReplies = allReplies.map(reply => {
        const replyAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
          reply.author.authId, 
          'comment'
        );
        return this.anonymityService.anonymizeContentResponse(reply, replyAnonymousIdentity);
      });

      return {
        rootComment: anonymizedRoot,
        replies: anonymizedReplies,
        totalReplies: anonymizedReplies.length
      };

    } catch (error) {
      this.logger.error(`Failed to get comment thread ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
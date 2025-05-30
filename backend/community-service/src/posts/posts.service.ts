import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { Post, PostVisibility, PostStatus } from './entities/post.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePostDto, UpdatePostDto, ReportPostDto, ModeratePostDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { PrivacyService } from '../common/services/privacy.service';
import { ModerationService } from '../common/services/moderation.service';
import { CommunityGateway } from '../community.gateway';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
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
   * Creates a new post with enforced anonymity
   * All posts in community are anonymous by default
   */
  async create(dto: CreatePostDto, user: any): Promise<any> {
    try {
      // Validate user exists
      const userEntity = await this.userRepo.findOne({ 
        where: { authId: user.id } 
      });
      
      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      // Generate anonymous identity for this user
      const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.id, 'post');

      // Enforce anonymity - all community posts are anonymous
      const postData = {
        ...dto,
        authorId: userEntity.id,
        isAnonymous: true, // Force anonymity in community
        pseudonym: anonymousIdentity.displayName,
        status: PostStatus.PUBLISHED, // Auto-approve in community context
        visibility: dto.visibility || PostVisibility.PUBLIC,
        privacySettings: {
          allowComments: true,
          allowReactions: true,
          allowSharing: false, // Prevent sharing that could de-anonymize
          notifyOnComment: true,
          notifyOnReaction: true,
          notifyOnReport: false // Don't notify to maintain anonymity
        }
      };

      // Sanitize content
      postData.content = this.privacyService.sanitizeContent(postData.content);

      // Create post
      const post = this.postRepo.create(postData);
      const savedPost = await this.postRepo.save(post);

      // Update user's post count
      await this.userRepo.update(userEntity.id, {
        postCount: userEntity.postCount + 1,
        lastActiveAt: new Date()
      });

      // Load post with relations for response
      const postWithRelations = await this.postRepo.findOne({
        where: { id: savedPost.id },
        relations: ['author']
      });

      // Anonymize response
      const anonymizedPost = this.anonymityService.anonymizeContentResponse(
        postWithRelations, 
        anonymousIdentity
      );

      // Emit real-time event
      this.gateway.emitEvent('postCreated', {
        id: savedPost.id,
        authorName: anonymousIdentity.displayName,
        title: savedPost.title,
        visibility: savedPost.visibility,
        isAnonymous: true
      });

      this.logger.log(`Anonymous post created: ${savedPost.id} by ${anonymousIdentity.displayName}`);
      return anonymizedPost;

    } catch (error) {
      this.logger.error(`Failed to create post: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lists posts with privacy filtering and anonymization
   */
  async list(query: any, user: any): Promise<any> {
    try {
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;

      // Build query with privacy filtering
      const queryBuilder = this.postRepo.createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.status = :status', { status: PostStatus.PUBLISHED });

      // Apply visibility filters
      if (user) {
        const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
        
        if (userEntity?.role === UserRole.THERAPIST || userEntity?.isVerifiedTherapist) {
          // Therapists can see therapist-only content
          queryBuilder.andWhere('post.visibility IN (:...visibilities)', {
            visibilities: [PostVisibility.PUBLIC, PostVisibility.ANONYMOUS, PostVisibility.THERAPISTS_ONLY]
          });
        } else {
          // Regular users can only see public and anonymous content
          queryBuilder.andWhere('post.visibility IN (:...visibilities)', {
            visibilities: [PostVisibility.PUBLIC, PostVisibility.ANONYMOUS]
          });
        }
      } else {
        // Non-authenticated users can only see public content
        queryBuilder.andWhere('post.visibility = :visibility', { visibility: PostVisibility.PUBLIC });
      }

      // Apply tag filtering
      if (query.tags && Array.isArray(query.tags)) {
        queryBuilder.andWhere('post.tags && :tags', { tags: query.tags });
      }

      // Apply content search
      if (query.search) {
        queryBuilder.andWhere(
          '(LOWER(post.title) LIKE LOWER(:search) OR LOWER(post.content) LIKE LOWER(:search))',
          { search: `%${query.search}%` }
        );
      }

      // Apply ordering
      const orderBy = query.orderBy || 'createdAt';
      const orderDirection = query.orderDirection === 'ASC' ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`post.${orderBy}`, orderDirection);

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [posts, total] = await queryBuilder.getManyAndCount();

      // Anonymize all posts
      const anonymizedPosts = posts.map(post => {
        const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(
          post.author.authId, 
          'post'
        );
        return this.anonymityService.anonymizeContentResponse(post, anonymousIdentity);
      });

      return {
        items: anonymizedPosts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      this.logger.error(`Failed to list posts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets a specific post with anonymization
   */
  async get(id: string, user: any): Promise<any> {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['author', 'comments', 'reactions']
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user can view this post
      if (!this.canUserViewPost(post, user)) {
        throw new ForbiddenException('You do not have permission to view this post');
      }

      // Increment view count
      await this.postRepo.update(id, { 
        viewCount: post.viewCount + 1 
      });

      // Generate anonymous identity for the author
      const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(
        post.author.authId, 
        'post'
      );

      // Anonymize the post response
      const anonymizedPost = this.anonymityService.anonymizeContentResponse(post, anonymousIdentity);

      // Anonymize comments and reactions
      if (anonymizedPost.comments) {
        anonymizedPost.comments = anonymizedPost.comments.map(comment => {
          const commentAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
            comment.author?.authId, 
            'comment'
          );
          return this.anonymityService.anonymizeContentResponse(comment, commentAnonymousIdentity);
        });
      }

      if (anonymizedPost.reactions) {
        anonymizedPost.reactions = anonymizedPost.reactions.map(reaction => {
          const reactionAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
            reaction.user?.authId, 
            'reaction'
          );
          return this.anonymityService.anonymizeContentResponse(reaction, reactionAnonymousIdentity);
        });
      }

      return anonymizedPost;

    } catch (error) {
      this.logger.error(`Failed to get post ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates a post (only by author or moderators)
   */
  async update(id: string, dto: UpdatePostDto, user: any): Promise<any> {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['author']
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user can update this post
      const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
      const isAuthor = post.author.authId === user.id;
      const isModerator = userEntity?.role === UserRole.MODERATOR || userEntity?.role === UserRole.ADMIN;

      if (!isAuthor && !isModerator) {
        throw new ForbiddenException('You can only update your own posts');
      }

      // Sanitize content if provided
      if (dto.content) {
        dto.content = this.privacyService.sanitizeContent(dto.content);
      }

      // Update post
      await this.postRepo.update(id, {
        ...dto,
        // Maintain anonymity settings
        isAnonymous: true,
        updatedAt: new Date()
      });

      // Get updated post
      const updatedPost = await this.get(id, user);

      // Emit real-time event
      this.gateway.emitEvent('postUpdated', {
        id: post.id,
        authorName: updatedPost.author.displayName,
        title: updatedPost.title
      });

      this.logger.log(`Post updated: ${id}`);
      return updatedPost;

    } catch (error) {
      this.logger.error(`Failed to update post ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes a post (only by author or moderators)
   */
  async delete(id: string, user: any): Promise<void> {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['author']
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user can delete this post
      const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
      const isAuthor = post.author.authId === user.id;
      const isModerator = userEntity?.role === UserRole.MODERATOR || userEntity?.role === UserRole.ADMIN;

      if (!isAuthor && !isModerator) {
        throw new ForbiddenException('You can only delete your own posts');
      }

      // Soft delete by changing status
      await this.postRepo.update(id, {
        status: PostStatus.REMOVED,
        updatedAt: new Date()
      });

      // Update user's post count
      if (isAuthor) {
        await this.userRepo.update(post.author.id, {
          postCount: Math.max(0, post.author.postCount - 1)
        });
      }

      // Emit real-time event
      this.gateway.emitEvent('postDeleted', {
        id: post.id,
        authorName: post.pseudonym || 'Anonymous User'
      });

      this.logger.log(`Post deleted: ${id}`);

    } catch (error) {
      this.logger.error(`Failed to delete post ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reports a post for moderation
   */
  async report(id: string, dto: ReportPostDto, user: any): Promise<void> {
    try {
      const post = await this.postRepo.findOne({ where: { id } });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Use moderation service to handle reporting
      await this.moderationService.reportPost(id, user.id, dto.reason);

      // Emit moderation event (anonymized)
      this.gateway.emitEvent('contentReported', {
        type: 'post',
        id: post.id,
        reason: dto.reason
      });

      this.logger.log(`Post reported: ${id} by user ${user.id}`);

    } catch (error) {
      this.logger.error(`Failed to report post ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Moderates a post (moderators/admins only)
   */
  async moderate(id: string, dto: ModeratePostDto, user: any): Promise<any> {
    try {
      const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
      
      if (!userEntity || (userEntity.role !== UserRole.MODERATOR && userEntity.role !== UserRole.ADMIN)) {
        throw new ForbiddenException('Only moderators and admins can moderate posts');
      }

      const post = await this.postRepo.findOne({ where: { id } });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Update post status
      await this.postRepo.update(id, {
        status: dto.status,
        lastModeratedAt: new Date(),
        lastModeratedBy: userEntity.id
      });

      // Use moderation service for comprehensive handling
      await this.moderationService.reviewContent(
        id, 
        'post', 
        userEntity.id, 
        dto.status === PostStatus.PUBLISHED ? 'approve' : 'remove',
        dto.notes || 'Moderated via API'
      );

      // Get updated post
      const updatedPost = await this.get(id, user);

      // Emit moderation event
      this.gateway.emitEvent('contentModerated', {
        type: 'post',
        id: post.id,
        status: dto.status,
        moderatorId: userEntity.id
      });

      this.logger.log(`Post moderated: ${id} status: ${dto.status}`);
      return updatedPost;

    } catch (error) {
      this.logger.error(`Failed to moderate post ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Checks if a user can view a specific post based on visibility settings
   */
  private canUserViewPost(post: Post, user: any): boolean {
    switch (post.visibility) {
      case PostVisibility.PUBLIC:
      case PostVisibility.ANONYMOUS:
        return true;
        
      case PostVisibility.THERAPISTS_ONLY:
        if (!user) return false;
        // This would require checking user role from auth service
        // For now, assume therapist status is in user object
        return user.role === UserRole.THERAPIST || user.isVerifiedTherapist;
        
      case PostVisibility.PRIVATE:
        if (!user) return false;
        return post.author.authId === user.id;
        
      default:
        return false;
    }
  }
} 
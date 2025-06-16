import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Reaction, ReactionType } from './entities/reaction.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { AddReactionDto, RemoveReactionDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { CommunityGateway } from '../community.gateway';

@Injectable()
export class ReactionsService {
  private readonly logger = new Logger(ReactionsService.name);

  constructor(
    @InjectRepository(Reaction) 
    private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly anonymityService: AnonymityService,
    private readonly gateway: CommunityGateway,
  ) {}

  /**
   * Adds a reaction with enforced anonymity
   * All reactions in community are anonymous by default
   */
  async add(dto: AddReactionDto, user: any): Promise<any> {
    try {
    // Validation: Must react to either a post or comment, not both or neither
    if (!dto.postId && !dto.commentId) {
      throw new BadRequestException('Must provide either postId or commentId');
    }
    if (dto.postId && dto.commentId) {
      throw new BadRequestException('Cannot react to both post and comment simultaneously');
    }

      // Validate user exists
      const userEntity = await this.userRepo.findOne({ 
        where: { authId: user.id } 
      });
      
      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      // Validate target exists (post or comment)
      if (dto.postId) {
        const post = await this.postRepo.findOne({ where: { id: dto.postId } });
        if (!post) {
          throw new NotFoundException('Post not found');
        }
        // Check if reactions are allowed on this post
        if (post.privacySettings && !post.privacySettings.allowReactions) {
          throw new BadRequestException('Reactions are not allowed on this post');
        }
      }

      if (dto.commentId) {
        const comment = await this.commentRepo.findOne({ where: { id: dto.commentId } });
        if (!comment) {
          throw new NotFoundException('Comment not found');
        }
        // Check if reactions are allowed on this comment
        if (comment.privacySettings && !comment.privacySettings.allowReactions) {
          throw new BadRequestException('Reactions are not allowed on this comment');
        }
      }

    // Check if user already reacted with this type to the same content
    const existingReaction = await this.reactionRepo.findOne({
      where: {
          userId: userEntity.id,
        postId: dto.postId || null,
        commentId: dto.commentId || null,
        type: dto.type
      }
    });

    if (existingReaction) {
      throw new BadRequestException('You have already reacted with this reaction type');
    }

      // Generate anonymous identity for this user
      const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.id, 'reaction');

      // Enforce anonymity - all community reactions are anonymous
      const reactionData = {
        userId: userEntity.id,
      postId: dto.postId || null,
      commentId: dto.commentId || null,
      type: dto.type,
        isAnonymous: true, // Force anonymity in community
        pseudonym: anonymousIdentity.displayName
      };

      // Create and save the reaction
      const reaction = this.reactionRepo.create(reactionData);
      const savedReaction = await this.reactionRepo.save(reaction);

      // Load reaction with relations for response
      const reactionWithRelations = await this.reactionRepo.findOne({
        where: { id: savedReaction.id },
        relations: ['user']
      });

      // Anonymize response
      const anonymizedReaction = this.anonymityService.anonymizeContentResponse(
        reactionWithRelations, 
        anonymousIdentity
      );

    // Emit real-time event
    this.gateway.emitEvent('reactionAdded', {
        id: savedReaction.id,
        postId: savedReaction.postId,
        commentId: savedReaction.commentId,
        type: savedReaction.type,
        authorName: anonymousIdentity.displayName,
        isAnonymous: true
      });

      this.logger.log(`Anonymous reaction added: ${savedReaction.id} by ${anonymousIdentity.displayName}`);
      return anonymizedReaction;

    } catch (error) {
      this.logger.error(`Failed to add reaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Removes a reaction
   */
  async remove(dto: RemoveReactionDto, user: any): Promise<void> {
    try {
      // Validation: Must specify either a post or comment, not both or neither
    if (!dto.postId && !dto.commentId) {
      throw new BadRequestException('Must provide either postId or commentId');
    }
    if (dto.postId && dto.commentId) {
        throw new BadRequestException('Cannot specify both post and comment');
      }

      // Validate user exists
      const userEntity = await this.userRepo.findOne({ 
        where: { authId: user.id } 
      });
      
      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      // Find existing reaction
      const existingReaction = await this.reactionRepo.findOne({
      where: {
          userId: userEntity.id,
        postId: dto.postId || null,
        commentId: dto.commentId || null,
        type: dto.type
      }
    });

      if (!existingReaction) {
      throw new NotFoundException('Reaction not found');
    }

    // Remove the reaction
      await this.reactionRepo.remove(existingReaction);

    // Emit real-time event
      this.gateway.emitEvent('reactionRemoved', {
        postId: existingReaction.postId,
        commentId: existingReaction.commentId,
        type: existingReaction.type,
        userId: userEntity.id // Internal tracking only, not exposed
      });

      this.logger.log(`Reaction removed: ${existingReaction.id}`);

    } catch (error) {
      this.logger.error(`Failed to remove reaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lists reactions with anonymization and aggregation
   */
  async list(query: any, user: any): Promise<any> {
    try {
    const where: any = {};
    
    // Filter by post or comment
    if (query.postId) {
      where.postId = query.postId;
    }
    if (query.commentId) {
      where.commentId = query.commentId;
    }
    
    // Optional type filter
    if (query.type && Object.values(ReactionType).includes(query.type)) {
      where.type = query.type;
    }
    
      // Get aggregated counts by type (most common use case)
      if (query.aggregate === 'true' || query.aggregate === true) {
        const reactions = await this.reactionRepo.find({ 
          where,
          relations: ['user']
        });
        
        // Group and count reactions by type (anonymous)
      const counts = reactions.reduce((acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
      }, {});
      
        // Check if current user has reacted (for UI highlighting)
        let userReactions = {};
        if (user) {
          const userEntity = await this.userRepo.findOne({ where: { authId: user.id } });
          if (userEntity) {
            userReactions = reactions
              .filter(r => r.userId === userEntity.id)
        .reduce((acc, r) => {
          acc[r.type] = true;
          return acc;
              }, {});
          }
        }
        
        return { 
          counts, 
          userReactions,
          total: reactions.length
        };
      }
      
      // Regular listing with pagination and anonymization
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;
      
      const [reactions, total] = await this.reactionRepo.findAndCount({
        where,
        relations: ['user'],
        take: limit,
        skip,
        order: { createdAt: 'DESC' }
      });
      
      // Anonymize all reactions
      const anonymizedReactions = reactions.map(reaction => {
        const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(
          reaction.user.authId, 
          'reaction'
        );
        return this.anonymityService.anonymizeContentResponse(reaction, anonymousIdentity);
      });
      
      return {
        items: anonymizedReactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      this.logger.error(`Failed to list reactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets reaction statistics for a specific post or comment
   */
  async getStatistics(query: any): Promise<any> {
    try {
      if (!query.postId && !query.commentId) {
        throw new BadRequestException('Must provide either postId or commentId');
      }

      const where: any = {};
      if (query.postId) where.postId = query.postId;
      if (query.commentId) where.commentId = query.commentId;

      // Get all reactions for the target
      const reactions = await this.reactionRepo.find({ where });

      // Generate statistics
      const statistics = {
        total: reactions.length,
        byType: reactions.reduce((acc, reaction) => {
          acc[reaction.type] = (acc[reaction.type] || 0) + 1;
          return acc;
        }, {}),
        // Most popular reaction
        mostPopular: null as string | null,
        // Unique reactor count (approximate, since we can't expose real user count)
        approximateUniqueReactors: new Set(reactions.map(r => r.userId)).size
      };

      // Find most popular reaction type
      if (Object.keys(statistics.byType).length > 0) {
        statistics.mostPopular = Object.entries(statistics.byType)
          .reduce((a, b) => a[1] > b[1] ? a : b)[0];
      }

      return statistics;

    } catch (error) {
      this.logger.error(`Failed to get reaction statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets user's own reactions (for profile/history view)
   */
  async getUserReactions(user: any, query: any): Promise<any> {
    try {
      const userEntity = await this.userRepo.findOne({ 
        where: { authId: user.id } 
      });
      
      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;

      const where: any = { userId: userEntity.id };
      
      // Optional type filter
      if (query.type && Object.values(ReactionType).includes(query.type)) {
        where.type = query.type;
      }

      const [reactions, total] = await this.reactionRepo.findAndCount({
      where,
        relations: ['post', 'comment'],
        take: limit,
      skip,
      order: { createdAt: 'DESC' }
      });

      // Return user's own reactions (they can see their own history)
      // But still anonymize the posts/comments they reacted to
      const anonymizedReactions = reactions.map(reaction => {
        const result = {
          id: reaction.id,
          type: reaction.type,
          createdAt: reaction.createdAt,
          isAnonymous: reaction.isAnonymous
        };

        // Anonymize the content they reacted to
        if (reaction.post) {
          const postAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
            reaction.post.author?.authId, 
            'post'
          );
          result['post'] = this.anonymityService.anonymizeContentResponse(
            reaction.post, 
            postAnonymousIdentity
          );
        }

        if (reaction.comment) {
          const commentAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(
            reaction.comment.author?.authId, 
            'comment'
          );
          result['comment'] = this.anonymityService.anonymizeContentResponse(
            reaction.comment, 
            commentAnonymousIdentity
          );
        }

        return result;
      });
    
    return {
        items: anonymizedReactions,
        pagination: {
          page,
          limit,
      total,
          pages: Math.ceil(total / limit)
        }
    };

    } catch (error) {
      this.logger.error(`Failed to get user reactions: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
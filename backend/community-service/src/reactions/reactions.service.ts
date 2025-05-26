import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Reaction, ReactionType } from './entities/reaction.entity';
import { AddReactionDto, RemoveReactionDto } from './dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';
import { CommunityGateway } from '../community.gateway';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction) private readonly reactionRepo: Repository<Reaction>,
    private readonly authClient: AuthClientService,
    private readonly gateway: CommunityGateway,
  ) {}

  async add(dto: AddReactionDto, user: any) {
    // Validation: Must react to either a post or comment, not both or neither
    if (!dto.postId && !dto.commentId) {
      throw new BadRequestException('Must provide either postId or commentId');
    }
    if (dto.postId && dto.commentId) {
      throw new BadRequestException('Cannot react to both post and comment simultaneously');
    }

    // Check if user already reacted with this type to the same content
    const existingReaction = await this.reactionRepo.findOne({
      where: {
        userId: user.id,
        postId: dto.postId || null,
        commentId: dto.commentId || null,
        type: dto.type
      }
    });

    if (existingReaction) {
      throw new BadRequestException('You have already reacted with this reaction type');
    }

    // Create and save the reaction
    const reaction = this.reactionRepo.create({
      userId: user.id,
      postId: dto.postId || null,
      commentId: dto.commentId || null,
      type: dto.type,
      isAnonymous: dto.isAnonymous ?? false
    });

    await this.reactionRepo.save(reaction);

    // Emit real-time event
    this.gateway.emitEvent('reactionAdded', {
      id: reaction.id,
      postId: reaction.postId,
      commentId: reaction.commentId,
      type: reaction.type,
      isAnonymous: reaction.isAnonymous
    });

    return reaction;
  }

  async remove(dto: RemoveReactionDto, user: any) {
    // Validation: Must specify either a post or comment to remove reaction from
    if (!dto.postId && !dto.commentId) {
      throw new BadRequestException('Must provide either postId or commentId');
    }
    if (dto.postId && dto.commentId) {
      throw new BadRequestException('Cannot specify both post and comment simultaneously');
    }

    // Find the existing reaction
    const reaction = await this.reactionRepo.findOne({
      where: {
        userId: user.id,
        postId: dto.postId || null,
        commentId: dto.commentId || null,
        type: dto.type
      }
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    // Store reaction details before removal for the event
    const reactionDetails = {
      id: reaction.id,
      postId: reaction.postId,
      commentId: reaction.commentId,
      type: reaction.type
    };

    // Remove the reaction
    await this.reactionRepo.remove(reaction);

    // Emit real-time event
    this.gateway.emitEvent('reactionRemoved', reactionDetails);

    return { success: true };
  }

  async list(query: any, user: any) {
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
    
    // Get aggregated counts by type
    if (query.aggregate === 'true') {
      const reactions = await this.reactionRepo.find({ where });
      
      // Group and count reactions by type
      const counts = reactions.reduce((acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
      }, {});
      
      // Check if user has reacted (for UI highlighting)
      const userReactions = user ? reactions
        .filter(r => r.userId === user.id)
        .reduce((acc, r) => {
          acc[r.type] = true;
          return acc;
        }, {}) : {};
      
      return { counts, userReactions };
    }
    
    // Regular listing with pagination
    const take = Math.min(parseInt(query.limit) || 20, 100); // Maximum 100 reactions per request
    const skip = parseInt(query.offset) || 0;
    
    const options: FindManyOptions<Reaction> = {
      where,
      take,
      skip,
      order: { createdAt: 'DESC' }
    };
    
    const [reactions, total] = await this.reactionRepo.findAndCount(options);
    
    return {
      items: reactions,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      pageCount: Math.ceil(total / take)
    };
  }
} 
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { CreateFollowDto } from './dto/create-follow.dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly authClient: AuthClientService,
  ) {}

  async createFollow(createFollowDto: CreateFollowDto, currentUserId: string): Promise<Follow> {
    // Verify both users exist via auth service
    await this.authClient.validateUser(currentUserId);
    await this.authClient.validateUser(createFollowDto.followedId);
    
    // Prevent self-following
    if (currentUserId === createFollowDto.followedId) {
      throw new BadRequestException('You cannot follow yourself');
    }
    
    // Check if the follow relationship already exists
    const existingFollow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followedId: createFollowDto.followedId,
      },
    });
    
    if (existingFollow) {
      if (existingFollow.isBlocked) {
        throw new ForbiddenException('You are blocked from following this user');
      }
      
      if (existingFollow.deletedAt) {
        // Restore soft-deleted follow
        await this.followRepository.restore(existingFollow.id);
        return this.followRepository.findOne({ where: { id: existingFollow.id } });
      }
      
      throw new BadRequestException('You are already following this user');
    }
    
    // Create new follow relationship
    const follow = this.followRepository.create({
      followerId: currentUserId,
      followedId: createFollowDto.followedId,
      isAccepted: true, // Auto-accept for now, could be changed for follow requests
      metadata: createFollowDto.metadata || {},
    });
    
    return this.followRepository.save(follow);
  }

  async removeFollow(followedId: string, currentUserId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followedId: followedId,
      },
    });
    
    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }
    
    // Soft delete the follow relationship
    await this.followRepository.softDelete(follow.id);
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    return this.followRepository.find({
      where: {
        followedId: userId,
        isAccepted: true,
        isBlocked: false,
      },
      relations: ['follower'],
    });
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return this.followRepository.find({
      where: {
        followerId: userId,
        isAccepted: true,
        isBlocked: false,
      },
      relations: ['followed'],
    });
  }

  async blockFollow(followerId: string, currentUserId: string): Promise<void> {
    // Find the follow relationship where the current user is being followed
    const follow = await this.followRepository.findOne({
      where: {
        followerId: followerId,
        followedId: currentUserId,
      },
    });
    
    if (!follow) {
      // Create a blocked follow entry if one doesn't exist
      const blockedFollow = this.followRepository.create({
        followerId: followerId,
        followedId: currentUserId,
        isBlocked: true,
        isAccepted: false,
      });
      
      await this.followRepository.save(blockedFollow);
      return;
    }
    
    // Update existing follow to blocked
    follow.isBlocked = true;
    follow.isAccepted = false;
    await this.followRepository.save(follow);
  }

  async checkFollows(followerId: string, followedId: string, checkBothDirections: boolean = false): Promise<{ follows: boolean }> {
    // Check if followerId follows followedId
    const directFollow = await this.followRepository.findOne({
      where: {
        followerId: followerId,
        followedId: followedId,
        isAccepted: true,
        isBlocked: false,
      },
    });
    
    if (directFollow) {
      return { follows: true };
    }
    
    // If checkBothDirections is true, also check the reverse relationship
    if (checkBothDirections) {
      const reverseFollow = await this.followRepository.findOne({
        where: {
          followerId: followedId,
          followedId: followerId,
          isAccepted: true,
          isBlocked: false,
        },
      });
      
      if (reverseFollow) {
        return { follows: true };
      }
    }
    
    return { follows: false };
  }
} 
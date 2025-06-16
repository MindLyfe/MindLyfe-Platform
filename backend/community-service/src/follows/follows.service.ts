import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow, FollowStatus } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { CreateFollowDto, UpdateFollowDto, FollowListQueryDto, ChatEligibilityDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { UserMappingService } from '../common/services/user-mapping.service';
import { CommunityGateway } from '../community.gateway';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly anonymityService: AnonymityService,
    private readonly userMappingService: UserMappingService,
    private readonly gateway: CommunityGateway,
  ) {}

  /**
   * Creates a follow relationship between two users (anonymous context)
   */
  async follow(dto: CreateFollowDto, followerUser: any): Promise<any> {
    try {
      // Get the follower's real user entity
      const followerEntity = await this.userRepo.findOne({
        where: { authId: followerUser.id }
      });

      if (!followerEntity) {
        throw new BadRequestException('Follower user not found');
      }

      // Validate and convert anonymous ID to real user ID
      const validation = await this.userMappingService.validateFollowTarget(
        dto.followingId, 
        followerUser.id
      );

      if (!validation.isValid) {
        throw new BadRequestException(validation.reason);
      }

      const followingUserId = validation.targetUserId!;
      const followingEntity = await this.userRepo.findOne({
        where: { id: followingUserId }
      });

      if (!followingEntity) {
        throw new NotFoundException('User to follow not found');
      }
    
    // Prevent self-following
      if (followerEntity.id === followingEntity.id) {
        throw new BadRequestException('Cannot follow yourself');
    }
    
      // Check if already following
      const existingFollow = await this.followRepo.findOne({
      where: {
          followerId: followerEntity.id,
          followingId: followingEntity.id,
          status: FollowStatus.ACTIVE
        }
    });
    
    if (existingFollow) {
        throw new BadRequestException('Already following this user');
      }

      // Create follow relationship
      const follow = this.followRepo.create({
        followerId: followerEntity.id,
        followingId: followingEntity.id,
        status: FollowStatus.ACTIVE,
        privacySettings: {
          allowChatInvitation: true,
          notifyOnFollow: true,
          notifyOnMutualFollow: true,
          allowRealNameInChat: true, // Default to allow, user can change
        },
        metadata: {
          followSource: dto.followSource,
          sourceContentId: dto.sourceContentId,
          mutualInterests: dto.mutualInterests,
        }
      });

      const savedFollow = await this.followRepo.save(follow);

      // Check if this creates a mutual follow relationship
      const reverseFollow = await this.followRepo.findOne({
        where: {
          followerId: followingEntity.id,
          followingId: followerEntity.id,
          status: FollowStatus.ACTIVE
        }
      });

      let isMutualFollow = false;
      if (reverseFollow) {
        // Mark both as mutual follows
        await this.followRepo.update(
          { id: savedFollow.id },
          {
            isMutualFollow: true,
            mutualFollowEstablishedAt: new Date(),
            chatAccessGranted: true,
            chatAccessGrantedAt: new Date()
          }
        );

        await this.followRepo.update(
          { id: reverseFollow.id },
          {
            isMutualFollow: true,
            mutualFollowEstablishedAt: new Date(),
            chatAccessGranted: true,
            chatAccessGrantedAt: new Date()
          }
        );

        isMutualFollow = true;

        // Emit mutual follow event
        this.gateway.emitEvent('mutualFollowEstablished', {
          user1Id: followerEntity.id,
          user2Id: followingEntity.id,
          chatAccessGranted: true
        });

        this.logger.log(`Mutual follow established between users ${followerEntity.id} and ${followingEntity.id}`);
      }

      // Generate anonymous identities for response
      const followerAnonymous = this.anonymityService.generateAnonymousIdentity(followerEntity.authId);
      const followingAnonymous = this.anonymityService.generateAnonymousIdentity(followingEntity.authId);

      // Emit follow event (anonymized)
      this.gateway.emitEvent('userFollowed', {
        followerId: followerAnonymous.id,
        followerName: followerAnonymous.displayName,
        followingId: followingAnonymous.id,
        followingName: followingAnonymous.displayName,
        isMutualFollow
      });

      return {
        id: savedFollow.id,
        follower: {
          id: followerAnonymous.id,
          displayName: followerAnonymous.displayName,
          avatarColor: followerAnonymous.avatarColor
        },
        following: {
          id: followingAnonymous.id,
          displayName: followingAnonymous.displayName,
          avatarColor: followingAnonymous.avatarColor
        },
        isMutualFollow,
        chatAccessGranted: savedFollow.chatAccessGranted,
        createdAt: savedFollow.createdAt
      };

    } catch (error) {
      this.logger.error(`Failed to create follow: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Removes a follow relationship
   */
  async unfollow(followingAnonymousId: string, followerUser: any): Promise<void> {
    try {
      const followerEntity = await this.userRepo.findOne({
        where: { authId: followerUser.id }
      });

      if (!followerEntity) {
        throw new BadRequestException('User not found');
      }

      // Convert anonymous ID to real user ID
      const followingUserId = await this.userMappingService.anonymousIdToRealUserId(followingAnonymousId);

      const follow = await this.followRepo.findOne({
      where: {
          followerId: followerEntity.id,
          followingId: followingUserId,
          status: FollowStatus.ACTIVE
        }
    });
    
    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }
    
      // If this was a mutual follow, update the reverse relationship
      if (follow.isMutualFollow) {
        await this.followRepo.update(
          {
            followerId: followingUserId,
            followingId: followerEntity.id
          },
          {
            isMutualFollow: false,
            chatAccessGranted: false,
            mutualFollowEstablishedAt: null,
            chatAccessGrantedAt: null
          }
        );

        // Emit mutual follow broken event
        this.gateway.emitEvent('mutualFollowBroken', {
          user1Id: followerEntity.id,
          user2Id: followingUserId,
          chatAccessRevoked: true
        });
      }

      // Remove the follow
      await this.followRepo.remove(follow);

      // Emit unfollow event
      this.gateway.emitEvent('userUnfollowed', {
        followerId: followerEntity.id,
        followingId: followingUserId
      });

      this.logger.log(`User ${followerEntity.id} unfollowed ${followingUserId}`);

    } catch (error) {
      this.logger.error(`Failed to unfollow: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lists follows with anonymization
   */
  async listFollows(query: FollowListQueryDto, user: any): Promise<any> {
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

      let queryBuilder = this.followRepo.createQueryBuilder('follow')
        .leftJoinAndSelect('follow.follower', 'follower')
        .leftJoinAndSelect('follow.following', 'following')
        .where('follow.status = :status', { status: query.status || FollowStatus.ACTIVE });

      // Filter by type
      switch (query.type) {
        case 'followers':
          queryBuilder = queryBuilder.andWhere('follow.followingId = :userId', { userId: userEntity.id });
          break;
        case 'following':
          queryBuilder = queryBuilder.andWhere('follow.followerId = :userId', { userId: userEntity.id });
          break;
        case 'mutual':
          queryBuilder = queryBuilder.andWhere(
            '(follow.followerId = :userId OR follow.followingId = :userId) AND follow.isMutualFollow = true',
            { userId: userEntity.id }
          );
          break;
        default:
          // All follows related to this user
          queryBuilder = queryBuilder.andWhere(
            '(follow.followerId = :userId OR follow.followingId = :userId)',
            { userId: userEntity.id }
          );
      }

      // Apply pagination
      queryBuilder = queryBuilder
        .orderBy('follow.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const [follows, total] = await queryBuilder.getManyAndCount();

      // Anonymize the results
      const anonymizedFollows = follows.map(follow => {
        const followerAnonymous = this.anonymityService.generateAnonymousIdentity(follow.follower.authId);
        const followingAnonymous = this.anonymityService.generateAnonymousIdentity(follow.following.authId);

        return {
          id: follow.id,
          follower: {
            id: followerAnonymous.id,
            displayName: followerAnonymous.displayName,
            avatarColor: followerAnonymous.avatarColor,
            role: follow.follower.role,
            isVerifiedTherapist: follow.follower.isVerifiedTherapist
          },
          following: {
            id: followingAnonymous.id,
            displayName: followingAnonymous.displayName,
            avatarColor: followingAnonymous.avatarColor,
            role: follow.following.role,
            isVerifiedTherapist: follow.following.isVerifiedTherapist
          },
          isMutualFollow: follow.isMutualFollow,
          chatAccessGranted: follow.chatAccessGranted,
          createdAt: follow.createdAt,
          mutualFollowEstablishedAt: follow.mutualFollowEstablishedAt
        };
      });

      return {
        items: anonymizedFollows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      this.logger.error(`Failed to list follows: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets follow statistics for a user
   */
  async getFollowStats(user: any): Promise<any> {
    try {
      const userEntity = await this.userRepo.findOne({
        where: { authId: user.id }
      });

      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      const [followersCount, followingCount, mutualFollowsCount] = await Promise.all([
        this.followRepo.count({
          where: {
            followingId: userEntity.id,
            status: FollowStatus.ACTIVE
          }
        }),
        this.followRepo.count({
      where: {
            followerId: userEntity.id,
            status: FollowStatus.ACTIVE
          }
        }),
        this.followRepo.count({
          where: [
            { followerId: userEntity.id, isMutualFollow: true, status: FollowStatus.ACTIVE },
            { followingId: userEntity.id, isMutualFollow: true, status: FollowStatus.ACTIVE }
          ]
        })
      ]);

      return {
        followersCount,
        followingCount,
        mutualFollowsCount: Math.floor(mutualFollowsCount / 2), // Divide by 2 since mutual follows are stored twice
        chatEligibleUsersCount: Math.floor(mutualFollowsCount / 2) // Same as mutual follows
      };

    } catch (error) {
      this.logger.error(`Failed to get follow stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Checks if two users can chat (mutual follow relationship)
   */
  async checkChatEligibility(dto: ChatEligibilityDto, user: any): Promise<any> {
    try {
      const userEntity = await this.userRepo.findOne({
        where: { authId: user.id }
      });

      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      // Convert anonymous ID to real user ID
      const targetUserId = await this.userMappingService.anonymousIdToRealUserId(dto.userId);

      // Find mutual follow relationship
      const mutualFollow = await this.followRepo.findOne({
        where: [
          {
            followerId: userEntity.id,
            followingId: targetUserId,
            isMutualFollow: true,
            chatAccessGranted: true,
            status: FollowStatus.ACTIVE
          },
          {
            followerId: targetUserId,
            followingId: userEntity.id,
            isMutualFollow: true,
            chatAccessGranted: true,
            status: FollowStatus.ACTIVE
          }
        ],
        relations: ['follower', 'following']
      });

      const canChat = !!mutualFollow;
      let chatPartner = null;

      if (canChat && mutualFollow) {
        // Determine who the chat partner is
        const partnerId = mutualFollow.followerId === userEntity.id 
          ? mutualFollow.followingId 
          : mutualFollow.followerId;
        
        const partnerEntity = mutualFollow.followerId === userEntity.id 
          ? mutualFollow.following 
          : mutualFollow.follower;

        // Generate anonymous identity for the partner
        const partnerAnonymous = this.anonymityService.generateAnonymousIdentity(partnerEntity.authId);

        chatPartner = {
          anonymousId: partnerAnonymous.id,
          displayName: partnerAnonymous.displayName,
          avatarColor: partnerAnonymous.avatarColor,
          role: partnerEntity.role,
          isVerifiedTherapist: partnerEntity.isVerifiedTherapist,
          // Real identity is NOT exposed here - that happens in chat service
          realUserId: partnerId, // Only for chat service internal use
          allowRealNameInChat: mutualFollow.privacySettings?.allowRealNameInChat ?? true
        };
      }

      return {
        canChat,
        chatPartner,
        mutualFollowEstablishedAt: mutualFollow?.mutualFollowEstablishedAt,
        chatAccessGrantedAt: mutualFollow?.chatAccessGrantedAt
      };

    } catch (error) {
      this.logger.error(`Failed to check chat eligibility: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets all users eligible for chat (mutual follows)
   */
  async getChatEligibleUsers(user: any): Promise<any> {
    try {
      const userEntity = await this.userRepo.findOne({
        where: { authId: user.id }
      });

      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      const mutualFollows = await this.followRepo.find({
        where: [
          {
            followerId: userEntity.id,
            isMutualFollow: true,
            chatAccessGranted: true,
            status: FollowStatus.ACTIVE
          },
          {
            followingId: userEntity.id,
            isMutualFollow: true,
            chatAccessGranted: true,
            status: FollowStatus.ACTIVE
          }
        ],
        relations: ['follower', 'following'],
        order: { mutualFollowEstablishedAt: 'DESC' }
      });

      // Deduplicate and anonymize
      const chatPartners = new Map();
      
      for (const follow of mutualFollows) {
        const partnerId = follow.followerId === userEntity.id 
          ? follow.followingId 
          : follow.followerId;
        
        if (!chatPartners.has(partnerId)) {
          const partnerEntity = follow.followerId === userEntity.id 
            ? follow.following 
            : follow.follower;

          const partnerAnonymous = this.anonymityService.generateAnonymousIdentity(partnerEntity.authId);

          chatPartners.set(partnerId, {
            anonymousId: partnerAnonymous.id,
            displayName: partnerAnonymous.displayName,
            avatarColor: partnerAnonymous.avatarColor,
            role: partnerEntity.role,
            isVerifiedTherapist: partnerEntity.isVerifiedTherapist,
            mutualFollowEstablishedAt: follow.mutualFollowEstablishedAt,
            chatAccessGrantedAt: follow.chatAccessGrantedAt,
            lastActiveAt: partnerEntity.lastActiveAt,
            // Real user ID for chat service (not exposed to frontend)
            realUserId: partnerId,
            allowRealNameInChat: follow.privacySettings?.allowRealNameInChat ?? true
          });
        }
      }

      return {
        chatPartners: Array.from(chatPartners.values()),
        totalCount: chatPartners.size
      };

    } catch (error) {
      this.logger.error(`Failed to get chat eligible users: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates follow privacy settings
   */
  async updateFollowSettings(followId: string, dto: UpdateFollowDto, user: any): Promise<any> {
    try {
      const userEntity = await this.userRepo.findOne({
        where: { authId: user.id }
      });

      if (!userEntity) {
        throw new BadRequestException('User not found');
      }

      const follow = await this.followRepo.findOne({
        where: {
          id: followId,
          followerId: userEntity.id // Only allow updating your own follows
        }
      });

      if (!follow) {
        throw new NotFoundException('Follow relationship not found');
      }

      // Update privacy settings
      const updatedPrivacySettings = {
        ...follow.privacySettings,
        ...(dto.allowChatInvitation !== undefined && { allowChatInvitation: dto.allowChatInvitation }),
        ...(dto.notifyOnFollow !== undefined && { notifyOnFollow: dto.notifyOnFollow }),
        ...(dto.notifyOnMutualFollow !== undefined && { notifyOnMutualFollow: dto.notifyOnMutualFollow }),
        ...(dto.allowRealNameInChat !== undefined && { allowRealNameInChat: dto.allowRealNameInChat })
      };

      await this.followRepo.update(followId, {
        status: dto.status || follow.status,
        privacySettings: updatedPrivacySettings
      });

      return { success: true };

    } catch (error) {
      this.logger.error(`Failed to update follow settings: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
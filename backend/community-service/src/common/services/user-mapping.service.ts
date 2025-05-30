import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AnonymityService } from './anonymity.service';
import * as crypto from 'crypto';

@Injectable()
export class UserMappingService {
  private readonly logger = new Logger(UserMappingService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly anonymityService: AnonymityService,
  ) {}

  /**
   * Converts an anonymous ID back to real user ID
   * This is used when processing follow requests from frontend
   */
  async anonymousIdToRealUserId(anonymousId: string): Promise<string> {
    // Get all users and check which one generates this anonymous ID
    // In production, you might want to cache this or use a more efficient lookup
    const users = await this.userRepo.find({ select: ['id', 'authId'] });
    
    for (const user of users) {
      const userAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.authId);
      if (userAnonymousIdentity.id === anonymousId) {
        return user.id;
      }
    }
    
    throw new NotFoundException(`User not found for anonymous ID: ${anonymousId}`);
  }

  /**
   * Converts a real user ID to anonymous ID
   * This is used when returning follow information to frontend
   */
  async realUserIdToAnonymousId(realUserId: string): Promise<string> {
    const user = await this.userRepo.findOne({ 
      where: { id: realUserId },
      select: ['authId']
    });
    
    if (!user) {
      throw new NotFoundException(`User not found for ID: ${realUserId}`);
    }
    
    const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.authId);
    return anonymousIdentity.id;
  }

  /**
   * Gets user's anonymous identity by real user ID
   */
  async getUserAnonymousIdentity(realUserId: string): Promise<any> {
    const user = await this.userRepo.findOne({ 
      where: { id: realUserId },
      select: ['authId', 'role', 'isVerifiedTherapist']
    });
    
    if (!user) {
      throw new NotFoundException(`User not found for ID: ${realUserId}`);
    }
    
    const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.authId);
    
    return {
      ...anonymousIdentity,
      role: user.role,
      isVerifiedTherapist: user.isVerifiedTherapist
    };
  }

  /**
   * Gets user's anonymous identity by auth ID
   */
  async getUserAnonymousIdentityByAuthId(authId: string): Promise<any> {
    const user = await this.userRepo.findOne({ 
      where: { authId },
      select: ['authId', 'role', 'isVerifiedTherapist']
    });
    
    if (!user) {
      throw new NotFoundException(`User not found for auth ID: ${authId}`);
    }
    
    const anonymousIdentity = this.anonymityService.generateAnonymousIdentity(authId);
    
    return {
      ...anonymousIdentity,
      role: user.role,
      isVerifiedTherapist: user.isVerifiedTherapist
    };
  }

  /**
   * Batch convert anonymous IDs to real user IDs
   * More efficient for handling multiple users at once
   */
  async batchAnonymousToRealUserIds(anonymousIds: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const users = await this.userRepo.find({ select: ['id', 'authId'] });
    
    for (const user of users) {
      const userAnonymousIdentity = this.anonymityService.generateAnonymousIdentity(user.authId);
      if (anonymousIds.includes(userAnonymousIdentity.id)) {
        result.set(userAnonymousIdentity.id, user.id);
      }
    }
    
    return result;
  }

  /**
   * Validates that a user can be followed (exists and is not self)
   */
  async validateFollowTarget(anonymousId: string, followerAuthId: string): Promise<{
    isValid: boolean;
    targetUserId?: string;
    reason?: string;
  }> {
    try {
      const targetUserId = await this.anonymousIdToRealUserId(anonymousId);
      const targetUser = await this.userRepo.findOne({ 
        where: { id: targetUserId },
        select: ['authId']
      });
      
      if (!targetUser) {
        return { isValid: false, reason: 'Target user not found' };
      }
      
      // Prevent self-following
      if (targetUser.authId === followerAuthId) {
        return { isValid: false, reason: 'Cannot follow yourself' };
      }
      
      return { isValid: true, targetUserId };
      
    } catch (error) {
      return { isValid: false, reason: 'Invalid user ID' };
    }
  }

  /**
   * Gets real user ID from auth ID (for internal use)
   */
  async authIdToRealUserId(authId: string): Promise<string> {
    const user = await this.userRepo.findOne({ 
      where: { authId },
      select: ['id']
    });
    
    if (!user) {
      throw new NotFoundException(`User not found for auth ID: ${authId}`);
    }
    
    return user.id;
  }

  /**
   * Gets auth ID from real user ID (for internal use)
   */
  async realUserIdToAuthId(realUserId: string): Promise<string> {
    const user = await this.userRepo.findOne({ 
      where: { id: realUserId },
      select: ['authId']
    });
    
    if (!user) {
      throw new NotFoundException(`User not found for ID: ${realUserId}`);
    }
    
    return user.authId;
  }
} 
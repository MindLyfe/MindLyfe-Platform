import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto, TherapistVerificationRequestDto, TherapistVerifyDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getMe(user: any) {
    const found = await this.userRepo.findOne({ where: { authId: user.id } });
    if (!found) {
      // Create user profile if doesn't exist (sync from auth service)
      const newUser = this.userRepo.create({
        authId: user.id,
        displayName: user.displayName || user.email || 'User',
        // Set default privacy settings
        privacySettings: {
          isAnonymousByDefault: false,
          showActivityStatus: true,
          showPostHistory: true,
          showCommentHistory: true,
          showReactionHistory: true,
          allowDirectMessages: true,
          allowMentions: true,
          allowTags: true,
          notifyOnMention: true,
          notifyOnReply: true,
          notifyOnReaction: true,
          notifyOnReport: true,
        },
      });
      return await this.userRepo.save(newUser);
    }
    return found;
  }

  async updateMe(dto: UpdateUserDto, user: any) {
    const found = await this.userRepo.findOne({ where: { authId: user.id } });
    if (!found) throw new NotFoundException('User profile not found');
    
    // Update allowed fields
    if (dto.displayName) found.displayName = dto.displayName;
    if (dto.pseudonym !== undefined) found.pseudonym = dto.pseudonym;
    if (dto.bio !== undefined) found.bio = dto.bio;
    if (dto.specialties) found.specialties = dto.specialties;
    if (dto.certifications) found.certifications = dto.certifications;
    if (dto.privacySettings) {
      found.privacySettings = { ...found.privacySettings, ...dto.privacySettings };
    }
    if (dto.therapistProfile && found.isVerifiedTherapist) {
      found.therapistProfile = { ...found.therapistProfile, ...dto.therapistProfile };
    }
    
    await this.userRepo.save(found);
    return found;
  }

  async requestTherapistVerification(dto: TherapistVerificationRequestDto, user: any) {
    const found = await this.userRepo.findOne({ where: { authId: user.id } });
    if (!found) throw new NotFoundException('User profile not found');
    
    // Store verification request in therapist profile
    found.therapistProfile = {
      licenseNumber: dto.licenseNumber,
      licenseState: dto.licenseState,
      licenseExpiry: new Date(dto.licenseExpiry),
      yearsOfExperience: dto.yearsOfExperience,
      education: dto.education,
      languages: dto.languages || [],
      acceptedInsurance: dto.acceptedInsurance || [],
      sessionTypes: dto.sessionTypes || [],
      hourlyRate: dto.hourlyRate || 0,
      availability: dto.availability || {},
    };
    
    // Add metadata for verification tracking
    found.metadata = {
      ...found.metadata,
      verificationRequest: {
        status: 'pending',
        requestedAt: new Date(),
        additionalNotes: dto.additionalNotes,
      }
    };
    
    await this.userRepo.save(found);
    
    // TODO: Send notification to moderators/admins via notification service
    // await this.notificationService.notifyModerators('therapist-verification-request', { userId: found.id });
    
    return { success: true, message: 'Therapist verification request submitted successfully' };
  }

  async verifyTherapist(id: string, dto: TherapistVerifyDto, user: any) {
    if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
      throw new ForbiddenException('Only admin or moderator can verify therapists');
    }
    
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('User not found');
    
    // Update verification status
    found.isVerifiedTherapist = dto.isVerified;
    
    // Update metadata with verification decision
    found.metadata = {
      ...found.metadata,
      verificationRequest: {
        ...found.metadata?.verificationRequest,
        status: dto.isVerified ? 'approved' : 'rejected',
        verifiedAt: new Date(),
        verifiedBy: user.id,
        notes: dto.notes,
        reason: dto.reason,
      }
    };
    
    // If verified, update role to therapist
    if (dto.isVerified) {
      found.role = UserRole.THERAPIST;
    }
    
    await this.userRepo.save(found);
    
    // TODO: Send notification to user via notification service
    // await this.notificationService.notifyUser(found.authId, 'therapist-verification-result', { 
    //   isVerified: dto.isVerified, 
    //   notes: dto.notes 
    // });
    
    return {
      success: true,
      user: found,
      message: `Therapist verification ${dto.isVerified ? 'approved' : 'rejected'} successfully`
    };
  }

  async getUserById(id: string) {
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  async getUserByAuthId(authId: string) {
    const found = await this.userRepo.findOne({ where: { authId } });
    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  async getAllUsers(page: number = 1, limit: number = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
} 
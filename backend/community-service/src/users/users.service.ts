import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto, TherapistVerificationRequestDto, TherapistVerifyDto } from './dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly authClient: AuthClientService,
  ) {}

  async getMe(user: any) {
    const found = await this.userRepo.findOne({ where: { id: user.id } });
    if (!found) throw new NotFoundException('User not found');
    // Hide sensitive fields
    delete found.password;
    delete found.email;
    return found;
  }

  async updateMe(dto: UpdateUserDto, user: any) {
    const found = await this.userRepo.findOne({ where: { id: user.id } });
    if (!found) throw new NotFoundException('User not found');
    Object.assign(found, dto);
    await this.userRepo.save(found);
    return found;
  }

  async requestTherapistVerification(dto: TherapistVerificationRequestDto, user: any) {
    const found = await this.userRepo.findOne({ where: { id: user.id } });
    if (!found) throw new NotFoundException('User not found');
    found.therapistVerificationRequest = dto;
    found.therapistVerificationStatus = 'pending';
    await this.userRepo.save(found);
    // Optionally: notify moderators/admins
    return { success: true };
  }

  async verifyTherapist(id: string, dto: TherapistVerifyDto, user: any) {
    if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
      throw new ForbiddenException('Only admin or moderator can verify therapists');
    }
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('User not found');
    found.isTherapist = dto.isVerified;
    found.therapistVerificationStatus = dto.isVerified ? 'approved' : 'rejected';
    found.therapistVerificationNotes = dto.notes;
    await this.userRepo.save(found);
    // Optionally: notify user
    return found;
  }
} 
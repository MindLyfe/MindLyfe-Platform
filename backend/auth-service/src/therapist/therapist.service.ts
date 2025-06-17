import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Therapist, TherapistStatus, LicenseStatus } from '../entities/therapist.entity';
import { User, UserRole, UserStatus } from '../entities/user.entity';
// Removed EmailService - notifications handled by notification service
import {
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  TherapistQueryDto,
  TherapistApprovalHistoryDto,
} from './dto/therapist.dto';

@Injectable()
export class TherapistService {
  private readonly logger = new Logger(TherapistService.name);

  constructor(
    @InjectRepository(Therapist)
    private therapistRepository: Repository<Therapist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async getPendingTherapists(query: TherapistQueryDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.therapistRepository
      .createQueryBuilder('therapist')
      .leftJoinAndSelect('therapist.user', 'user')
      .where('therapist.status = :status', { status: TherapistStatus.PENDING_VERIFICATION });

    if (query.licenseState) {
      queryBuilder.andWhere('therapist.licenseState ILIKE :licenseState', {
        licenseState: `%${query.licenseState}%`,
      });
    }

    if (query.specialization) {
      queryBuilder.andWhere('therapist.specialization ILIKE :specialization', {
        specialization: `%${query.specialization}%`,
      });
    }

    const [therapists, total] = await queryBuilder
      .orderBy(`therapist.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: therapists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTherapists(query: TherapistQueryDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.therapistRepository
      .createQueryBuilder('therapist')
      .leftJoinAndSelect('therapist.user', 'user');

    if (query.status) {
      queryBuilder.andWhere('therapist.status = :status', { status: query.status });
    }

    if (query.licenseStatus) {
      queryBuilder.andWhere('therapist.licenseStatus = :licenseStatus', {
        licenseStatus: query.licenseStatus,
      });
    }

    if (query.licenseState) {
      queryBuilder.andWhere('therapist.licenseState ILIKE :licenseState', {
        licenseState: `%${query.licenseState}%`,
      });
    }

    if (query.specialization) {
      queryBuilder.andWhere('therapist.specialization ILIKE :specialization', {
        specialization: `%${query.specialization}%`,
      });
    }

    const [therapists, total] = await queryBuilder
      .orderBy(`therapist.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: therapists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTherapistById(id: string, currentUser: any) {
    const therapist = await this.therapistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    // Check permissions: Admin/Support can see all, therapists can only see their own
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.ORGANIZATION_ADMIN &&
      (currentUser.role !== UserRole.THERAPIST || therapist.userId !== currentUser.id)
    ) {
      throw new ForbiddenException('Insufficient permissions to view this therapist');
    }

    return therapist;
  }

  async getTherapistByUserId(userId: string) {
    const therapist = await this.therapistRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist profile not found');
    }

    return therapist;
  }

  async approveTherapist(id: string, approveDto: ApproveTherapistDto, adminUserId: string) {
    const therapist = await this.therapistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    if (therapist.status !== TherapistStatus.PENDING_VERIFICATION) {
      throw new BadRequestException(
        `Cannot approve therapist with status: ${therapist.status}`,
      );
    }

    // Update therapist status
    therapist.status = TherapistStatus.VERIFIED;
    therapist.isAcceptingNewClients = true;
    
    if (approveDto.licenseState) {
      therapist.licenseState = approveDto.licenseState;
    }
    
    if (approveDto.licenseStatus) {
      therapist.licenseStatus = approveDto.licenseStatus;
    } else {
      therapist.licenseStatus = LicenseStatus.ACTIVE;
    }

    // Update user status to active
    therapist.user.status = UserStatus.ACTIVE;

    // Save changes
    await this.therapistRepository.save(therapist);
    await this.userRepository.save(therapist.user);

    // Log approval action
    this.logger.log(
      `Therapist ${therapist.id} approved by admin ${adminUserId}. Reason: ${approveDto.approvalNotes}`,
    );

    // Send approval email via notification service
    try {
      await this.sendNotificationRequest('therapist/approval-email', {
        userId: therapist.user.id,
        email: therapist.user.email,
        firstName: therapist.user.firstName,
        lastName: therapist.user.lastName,
        approvalNotes: approveDto.approvalNotes,
        therapistId: therapist.id
      });
    } catch (error) {
      this.logger.error('Failed to send therapist approval email', error);
    }

    return {
      message: 'Therapist approved successfully',
      therapist: {
        id: therapist.id,
        status: therapist.status,
        licenseStatus: therapist.licenseStatus,
        user: {
          id: therapist.user.id,
          email: therapist.user.email,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          status: therapist.user.status,
        },
      },
    };
  }

  async rejectTherapist(id: string, rejectDto: RejectTherapistDto, adminUserId: string) {
    const therapist = await this.therapistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    if (therapist.status !== TherapistStatus.PENDING_VERIFICATION) {
      throw new BadRequestException(
        `Cannot reject therapist with status: ${therapist.status}`,
      );
    }

    // Update therapist status
    therapist.status = TherapistStatus.REJECTED;
    therapist.isAcceptingNewClients = false;

    // Update user status
    therapist.user.status = UserStatus.SUSPENDED;

    // Save changes
    await this.therapistRepository.save(therapist);
    await this.userRepository.save(therapist.user);

    // Log rejection action
    this.logger.log(
      `Therapist ${therapist.id} rejected by admin ${adminUserId}. Reason: ${rejectDto.reason}`,
    );

    // Send rejection email via notification service
    try {
      await this.sendNotificationRequest('therapist/rejection-email', {
        userId: therapist.user.id,
        email: therapist.user.email,
        firstName: therapist.user.firstName,
        lastName: therapist.user.lastName,
        reason: rejectDto.reason,
        notes: rejectDto.notes,
        therapistId: therapist.id
      });
    } catch (error) {
      this.logger.error('Failed to send therapist rejection email', error);
    }

    return {
      message: 'Therapist rejected successfully',
      therapist: {
        id: therapist.id,
        status: therapist.status,
        user: {
          id: therapist.user.id,
          email: therapist.user.email,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          status: therapist.user.status,
        },
      },
    };
  }

  async updateTherapistStatus(
    id: string,
    updateDto: UpdateTherapistStatusDto,
    adminUserId: string,
  ) {
    const therapist = await this.therapistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const previousStatus = therapist.status;
    therapist.status = updateDto.status;

    if (updateDto.licenseStatus) {
      therapist.licenseStatus = updateDto.licenseStatus;
    }

    // Update user status based on therapist status
    switch (updateDto.status) {
      case TherapistStatus.VERIFIED:
        therapist.user.status = UserStatus.ACTIVE;
        therapist.isAcceptingNewClients = true;
        break;
      case TherapistStatus.SUSPENDED:
      case TherapistStatus.REJECTED:
        therapist.user.status = UserStatus.SUSPENDED;
        therapist.isAcceptingNewClients = false;
        break;
      case TherapistStatus.PENDING_VERIFICATION:
        therapist.user.status = UserStatus.PENDING;
        therapist.isAcceptingNewClients = false;
        break;
    }

    await this.therapistRepository.save(therapist);
    await this.userRepository.save(therapist.user);

    this.logger.log(
      `Therapist ${therapist.id} status updated from ${previousStatus} to ${updateDto.status} by admin ${adminUserId}`,
    );

    return {
      message: 'Therapist status updated successfully',
      therapist: {
        id: therapist.id,
        status: therapist.status,
        licenseStatus: therapist.licenseStatus,
        previousStatus,
      },
    };
  }

  async suspendTherapist(id: string, suspendDto: RejectTherapistDto, adminUserId: string) {
    const therapist = await this.therapistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    if (therapist.status === TherapistStatus.SUSPENDED) {
      throw new BadRequestException('Therapist is already suspended');
    }

    const previousStatus = therapist.status;
    therapist.status = TherapistStatus.SUSPENDED;
    therapist.isAcceptingNewClients = false;
    therapist.user.status = UserStatus.SUSPENDED;

    await this.therapistRepository.save(therapist);
    await this.userRepository.save(therapist.user);

    this.logger.log(
      `Therapist ${therapist.id} suspended by admin ${adminUserId}. Reason: ${suspendDto.reason}`,
    );

    // Send suspension email via notification service
    try {
      await this.sendNotificationRequest('therapist/suspension-email', {
        userId: therapist.user.id,
        email: therapist.user.email,
        firstName: therapist.user.firstName,
        lastName: therapist.user.lastName,
        reason: suspendDto.reason,
        notes: suspendDto.notes,
        therapistId: therapist.id
      });
    } catch (error) {
      this.logger.error('Failed to send therapist suspension email', error);
    }

    return {
      message: 'Therapist suspended successfully',
      therapist: {
        id: therapist.id,
        status: therapist.status,
        previousStatus,
      },
    };
  }

  async reactivateTherapist(id: string, adminUserId: string) {
    const therapist = await this.therapistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    if (therapist.status !== TherapistStatus.SUSPENDED) {
      throw new BadRequestException(
        `Cannot reactivate therapist with status: ${therapist.status}`,
      );
    }

    therapist.status = TherapistStatus.VERIFIED;
    therapist.isAcceptingNewClients = true;
    therapist.user.status = UserStatus.ACTIVE;

    await this.therapistRepository.save(therapist);
    await this.userRepository.save(therapist.user);

    this.logger.log(`Therapist ${therapist.id} reactivated by admin ${adminUserId}`);

    // Send reactivation email via notification service
    try {
      await this.sendNotificationRequest('therapist/reactivation-email', {
        userId: therapist.user.id,
        email: therapist.user.email,
        firstName: therapist.user.firstName,
        lastName: therapist.user.lastName,
        therapistId: therapist.id
      });
    } catch (error) {
      this.logger.error('Failed to send therapist reactivation email', error);
    }

    return {
      message: 'Therapist reactivated successfully',
      therapist: {
        id: therapist.id,
        status: therapist.status,
      },
    };
  }

  /**
   * Send notification request to notification service
   */
  private async sendNotificationRequest(endpoint: string, data: any): Promise<void> {
    try {
      const notificationServiceUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL');
      
      if (!notificationServiceUrl) {
        this.logger.warn('Notification service URL not configured, skipping notification');
        return;
      }
      
      // Generate service token for authentication
      const serviceToken = this.configService.get<string>('SERVICE_TOKEN');
      
      await firstValueFrom(
        this.httpService.post(
          `${notificationServiceUrl}/api/${endpoint}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${serviceToken}`,
            },
          }
        )
      );
      
      this.logger.log(`Notification sent to ${endpoint}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to ${endpoint}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
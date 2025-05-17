import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, status, role, search } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    // Apply filters if provided
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` },
      );
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    // Order by creation date
    queryBuilder.orderBy('user.createdAt', 'DESC');
    
    // Select only necessary fields (exclude sensitive data)
    queryBuilder.select([
      'user.id',
      'user.email',
      'user.firstName',
      'user.lastName',
      'user.role',
      'user.status',
      'user.emailVerified',
      'user.createdAt',
      'user.lastLogin',
    ]);
    
    const [users, total] = await queryBuilder.getManyAndCount();
    
    return {
      data: users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phoneNumber',
        'role',
        'status',
        'emailVerified',
        'twoFactorEnabled',
        'createdAt',
        'updatedAt',
        'lastLogin',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      // If email is changed, require verification again
      user.emailVerified = false;
      user.verificationToken = require('crypto').randomBytes(32).toString('hex');
      // TODO: Send verification email
    }

    // Update user with new data
    Object.assign(user, updateUserDto);

    // Save updated user
    await this.userRepository.save(user);

    // Return user without sensitive fields
    const { password, refreshToken, resetPasswordToken, resetPasswordExpires, ...result } = user;
    return result;
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;
    await this.userRepository.save(user);

    return {
      message: `User status updated to ${status}`,
    };
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Instead of hard-deleting the user, we can set the status to inactive
    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);

    return {
      message: 'User has been deactivated',
    };
  }
} 
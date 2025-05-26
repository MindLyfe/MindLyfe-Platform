import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, UserStatus, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export type SafeUser = Omit<User, 'password' | 'hashPassword' | 'comparePassword'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userRepository.find();
    return users.map(user => this.sanitizeUser(user));
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.sanitizeUser(user);
  }

  // Internal method that returns full User with password - use carefully
  async findByIdInternal(id: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date())
      } 
    });
  }

  async createUser(userData: Partial<User>): Promise<SafeUser> {
    // Hash password if provided
    let hashedPassword = userData.password;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }
    
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
      status: userData.status || UserStatus.PENDING,
      emailVerified: userData.emailVerified || false,
      twoFactorEnabled: userData.twoFactorEnabled || false,
    });
    
    const savedUser = await this.userRepository.save(newUser);
    return this.sanitizeUser(savedUser);
  }

  async updateLastLogin(id: string): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    user.lastLogin = new Date();
    const updatedUser = await this.userRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }

  async updateResetToken(id: string, token: string, expires: Date): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    
    const updatedUser = await this.userRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }

  async updatePassword(id: string, password: string): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    const updatedUser = await this.userRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }

  async deactivateUser(id: string): Promise<{ id: string, status: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);
    
    return { id, status: 'deactivated' };
  }

  private sanitizeUser(user: User): SafeUser {
    const { password, hashPassword, comparePassword, ...result } = user;
    return result as SafeUser;
  }
} 
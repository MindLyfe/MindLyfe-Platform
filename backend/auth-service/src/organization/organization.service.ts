import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Organization, OrganizationStatus } from '../entities/organization.entity';
import { User, UserType, UserStatus } from '../entities/user.entity';
import { Subscription, SubscriptionType, SubscriptionStatus } from '../entities/subscription.entity';
import { Payment, PaymentType, PaymentStatus } from '../entities/payment.entity';

export interface CreateOrganizationDto {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  maxUsers: number;
  adminUserId: string;
}

export interface AddUserToOrganizationDto {
  organizationId: string;
  userEmail: string;
  adminUserId: string;
}

export interface OrganizationSubscriptionDto {
  organizationId: string;
  paymentMethod: string;
  phoneNumber?: string;
  adminUserId: string;
}

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private dataSource: DataSource,
  ) {}

  async createOrganization(createDto: CreateOrganizationDto): Promise<Organization> {
    // Verify admin user exists and has appropriate permissions
    const adminUser = await this.userRepository.findOne({
      where: { id: createDto.adminUserId }
    });

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    // Check if organization name or email already exists
    const existingOrg = await this.organizationRepository.findOne({
      where: [
        { name: createDto.name },
        { email: createDto.email }
      ]
    });

    if (existingOrg) {
      throw new BadRequestException('Organization with this name or email already exists');
    }

    return await this.dataSource.transaction(async manager => {
      // Create organization
      const organization = manager.create(Organization, {
        name: createDto.name,
        email: createDto.email,
        phoneNumber: createDto.phoneNumber,
        address: createDto.address,
        maxUsers: createDto.maxUsers,
        currentUsers: 1, // Admin user counts as first user
        status: OrganizationStatus.ACTIVE,
        isActive: false // Will be activated after payment
      });

      const savedOrganization = await manager.save(organization);

      // Update admin user to be organization admin
      adminUser.organizationId = savedOrganization.id;
      adminUser.userType = UserType.ORGANIZATION_MEMBER;
      adminUser.role = 'organization_admin' as any;
      await manager.save(adminUser);

      return savedOrganization;
    });
  }

  async createOrganizationSubscription(subscriptionDto: OrganizationSubscriptionDto): Promise<{ payment: Payment }> {
    const organization = await this.organizationRepository.findOne({
      where: { id: subscriptionDto.organizationId },
      relations: ['users']
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Verify admin permissions
    const adminUser = await this.userRepository.findOne({
      where: { 
        id: subscriptionDto.adminUserId,
        organizationId: organization.id,
        role: 'organization_admin' as any
      }
    });

    if (!adminUser) {
      throw new ForbiddenException('Only organization admins can create subscriptions');
    }

    // Calculate total cost based on max users
    const totalCost = organization.maxUsers * organization.pricePerUser;

    return await this.dataSource.transaction(async manager => {
      // Create payment for organization subscription
      const payment = manager.create(Payment, {
        userId: subscriptionDto.adminUserId,
        organizationId: organization.id,
        type: PaymentType.ORGANIZATION_PAYMENT,
        status: PaymentStatus.PENDING,
        method: subscriptionDto.paymentMethod as any,
        amount: totalCost,
        currency: 'UGX',
        reference: this.generatePaymentReference(),
        phoneNumber: subscriptionDto.phoneNumber,
        description: `Annual subscription for ${organization.name} (${organization.maxUsers} users)`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        metadata: {
          organizationId: organization.id,
          maxUsers: organization.maxUsers,
          pricePerUser: organization.pricePerUser
        }
      });

      const savedPayment = await manager.save(payment);

      return { payment: savedPayment };
    });
  }

  async confirmOrganizationPayment(paymentId: string): Promise<Organization> {
    return await this.dataSource.transaction(async manager => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        relations: ['organization']
      });

      if (!payment || !payment.organization) {
        throw new NotFoundException('Payment or organization not found');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Payment is not pending');
      }

      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      await manager.save(payment);

      // Activate organization subscription
      const organization = payment.organization;
      organization.isActive = true;
      organization.subscriptionStartDate = new Date();
      organization.subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      await manager.save(organization);

      // Create individual subscriptions for all organization users
      const users = await manager.find(User, {
        where: { organizationId: organization.id }
      });

      for (const user of users) {
        const subscription = manager.create(Subscription, {
          userId: user.id,
          type: SubscriptionType.ORGANIZATION,
          status: SubscriptionStatus.ACTIVE,
          amount: organization.pricePerUser,
          sessionsIncluded: organization.sessionsPerUser,
          sessionsUsed: 0,
          creditsAvailable: 0,
          startDate: organization.subscriptionStartDate,
          endDate: organization.subscriptionEndDate,
          autoRenew: false
        });

        await manager.save(subscription);
      }

      return organization;
    });
  }

  async addUserToOrganization(addUserDto: AddUserToOrganizationDto): Promise<User> {
    const organization = await this.organizationRepository.findOne({
      where: { id: addUserDto.organizationId },
      relations: ['users']
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.isActive) {
      throw new BadRequestException('Organization subscription is not active');
    }

    // Verify admin permissions
    const adminUser = await this.userRepository.findOne({
      where: { 
        id: addUserDto.adminUserId,
        organizationId: organization.id,
        role: 'organization_admin' as any
      }
    });

    if (!adminUser) {
      throw new ForbiddenException('Only organization admins can add users');
    }

    // Check if organization has reached max users
    if (organization.currentUsers >= organization.maxUsers) {
      throw new BadRequestException('Organization has reached maximum user limit');
    }

    // Find user to add
    const userToAdd = await this.userRepository.findOne({
      where: { email: addUserDto.userEmail }
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    if (userToAdd.organizationId) {
      throw new BadRequestException('User is already part of an organization');
    }

    return await this.dataSource.transaction(async manager => {
      // Update user to be organization member
      userToAdd.organizationId = organization.id;
      userToAdd.userType = UserType.ORGANIZATION_MEMBER;
      const savedUser = await manager.save(userToAdd);

      // Update organization user count
      organization.currentUsers += 1;
      await manager.save(organization);

      // Create subscription for the new user if organization is active
      if (organization.isActive) {
        const subscription = manager.create(Subscription, {
          userId: userToAdd.id,
          type: SubscriptionType.ORGANIZATION,
          status: SubscriptionStatus.ACTIVE,
          amount: organization.pricePerUser,
          sessionsIncluded: organization.sessionsPerUser,
          sessionsUsed: 0,
          creditsAvailable: 0,
          startDate: organization.subscriptionStartDate,
          endDate: organization.subscriptionEndDate,
          autoRenew: false
        });

        await manager.save(subscription);
      }

      return savedUser;
    });
  }

  async removeUserFromOrganization(organizationId: string, userId: string, adminUserId: string): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Verify admin permissions
    const adminUser = await this.userRepository.findOne({
      where: { 
        id: adminUserId,
        organizationId: organization.id,
        role: 'organization_admin' as any
      }
    });

    if (!adminUser) {
      throw new ForbiddenException('Only organization admins can remove users');
    }

    const userToRemove = await this.userRepository.findOne({
      where: { id: userId, organizationId: organization.id }
    });

    if (!userToRemove) {
      throw new NotFoundException('User not found in organization');
    }

    if (userToRemove.id === adminUserId) {
      throw new BadRequestException('Admin cannot remove themselves');
    }

    await this.dataSource.transaction(async manager => {
      // Remove user from organization
      userToRemove.organizationId = null;
      userToRemove.userType = UserType.INDIVIDUAL;
      userToRemove.role = 'user' as any;
      await manager.save(userToRemove);

      // Deactivate organization subscriptions for this user
      await manager.update(
        Subscription,
        { userId: userToRemove.id, type: SubscriptionType.ORGANIZATION },
        { status: SubscriptionStatus.CANCELLED }
      );

      // Update organization user count
      organization.currentUsers -= 1;
      await manager.save(organization);
    });
  }

  async getOrganizationDetails(organizationId: string): Promise<{
    organization: Organization;
    users: User[];
    subscriptionStatus: {
      isActive: boolean;
      totalCost: number;
      remainingDays: number;
    };
  }> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: ['users']
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const users = await this.userRepository.find({
      where: { organizationId: organization.id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt']
    });

    let remainingDays = 0;
    if (organization.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(organization.subscriptionEndDate);
      remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      organization,
      users,
      subscriptionStatus: {
        isActive: organization.isActive,
        totalCost: organization.maxUsers * organization.pricePerUser,
        remainingDays
      }
    };
  }

  async getUserOrganization(userId: string): Promise<{
    organization: Organization | null;
    userRole: string;
    subscriptionStatus?: {
      isActive: boolean;
      totalCost: number;
      remainingDays: number;
    };
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.organizationId || !user.organization) {
      return {
        organization: null,
        userRole: user.role,
        subscriptionStatus: undefined
      };
    }

    const organization = user.organization;
    let remainingDays = 0;
    if (organization.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(organization.subscriptionEndDate);
      remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      organization,
      userRole: user.role,
      subscriptionStatus: {
        isActive: organization.isActive,
        totalCost: organization.maxUsers * organization.pricePerUser,
        remainingDays
      }
    };
  }

  private generatePaymentReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `ORG_${timestamp}_${random}`.toUpperCase();
  }
} 
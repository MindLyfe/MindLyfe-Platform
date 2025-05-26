import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserType } from '../entities/user.entity';
import { Subscription, SubscriptionType, SubscriptionStatus } from '../entities/subscription.entity';
import { Organization } from '../entities/organization.entity';
import { Payment, PaymentType, PaymentStatus } from '../entities/payment.entity';

export interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  price: number;
  sessions: number;
  duration: number; // in days
  description: string;
}

export interface CreateSubscriptionDto {
  userId: string;
  type: SubscriptionType;
  paymentMethod: string;
  phoneNumber?: string;
}

export interface PurchaseCreditsDto {
  userId: string;
  credits: number;
  paymentMethod: string;
  phoneNumber?: string;
}

@Injectable()
export class SubscriptionService {
  private readonly PLANS: Record<SubscriptionType, SubscriptionPlan> = {
    [SubscriptionType.MONTHLY]: {
      type: SubscriptionType.MONTHLY,
      name: 'Monthly Membership',
      price: 200000,
      sessions: 4,
      duration: 30,
      description: 'Monthly membership with 4 therapy sessions'
    },
    [SubscriptionType.ORGANIZATION]: {
      type: SubscriptionType.ORGANIZATION,
      name: 'Organization Plan',
      price: 680000,
      sessions: 8,
      duration: 365,
      description: 'Annual organization plan with 8 sessions per user'
    },
    [SubscriptionType.CREDIT]: {
      type: SubscriptionType.CREDIT,
      name: 'Session Credits',
      price: 76000,
      sessions: 1,
      duration: 90, // Credits expire in 90 days
      description: 'Individual session credits'
    }
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private dataSource: DataSource,
  ) {}

  async getAvailablePlans(userId: string): Promise<SubscriptionPlan[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Organization members can only purchase credits
    if (user.isOrganizationMember) {
      return [this.PLANS[SubscriptionType.CREDIT]];
    }

    // Individual users can purchase monthly membership or credits
    return [
      this.PLANS[SubscriptionType.MONTHLY],
      this.PLANS[SubscriptionType.CREDIT]
    ];
  }

  async createSubscription(createDto: CreateSubscriptionDto): Promise<{ subscription: Subscription; payment: Payment }> {
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId },
      relations: ['organization', 'subscriptions']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate subscription type for user
    await this.validateSubscriptionType(user, createDto.type);

    const plan = this.PLANS[createDto.type];
    
    return await this.dataSource.transaction(async manager => {
      // Create subscription
      const subscription = await manager.save(manager.create(Subscription, {
        userId: createDto.userId,
        type: createDto.type,
        status: SubscriptionStatus.PENDING,
        amount: plan.price,
        sessionsIncluded: plan.sessions,
        sessionsUsed: 0,
        creditsAvailable: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
        autoRenew: createDto.type === SubscriptionType.MONTHLY
      }));

      const savedSubscription = subscription;

      // Create payment
      const payment = manager.create(Payment, {
        userId: createDto.userId,
        subscriptionId: savedSubscription.id,
        type: PaymentType.SUBSCRIPTION,
        status: PaymentStatus.PENDING,
        method: createDto.paymentMethod as any,
        amount: plan.price,
        currency: 'UGX',
        reference: this.generatePaymentReference(),
        phoneNumber: createDto.phoneNumber,
        description: `Payment for ${plan.name}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      });

      const savedPayment = await manager.save(payment);

      return { subscription: savedSubscription, payment: savedPayment };
    });
  }

  async purchaseCredits(purchaseDto: PurchaseCreditsDto): Promise<{ subscription: Subscription; payment: Payment }> {
    const user = await this.userRepository.findOne({
      where: { id: purchaseDto.userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const creditPlan = this.PLANS[SubscriptionType.CREDIT];
    const totalAmount = creditPlan.price * purchaseDto.credits;

    return await this.dataSource.transaction(async manager => {
      // Create credit subscription
      const subscription = await manager.save(manager.create(Subscription, {
        userId: purchaseDto.userId,
        type: SubscriptionType.CREDIT,
        status: SubscriptionStatus.PENDING,
        amount: totalAmount,
        sessionsIncluded: 0,
        sessionsUsed: 0,
        creditsAvailable: purchaseDto.credits,
        startDate: new Date(),
        endDate: new Date(Date.now() + creditPlan.duration * 24 * 60 * 60 * 1000),
        autoRenew: false
      }));

      const savedSubscription = subscription;

      // Create payment
      const payment = manager.create(Payment, {
        userId: purchaseDto.userId,
        subscriptionId: savedSubscription.id,
        type: PaymentType.CREDIT_PURCHASE,
        status: PaymentStatus.PENDING,
        method: purchaseDto.paymentMethod as any,
        amount: totalAmount,
        currency: 'UGX',
        reference: this.generatePaymentReference(),
        phoneNumber: purchaseDto.phoneNumber,
        description: `Purchase of ${purchaseDto.credits} session credits`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });

      const savedPayment = await manager.save(payment);

      return { subscription: savedSubscription, payment: savedPayment };
    });
  }

  async getUserSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    subscriptions: Subscription[];
    totalAvailableSessions: number;
    canBookSession: boolean;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subscriptions', 'organization']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeSubscriptions = user.subscriptions?.filter(
      sub => sub.status === SubscriptionStatus.ACTIVE && !sub.isExpired
    ) || [];

    const totalAvailableSessions = activeSubscriptions.reduce(
      (total, sub) => total + sub.totalAvailableSessions, 0
    );

    return {
      hasActiveSubscription: activeSubscriptions.length > 0,
      subscriptions: activeSubscriptions,
      totalAvailableSessions,
      canBookSession: totalAvailableSessions > 0
    };
  }

  async confirmPayment(paymentId: string): Promise<Subscription> {
    return await this.dataSource.transaction(async manager => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        relations: ['subscription']
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Payment is not pending');
      }

      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      await manager.save(payment);

      // Activate subscription
      if (payment.subscription) {
        payment.subscription.status = SubscriptionStatus.ACTIVE;
        return await manager.save(payment.subscription);
      }

      throw new BadRequestException('No subscription associated with payment');
    });
  }

  // Method for teletherapy service to validate user can book sessions
  async validateUserCanBookSession(userId: string): Promise<{
    canBook: boolean;
    reason?: string;
    availableSessions: number;
    nextAvailableDate?: Date;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subscriptions']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeSubscriptions = user.subscriptions?.filter(
      sub => sub.status === SubscriptionStatus.ACTIVE && !sub.isExpired
    ) || [];

    const totalAvailableSessions = activeSubscriptions.reduce(
      (total, sub) => total + sub.totalAvailableSessions, 0
    );

    if (totalAvailableSessions <= 0) {
      return {
        canBook: false,
        reason: 'No available sessions. Please purchase a subscription or credits.',
        availableSessions: 0
      };
    }

    // Check weekly limit by looking at last session date
    const lastSessionSub = activeSubscriptions
      .filter(sub => sub.lastSessionDate)
      .sort((a, b) => (b.lastSessionDate?.getTime() || 0) - (a.lastSessionDate?.getTime() || 0))[0];

    if (lastSessionSub?.lastSessionDate) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      if (lastSessionSub.lastSessionDate > oneWeekAgo) {
        const nextAvailableDate = new Date(lastSessionSub.lastSessionDate);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);
        
        return {
          canBook: false,
          reason: 'Weekly limit reached. Only one session per week allowed.',
          availableSessions: totalAvailableSessions,
          nextAvailableDate
        };
      }
    }

    return {
      canBook: true,
      availableSessions: totalAvailableSessions
    };
  }

  // Method for teletherapy service to consume a session after booking
  async consumeSession(userId: string): Promise<{
    subscriptionId: string;
    paidFromSubscription: boolean;
    paidFromCredit: boolean;
  }> {
    return await this.dataSource.transaction(async manager => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: ['subscriptions']
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find the best subscription to use (prioritize expiring first)
      const activeSubscriptions = user.subscriptions
        ?.filter(sub => sub.status === SubscriptionStatus.ACTIVE && !sub.isExpired)
        .sort((a, b) => {
          // Prioritize subscriptions with remaining sessions over credits
          if (a.remainingSessions > 0 && b.remainingSessions === 0) return -1;
          if (b.remainingSessions > 0 && a.remainingSessions === 0) return 1;
          
          // Then prioritize by expiration date
          if (a.endDate && b.endDate) {
            return a.endDate.getTime() - b.endDate.getTime();
          }
          return 0;
        });

      if (!activeSubscriptions || activeSubscriptions.length === 0) {
        throw new ForbiddenException('No active subscription found');
      }

      const subscription = activeSubscriptions[0];

      if (subscription.totalAvailableSessions <= 0) {
        throw new ForbiddenException('No sessions available');
      }

      let paidFromSubscription = false;
      let paidFromCredit = false;

      // Use session from subscription or credits
      if (subscription.remainingSessions > 0) {
        subscription.sessionsUsed += 1;
        paidFromSubscription = true;
      } else if (subscription.creditsAvailable > 0) {
        subscription.creditsAvailable -= 1;
        paidFromCredit = true;
      } else {
        throw new ForbiddenException('No sessions or credits available');
      }

      subscription.lastSessionDate = new Date();
      await manager.save(subscription);

      return {
        subscriptionId: subscription.id,
        paidFromSubscription,
        paidFromCredit
      };
    });
  }

  private async validateSubscriptionType(user: User, type: SubscriptionType): Promise<void> {
    // Organization members can only purchase credits
    if (user.isOrganizationMember && type !== SubscriptionType.CREDIT) {
      throw new ForbiddenException('Organization members can only purchase session credits');
    }

    // Check for existing active subscriptions
    const existingSubscription = user.subscriptions?.find(
      sub => sub.status === SubscriptionStatus.ACTIVE && 
             sub.type === type && 
             !sub.isExpired
    );

    if (existingSubscription && type === SubscriptionType.MONTHLY) {
      throw new BadRequestException('User already has an active monthly subscription');
    }
  }


  private generatePaymentReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `PAY_${timestamp}_${random}`.toUpperCase();
  }
} 
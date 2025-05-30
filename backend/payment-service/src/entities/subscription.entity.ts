import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PaymentGatewayType } from '../enums/payment-gateway.enum';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
}

@Entity('subscriptions')
@Index(['userId'])
@Index(['gatewaySubscriptionId'])
@Index(['status'])
@Index(['gateway'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'gateway_subscription_id', unique: true })
  gatewaySubscriptionId: string;

  @Column({ name: 'gateway_customer_id' })
  gatewayCustomerId: string;

  @Column({ name: 'gateway_price_id' })
  gatewayPriceId: string;

  @Column({
    type: 'enum',
    enum: PaymentGatewayType,
    default: PaymentGatewayType.STRIPE,
  })
  gateway: PaymentGatewayType;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
  })
  plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.INACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'usd' })
  currency: string;

  @Column({ name: 'billing_cycle', default: 'monthly' })
  billingCycle: string;

  @Column({ name: 'current_period_start', type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({ name: 'trial_start', type: 'timestamp', nullable: true })
  trialStart?: Date;

  @Column({ name: 'trial_end', type: 'timestamp', nullable: true })
  trialEnd?: Date;

  @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
  canceledAt?: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Legacy fields for backward compatibility (will be deprecated)
  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId?: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  @Column({ name: 'stripe_price_id', nullable: true })
  stripePriceId?: string;
} 
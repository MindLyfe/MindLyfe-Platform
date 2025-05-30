import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PaymentGatewayType } from '../enums/payment-gateway.enum';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
  THERAPY_SESSION = 'therapy_session',
  PREMIUM_FEATURE = 'premium_feature',
}

@Entity('payments')
@Index(['userId'])
@Index(['gatewayPaymentId'])
@Index(['status'])
@Index(['type'])
@Index(['gateway'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'gateway_payment_id', unique: true })
  gatewayPaymentId: string;

  @Column({ name: 'gateway_customer_id', nullable: true })
  gatewayCustomerId?: string;

  @Column({ name: 'gateway_subscription_id', nullable: true })
  gatewaySubscriptionId?: string;

  @Column({
    type: 'enum',
    enum: PaymentGatewayType,
    default: PaymentGatewayType.STRIPE,
  })
  gateway: PaymentGatewayType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'usd' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'refunded_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Legacy fields for backward compatibility (will be deprecated)
  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId?: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId?: string;
} 
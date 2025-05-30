import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '../entities/subscription.entity';
import { PaymentGatewayType } from '../enums/payment-gateway.enum';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription plan',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.PREMIUM,
  })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'Gateway price ID for the subscription',
    example: 'price_1234567890',
  })
  @IsString()
  priceId: string;

  @ApiPropertyOptional({
    description: 'Payment gateway to use',
    enum: PaymentGatewayType,
    example: PaymentGatewayType.STRIPE,
  })
  @IsEnum(PaymentGatewayType)
  @IsOptional()
  gateway?: PaymentGatewayType;

  @ApiPropertyOptional({
    description: 'Billing cycle (monthly, yearly)',
    example: 'monthly',
    default: 'monthly',
  })
  @IsString()
  @IsOptional()
  billingCycle?: string = 'monthly';

  @ApiPropertyOptional({
    description: 'Trial period in days',
    example: 14,
  })
  @IsOptional()
  trialPeriodDays?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata for the subscription',
    example: { source: 'web', campaign: 'summer2024' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Gateway customer ID if existing customer',
    example: 'cus_123456789',
  })
  @IsString()
  @IsOptional()
  customerId?: string;
} 
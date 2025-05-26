import { IsEnum, IsString, IsNumber, IsOptional, Min, Max, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionType } from '../entities/subscription.entity';
import { PaymentMethod } from '../entities/payment.entity';

export class CreateSubscriptionRequestDto {
  @ApiProperty({ 
    enum: SubscriptionType, 
    description: 'Type of subscription',
    example: SubscriptionType.MONTHLY
  })
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @ApiProperty({ 
    enum: PaymentMethod, 
    description: 'Payment method',
    example: PaymentMethod.MOBILE_MONEY
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ 
    description: 'Phone number for mobile money payments',
    example: '+256700000000',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber('UG')
  phoneNumber?: string;
}

export class PurchaseCreditsRequestDto {
  @ApiProperty({ 
    description: 'Number of session credits to purchase',
    example: 2,
    minimum: 1,
    maximum: 20
  })
  @IsNumber()
  @Min(1)
  @Max(20)
  credits: number;

  @ApiProperty({ 
    enum: PaymentMethod, 
    description: 'Payment method',
    example: PaymentMethod.MOBILE_MONEY
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ 
    description: 'Phone number for mobile money payments',
    example: '+256700000000',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber('UG')
  phoneNumber?: string;
}

export class SubscriptionStatusResponseDto {
  @ApiProperty({ description: 'Whether user has active subscription' })
  hasActiveSubscription: boolean;

  @ApiProperty({ description: 'Total available sessions from all subscriptions' })
  totalAvailableSessions: number;

  @ApiProperty({ description: 'Whether user can book a session now' })
  canBookSession: boolean;

  @ApiProperty({ 
    description: 'Next available booking date if weekly limit reached',
    required: false
  })
  nextAvailableBookingDate?: Date;

  @ApiProperty({ description: 'List of active subscriptions' })
  subscriptions: any[];
}

export class SubscriptionPlanResponseDto {
  @ApiProperty({ enum: SubscriptionType })
  type: SubscriptionType;

  @ApiProperty({ description: 'Plan name' })
  name: string;

  @ApiProperty({ description: 'Price in UGX' })
  price: number;

  @ApiProperty({ description: 'Number of sessions included' })
  sessions: number;

  @ApiProperty({ description: 'Duration in days' })
  duration: number;

  @ApiProperty({ description: 'Plan description' })
  description: string;
} 
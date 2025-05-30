import { IsEnum, IsNumber, IsOptional, IsString, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '../entities/payment.entity';
import { PaymentGatewayType } from '../enums/payment-gateway.enum';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment amount in cents',
    example: 2999,
    minimum: 50,
  })
  @IsNumber()
  @Min(50)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'usd',
    default: 'usd',
  })
  @IsString()
  @IsOptional()
  currency?: string = 'usd';

  @ApiProperty({
    description: 'Type of payment',
    enum: PaymentType,
    example: PaymentType.ONE_TIME,
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({
    description: 'Payment gateway to use',
    enum: PaymentGatewayType,
    example: PaymentGatewayType.STRIPE,
  })
  @IsEnum(PaymentGatewayType)
  @IsOptional()
  gateway?: PaymentGatewayType;

  @ApiPropertyOptional({
    description: 'Payment description',
    example: 'Premium subscription payment',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the payment',
    example: { subscriptionId: 'sub_123', feature: 'premium' },
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
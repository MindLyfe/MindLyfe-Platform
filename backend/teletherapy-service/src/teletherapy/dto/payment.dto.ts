import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsEnum, IsNumber, IsUUID, ValidateNested, IsObject, IsEmail, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../entities/therapy-session.entity';

export class PaymentMethodDto {
  @ApiProperty({ description: 'Payment provider', enum: ['stripe', 'paypal', 'bank_transfer'] })
  @IsEnum(['stripe', 'paypal', 'bank_transfer'])
  provider: 'stripe' | 'paypal' | 'bank_transfer';

  @ApiProperty({ description: 'Payment method type', enum: ['card', 'bank_account', 'paypal_account'] })
  @IsEnum(['card', 'bank_account', 'paypal_account'])
  type: 'card' | 'bank_account' | 'paypal_account';

  @ApiProperty({ description: 'Payment method details' })
  @IsObject()
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    accountNumber?: string;
    routingNumber?: string;
    accountType?: string;
    paypalEmail?: string;
  };
}

export class BillingAddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;
}

export class PaymentIntentDto {
  @ApiProperty({ description: 'Session ID' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Amount in smallest currency unit (e.g., cents)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Payment method', type: PaymentMethodDto })
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiProperty({ description: 'Billing address', type: BillingAddressDto })
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress: BillingAddressDto;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ description: 'Description of the payment' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Metadata for the payment', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class DiscountDto {
  @ApiProperty({ description: 'Discount code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Discount amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Discount type', enum: ['percentage', 'fixed'] })
  @IsEnum(['percentage', 'fixed'])
  type: 'percentage' | 'fixed';

  @ApiProperty({ description: 'Minimum purchase amount for discount', required: false })
  @IsOptional()
  @IsNumber()
  minimumAmount?: number;

  @ApiProperty({ description: 'Maximum discount amount', required: false })
  @IsOptional()
  @IsNumber()
  maximumAmount?: number;

  @ApiProperty({ description: 'Expiration date', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}

export class InvoiceDto {
  @ApiProperty({ description: 'Invoice number' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Session ID' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Amount in smallest currency unit' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ description: 'Due date' })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({ description: 'Items in the invoice' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ description: 'Applied discounts', type: [DiscountDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountDto)
  discounts?: DiscountDto[];

  @ApiProperty({ description: 'Billing address', type: BillingAddressDto })
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress: BillingAddressDto;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class InvoiceItemDto {
  @ApiProperty({ description: 'Item description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit price in smallest currency unit' })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ description: 'Tax rate percentage', required: false })
  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class RefundDto {
  @ApiProperty({ description: 'Payment intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'Amount to refund in smallest currency unit', required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Whether to refund to original payment method', default: true })
  @IsBoolean()
  @IsOptional()
  refundToOriginalMethod?: boolean;

  @ApiProperty({ description: 'Metadata for the refund', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Event type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Event data' })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ description: 'Webhook signature' })
  @IsString()
  signature: string;

  @ApiProperty({ description: 'Timestamp of the event' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
} 
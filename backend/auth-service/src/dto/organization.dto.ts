import { IsString, IsEmail, IsNumber, IsOptional, Min, Max, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreateOrganizationRequestDto {
  @ApiProperty({ 
    description: 'Organization name',
    example: 'Acme Corporation'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Organization email',
    example: 'admin@acme.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Organization phone number',
    example: '+256700000000',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber('UG')
  phoneNumber?: string;

  @ApiProperty({ 
    description: 'Organization address',
    example: 'Kampala, Uganda',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    description: 'Maximum number of users allowed',
    example: 50,
    minimum: 1,
    maximum: 1000
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxUsers: number;
}

export class OrganizationSubscriptionRequestDto {
  @ApiProperty({ 
    enum: PaymentMethod, 
    description: 'Payment method',
    example: PaymentMethod.BANK_TRANSFER
  })
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

export class AddUserToOrganizationRequestDto {
  @ApiProperty({ 
    description: 'Email of user to add to organization',
    example: 'user@example.com'
  })
  @IsEmail()
  userEmail: string;
}

export class OrganizationDetailsResponseDto {
  @ApiProperty({ description: 'Organization information' })
  organization: any;

  @ApiProperty({ description: 'List of organization users' })
  users: any[];

  @ApiProperty({ description: 'Subscription status information' })
  subscriptionStatus: {
    isActive: boolean;
    totalCost: number;
    remainingDays: number;
  };
} 
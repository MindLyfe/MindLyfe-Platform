import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsDateString, IsPhoneNumber, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@mindlyf.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, { 
    message: 'Please provide a valid phone number (e.g., +1-555-123-4567 or +1234567890)' 
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date of birth' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'guardian@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid guardian email address' })
  guardianEmail?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, { 
    message: 'Please provide a valid guardian phone number (e.g., +1-555-123-4567 or +1234567890)' 
  })
  guardianPhone?: string;
}

export class TherapistRegisterDto extends RegisterDto {
  @ApiProperty({ example: 'LIC123456789', description: 'Professional license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ 
    example: ['Anxiety', 'Depression', 'PTSD'], 
    description: 'Areas of specialization',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  specialization: string[];

  @ApiProperty({ 
    example: ['PhD in Psychology', 'Licensed Clinical Psychologist'], 
    description: 'Professional credentials',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  credentials?: string[];

  @ApiProperty({ 
    example: 150, 
    description: 'Hourly rate in USD',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

export class OrganizationUserDto {
  @ApiProperty({ example: 'org.user@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'org-uuid-123' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, { 
    message: 'Please provide a valid phone number (e.g., +1-555-123-4567 or +1234567890)' 
  })
  phoneNumber?: string;
}

export class SupportTeamUserDto extends RegisterDto {
  @ApiProperty({ 
    example: 'Customer Support', 
    description: 'Department or team assignment'
  })
  @IsString()
  @IsNotEmpty()
  department: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@mindlyf.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@mindlyf.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewStrongP@ss123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  })
  password: string;

  @ApiProperty({ example: 'NewStrongP@ss123' })
  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewStrongP@ss123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  })
  newPassword: string;

  @ApiProperty({ example: 'NewStrongP@ss123' })
  @IsString()
  @IsNotEmpty()
  newPasswordConfirmation: string;
}
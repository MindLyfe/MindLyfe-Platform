import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsDateString, IsPhoneNumber, IsArray, IsNumber, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Enum for user preferences
export enum PreferredLanguage {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  ITALIAN = 'it',
  PORTUGUESE = 'pt',
  CHINESE = 'zh',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  ARABIC = 'ar'
}

export enum CommunicationPreference {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  ALL = 'all',
  NONE = 'none'
}

export class RegisterDto {
  @ApiProperty({ 
    example: 'john.doe@mindlyf.com',
    description: 'User email address - must be unique and valid format',
    format: 'email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    example: 'StrongP@ss123',
    description: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  })
  password: string;

  @ApiProperty({ 
    example: 'John',
    description: 'User first name - 2-50 characters, letters and spaces only',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @Matches(/^[A-Za-z\s\-']+$/, { message: 'First name can only contain letters, spaces, hyphens and apostrophes' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ 
    example: 'Doe',
    description: 'User last name - 2-50 characters, letters and spaces only',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @Matches(/^[A-Za-z\s\-']+$/, { message: 'Last name can only contain letters, spaces, hyphens and apostrophes' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiPropertyOptional({ 
    example: '+1-555-123-4567',
    description: 'Phone number in international format (optional) - E.164 format preferred',
    pattern: '^[\\+]?[1-9][\\d]{0,15}$|^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,20}$'
  })
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, { 
    message: 'Please provide a valid phone number (e.g., +1-555-123-4567 or +1234567890)' 
  })
  @Transform(({ value }) => value?.replace(/\s+/g, '').trim())
  phoneNumber?: string;

  @ApiPropertyOptional({ 
    example: '1990-01-15',
    description: 'Date of birth in YYYY-MM-DD format (optional) - Users under 18 require guardian information',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date of birth in YYYY-MM-DD format' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ 
    example: 'guardian@example.com',
    description: 'Guardian email address (required for users under 18)',
    format: 'email'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid guardian email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  guardianEmail?: string;

  @ApiPropertyOptional({ 
    example: '+1-555-987-6543',
    description: 'Guardian phone number (required for users under 18)',
    pattern: '^[\\+]?[1-9][\\d]{0,15}$|^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,20}$'
  })
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, { 
    message: 'Please provide a valid guardian phone number (e.g., +1-555-123-4567 or +1234567890)' 
  })
  @Transform(({ value }) => value?.replace(/\s+/g, '').trim())
  guardianPhone?: string;

  @ApiPropertyOptional({ 
    example: PreferredLanguage.ENGLISH,
    description: 'Preferred language for communication',
    enum: PreferredLanguage,
    default: PreferredLanguage.ENGLISH
  })
  @IsOptional()
  @IsEnum(PreferredLanguage)
  preferredLanguage?: PreferredLanguage = PreferredLanguage.ENGLISH;

  @ApiPropertyOptional({ 
    example: CommunicationPreference.EMAIL,
    description: 'Preferred method of communication',
    enum: CommunicationPreference,
    default: CommunicationPreference.EMAIL
  })
  @IsOptional()
  @IsEnum(CommunicationPreference)
  communicationPreference?: CommunicationPreference = CommunicationPreference.EMAIL;

  @ApiPropertyOptional({ 
    example: 'America/New_York',
    description: 'User timezone (optional) - IANA timezone identifier',
    default: 'UTC'
  })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiPropertyOptional({ 
    example: true,
    description: 'Agreement to terms of service (required)',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  agreeToTerms?: boolean = false;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Consent to privacy policy (required)',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  agreeToPrivacy?: boolean = false;

  @ApiPropertyOptional({ 
    example: false,
    description: 'Opt-in for marketing communications (optional)',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  marketingOptIn?: boolean = false;
}

export class TherapistRegisterDto extends RegisterDto {
  @ApiProperty({ 
    example: 'LIC123456789',
    description: 'Professional license number - must be unique and valid format',
    minLength: 5,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'License number must be at least 5 characters' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  licenseNumber: string;

  @ApiProperty({ 
    example: ['Anxiety Disorders', 'Depression', 'PTSD', 'Relationship Counseling'], 
    description: 'Areas of specialization - select 1-10 specializations',
    type: [String],
    minItems: 1,
    maxItems: 10
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  specialization: string[];

  @ApiProperty({ 
    example: ['PhD in Clinical Psychology', 'Licensed Clinical Social Worker', 'Certified Trauma Specialist'], 
    description: 'Professional credentials and certifications',
    type: [String],
    required: false,
    maxItems: 20
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  credentials?: string[];

  @ApiProperty({ 
    example: 150, 
    description: 'Hourly rate in USD (1-500)',
    minimum: 1,
    maximum: 500,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Hourly rate must be at least $1' })
  @Max(500, { message: 'Hourly rate cannot exceed $500' })
  hourlyRate?: number;

  @ApiProperty({ 
    example: 'Dr. John Doe is a licensed clinical psychologist with over 10 years of experience...',
    description: 'Professional bio and background (50-2000 characters)',
    minLength: 50,
    maxLength: 2000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(50, { message: 'Bio must be at least 50 characters' })
  @Transform(({ value }) => value?.trim())
  professionalBio?: string;

  @ApiProperty({ 
    example: 'University of California, Berkeley',
    description: 'Educational institution',
    required: false
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  education?: string;

  @ApiProperty({ 
    example: 12,
    description: 'Years of professional experience',
    minimum: 0,
    maximum: 50,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ 
    example: ['English', 'Spanish', 'French'],
    description: 'Languages spoken by the therapist',
    type: [String],
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesSpoken?: string[];

  @ApiPropertyOptional({ 
    example: 'California',
    description: 'State where licensed to practice'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  licenseState?: string;

  @ApiPropertyOptional({ 
    example: '2025-12-31',
    description: 'License expiration date',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  licenseExpirationDate?: string;
}

export class OrganizationUserDto {
  @ApiProperty({ 
    example: 'jane.manager@healthcare.com',
    description: 'Organization user email address',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    example: 'Jane',
    description: 'First name of organization user'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ 
    example: 'Manager',
    description: 'Last name of organization user'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the organization this user belongs to',
    format: 'uuid'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 
    { message: 'Organization ID must be a valid UUID' })
  organizationId: string;

  @ApiPropertyOptional({ 
    example: '+1-555-123-4567',
    description: 'Phone number of organization user',
    pattern: '^[\\+]?[1-9][\\d]{0,15}$|^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,20}$'
  })
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, { 
    message: 'Please provide a valid phone number (e.g., +1-555-123-4567 or +1234567890)' 
  })
  @Transform(({ value }) => value?.replace(/\s+/g, '').trim())
  phoneNumber?: string;

  @ApiPropertyOptional({ 
    example: 'Healthcare Administrator',
    description: 'Job title within the organization'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  jobTitle?: string;

  @ApiPropertyOptional({ 
    example: 'Operations',
    description: 'Department within the organization'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  department?: string;
}

export class SupportTeamUserDto extends RegisterDto {
  @ApiProperty({ 
    example: 'Customer Support', 
    description: 'Department or team assignment for support staff',
    enum: ['Customer Support', 'Technical Support', 'Billing Support', 'Clinical Support', 'Admin Support']
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  department: string;

  @ApiPropertyOptional({ 
    example: 'Senior Support Specialist',
    description: 'Job title within support team'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  jobTitle?: string;

  @ApiPropertyOptional({ 
    example: ['English', 'Spanish'],
    description: 'Languages the support agent can communicate in',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportLanguages?: string[];

  @ApiPropertyOptional({ 
    example: ['chat', 'email', 'phone'],
    description: 'Support channels this agent can handle',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportChannels?: string[];
}

export class LoginDto {
  @ApiProperty({ 
    example: 'john.doe@mindlyf.com',
    description: 'User email address for login',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    example: 'StrongP@ss123',
    description: 'User password for authentication',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ 
    example: 'web',
    description: 'Device type for tracking sessions (web, mobile, desktop)',
    default: 'web'
  })
  @IsOptional()
  @IsString()
  deviceType?: string = 'web';

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether to remember this device for future logins',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  rememberMe?: boolean = false;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Valid refresh token received from login or previous refresh',
    minLength: 20
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Refresh token must be at least 20 characters' })
  refreshToken: string;

  @ApiPropertyOptional({ 
    example: 'web',
    description: 'Device type for the new session',
    default: 'web'
  })
  @IsOptional()
  @IsString()
  deviceType?: string = 'web';
}

export class ForgotPasswordDto {
  @ApiProperty({ 
    example: 'john.doe@mindlyf.com',
    description: 'Email address to send password reset link to',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiPropertyOptional({ 
    example: 'https://app.mindlyf.com/reset-password',
    description: 'Custom redirect URL after password reset (optional)',
    format: 'uri'
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'Redirect URL must be a valid HTTP/HTTPS URL' })
  redirectUrl?: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset_token_abc123xyz789',
    description: 'Password reset token received via email',
    minLength: 10
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Reset token must be at least 10 characters' })
  token: string;

  @ApiProperty({ 
    example: 'NewStrongP@ss123',
    description: 'New password - must meet security requirements',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  })
  password: string;

  @ApiProperty({ 
    example: 'NewStrongP@ss123',
    description: 'Confirm new password - must match the password field exactly'
  })
  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: 'email_verification_token_abc123',
    description: 'Email verification token received via email',
    minLength: 10
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Verification token must be at least 10 characters' })
  token: string;

  @ApiPropertyOptional({ 
    example: 'https://app.mindlyf.com/dashboard',
    description: 'URL to redirect to after successful verification',
    format: 'uri'
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'Redirect URL must be a valid HTTP/HTTPS URL' })
  redirectUrl?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'CurrentP@ss123',
    description: 'Current password for verification',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Current password must be at least 8 characters' })
  currentPassword: string;

  @ApiProperty({ 
    example: 'NewStrongP@ss123',
    description: 'New password - must meet security requirements and be different from current',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  })
  newPassword: string;

  @ApiProperty({ 
    example: 'NewStrongP@ss123',
    description: 'Confirm new password - must match the newPassword field exactly'
  })
  @IsString()
  @IsNotEmpty()
  newPasswordConfirmation: string;
}
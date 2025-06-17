"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordDto = exports.VerifyEmailDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RefreshTokenDto = exports.LoginDto = exports.SupportTeamUserDto = exports.OrganizationUserDto = exports.TherapistRegisterDto = exports.RegisterDto = exports.CommunicationPreference = exports.PreferredLanguage = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var PreferredLanguage;
(function (PreferredLanguage) {
    PreferredLanguage["ENGLISH"] = "en";
    PreferredLanguage["SPANISH"] = "es";
    PreferredLanguage["FRENCH"] = "fr";
    PreferredLanguage["GERMAN"] = "de";
    PreferredLanguage["ITALIAN"] = "it";
    PreferredLanguage["PORTUGUESE"] = "pt";
    PreferredLanguage["CHINESE"] = "zh";
    PreferredLanguage["JAPANESE"] = "ja";
    PreferredLanguage["KOREAN"] = "ko";
    PreferredLanguage["ARABIC"] = "ar";
})(PreferredLanguage || (exports.PreferredLanguage = PreferredLanguage = {}));
var CommunicationPreference;
(function (CommunicationPreference) {
    CommunicationPreference["EMAIL"] = "email";
    CommunicationPreference["SMS"] = "sms";
    CommunicationPreference["PUSH"] = "push";
    CommunicationPreference["ALL"] = "all";
    CommunicationPreference["NONE"] = "none";
})(CommunicationPreference || (exports.CommunicationPreference = CommunicationPreference = {}));
class RegisterDto {
    email;
    password;
    firstName;
    lastName;
    phoneNumber;
    dateOfBirth;
    guardianEmail;
    guardianPhone;
    preferredLanguage = PreferredLanguage.ENGLISH;
    communicationPreference = CommunicationPreference.EMAIL;
    timezone = 'UTC';
    agreeToTerms = false;
    agreeToPrivacy = false;
    marketingOptIn = false;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'john.doe@mindlyf.com',
        description: 'User email address - must be unique and valid format',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'StrongP@ss123',
        description: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'John',
        description: 'User first name - 2-50 characters, letters and spaces only',
        minLength: 2,
        maxLength: 50
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters' }),
    (0, class_validator_1.Matches)(/^[A-Za-z\s\-']+$/, { message: 'First name can only contain letters, spaces, hyphens and apostrophes' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Doe',
        description: 'User last name - 2-50 characters, letters and spaces only',
        minLength: 2,
        maxLength: 50
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters' }),
    (0, class_validator_1.Matches)(/^[A-Za-z\s\-']+$/, { message: 'Last name can only contain letters, spaces, hyphens and apostrophes' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+1-555-123-4567',
        description: 'Phone number in international format (optional) - E.164 format preferred',
        pattern: '^[\\+]?[1-9][\\d]{0,15}$|^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,20}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, {
        message: 'Please provide a valid phone number (e.g., +1-555-123-4567 or +1234567890)'
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.replace(/\s+/g, '').trim()),
    __metadata("design:type", String)
], RegisterDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '1990-01-15',
        description: 'Date of birth in YYYY-MM-DD format (optional) - Users under 18 require guardian information',
        format: 'date',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Please provide a valid date of birth in YYYY-MM-DD format' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'guardian@example.com',
        description: 'Guardian email address (required for users under 18)',
        format: 'email'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid guardian email address' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], RegisterDto.prototype, "guardianEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+1-555-987-6543',
        description: 'Guardian phone number (required for users under 18)',
        pattern: '^[\\+]?[1-9][\\d]{0,15}$|^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,20}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, {
        message: 'Please provide a valid guardian phone number (e.g., +1-555-123-4567 or +1234567890)'
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.replace(/\s+/g, '').trim()),
    __metadata("design:type", String)
], RegisterDto.prototype, "guardianPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: PreferredLanguage.ENGLISH,
        description: 'Preferred language for communication',
        enum: PreferredLanguage,
        default: PreferredLanguage.ENGLISH
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PreferredLanguage),
    __metadata("design:type", String)
], RegisterDto.prototype, "preferredLanguage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: CommunicationPreference.EMAIL,
        description: 'Preferred method of communication',
        enum: CommunicationPreference,
        default: CommunicationPreference.EMAIL
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CommunicationPreference),
    __metadata("design:type", String)
], RegisterDto.prototype, "communicationPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'America/New_York',
        description: 'User timezone (optional) - IANA timezone identifier',
        default: 'UTC'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: true,
        description: 'Agreement to terms of service (required)',
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "agreeToTerms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: true,
        description: 'Consent to privacy policy (required)',
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "agreeToPrivacy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: false,
        description: 'Opt-in for marketing communications (optional)',
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "marketingOptIn", void 0);
class TherapistRegisterDto extends RegisterDto {
    licenseNumber;
    specialization;
    credentials;
    hourlyRate;
    professionalBio;
    education;
    yearsOfExperience;
    languagesSpoken;
    licenseState;
    licenseExpirationDate;
}
exports.TherapistRegisterDto = TherapistRegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'LIC123456789',
        description: 'Professional license number - must be unique and valid format',
        minLength: 5,
        maxLength: 50
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5, { message: 'License number must be at least 5 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toUpperCase().trim()),
    __metadata("design:type", String)
], TherapistRegisterDto.prototype, "licenseNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Anxiety Disorders', 'Depression', 'PTSD', 'Relationship Counseling'],
        description: 'Areas of specialization - select 1-10 specializations',
        type: [String],
        minItems: 1,
        maxItems: 10
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], TherapistRegisterDto.prototype, "specialization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['PhD in Clinical Psychology', 'Licensed Clinical Social Worker', 'Certified Trauma Specialist'],
        description: 'Professional credentials and certifications',
        type: [String],
        required: false,
        maxItems: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TherapistRegisterDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 150,
        description: 'Hourly rate in USD (1-500)',
        minimum: 1,
        maximum: 500,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Hourly rate must be at least $1' }),
    (0, class_validator_1.Max)(500, { message: 'Hourly rate cannot exceed $500' }),
    __metadata("design:type", Number)
], TherapistRegisterDto.prototype, "hourlyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Dr. John Doe is a licensed clinical psychologist with over 10 years of experience...',
        description: 'Professional bio and background (50-2000 characters)',
        minLength: 50,
        maxLength: 2000,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50, { message: 'Bio must be at least 50 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], TherapistRegisterDto.prototype, "professionalBio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'University of California, Berkeley',
        description: 'Educational institution',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], TherapistRegisterDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12,
        description: 'Years of professional experience',
        minimum: 0,
        maximum: 50,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], TherapistRegisterDto.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['English', 'Spanish', 'French'],
        description: 'Languages spoken by the therapist',
        type: [String],
        maxItems: 10
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TherapistRegisterDto.prototype, "languagesSpoken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'California',
        description: 'State where licensed to practice'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], TherapistRegisterDto.prototype, "licenseState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2025-12-31',
        description: 'License expiration date',
        format: 'date'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TherapistRegisterDto.prototype, "licenseExpirationDate", void 0);
class OrganizationUserDto {
    email;
    firstName;
    lastName;
    organizationId;
    phoneNumber;
    jobTitle;
    department;
}
exports.OrganizationUserDto = OrganizationUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'jane.manager@healthcare.com',
        description: 'Organization user email address',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], OrganizationUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Jane',
        description: 'First name of organization user'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], OrganizationUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Manager',
        description: 'Last name of organization user'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], OrganizationUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID of the organization this user belongs to',
        format: 'uuid'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, { message: 'Organization ID must be a valid UUID' }),
    __metadata("design:type", String)
], OrganizationUserDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+1-555-123-4567',
        description: 'Phone number of organization user',
        pattern: '^[\\+]?[1-9][\\d]{0,15}$|^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,20}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/, {
        message: 'Please provide a valid phone number (e.g., +1-555-123-4567 or +1234567890)'
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.replace(/\s+/g, '').trim()),
    __metadata("design:type", String)
], OrganizationUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Healthcare Administrator',
        description: 'Job title within the organization'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], OrganizationUserDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Operations',
        description: 'Department within the organization'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], OrganizationUserDto.prototype, "department", void 0);
class SupportTeamUserDto extends RegisterDto {
    department;
    jobTitle;
    supportLanguages;
    supportChannels;
}
exports.SupportTeamUserDto = SupportTeamUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Customer Support',
        description: 'Department or team assignment for support staff',
        enum: ['Customer Support', 'Technical Support', 'Billing Support', 'Clinical Support', 'Admin Support']
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], SupportTeamUserDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Senior Support Specialist',
        description: 'Job title within support team'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], SupportTeamUserDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['English', 'Spanish'],
        description: 'Languages the support agent can communicate in',
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SupportTeamUserDto.prototype, "supportLanguages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['chat', 'email', 'phone'],
        description: 'Support channels this agent can handle',
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SupportTeamUserDto.prototype, "supportChannels", void 0);
class LoginDto {
    email;
    password;
    deviceType = 'web';
    rememberMe = false;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'john.doe@mindlyf.com',
        description: 'User email address for login',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'StrongP@ss123',
        description: 'User password for authentication',
        minLength: 8
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'web',
        description: 'Device type for tracking sessions (web, mobile, desktop)',
        default: 'web'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "deviceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: true,
        description: 'Whether to remember this device for future logins',
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], LoginDto.prototype, "rememberMe", void 0);
class RefreshTokenDto {
    refreshToken;
    deviceType = 'web';
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Valid refresh token received from login or previous refresh',
        minLength: 20
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(20, { message: 'Refresh token must be at least 20 characters' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'web',
        description: 'Device type for the new session',
        default: 'web'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "deviceType", void 0);
class ForgotPasswordDto {
    email;
    redirectUrl;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'john.doe@mindlyf.com',
        description: 'Email address to send password reset link to',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://app.mindlyf.com/reset-password',
        description: 'Custom redirect URL after password reset (optional)',
        format: 'uri'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^https?:\/\/.+/, { message: 'Redirect URL must be a valid HTTP/HTTPS URL' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "redirectUrl", void 0);
class ResetPasswordDto {
    token;
    password;
    passwordConfirmation;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'reset_token_abc123xyz789',
        description: 'Password reset token received via email',
        minLength: 10
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(10, { message: 'Reset token must be at least 10 characters' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NewStrongP@ss123',
        description: 'New password - must meet security requirements',
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NewStrongP@ss123',
        description: 'Confirm new password - must match the password field exactly'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "passwordConfirmation", void 0);
class VerifyEmailDto {
    token;
    redirectUrl;
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'email_verification_token_abc123',
        description: 'Email verification token received via email',
        minLength: 10
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(10, { message: 'Verification token must be at least 10 characters' }),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://app.mindlyf.com/dashboard',
        description: 'URL to redirect to after successful verification',
        format: 'uri'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^https?:\/\/.+/, { message: 'Redirect URL must be a valid HTTP/HTTPS URL' }),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "redirectUrl", void 0);
class ChangePasswordDto {
    currentPassword;
    newPassword;
    newPasswordConfirmation;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CurrentP@ss123',
        description: 'Current password for verification',
        minLength: 8
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8, { message: 'Current password must be at least 8 characters' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NewStrongP@ss123',
        description: 'New password - must meet security requirements and be different from current',
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NewStrongP@ss123',
        description: 'Confirm new password - must match the newPassword field exactly'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPasswordConfirmation", void 0);
//# sourceMappingURL=auth.dto.js.map
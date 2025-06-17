import { Controller, Post, Body, HttpCode, HttpStatus, Req, Get, UseGuards, Patch, Headers, Param, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiBody, ApiParam, ApiConsumes, ApiProduces } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ChangePasswordDto, TherapistRegisterDto, OrganizationUserDto, SupportTeamUserDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ServiceTokenGuard } from './guards/service-token.guard';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // Strict rate limiting for registration
  @ApiOperation({ 
    summary: '👤 Register New User',
    description: `
## Registration Flow Overview

**Step 1: Submit Registration Data**
- Provide all required user information (email, password, names)
- Optional: phone number, date of birth, preferences
- **Important**: If user is under 18, guardian information is required

**Step 2: Email Verification**
- System sends verification email to provided address
- User must click verification link to activate account
- Account remains inactive until email is verified

**Step 3: Account Activation**
- After email verification, account becomes active
- User can now login and access the platform

### Age-Based Requirements:
- **Adults (18+)**: Basic information only
- **Minors (<18)**: Guardian email and phone required
- System automatically validates age and enforces guardian requirements

### Data Processing:
- Passwords are encrypted using bcrypt
- Personal data is stored securely with HIPAA compliance
- Email addresses are normalized (lowercase, trimmed)
- Phone numbers are formatted and validated
    `
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'Complete user registration data',
    examples: {
      'Adult User': {
        value: {
          email: 'john.doe@mindlyf.com',
          password: 'StrongP@ss123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1-555-123-4567',
          dateOfBirth: '1990-01-15',
          preferredLanguage: 'en',
          communicationPreference: 'email',
          timezone: 'America/New_York',
          agreeToTerms: true,
          agreeToPrivacy: true,
          marketingOptIn: false
        }
      },
      'Minor User': {
        value: {
          email: 'teen.user@mindlyf.com',
          password: 'SecureP@ss456',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+1-555-987-6543',
          dateOfBirth: '2008-05-20',
          guardianEmail: 'parent@example.com',
          guardianPhone: '+1-555-123-9876',
          preferredLanguage: 'en',
          communicationPreference: 'email',
          agreeToTerms: true,
          agreeToPrivacy: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '✅ User successfully registered - email verification required',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Registration successful. Please check your email to verify your account.' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unique user identifier' },
        email: { type: 'string', example: 'john.doe@mindlyf.com', description: 'Registered email address' },
        verificationRequired: { type: 'boolean', example: true, description: 'Email verification is required' },
        nextSteps: { 
          type: 'array', 
          items: { type: 'string' },
          example: [
            'Check your email for verification link',
            'Click the verification link to activate your account',
            'Return to login page after verification'
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '❌ Validation errors in registration data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array',
          items: { type: 'string' },
          example: [
            'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
            'First name must be at least 2 characters',
            'Guardian email is required for users under 18'
          ]
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: '❌ User already exists with this email address',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Conflict' },
        suggestion: { type: 'string', example: 'Try logging in instead, or use forgot password if needed' }
      }
    }
  })
  @ApiResponse({ 
    status: 429, 
    description: '❌ Too many registration attempts',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'Too many registration attempts. Please try again later.' },
        retryAfter: { type: 'number', example: 60, description: 'Seconds to wait before next attempt' }
      }
    }
  })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.register(registerDto, { ipAddress, userAgent });
  }

  @Post('register/therapist')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '🩺 Register New Therapist',
    description: `
## Therapist Registration Flow

**Step 1: Submit Professional Information**
- All standard user information (email, password, names)
- Professional license number (must be unique)
- Specializations and credentials
- Optional: hourly rate, bio, education details

**Step 2: License Verification Process**
- System validates license number format
- License is flagged for manual verification by admin
- Therapist account created but marked as "pending approval"

**Step 3: Admin Review & Approval**
- Admin team reviews credentials and license
- Background checks may be performed
- Approval or rejection notification sent

**Step 4: Account Activation**
- After admin approval, therapist can access full features
- Can create therapy sessions, set availability
- Listed in therapist directory for client matching

### Required Professional Information:
- **License Number**: Unique professional license identifier
- **Specializations**: Areas of expertise (1-10 specializations)
- **Credentials**: Professional certifications (optional but recommended)

### Optional Enhancement Data:
- **Hourly Rate**: Suggested session pricing ($1-500)
- **Professional Bio**: Detailed background (50-2000 characters)
- **Education**: Educational background
- **Years of Experience**: Professional experience duration
- **Languages**: Languages spoken for client matching
    `
  })
  @ApiBody({ 
    type: TherapistRegisterDto,
    description: 'Complete therapist registration data with professional credentials',
    examples: {
      'Licensed Therapist': {
        value: {
          email: 'dr.sarah.wilson@mindlyf.com',
          password: 'TherapistP@ss123',
          firstName: 'Sarah',
          lastName: 'Wilson',
          phoneNumber: '+1-555-789-0123',
          dateOfBirth: '1985-03-15',
          licenseNumber: 'LIC987654321',
          specialization: [
            'Anxiety Disorders',
            'Depression',
            'Cognitive Behavioral Therapy',
            'Trauma and PTSD'
          ],
          credentials: [
            'PhD in Clinical Psychology',
            'Licensed Clinical Psychologist',
            'Certified Trauma Specialist'
          ],
          hourlyRate: 175,
          professionalBio: 'Dr. Sarah Wilson is a licensed clinical psychologist with over 12 years of experience treating anxiety, depression, and trauma. She specializes in cognitive behavioral therapy and has extensive training in trauma-informed care.',
          education: 'PhD in Clinical Psychology, Harvard University',
          yearsOfExperience: 12,
          languagesSpoken: ['English', 'Spanish'],
          licenseState: 'California',
          licenseExpirationDate: '2025-12-31',
          preferredLanguage: 'en',
          communicationPreference: 'email',
          agreeToTerms: true,
          agreeToPrivacy: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '✅ Therapist registered successfully - pending admin approval',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Therapist registration successful. Your application is under review.' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        email: { type: 'string', example: 'dr.sarah.wilson@mindlyf.com' },
        status: { type: 'string', example: 'pending_approval', description: 'Account status awaiting admin review' },
        licenseNumber: { type: 'string', example: 'LIC987654321' },
        approvalProcess: {
          type: 'object',
          properties: {
            estimatedReviewTime: { type: 'string', example: '2-5 business days' },
            nextSteps: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Admin team will verify your professional license',
                'Background check may be conducted',
                'You will receive approval/rejection notification via email',
                'Check your email for verification link to activate basic account access'
              ]
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '❌ Invalid therapist registration data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array',
          items: { type: 'string' },
          example: [
            'License number must be at least 5 characters',
            'At least one specialization is required',
            'Hourly rate must be between $1 and $500',
            'Professional bio must be at least 50 characters'
          ]
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: '❌ Therapist already exists or license number is taken',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'License number already registered or email already exists' },
        error: { type: 'string', example: 'Conflict' },
        conflictType: { type: 'string', example: 'license_number', enum: ['email', 'license_number'] }
      }
    }
  })
  @ApiResponse({ 
    status: 429, 
    description: '❌ Too many therapist registration attempts',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'Too many therapist registration attempts. Please try again later.' },
        retryAfter: { type: 'number', example: 180, description: 'Seconds to wait before next attempt' }
      }
    }
  })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async registerTherapist(
    @Body() therapistDto: TherapistRegisterDto,
    @Headers('x-forwarded-for') clientIp?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const metadata = { clientIp, userAgent };
    return this.authService.registerTherapist(therapistDto, metadata);
  }

  @Post('register/organization-user')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Register a new organization user (Admin only)' })
  @ApiBody({ type: OrganizationUserDto })
  @ApiResponse({ status: 201, description: 'Organization user registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for admins
  async registerOrganizationUser(
    @Body() orgUserDto: OrganizationUserDto,
    @Headers('x-forwarded-for') clientIp?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const metadata = { clientIp, userAgent };
    // TODO: Get admin user ID from JWT token
    const adminUserId = 'admin-user-id'; // This should come from the authenticated user
    return this.authService.registerOrganizationUser(orgUserDto, adminUserId, metadata);
  }

  @Post('register/support-team')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register a new support team member (Admin only)' })
  @ApiBody({ type: SupportTeamUserDto })
  @ApiResponse({ status: 201, description: 'Support team member registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for admins
  async registerSupportTeam(
    @Body() supportDto: SupportTeamUserDto,
    @Headers('x-forwarded-for') clientIp?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const metadata = { clientIp, userAgent };
    // TODO: Get admin user ID from JWT token
    const adminUserId = 'admin-user-id'; // This should come from the authenticated user
    return this.authService.registerSupportTeam(supportDto, adminUserId, metadata);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify email with token',
    description: 'Verifies a user\'s email address using the token sent to their email. This step is required to activate the account.'
  })
  @ApiBody({ 
    type: VerifyEmailDto,
    description: 'The verification token that was sent to the user\'s email'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email successfully verified',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email verification successful. You can now log in.' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Invalid verification token or token expired' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.verifyEmail(verifyEmailDto, { ipAddress, userAgent });
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // Strict rate limiting for login
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticates a user and provides JWT access and refresh tokens. If MFA is enabled, an MFA verification step will be required.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'User credentials (email and password)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' },
        email: { type: 'string', example: 'user@mindlyf.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: { type: 'string', example: 'user' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        sessionId: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA verification required',
    schema: {
      type: 'object',
      properties: {
        requiresMfa: { type: 'boolean', example: true },
        message: { type: 'string', example: 'MFA verification required' },
        userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' },
        tempToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account not verified' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.login(loginDto, { 
      ipAddress, 
      userAgent,
      deviceInfo: userAgent // simplified, could extract device info from UA
    });
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh JWT token',
    description: 'Gets a new access token using a valid refresh token. This allows extending the user\'s session without requiring re-authentication.'
  })
  @ApiBody({ 
    type: RefreshTokenDto,
    description: 'The refresh token obtained during login or previous refresh'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        sessionId: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token or token expired' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.refreshToken(refreshTokenDto, { ipAddress, userAgent });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Invalidates the user\'s current session, or optionally all sessions. This revokes the refresh token(s).'
  })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Optional session ID to specify which session to terminate. If not provided, all sessions will be terminated.',
    required: false
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiProduces('application/json')
  async logout(
    @Req() req,
    @Headers('x-session-id') sessionId: string,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.logout(req.user.sub, sessionId, { ipAddress, userAgent });
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'Change user password',
    description: 'Allows an authenticated user to change their password. Requires the current password for verification and invalidates all sessions.'
  })
  @ApiBody({ 
    type: ChangePasswordDto,
    description: 'Contains current password for verification and the new password'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password successfully changed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password changed successfully. Please log in again with your new password.' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input - New passwords don\'t match or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized or incorrect current password' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async changePassword(
    @Req() req, 
    @Body() changePasswordDto: ChangePasswordDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDto, { ipAddress, userAgent });
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // Strict rate limiting
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Initiates the password reset process by sending a reset link to the user\'s email'
  })
  @ApiBody({ 
    type: ForgotPasswordDto,
    description: 'Email address for the account that needs password reset'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'If your email is registered, you will receive password reset instructions.' }
      }
    }
  })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.forgotPassword(forgotPasswordDto, { ipAddress, userAgent });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset password with token',
    description: 'Completes the password reset process using the token sent to the user\'s email'
  })
  @ApiBody({ 
    type: ResetPasswordDto,
    description: 'Reset token from email and new password'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password successfully reset',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password has been reset successfully. You can now log in with your new password.' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid token, token expired, or passwords do not match' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.resetPassword(resetPasswordDto, { ipAddress, userAgent });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Returns the profile information of the currently authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user profile',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' },
        email: { type: 'string', example: 'user@mindlyf.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: { type: 'string', example: 'user' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiProduces('application/json')
  async getProfile(@Req() req) {
    return req.user;
  }

  @Post('validate-token')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Validate a JWT token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid and user information is returned',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token is invalid or expired',
  })
  @ApiHeader({
    name: 'X-Service-Name',
    description: 'Name of the service making the request',
    required: true,
  })
  async validateToken(@Body() body: { token: string }) {
    try {
      const payload = this.jwtService.verify(body.token);
      const user = await this.authService.validateUserById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post('validate-service-token')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Validate a service-to-service token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service token is valid',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Service token is invalid',
  })
  @ApiHeader({
    name: 'X-Service-Name',
    description: 'Name of the service making the request',
    required: true,
  })
  async validateServiceToken(
    @Body() body: { serviceName: string; token: string },
    @Headers('X-Service-Name') requestingService: string,
  ) {
    const isValid = await this.authService.validateServiceToken(
      body.serviceName,
      body.token,
      requestingService,
    );

    return { valid: isValid };
  }

  @Post('revoke-token')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Revoke a JWT token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token has been revoked',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid service token',
  })
  @ApiHeader({
    name: 'X-Service-Name',
    description: 'Name of the service making the request',
    required: true,
  })
  async revokeToken(@Body() body: { token: string }) {
    await this.authService.revokeToken(body.token);
    return { message: 'Token revoked successfully' };
  }

  @Get('users/:userId')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Get user information (service-to-service)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiHeader({
    name: 'X-Service-Name',
    description: 'Name of the service making the request',
    required: true,
  })
  async getUserInfo(@Param('userId') userId: string) {
    const user = await this.authService.validateUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  @Get('users/:userId/subscription-status')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Get user subscription status (Service-to-Service)' })
  @ApiHeader({ name: 'X-Service-Name', description: 'Name of the requesting service' })
  @ApiParam({ name: 'userId', description: 'User ID to get subscription status for' })
  @ApiResponse({ 
    status: 200, 
    description: 'User subscription status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' }
          }
        },
        subscription: {
          type: 'object',
          properties: {
            hasActiveSubscription: { type: 'boolean' },
            subscriptions: { type: 'array' },
            userType: { type: 'string' },
            organizationId: { type: 'string', nullable: true },
            canMakePayments: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserSubscriptionStatus(@Param('userId') userId: string) {
    const user = await this.authService.validateUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      subscription: {
        hasActiveSubscription: false, // Auth service no longer handles payments
        subscriptions: [],
        userType: 'individual',
        organizationId: null,
        canMakePayments: true // Always allow - payment service will handle validation
      }
    };
  }

  @Post('users/:userId/payment-notification')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Receive payment notifications from payment service (Service-to-Service)' })
  @ApiHeader({ name: 'X-Service-Name', description: 'Name of the requesting service (should be payment-service)' })
  @ApiParam({ name: 'userId', description: 'User ID for the payment notification' })
  @ApiResponse({ status: 200, description: 'Payment notification processed successfully' })
  async handlePaymentNotification(
    @Param('userId') userId: string,
    @Body() notification: {
      type: 'payment_succeeded' | 'payment_failed' | 'subscription_created' | 'subscription_canceled';
      paymentId?: string;
      subscriptionId?: string;
      amount?: number;
      currency?: string;
      gateway?: string;
      metadata?: Record<string, any>;
    }
  ) {
    // Log the payment notification for audit purposes
    console.log(`Payment notification received for user ${userId}:`, notification);
    
    // Auth service no longer processes payments, just acknowledges the notification
    return { 
      message: 'Payment notification received',
      userId,
      type: notification.type,
      processed: true
    };
  }

  @Post('validate-payment-access')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Validate if user can make payments (Service-to-Service)' })
  @ApiHeader({ name: 'X-Service-Name', description: 'Name of the requesting service (should be payment-service)' })
  @ApiResponse({ status: 200, description: 'Payment access validation result' })
  async validatePaymentAccess(@Body() body: { userId: string; paymentType: string; amount: number }) {
    const user = await this.authService.validateUserById(body.userId);
    
    if (!user) {
      return { canMakePayment: false, reason: 'User not found' };
    }

    if (!user.emailVerified) {
      return { canMakePayment: false, reason: 'Email not verified' };
    }

    if (user.status !== 'active') {
      return { canMakePayment: false, reason: 'Account not active' };
    }

    // All payment validation is now handled by payment service
    // Auth service just checks basic user status
    return { 
      canMakePayment: true,
      userId: body.userId,
      paymentType: body.paymentType,
      amount: body.amount
    };
  }
}
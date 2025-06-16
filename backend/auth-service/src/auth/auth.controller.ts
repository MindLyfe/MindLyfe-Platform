import { Controller, Post, Body, HttpCode, HttpStatus, Req, Get, UseGuards, Patch, Headers, Param, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiBody, ApiParam, ApiConsumes, ApiProduces } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ServiceTokenGuard } from './guards/service-token.guard';
import { JwtService } from '@nestjs/jwt';

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
    summary: 'Register a new user',
    description: 'Creates a new user account in the system. An email verification link will be sent to the provided email address.'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'User registration data including email, password, and personal details'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully created',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Registration successful. Please check your email to verify your account.' },
        userId: { type: 'string', example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input - Validation errors in the registration data' })
  @ApiResponse({ status: 409, description: 'User already exists with this email address' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.authService.register(registerDto, { ipAddress, userAgent });
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
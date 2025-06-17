import { Controller, Post, Body, Get, UseGuards, Req, HttpCode, HttpStatus, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Register adult user (18+) or minor user (<18) with guardian information' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('register/therapist')
  @ApiOperation({ summary: 'Register a new therapist', description: 'Register therapist with license verification' })
  @ApiResponse({ status: 201, description: 'Therapist successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async registerTherapist(@Body() registerDto: any) {
    return this.authService.registerTherapist(registerDto);
  }

  @Public()
  @Post('register/organization-user')
  @ApiOperation({ summary: 'Register organization user', description: 'Register user for healthcare organization' })
  @ApiResponse({ status: 201, description: 'Organization user successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async registerOrganizationUser(@Body() registerDto: any) {
    return this.authService.registerOrganizationUser(registerDto);
  }

  @Public()
  @Post('register/support-team')
  @ApiOperation({ summary: 'Register support team member', description: 'Register support team user' })
  @ApiResponse({ status: 201, description: 'Support team user successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async registerSupportTeam(@Body() registerDto: any) {
    return this.authService.registerSupportTeam(registerDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token', description: 'Get new access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshDto: any) {
    return this.authService.refreshToken(refreshDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset', description: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotDto: any) {
    return this.authService.forgotPassword(forgotDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token', description: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  async resetPassword(@Body() resetDto: any) {
    return this.authService.resetPassword(resetDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address', description: 'Verify email using token from email' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid verification token' })
  async verifyEmail(@Body() verifyDto: any) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Get authenticated user information' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password', description: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(@Req() req: any, @Body() changePasswordDto: any) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout', description: 'Logout user and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @Post('revoke-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token', description: 'Revoke specific refresh token' })
  @ApiResponse({ status: 200, description: 'Token successfully revoked' })
  async revokeToken(@Body() revokeDto: any) {
    return this.authService.revokeToken(revokeDto);
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate JWT token', description: 'Validate if JWT token is valid' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateToken(@Req() req: any) {
    return this.authService.validateToken(req.user);
  }

  @Post('validate-service-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate service token', description: 'Validate service-to-service token' })
  @ApiResponse({ status: 200, description: 'Service token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid service token' })
  async validateServiceToken(@Body() tokenDto: any) {
    return this.authService.validateServiceToken(tokenDto);
  }

  @Post('validate-payment-access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate payment access', description: 'Check if user has payment access' })
  @ApiResponse({ status: 200, description: 'Payment access validated' })
  async validatePaymentAccess(@Req() req: any, @Body() paymentDto: any) {
    return this.authService.validatePaymentAccess(req.user.userId, paymentDto);
  }
} 
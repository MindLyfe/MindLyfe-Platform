import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from '../services/subscriptions.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans', description: 'Get available subscription plans for current user' })
  @ApiResponse({ status: 200, description: 'Available plans retrieved successfully' })
  async getAvailablePlans(@Req() req: any) {
    return this.subscriptionsService.getAvailablePlans(req.user.userId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get user subscription status', description: 'Get current user subscription status and details' })
  @ApiResponse({ status: 200, description: 'Subscription status retrieved successfully' })
  async getUserSubscriptionStatus(@Req() req: any) {
    return this.subscriptionsService.getUserSubscriptionStatus(req.user.userId);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subscription', description: 'Create new subscription for current user' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  async createSubscription(@Req() req: any, @Body() createDto: any) {
    return this.subscriptionsService.createSubscription(createDto, req.user.userId);
  }

  @Post('credits/purchase')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Purchase session credits', description: 'Purchase therapy session credits (1-20 credits allowed)' })
  @ApiResponse({ status: 201, description: 'Credits purchased successfully' })
  @ApiResponse({ status: 400, description: 'Invalid purchase data or credit amount (must be 1-20)' })
  async purchaseCredits(@Req() req: any, @Body() purchaseDto: any) {
    return this.subscriptionsService.purchaseCredits(purchaseDto, req.user.userId);
  }

  @Post('payment/:paymentId/confirm')
  @ApiParam({ name: 'paymentId', description: 'Payment ID to confirm' })
  @ApiOperation({ summary: 'Confirm payment and activate subscription', description: 'Confirm payment and activate associated subscription' })
  @ApiResponse({ status: 200, description: 'Payment confirmed and subscription activated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmPayment(@Param('paymentId') paymentId: string) {
    return this.subscriptionsService.confirmPayment(paymentId);
  }

  // Service-to-service endpoints (for teletherapy integration)
  @Get('validate-booking/:userId')
  @ApiParam({ name: 'userId', description: 'User ID to validate booking for' })
  @ApiOperation({ summary: 'Validate if user can book a session', description: 'Check if user has valid subscription for booking sessions' })
  @ApiResponse({ status: 200, description: 'Booking validation result' })
  async validateUserCanBookSession(@Param('userId') userId: string) {
    return this.subscriptionsService.validateUserCanBookSession(userId);
  }

  @Post('consume-session/:userId')
  @ApiParam({ name: 'userId', description: 'User ID to consume session for' })
  @ApiOperation({ summary: 'Consume a session from user subscription', description: 'Consume one session credit from user subscription' })
  @ApiResponse({ status: 200, description: 'Session consumed successfully' })
  @ApiResponse({ status: 403, description: 'No sessions available or invalid subscription' })
  async consumeSession(@Param('userId') userId: string) {
    return this.subscriptionsService.consumeSession(userId);
  }
} 
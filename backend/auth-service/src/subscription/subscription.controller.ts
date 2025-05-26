import { Controller, Get, Post, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServiceTokenGuard } from '../auth/guards/service-token.guard';
import { SubscriptionService, CreateSubscriptionDto, PurchaseCreditsDto } from './subscription.service';
import { SubscriptionType } from '../entities/subscription.entity';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans for user' })
  @ApiResponse({ status: 200, description: 'Available plans retrieved successfully' })
  async getAvailablePlans(@Request() req) {
    return await this.subscriptionService.getAvailablePlans(req.user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get user subscription status' })
  @ApiResponse({ status: 200, description: 'Subscription status retrieved successfully' })
  async getUserSubscriptionStatus(@Request() req) {
    return await this.subscriptionService.getUserSubscriptionStatus(req.user.id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  async createSubscription(
    @Request() req,
    @Body() createDto: Omit<CreateSubscriptionDto, 'userId'>
  ) {
    const fullDto: CreateSubscriptionDto = {
      ...createDto,
      userId: req.user.id
    };

    return await this.subscriptionService.createSubscription(fullDto);
  }

  @Post('credits/purchase')
  @ApiOperation({ summary: 'Purchase session credits' })
  @ApiResponse({ status: 201, description: 'Credits purchased successfully' })
  @ApiResponse({ status: 400, description: 'Invalid purchase data' })
  async purchaseCredits(
    @Request() req,
    @Body() purchaseDto: Omit<PurchaseCreditsDto, 'userId'>
  ) {
    if (purchaseDto.credits <= 0 || purchaseDto.credits > 20) {
      throw new BadRequestException('Credits must be between 1 and 20');
    }

    const fullDto: PurchaseCreditsDto = {
      ...purchaseDto,
      userId: req.user.id
    };

    return await this.subscriptionService.purchaseCredits(fullDto);
  }

  @Post('payment/:paymentId/confirm')
  @ApiOperation({ summary: 'Confirm payment and activate subscription' })
  @ApiResponse({ status: 200, description: 'Payment confirmed and subscription activated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmPayment(@Param('paymentId') paymentId: string) {
    return await this.subscriptionService.confirmPayment(paymentId);
  }

  @Get('validate-booking/:userId')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Validate if user can book a session (for teletherapy service)' })
  @ApiResponse({ status: 200, description: 'Booking validation result' })
  async validateUserCanBookSession(@Param('userId') userId: string) {
    return await this.subscriptionService.validateUserCanBookSession(userId);
  }

  @Post('consume-session/:userId')
  @UseGuards(ServiceTokenGuard)
  @ApiOperation({ summary: 'Consume a session from user subscription (for teletherapy service)' })
  @ApiResponse({ status: 200, description: 'Session consumed successfully' })
  @ApiResponse({ status: 403, description: 'No sessions available' })
  async consumeSession(@Param('userId') userId: string) {
    return await this.subscriptionService.consumeSession(userId);
  }
} 
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  Res, 
  UseGuards,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ProxyService } from '../services/proxy.service';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly proxyService: ProxyService) {}

  // ==================== PAYMENT INTENT ENDPOINTS ====================

  @Post('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create payment intent',
    description: 'Create a new payment intent for one-time payment'
  })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPayment(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments', req, res);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user payments',
    description: 'Get paginated list of user payments'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by payment status' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPayments(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments', req, res);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get payment details',
    description: 'Get details of a specific payment'
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPayment(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/${id}`, req, res);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Confirm payment',
    description: 'Confirm a payment intent'
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Payment cannot be confirmed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async confirmPayment(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/${id}/confirm`, req, res);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cancel payment',
    description: 'Cancel a pending payment intent'
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment canceled successfully' })
  @ApiResponse({ status: 400, description: 'Payment cannot be canceled' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelPayment(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/${id}/cancel`, req, res);
  }

  // ==================== SUBSCRIPTION ENDPOINTS ====================

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create subscription',
    description: 'Create a new subscription for recurring payments'
  })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSubscription(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/subscriptions', req, res);
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user subscriptions',
    description: 'Get list of user subscriptions'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by subscription status' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscriptions(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/subscriptions', req, res);
  }

  @Get('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get subscription details',
    description: 'Get details of a specific subscription'
  })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscription(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/subscriptions/${id}`, req, res);
  }

  @Patch('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update subscription',
    description: 'Update subscription details (plan, payment method, etc.)'
  })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSubscription(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/subscriptions/${id}`, req, res);
  }

  @Post('subscriptions/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cancel subscription',
    description: 'Cancel an active subscription'
  })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  @ApiResponse({ status: 400, description: 'Subscription cannot be canceled' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelSubscription(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/subscriptions/${id}/cancel`, req, res);
  }

  @Post('subscriptions/:id/resume')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Resume subscription',
    description: 'Resume a canceled subscription'
  })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription resumed successfully' })
  @ApiResponse({ status: 400, description: 'Subscription cannot be resumed' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resumeSubscription(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/subscriptions/${id}/resume`, req, res);
  }

  // ==================== REFUND ENDPOINTS ====================

  @Post('refunds')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create refund',
    description: 'Request a refund for a payment'
  })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createRefund(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/refunds', req, res);
  }

  @Get('refunds')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user refunds',
    description: 'Get list of user refunds'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRefunds(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/refunds', req, res);
  }

  @Get('refunds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get refund details',
    description: 'Get details of a specific refund'
  })
  @ApiParam({ name: 'id', description: 'Refund ID' })
  @ApiResponse({ status: 200, description: 'Refund details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRefund(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/refunds/${id}`, req, res);
  }

  // ==================== CUSTOMER ENDPOINTS ====================

  @Get('customers/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get customer profile',
    description: 'Get current user payment profile'
  })
  @ApiResponse({ status: 200, description: 'Customer profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCustomerProfile(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/customers/profile', req, res);
  }

  @Patch('customers/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update customer profile',
    description: 'Update customer payment profile'
  })
  @ApiResponse({ status: 200, description: 'Customer profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCustomerProfile(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/customers/profile', req, res);
  }

  // ==================== PAYMENT METHODS ENDPOINTS ====================

  @Get('payment-methods')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get payment methods',
    description: 'Get user saved payment methods'
  })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentMethods(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/payment-methods', req, res);
  }

  @Post('payment-methods')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Add payment method',
    description: 'Add a new payment method to customer account'
  })
  @ApiResponse({ status: 201, description: 'Payment method added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment method data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addPaymentMethod(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/payment-methods', req, res);
  }

  @Delete('payment-methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Remove payment method',
    description: 'Remove a saved payment method'
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({ status: 200, description: 'Payment method removed successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removePaymentMethod(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/payment-methods/${id}`, req, res);
  }

  @Patch('payment-methods/:id/default')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Set default payment method',
    description: 'Set a payment method as default'
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({ status: 200, description: 'Default payment method updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setDefaultPaymentMethod(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/payments/payment-methods/${id}/default`, req, res);
  }

  // ==================== CONFIGURATION ENDPOINTS ====================

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get payment configuration',
    description: 'Get payment service configuration'
  })
  @ApiResponse({ status: 200, description: 'Payment configuration retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentConfig(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/config', req, res);
  }

  @Get('currencies')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get supported currencies',
    description: 'Get list of supported currencies'
  })
  @ApiResponse({ status: 200, description: 'Currencies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrencies(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/currencies', req, res);
  }

  @Get('gateways')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get payment gateways',
    description: 'Get available payment gateways'
  })
  @ApiResponse({ status: 200, description: 'Payment gateways retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentGateways(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/gateways', req, res);
  }

  // ==================== CURRENCY CONVERSION ENDPOINTS ====================

  @Get('detect-currency')
  @Public()
  @ApiOperation({ 
    summary: 'Detect user currency',
    description: 'Detect user currency based on location'
  })
  @ApiResponse({ status: 200, description: 'Currency detected successfully' })
  async detectCurrency(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/detect-currency', req, res);
  }

  @Post('convert-currency')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Convert currency',
    description: 'Convert amount between currencies'
  })
  @ApiResponse({ status: 200, description: 'Currency converted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid conversion data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async convertCurrency(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/convert-currency', req, res);
  }

  @Get('exchange-rates')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get exchange rates',
    description: 'Get current exchange rates'
  })
  @ApiQuery({ name: 'base', required: false, description: 'Base currency' })
  @ApiResponse({ status: 200, description: 'Exchange rates retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExchangeRates(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/exchange-rates', req, res);
  }

  // ==================== WEBHOOK ENDPOINTS ====================

  @Post('webhook/stripe')
  @Public()
  @ApiOperation({ 
    summary: 'Stripe webhook',
    description: 'Handle Stripe webhook events'
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/webhook/stripe', req, res);
  }

  @Post('webhook/paypal')
  @Public()
  @ApiOperation({ 
    summary: 'PayPal webhook',
    description: 'Handle PayPal webhook events'
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async paypalWebhook(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/webhook/paypal', req, res);
  }

  // ==================== HEALTH & MONITORING ENDPOINTS ====================

  @Get('health')
  @Public()
  @ApiOperation({ 
    summary: 'Service health check',
    description: 'Check if the payment service is healthy'
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async getHealth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/payments/health', req, res);
  }

  // ==================== PRIVATE HELPER METHOD ====================

  private async proxyToService(path: string, req: Request, res: Response) {
    try {
      const method = req.method;
      const body = req.body;
      const headers = { ...req.headers };
      const params = req.query;

      // Remove gateway-specific headers
      delete headers.host;
      delete headers.connection;
      delete headers['content-length'];

      this.logger.log(`Proxying ${method} ${path} to payment service`);

      const response = await this.proxyService.forwardRequest(
        'payment',
        path,
        method,
        body,
        headers as Record<string, string>,
        params as Record<string, any>
      );

      // Set response headers
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding' && 
            key.toLowerCase() !== 'connection' &&
            key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error('Error proxying to payment service:', error.message);
      throw new HttpException(
        {
          error: 'Service Unavailable',
          message: 'Payment service temporarily unavailable',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
} 
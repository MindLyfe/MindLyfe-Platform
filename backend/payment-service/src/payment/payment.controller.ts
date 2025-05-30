import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PaymentGatewayFactory } from '../services/payment-gateway-factory.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { PaymentGatewayType } from '../enums/payment-gateway.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('payments')
@Controller('api/payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly gatewayFactory: PaymentGatewayFactory,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async createPayment(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(req.user.id, createPaymentDto);
  }

  @Post('subscriptions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createSubscription(@Request() req: any, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.paymentService.createSubscription(req.user.id, createSubscriptionDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPayments(@Request() req: any) {
    return this.paymentService.getPaymentsByUser(req.user.id);
  }

  @Get('subscriptions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async getSubscriptions(@Request() req: any) {
    return this.paymentService.getSubscriptionsByUser(req.user.id);
  }

  @Get('gateways')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get available payment gateways' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available gateways retrieved successfully',
  })
  async getAvailableGateways() {
    const gateways = await this.paymentService.getAvailableGateways();
    return {
      gateways,
      default: 'dpo',
    };
  }

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment configuration for user' })
  @ApiQuery({ name: 'country', required: false, description: 'User country code' })
  @ApiQuery({ name: 'currency', required: false, description: 'Preferred currency' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment configuration retrieved successfully',
  })
  async getPaymentConfig(
    @Req() req: any,
    @Query('country') country?: string,
    @Query('currency') currency?: string,
  ) {
    const userId = req.user.id;
    const userIp = req.ip || req.connection.remoteAddress;
    
    // Get user details from auth service
    const user = await this.paymentService.getUserFromAuthService(userId);
    
    // Detect best gateway and currency
    const bestGateway = await this.paymentService.detectBestGateway(
      country || user?.country,
      currency,
      userIp
    );
    
    // Get gateway configuration
    const gatewayConfig = await this.paymentService.getGatewayConfig(bestGateway.type);
    
    // Get supported currencies for the gateway
    const supportedCurrencies = bestGateway.supportedCurrencies;
    
    // Detect appropriate currency
    let detectedCurrency = currency;
    if (!detectedCurrency && bestGateway.name === 'dpo') {
      detectedCurrency = await (bestGateway as any).detectUserCurrency(
        country || user?.country,
        userIp
      );
    }
    detectedCurrency = detectedCurrency || 'UGX';
    
    return {
      gateway: {
        type: bestGateway.type,
        name: bestGateway.name,
        ...gatewayConfig,
      },
      currency: {
        detected: detectedCurrency,
        supported: supportedCurrencies,
        default: 'UGX',
      },
      location: {
        country: country || user?.country || 'UG',
        ip: userIp,
      },
      user: {
        id: userId,
        country: user?.country,
        email: user?.email,
      },
    };
  }

  @Get('currencies')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get supported currencies' })
  @ApiQuery({ name: 'gateway', required: false, enum: PaymentGatewayType, description: 'Payment gateway type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Supported currencies retrieved successfully',
  })
  async getSupportedCurrencies(@Query('gateway') gateway?: PaymentGatewayType) {
    const currencies = await this.paymentService.getSupportedCurrencies(gateway);
    return {
      currencies,
      gateway: gateway || 'all',
    };
  }

  @Post('detect-currency')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detect appropriate currency for user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'User country code' },
        ip: { type: 'string', description: 'User IP address' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Currency detected successfully',
  })
  async detectCurrency(
    @Req() req: any,
    @Body() body: { country?: string; ip?: string },
  ) {
    const userId = req.user.id;
    const userIp = body.ip || req.ip || req.connection.remoteAddress;
    
    // Get user details from auth service
    const user = await this.paymentService.getUserFromAuthService(userId);
    
    // Detect best gateway
    const bestGateway = await this.paymentService.detectBestGateway(
      body.country || user?.country,
      undefined,
      userIp
    );
    
    // Detect currency
    let detectedCurrency = 'UGX'; // Default
    if (bestGateway.name === 'dpo') {
      detectedCurrency = await (bestGateway as any).detectUserCurrency(
        body.country || user?.country,
        userIp
      );
    }
    
    return {
      currency: detectedCurrency,
      gateway: bestGateway.type,
      country: body.country || user?.country || 'UG',
      supported_currencies: bestGateway.supportedCurrencies,
    };
  }

  @Post('convert-currency')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Convert currency amount' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Amount to convert' },
        fromCurrency: { type: 'string', description: 'Source currency code' },
        toCurrency: { type: 'string', description: 'Target currency code' },
      },
      required: ['amount', 'fromCurrency', 'toCurrency'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Currency converted successfully',
  })
  async convertCurrency(
    @Body() body: { amount: number; fromCurrency: string; toCurrency: string },
  ) {
    const result = await this.paymentService.convertCurrency(
      body.amount,
      body.fromCurrency,
      body.toCurrency
    );
    
    return {
      ...result,
      formatted: {
        original: this.paymentService.formatCurrency(body.amount, body.fromCurrency),
        converted: this.paymentService.formatCurrency(result.convertedAmount, body.toCurrency),
      },
    };
  }

  @Get('exchange-rates')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get exchange rates for a base currency' })
  @ApiQuery({ name: 'base', required: true, description: 'Base currency code' })
  @ApiQuery({ name: 'targets', required: false, description: 'Comma-separated target currencies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exchange rates retrieved successfully',
  })
  async getExchangeRates(
    @Query('base') baseCurrency: string,
    @Query('targets') targets?: string,
  ) {
    const targetCurrencies = targets ? targets.split(',') : undefined;
    const rates = await this.paymentService.getExchangeRates(baseCurrency, targetCurrencies);
    
    return {
      baseCurrency,
      rates,
      timestamp: new Date(),
    };
  }

  @Get('payment-methods/:country')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get available payment methods for a country' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment methods retrieved successfully',
  })
  async getPaymentMethodsForCountry(@Param('country') country: string) {
    return this.paymentService.getPaymentMethodsForCountry(country.toUpperCase());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  async getPayment(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.getPaymentById(id, req.user.id);
  }

  @Get('subscriptions/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  async getSubscription(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.getSubscriptionById(id, req.user.id);
  }

  @Delete('subscriptions/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  async cancelSubscription(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.cancelSubscription(id, req.user.id);
  }

  @Post(':id/refund')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  async refundPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { amount?: number },
  ) {
    return this.paymentService.refundPayment(id, req.user.id, body.amount);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle payment gateway webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ) {
    // Determine gateway type from headers
    const gatewayType = this.gatewayFactory.getGatewayTypeFromWebhook(headers);
    
    // Get the appropriate gateway
    const gateway = this.gatewayFactory.getGateway(gatewayType);
    
    // Get the webhook signature for this gateway
    let webhookSignature: string;
    switch (gatewayType) {
      case PaymentGatewayType.STRIPE:
        webhookSignature = headers['stripe-signature'];
        break;
      case PaymentGatewayType.PAYPAL:
        webhookSignature = headers['paypal-transmission-sig'];
        break;
      case PaymentGatewayType.DPO:
        webhookSignature = headers['x-dpo-signature'] || '';
        break;
      default:
        webhookSignature = '';
    }

    // Verify webhook signature if supported by gateway
    if (webhookSignature && gateway.verifyWebhook) {
      const isValid = await gateway.verifyWebhook(req.rawBody, webhookSignature);
      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    // Parse webhook payload
    let event;
    try {
      event = JSON.parse(req.rawBody.toString());
    } catch (error) {
      throw new BadRequestException('Invalid webhook payload');
    }
    
    // Process the webhook
    await this.paymentService.handleWebhook(event, gatewayType);
    
    return { received: true };
  }

  // Legacy endpoint for backward compatibility
  @Get('config/publishable-key')
  @ApiOperation({ summary: 'Get default gateway publishable key (legacy)' })
  @ApiResponse({ status: 200, description: 'Publishable key retrieved successfully' })
  async getPublishableKey() {
    const config = await this.paymentService.getGatewayConfig();
    return {
      publishableKey: config.publishableKey,
      gateway: config.type,
    };
  }
} 
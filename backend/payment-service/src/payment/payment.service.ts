import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { PaymentGatewayFactory } from '../services/payment-gateway-factory.service';
import { CurrencyConverterService } from '../services/currency-converter.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { PaymentGatewayType } from '../enums/payment-gateway.enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly gatewayFactory: PaymentGatewayFactory,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly currencyConverterService: CurrencyConverterService,
  ) {}

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      // Validate payment access with auth service
      const canMakePayment = await this.validatePaymentAccess(userId, createPaymentDto.type, createPaymentDto.amount);
      if (!canMakePayment) {
        throw new BadRequestException('User is not authorized to make this payment');
      }

      // Get user details from auth service
      const user = await this.getUserFromAuthService(userId);
      
      // Detect best gateway based on user location and DPO support
      let gateway;
      let currency = createPaymentDto.currency;
      
      if (createPaymentDto.gateway) {
        // User specified a gateway
        gateway = this.gatewayFactory.getGateway(createPaymentDto.gateway);
      } else {
        // Auto-detect based on user location and DPO support
        const userCountry = user?.country || createPaymentDto.metadata?.userCountry;
        
        // Check if DPO supports the user's country
        const dpoGateway = this.gatewayFactory.getGateway(PaymentGatewayType.DPO);
        const isDpoSupported = userCountry && (dpoGateway as any).isCountrySupported(userCountry);
        
        if (isDpoSupported) {
          gateway = dpoGateway;
          this.logger.log(`Using DPO Pay for user from ${userCountry} (supported country)`);
          
          // Auto-detect currency for DPO-supported countries
          if (!currency) {
            currency = await (dpoGateway as any).detectUserCurrency(
              userCountry,
              createPaymentDto.metadata?.userIp
            );
          }
        } else {
          // Use Stripe for non-DPO countries
          gateway = this.gatewayFactory.getGateway(PaymentGatewayType.STRIPE);
          this.logger.log(`Using Stripe for user from ${userCountry || 'unknown country'} (DPO not supported)`);
          
          // Default to USD for Stripe if no currency specified
          currency = currency || 'USD';
        }
      }

      // Validate currency is supported by selected gateway
      if (!gateway.supportedCurrencies.includes(currency.toUpperCase())) {
        throw new BadRequestException(`Currency ${currency} is not supported by ${gateway.name}`);
      }

      // Create or get gateway customer
      let gatewayCustomerId = null;
      try {
        const customerData = {
          email: user?.email || createPaymentDto.metadata?.customerEmail,
          name: user?.name || `${createPaymentDto.metadata?.customerFirstName} ${createPaymentDto.metadata?.customerLastName}`.trim(),
          phone: user?.phone || createPaymentDto.metadata?.customerPhone,
          country: user?.country || createPaymentDto.metadata?.userCountry,
          metadata: {
            userId,
            platform: 'MindLyf',
            ...createPaymentDto.metadata,
          },
        };
        
        const customer = await gateway.createCustomer(customerData);
        gatewayCustomerId = customer.id;
      } catch (error) {
        this.logger.warn(`Failed to create gateway customer: ${error.message}`);
      }

      // Create payment intent with enhanced metadata
      const paymentData = {
        amount: createPaymentDto.amount,
        currency: currency,
        description: createPaymentDto.description || `MindLyf ${createPaymentDto.type} payment`,
        metadata: {
          userId,
          type: createPaymentDto.type,
          userCountry: user?.country || createPaymentDto.metadata?.userCountry,
          userIp: createPaymentDto.metadata?.userIp,
          customerEmail: user?.email || createPaymentDto.metadata?.customerEmail,
          customerFirstName: user?.firstName || createPaymentDto.metadata?.customerFirstName,
          customerLastName: user?.lastName || createPaymentDto.metadata?.customerLastName,
          customerPhone: user?.phone || createPaymentDto.metadata?.customerPhone,
          orderId: `mindlyf_${createPaymentDto.type}_${Date.now()}`,
          redirectUrl: createPaymentDto.metadata?.redirectUrl || this.configService.get<string>('dpo.redirectUrl'),
          backUrl: createPaymentDto.metadata?.backUrl || this.configService.get<string>('dpo.backUrl'),
          ...createPaymentDto.metadata,
        },
      };

      const paymentIntent = await gateway.createPaymentIntent(paymentData);

      // Create payment record
      const payment = this.paymentRepository.create({
        userId,
        gateway: gateway.type,
        gatewayPaymentId: paymentIntent.id,
        gatewayCustomerId,
        amount: createPaymentDto.amount,
        currency: currency,
        status: PaymentStatus.PENDING,
        type: createPaymentDto.type,
        description: createPaymentDto.description,
        metadata: {
          gateway_response: paymentIntent,
          user_location: {
            country: user?.country || createPaymentDto.metadata?.userCountry,
            detected_currency: currency,
            ip: createPaymentDto.metadata?.userIp,
          },
          ...createPaymentDto.metadata,
        },
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Send notification
      await this.sendNotification(userId, 'payment_created', {
        paymentId: savedPayment.id,
        amount: savedPayment.amount,
        currency: savedPayment.currency,
        gateway: gateway.name,
        payment_url: paymentIntent.payment_url || paymentIntent.client_secret,
      });

      // Notify auth service about payment creation
      await this.notifyAuthService(userId, {
        type: 'payment_created',
        paymentId: savedPayment.id,
        amount: savedPayment.amount,
        currency: savedPayment.currency,
        gateway: gateway.name,
      });

      return savedPayment;
    } catch (error) {
      this.logger.error(`Payment creation failed: ${error.message}`);
      throw new BadRequestException(`Failed to create payment: ${error.message}`);
    }
  }

  async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    try {
      // Validate subscription access with auth service
      const canMakePayment = await this.validatePaymentAccess(userId, PaymentType.SUBSCRIPTION, 0);
      if (!canMakePayment) {
        throw new BadRequestException('User is not authorized to create subscriptions');
      }

      // Get user details from auth service
      const user = await this.getUserFromAuthService(userId);
      
      // Get the appropriate payment gateway
      const gateway = createSubscriptionDto.gateway 
        ? this.gatewayFactory.getGateway(createSubscriptionDto.gateway)
        : this.gatewayFactory.getDefaultGateway();

      // Create or get gateway customer
      let gatewayCustomerId = createSubscriptionDto.customerId;
      if (!gatewayCustomerId) {
        const customer = await gateway.createCustomer({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId }
        });
        gatewayCustomerId = customer.id;
      }

      // Create gateway subscription
      const gatewaySubscription = await gateway.createSubscription({
        customerId: gatewayCustomerId,
        priceId: createSubscriptionDto.priceId,
        trialPeriodDays: createSubscriptionDto.trialPeriodDays,
        metadata: {
          userId,
          plan: createSubscriptionDto.plan,
          ...createSubscriptionDto.metadata,
        }
      });

      // Save subscription to database
      const subscription = this.subscriptionRepository.create({
        userId,
        gatewaySubscriptionId: gatewaySubscription.id,
        gatewayCustomerId,
        gatewayPriceId: createSubscriptionDto.priceId,
        gateway: createSubscriptionDto.gateway || PaymentGatewayType.STRIPE,
        plan: createSubscriptionDto.plan,
        status: SubscriptionStatus.INACTIVE,
        amount: gatewaySubscription.amount,
        currency: gatewaySubscription.currency,
        billingCycle: createSubscriptionDto.billingCycle || 'monthly',
        currentPeriodStart: gatewaySubscription.currentPeriodStart,
        currentPeriodEnd: gatewaySubscription.currentPeriodEnd,
        trialStart: gatewaySubscription.trialStart,
        trialEnd: gatewaySubscription.trialEnd,
        metadata: createSubscriptionDto.metadata,
        // Legacy fields for backward compatibility
        stripeSubscriptionId: gateway.name === 'stripe' ? gatewaySubscription.id : null,
        stripeCustomerId: gateway.name === 'stripe' ? gatewayCustomerId : null,
        stripePriceId: gateway.name === 'stripe' ? createSubscriptionDto.priceId : null,
      });

      const savedSubscription = await this.subscriptionRepository.save(subscription);

      // Send notification
      await this.sendNotification(userId, 'subscription_created', {
        subscriptionId: savedSubscription.id,
        plan: createSubscriptionDto.plan,
        gateway: gateway.name,
      });

      // Notify auth service about subscription creation
      await this.notifyAuthService(userId, {
        type: 'subscription_created',
        subscriptionId: savedSubscription.id,
        plan: createSubscriptionDto.plan,
        gateway: gateway.name,
        metadata: createSubscriptionDto.metadata,
      });

      return savedSubscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getSubscriptionById(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async cancelSubscription(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id, userId);

    try {
      // Get the appropriate gateway
      const gateway = this.gatewayFactory.getGatewayBySubscriptionId(subscription.gatewaySubscriptionId);

      // Cancel in gateway
      await gateway.cancelSubscription(subscription.gatewaySubscriptionId);

      // Update in database
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      
      const updatedSubscription = await this.subscriptionRepository.save(subscription);

      // Send notification
      await this.sendNotification(userId, 'subscription_canceled', {
        subscriptionId: subscription.id,
        plan: subscription.plan,
        gateway: gateway.name,
      });

      // Notify auth service about subscription cancellation
      await this.notifyAuthService(userId, {
        type: 'subscription_canceled',
        subscriptionId: subscription.id,
        plan: subscription.plan,
        gateway: gateway.name,
      });

      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async refundPayment(id: string, userId: string, amount?: number): Promise<Payment> {
    const payment = await this.getPaymentById(id, userId);

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Payment cannot be refunded');
    }

    try {
      // Get the appropriate gateway
      const gateway = this.gatewayFactory.getGatewayByPaymentIntentId(payment.gatewayPaymentId);

      // Create refund in gateway
      const refund = await gateway.createRefund({
        paymentIntentId: payment.gatewayPaymentId,
        amount,
        reason: 'requested_by_customer'
      });

      // Update payment in database
      const refundAmount = refund.amount;
      payment.refundedAmount = Number(payment.refundedAmount) + refundAmount;
      
      if (payment.refundedAmount >= payment.amount) {
        payment.status = PaymentStatus.REFUNDED;
      } else {
        payment.status = PaymentStatus.PARTIALLY_REFUNDED;
      }

      const updatedPayment = await this.paymentRepository.save(payment);

      // Send notification
      await this.sendNotification(userId, 'payment_refunded', {
        paymentId: payment.id,
        refundAmount,
        currency: payment.currency,
        gateway: gateway.name,
      });

      return updatedPayment;
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      throw new BadRequestException('Failed to refund payment');
    }
  }

  async handleWebhook(event: any, gatewayType: PaymentGatewayType): Promise<void> {
    this.logger.log(`Handling ${gatewayType} webhook event: ${event.type}`);

    // Get the appropriate gateway
    const gateway = this.gatewayFactory.getGateway(gatewayType);

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'PAYMENT.CAPTURE.COMPLETED': // PayPal equivalent
        await this.handlePaymentSucceeded(event.data.object, gateway.name);
        break;
      case 'payment_intent.payment_failed':
      case 'PAYMENT.CAPTURE.DENIED': // PayPal equivalent
        await this.handlePaymentFailed(event.data.object, gateway.name);
        break;
      case 'invoice.payment_succeeded':
      case 'BILLING.SUBSCRIPTION.ACTIVATED': // PayPal equivalent
        await this.handleSubscriptionPaymentSucceeded(event.data.object, gateway.name);
        break;
      case 'customer.subscription.updated':
      case 'BILLING.SUBSCRIPTION.UPDATED': // PayPal equivalent
        await this.handleSubscriptionUpdated(event.data.object, gateway.name);
        break;
      case 'customer.subscription.deleted':
      case 'BILLING.SUBSCRIPTION.CANCELLED': // PayPal equivalent
        await this.handleSubscriptionDeleted(event.data.object, gateway.name);
        break;
      default:
        this.logger.log(`Unhandled ${gatewayType} webhook event type: ${event.type}`);
    }
  }

  /**
   * Get user information from auth service
   */
  async getUserFromAuthService(userId: string): Promise<any> {
    try {
      const serviceToken = this.configService.get<string>('services.auth.serviceToken');
      const authServiceUrl = this.configService.get<string>('services.auth.url');

      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/auth/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${serviceToken}`,
            'X-Service-Name': 'payment-service',
          },
        })
      );

      return response.data.user;
    } catch (error) {
      this.logger.error(`Failed to get user from auth service: ${error.message}`);
      return null;
    }
  }

  /**
   * Detect best gateway for user based on location and currency
   */
  async detectBestGateway(userCountry?: string, userCurrency?: string, userIp?: string): Promise<any> {
    return this.gatewayFactory.detectBestGateway(userCountry, userCurrency, userIp);
  }

  /**
   * Get gateway configuration
   */
  async getGatewayConfig(gatewayType?: PaymentGatewayType): Promise<any> {
    return this.gatewayFactory.getGatewayConfig(gatewayType);
  }

  /**
   * Get supported currencies for a gateway
   */
  async getSupportedCurrencies(gatewayType?: PaymentGatewayType): Promise<string[]> {
    if (gatewayType) {
      return this.gatewayFactory.getSupportedCurrencies(gatewayType);
    }
    
    // Return all supported currencies across all gateways
    const allCurrencies = new Set<string>();
    const gateways = await this.gatewayFactory.getAvailableGateways();
    
    for (const gateway of gateways) {
      const currencies = this.gatewayFactory.getSupportedCurrencies(gateway.type);
      currencies.forEach(currency => allCurrencies.add(currency));
    }
    
    return Array.from(allCurrencies).sort();
  }

  /**
   * Get available payment gateways
   */
  async getAvailableGateways(): Promise<any[]> {
    return this.gatewayFactory.getAvailableGateways();
  }

  /**
   * Convert currency amount
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<any> {
    return this.currencyConverterService.convertCurrency(amount, fromCurrency, toCurrency);
  }

  /**
   * Get exchange rates for a base currency
   */
  async getExchangeRates(baseCurrency: string, targetCurrencies?: string[]): Promise<any> {
    const currencies = targetCurrencies || this.currencyConverterService.getSupportedCurrencies();
    return this.currencyConverterService.getExchangeRates(baseCurrency, currencies);
  }

  /**
   * Format currency amount with proper symbols
   */
  formatCurrency(amount: number, currency: string): string {
    return this.currencyConverterService.formatCurrency(amount, currency);
  }

  /**
   * Get payment methods available for a country
   */
  async getPaymentMethodsForCountry(countryCode: string): Promise<any> {
    const dpoGateway = this.gatewayFactory.getGateway(PaymentGatewayType.DPO);
    const isDpoSupported = (dpoGateway as any).isCountrySupported(countryCode);
    
    if (isDpoSupported) {
      const paymentMethods = (dpoGateway as any).getPaymentMethodsForCountry(countryCode);
      const mobileNetworks = (dpoGateway as any).getMobileNetworksForCountry(countryCode);
      
      return {
        gateway: 'dpo',
        supported: true,
        paymentMethods,
        mobileNetworks,
        country: countryCode,
      };
    } else {
      return {
        gateway: 'stripe',
        supported: false,
        paymentMethods: ['CC'], // Credit cards only for Stripe
        mobileNetworks: [],
        country: countryCode,
      };
    }
  }

  private async handlePaymentSucceeded(paymentObject: any, gatewayName: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { gatewayPaymentId: paymentObject.id },
    });

    if (payment) {
      payment.status = PaymentStatus.SUCCEEDED;
      payment.processedAt = new Date();
      await this.paymentRepository.save(payment);

      await this.sendNotification(payment.userId, 'payment_succeeded', {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        gateway: gatewayName,
      });

      // Notify auth service about successful payment
      await this.notifyAuthService(payment.userId, {
        type: 'payment_succeeded',
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        gateway: gatewayName,
      });
    }
  }

  private async handlePaymentFailed(paymentObject: any, gatewayName: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { gatewayPaymentId: paymentObject.id },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = paymentObject.last_payment_error?.message || 'Payment failed';
      await this.paymentRepository.save(payment);

      await this.sendNotification(payment.userId, 'payment_failed', {
        paymentId: payment.id,
        reason: payment.failureReason,
        gateway: gatewayName,
      });

      // Notify auth service about failed payment
      await this.notifyAuthService(payment.userId, {
        type: 'payment_failed',
        paymentId: payment.id,
        reason: payment.failureReason,
        gateway: gatewayName,
      });
    }
  }

  private async handleSubscriptionPaymentSucceeded(invoiceObject: any, gatewayName: string): Promise<void> {
    const subscriptionId = invoiceObject.subscription || invoiceObject.billing_agreement_id;
    const subscription = await this.subscriptionRepository.findOne({
      where: { gatewaySubscriptionId: subscriptionId },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.ACTIVE;
      await this.subscriptionRepository.save(subscription);

      await this.sendNotification(subscription.userId, 'subscription_payment_succeeded', {
        subscriptionId: subscription.id,
        plan: subscription.plan,
        gateway: gatewayName,
      });

      // Notify auth service about subscription activation
      await this.notifyAuthService(subscription.userId, {
        type: 'subscription_activated',
        subscriptionId: subscription.id,
        plan: subscription.plan,
        gateway: gatewayName,
      });
    }
  }

  private async handleSubscriptionUpdated(subscriptionObject: any, gatewayName: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { gatewaySubscriptionId: subscriptionObject.id },
    });

    if (subscription) {
      subscription.status = this.mapGatewayStatusToLocal(subscriptionObject.status, gatewayName);
      
      if (subscriptionObject.current_period_start) {
        subscription.currentPeriodStart = new Date(subscriptionObject.current_period_start * 1000);
      }
      if (subscriptionObject.current_period_end) {
        subscription.currentPeriodEnd = new Date(subscriptionObject.current_period_end * 1000);
      }
      if (subscriptionObject.canceled_at) {
        subscription.canceledAt = new Date(subscriptionObject.canceled_at * 1000);
      }
      if (subscriptionObject.ended_at) {
        subscription.endedAt = new Date(subscriptionObject.ended_at * 1000);
      }

      await this.subscriptionRepository.save(subscription);
    }
  }

  private async handleSubscriptionDeleted(subscriptionObject: any, gatewayName: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { gatewaySubscriptionId: subscriptionObject.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.endedAt = new Date();
      await this.subscriptionRepository.save(subscription);

      await this.sendNotification(subscription.userId, 'subscription_ended', {
        subscriptionId: subscription.id,
        plan: subscription.plan,
        gateway: gatewayName,
      });

      // Notify auth service about subscription deletion
      await this.notifyAuthService(subscription.userId, {
        type: 'subscription_ended',
        subscriptionId: subscription.id,
        plan: subscription.plan,
        gateway: gatewayName,
      });
    }
  }

  private mapGatewayStatusToLocal(gatewayStatus: string, gatewayName: string): SubscriptionStatus {
    // Map different gateway statuses to our local enum
    switch (gatewayName) {
      case 'stripe':
        switch (gatewayStatus) {
          case 'active':
            return SubscriptionStatus.ACTIVE;
          case 'canceled':
            return SubscriptionStatus.CANCELED;
          case 'past_due':
            return SubscriptionStatus.PAST_DUE;
          case 'unpaid':
            return SubscriptionStatus.UNPAID;
          case 'trialing':
            return SubscriptionStatus.TRIALING;
          default:
            return SubscriptionStatus.INACTIVE;
        }
      case 'paypal':
        switch (gatewayStatus) {
          case 'ACTIVE':
            return SubscriptionStatus.ACTIVE;
          case 'CANCELLED':
            return SubscriptionStatus.CANCELED;
          case 'SUSPENDED':
            return SubscriptionStatus.PAST_DUE;
          default:
            return SubscriptionStatus.INACTIVE;
        }
      default:
        return SubscriptionStatus.INACTIVE;
    }
  }

  private async sendNotification(userId: string, type: string, data: any): Promise<void> {
    try {
      const notificationServiceUrl = this.configService.get<string>('services.notification.url');
      const serviceToken = this.configService.get<string>('services.auth.serviceToken');

      await firstValueFrom(
        this.httpService.post(
          `${notificationServiceUrl}/api/notification`,
          {
            userId,
            type,
            data,
          },
          {
            headers: {
              'Authorization': `Bearer ${serviceToken}`,
              'X-Service-Name': 'payment-service',
            },
          }
        )
      );
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      // Don't throw error as notification failure shouldn't break the main flow
    }
  }

  private async validatePaymentAccess(userId: string, type: PaymentType, amount: number): Promise<boolean> {
    try {
      const serviceToken = this.configService.get<string>('services.auth.serviceToken');
      const authServiceUrl = this.configService.get<string>('services.auth.url');

      const response = await firstValueFrom(
        this.httpService.post(`${authServiceUrl}/auth/validate-payment-access`, {
          userId,
          paymentType: type,
          amount,
        }, {
          headers: {
            'Authorization': `Bearer ${serviceToken}`,
            'X-Service-Name': 'payment-service',
          },
        })
      );

      return response.data.canMakePayment;
    } catch (error) {
      this.logger.error(`Failed to validate payment access: ${error.message}`);
      // Default to allowing payment if auth service is unavailable
      return true;
    }
  }

  private async notifyAuthService(userId: string, notification: any): Promise<void> {
    try {
      const serviceToken = this.configService.get<string>('services.auth.serviceToken');
      const authServiceUrl = this.configService.get<string>('services.auth.url');

      await firstValueFrom(
        this.httpService.post(`${authServiceUrl}/auth/users/${userId}/payment-notification`, notification, {
          headers: {
            'Authorization': `Bearer ${serviceToken}`,
            'X-Service-Name': 'payment-service',
          },
        })
      );

      this.logger.log(`Payment notification sent to auth service for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to notify auth service: ${error.message}`);
      // Don't throw error as auth notification failure shouldn't break the main flow
    }
  }
} 
} 
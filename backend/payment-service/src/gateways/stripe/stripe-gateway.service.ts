import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentGatewayProvider,
  PaymentGatewayCustomer,
  PaymentGatewayPaymentIntent,
  PaymentGatewaySubscription,
  PaymentGatewayRefund,
  PaymentGatewayWebhookEvent,
  CreateCustomerParams,
  CreatePaymentIntentParams,
  CreateSubscriptionParams,
  CreateRefundParams,
} from '../../interfaces/payment-gateway.interface';

@Injectable()
export class StripeGatewayService extends PaymentGatewayProvider {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeGatewayService.name);
  private readonly stripe: Stripe;
  private readonly publishableKey: string;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    super();
    
    const secretKey = this.configService.get<string>('stripe.secretKey');
    this.publishableKey = this.configService.get<string>('stripe.publishableKey');
    this.webhookSecret = this.configService.get<string>('stripe.webhookSecret');

    if (!secretKey) {
      throw new Error('Stripe secret key is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  isConfigured(): boolean {
    return !!(
      this.configService.get<string>('stripe.secretKey') &&
      this.configService.get<string>('stripe.publishableKey')
    );
  }

  getPublishableKey(): string {
    return this.publishableKey;
  }

  async createCustomer(params: CreateCustomerParams): Promise<PaymentGatewayCustomer> {
    try {
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: params.metadata,
      });

      return this.mapStripeCustomer(customer);
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw new BadRequestException('Failed to create customer');
    }
  }

  async getCustomer(customerId: string): Promise<PaymentGatewayCustomer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return this.mapStripeCustomer(customer as Stripe.Customer);
    } catch (error) {
      this.logger.error(`Failed to get customer: ${error.message}`);
      throw new BadRequestException('Failed to get customer');
    }
  }

  async updateCustomer(customerId: string, params: Partial<CreateCustomerParams>): Promise<PaymentGatewayCustomer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        email: params.email,
        name: params.name,
        metadata: params.metadata,
      });

      return this.mapStripeCustomer(customer);
    } catch (error) {
      this.logger.error(`Failed to update customer: ${error.message}`);
      throw new BadRequestException('Failed to update customer');
    }
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentGatewayPaymentIntent> {
    try {
      const stripeParams: Stripe.PaymentIntentCreateParams = {
        amount: params.amount,
        currency: params.currency,
        metadata: params.metadata,
        description: params.description,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (params.customerId) {
        stripeParams.customer = params.customerId;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(stripeParams);
      return this.mapStripePaymentIntent(paymentIntent);
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentGatewayPaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return this.mapStripePaymentIntent(paymentIntent);
    } catch (error) {
      this.logger.error(`Failed to confirm payment intent: ${error.message}`);
      throw new BadRequestException('Failed to confirm payment intent');
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentGatewayPaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      return this.mapStripePaymentIntent(paymentIntent);
    } catch (error) {
      this.logger.error(`Failed to cancel payment intent: ${error.message}`);
      throw new BadRequestException('Failed to cancel payment intent');
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentGatewayPaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return this.mapStripePaymentIntent(paymentIntent);
    } catch (error) {
      this.logger.error(`Failed to get payment intent: ${error.message}`);
      throw new BadRequestException('Failed to get payment intent');
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<PaymentGatewaySubscription> {
    try {
      const stripeParams: Stripe.SubscriptionCreateParams = {
        customer: params.customerId,
        items: [{ price: params.priceId }],
        metadata: params.metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      };

      if (params.trialPeriodDays) {
        stripeParams.trial_period_days = params.trialPeriodDays;
      }

      const subscription = await this.stripe.subscriptions.create(stripeParams);
      return this.mapStripeSubscription(subscription);
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<PaymentGatewaySubscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      return this.mapStripeSubscription(subscription);
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async getSubscription(subscriptionId: string): Promise<PaymentGatewaySubscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return this.mapStripeSubscription(subscription);
    } catch (error) {
      this.logger.error(`Failed to get subscription: ${error.message}`);
      throw new BadRequestException('Failed to get subscription');
    }
  }

  async createRefund(params: CreateRefundParams): Promise<PaymentGatewayRefund> {
    try {
      const stripeParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
        reason: params.reason as Stripe.RefundCreateParams.Reason,
      };

      if (params.amount) {
        stripeParams.amount = params.amount;
      }

      const refund = await this.stripe.refunds.create(stripeParams);
      return this.mapStripeRefund(refund);
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new BadRequestException('Failed to create refund');
    }
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string, secret: string): Promise<PaymentGatewayWebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret || this.webhookSecret);
      return this.mapStripeWebhookEvent(event);
    } catch (error) {
      this.logger.error(`Failed to construct webhook event: ${error.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  validateWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(payload, signature, secret || this.webhookSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Mapping methods to convert Stripe objects to gateway interfaces
  private mapStripeCustomer(customer: Stripe.Customer): PaymentGatewayCustomer {
    return {
      id: customer.id,
      email: customer.email || '',
      name: customer.name || undefined,
      metadata: customer.metadata,
    };
  }

  private mapStripePaymentIntent(paymentIntent: Stripe.PaymentIntent): PaymentGatewayPaymentIntent {
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      customerId: paymentIntent.customer as string || undefined,
      clientSecret: paymentIntent.client_secret || undefined,
      metadata: paymentIntent.metadata,
    };
  }

  private mapStripeSubscription(subscription: Stripe.Subscription): PaymentGatewaySubscription {
    const priceId = subscription.items.data[0]?.price?.id || '';
    const amount = subscription.items.data[0]?.price?.unit_amount || 0;
    const currency = subscription.items.data[0]?.price?.currency || 'usd';

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      priceId,
      status: subscription.status,
      amount,
      currency,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
      endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : undefined,
      metadata: subscription.metadata,
    };
  }

  private mapStripeRefund(refund: Stripe.Refund): PaymentGatewayRefund {
    return {
      id: refund.id,
      paymentIntentId: refund.payment_intent as string,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason || undefined,
    };
  }

  private mapStripeWebhookEvent(event: Stripe.Event): PaymentGatewayWebhookEvent {
    return {
      id: event.id,
      type: event.type,
      data: event.data,
      created: event.created,
    };
  }
} 
export interface PaymentGatewayCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface PaymentGatewayPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerId?: string;
  clientSecret?: string;
  metadata?: Record<string, any>;
}

export interface PaymentGatewaySubscription {
  id: string;
  customerId: string;
  priceId: string;
  status: string;
  amount: number;
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  endedAt?: Date;
  metadata?: Record<string, any>;
}

export interface PaymentGatewayRefund {
  id: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
}

export interface PaymentGatewayWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, any>;
  description?: string;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, any>;
}

export interface CreateRefundParams {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

export abstract class PaymentGatewayProvider {
  abstract readonly name: string;
  
  // Customer operations
  abstract createCustomer(params: CreateCustomerParams): Promise<PaymentGatewayCustomer>;
  abstract getCustomer(customerId: string): Promise<PaymentGatewayCustomer>;
  abstract updateCustomer(customerId: string, params: Partial<CreateCustomerParams>): Promise<PaymentGatewayCustomer>;
  
  // Payment operations
  abstract createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentGatewayPaymentIntent>;
  abstract confirmPaymentIntent(paymentIntentId: string): Promise<PaymentGatewayPaymentIntent>;
  abstract cancelPaymentIntent(paymentIntentId: string): Promise<PaymentGatewayPaymentIntent>;
  abstract getPaymentIntent(paymentIntentId: string): Promise<PaymentGatewayPaymentIntent>;
  
  // Subscription operations
  abstract createSubscription(params: CreateSubscriptionParams): Promise<PaymentGatewaySubscription>;
  abstract cancelSubscription(subscriptionId: string): Promise<PaymentGatewaySubscription>;
  abstract getSubscription(subscriptionId: string): Promise<PaymentGatewaySubscription>;
  
  // Refund operations
  abstract createRefund(params: CreateRefundParams): Promise<PaymentGatewayRefund>;
  
  // Webhook operations
  abstract constructWebhookEvent(payload: string | Buffer, signature: string, secret: string): Promise<PaymentGatewayWebhookEvent>;
  abstract validateWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean;
  
  // Configuration
  abstract getPublishableKey(): string;
  abstract isConfigured(): boolean;
} 
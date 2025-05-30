import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGatewayProvider } from '../interfaces/payment-gateway.interface';
import { PaymentGatewayType } from '../enums/payment-gateway.enum';
import { StripeGatewayService } from '../gateways/stripe/stripe-gateway.service';
import { PayPalGatewayService } from '../gateways/paypal/paypal-gateway.service';
import { DpoGatewayService } from '../gateways/dpo/dpo-gateway.service';

// African countries where DPO Pay is the preferred gateway
const AFRICAN_COUNTRIES = [
  'UG', 'KE', 'TZ', 'RW', 'GH', 'ZM', 'CI', 'NA', 'BW', 'ZA', 'MW', 'NG', 'AE'
];

@Injectable()
export class PaymentGatewayFactory {
  private readonly logger = new Logger(PaymentGatewayFactory.name);
  private readonly gateways: Map<PaymentGatewayType, PaymentGatewayProvider> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly stripeGateway: StripeGatewayService,
    private readonly paypalGateway: PayPalGatewayService,
    private readonly dpoGateway: DpoGatewayService,
  ) {
    this.initializeGateways();
  }

  private initializeGateways(): void {
    // Register all available gateways
    this.gateways.set(PaymentGatewayType.DPO, this.dpoGateway);
    this.gateways.set(PaymentGatewayType.STRIPE, this.stripeGateway);
    this.gateways.set(PaymentGatewayType.PAYPAL, this.paypalGateway);
    
    this.logger.log('Payment gateways initialized');
  }

  /**
   * Get gateway by type
   */
  getGateway(type: PaymentGatewayType): PaymentGatewayProvider {
    const gateway = this.gateways.get(type);
    if (!gateway) {
      throw new BadRequestException(`Payment gateway ${type} not supported`);
    }
    return gateway;
  }

  /**
   * Get default gateway based on user location and preferences
   */
  getDefaultGateway(userCountry?: string, userCurrency?: string): PaymentGatewayProvider {
    // Check if user is from Africa - use DPO Pay
    if (userCountry && AFRICAN_COUNTRIES.includes(userCountry.toUpperCase())) {
      this.logger.log(`Using DPO Pay for African user from ${userCountry}`);
      return this.dpoGateway;
    }

    // Check if currency is African - use DPO Pay
    if (userCurrency && this.dpoGateway.supportedCurrencies.includes(userCurrency.toUpperCase())) {
      this.logger.log(`Using DPO Pay for African currency ${userCurrency}`);
      return this.dpoGateway;
    }

    // Check configured default gateway
    const defaultGatewayType = this.configService.get<string>('payment.defaultGateway', 'dpo');
    
    // If default is DPO or not specified, use DPO
    if (defaultGatewayType === 'dpo' || !defaultGatewayType) {
      this.logger.log('Using DPO Pay as default gateway');
      return this.dpoGateway;
    }

    // Fall back to configured default or Stripe
    const gateway = this.gateways.get(defaultGatewayType as PaymentGatewayType);
    if (gateway) {
      this.logger.log(`Using configured default gateway: ${defaultGatewayType}`);
      return gateway;
    }

    // Final fallback to DPO Pay (Africa-first approach)
    this.logger.log('Falling back to DPO Pay as ultimate default');
    return this.dpoGateway;
  }

  /**
   * Get gateway by payment intent ID (for webhooks and verification)
   */
  getGatewayByPaymentIntentId(paymentIntentId: string): PaymentGatewayProvider {
    // DPO payment tokens are UUIDs
    if (paymentIntentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return this.dpoGateway;
    }
    
    // Stripe payment intents start with 'pi_'
    if (paymentIntentId.startsWith('pi_')) {
      return this.stripeGateway;
    }
    
    // PayPal payment IDs are typically longer alphanumeric strings
    if (paymentIntentId.length > 15 && !paymentIntentId.includes('_')) {
      return this.paypalGateway;
    }

    // Default to DPO for unknown formats (Africa-first approach)
    this.logger.warn(`Unknown payment intent format: ${paymentIntentId}, defaulting to DPO`);
    return this.dpoGateway;
  }

  /**
   * Get gateway by subscription ID
   */
  getGatewayBySubscriptionId(subscriptionId: string): PaymentGatewayProvider {
    // DPO subscription IDs start with 'dpo_sub_'
    if (subscriptionId.startsWith('dpo_sub_')) {
      return this.dpoGateway;
    }
    
    // Stripe subscription IDs start with 'sub_'
    if (subscriptionId.startsWith('sub_')) {
      return this.stripeGateway;
    }
    
    // PayPal subscription IDs
    if (subscriptionId.startsWith('I-') || subscriptionId.length > 15) {
      return this.paypalGateway;
    }

    // Default to DPO for unknown formats
    this.logger.warn(`Unknown subscription format: ${subscriptionId}, defaulting to DPO`);
    return this.dpoGateway;
  }

  /**
   * Get gateway configuration for frontend
   */
  async getGatewayConfig(gatewayType?: PaymentGatewayType): Promise<{ type: PaymentGatewayType; publishableKey: string }> {
    const gateway = gatewayType ? this.getGateway(gatewayType) : this.getDefaultGateway();
    
    switch (gateway.type) {
      case PaymentGatewayType.DPO:
        return {
          type: PaymentGatewayType.DPO,
          publishableKey: this.configService.get<string>('dpo.companyToken', ''), // DPO uses company token
        };
      case PaymentGatewayType.STRIPE:
        return {
          type: PaymentGatewayType.STRIPE,
          publishableKey: this.configService.get<string>('stripe.publishableKey', ''),
        };
      case PaymentGatewayType.PAYPAL:
        return {
          type: PaymentGatewayType.PAYPAL,
          publishableKey: this.configService.get<string>('paypal.clientId', ''),
        };
      default:
        return {
          type: PaymentGatewayType.DPO,
          publishableKey: this.configService.get<string>('dpo.companyToken', ''),
        };
    }
  }

  /**
   * Get list of available gateways
   */
  async getAvailableGateways(): Promise<Array<{ type: PaymentGatewayType; name: string; configured: boolean }>> {
    const gateways = [];

    // DPO Pay
    gateways.push({
      type: PaymentGatewayType.DPO,
      name: 'DPO Pay',
      configured: !!this.configService.get<string>('dpo.companyToken'),
    });

    // Stripe
    gateways.push({
      type: PaymentGatewayType.STRIPE,
      name: 'Stripe',
      configured: !!this.configService.get<string>('stripe.secretKey'),
    });

    // PayPal
    gateways.push({
      type: PaymentGatewayType.PAYPAL,
      name: 'PayPal',
      configured: !!this.configService.get<string>('paypal.clientSecret'),
    });

    // Square
    gateways.push({
      type: PaymentGatewayType.SQUARE,
      name: 'Square',
      configured: !!this.configService.get<string>('square.accessToken'),
    });

    // Razorpay
    gateways.push({
      type: PaymentGatewayType.RAZORPAY,
      name: 'Razorpay',
      configured: !!this.configService.get<string>('razorpay.keySecret'),
    });

    // Braintree
    gateways.push({
      type: PaymentGatewayType.BRAINTREE,
      name: 'Braintree',
      configured: !!this.configService.get<string>('braintree.privateKey'),
    });

    return gateways;
  }

  /**
   * Detect best gateway for user based on location and currency
   */
  async detectBestGateway(userCountry?: string, userCurrency?: string, userIp?: string): Promise<PaymentGatewayProvider> {
    // Priority 1: African countries use DPO Pay
    if (userCountry && AFRICAN_COUNTRIES.includes(userCountry.toUpperCase())) {
      this.logger.log(`Detected African country ${userCountry}, using DPO Pay`);
      return this.dpoGateway;
    }

    // Priority 2: African currencies use DPO Pay
    if (userCurrency && this.dpoGateway.supportedCurrencies.includes(userCurrency.toUpperCase())) {
      this.logger.log(`Detected African currency ${userCurrency}, using DPO Pay`);
      return this.dpoGateway;
    }

    // Priority 3: IP-based detection (simplified)
    if (userIp) {
      // In a real implementation, you would use a GeoIP service
      // For now, we'll assume African IPs and default to DPO
      this.logger.log(`IP-based detection for ${userIp}, defaulting to DPO Pay`);
      return this.dpoGateway;
    }

    // Priority 4: Regional preferences
    // Europe/US: Stripe, Asia: Razorpay, etc.
    if (userCountry) {
      const country = userCountry.toUpperCase();
      
      // European countries
      if (['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH'].includes(country)) {
        return this.stripeGateway;
      }
      
      // Asian countries
      if (['IN', 'MY', 'SG', 'TH', 'PH'].includes(country)) {
        // Would use Razorpay if configured, otherwise Stripe
        return this.stripeGateway;
      }
      
      // North America
      if (['US', 'CA'].includes(country)) {
        return this.stripeGateway;
      }
    }

    // Default: DPO Pay (Africa-first approach for MindLyf)
    this.logger.log('No specific location detected, using DPO Pay as default');
    return this.dpoGateway;
  }

  /**
   * Get supported currencies for a gateway
   */
  getSupportedCurrencies(gatewayType: PaymentGatewayType): string[] {
    const gateway = this.getGateway(gatewayType);
    return gateway.supportedCurrencies;
  }

  /**
   * Check if a gateway supports a specific currency
   */
  supportsCurrency(gatewayType: PaymentGatewayType, currency: string): boolean {
    const gateway = this.getGateway(gatewayType);
    return gateway.supportedCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Get the best gateway for a specific currency
   */
  getBestGatewayForCurrency(currency: string): PaymentGatewayProvider {
    const upperCurrency = currency.toUpperCase();
    
    // Check DPO first (Africa-first approach)
    if (this.dpoGateway.supportedCurrencies.includes(upperCurrency)) {
      return this.dpoGateway;
    }
    
    // Check Stripe
    if (this.stripeGateway.supportedCurrencies.includes(upperCurrency)) {
      return this.stripeGateway;
    }
    
    // Check PayPal
    if (this.paypalGateway.supportedCurrencies.includes(upperCurrency)) {
      return this.paypalGateway;
    }
    
    // Default to DPO
    return this.dpoGateway;
  }

  /**
   * Detect gateway type from webhook headers
   */
  getGatewayTypeFromWebhook(headers: Record<string, string>): PaymentGatewayType {
    // Stripe webhooks have stripe-signature header
    if (headers['stripe-signature']) {
      return PaymentGatewayType.STRIPE;
    }
    
    // PayPal webhooks have specific headers
    if (headers['paypal-transmission-sig'] || headers['paypal-transmission-id']) {
      return PaymentGatewayType.PAYPAL;
    }
    
    // DPO Pay webhooks (check for DPO-specific headers or user-agent)
    if (headers['user-agent']?.includes('DPO') || headers['x-dpo-signature']) {
      return PaymentGatewayType.DPO;
    }
    
    // Default to DPO for unknown webhooks (Africa-first approach)
    this.logger.warn('Unknown webhook headers, defaulting to DPO Pay');
    return PaymentGatewayType.DPO;
  }
} 
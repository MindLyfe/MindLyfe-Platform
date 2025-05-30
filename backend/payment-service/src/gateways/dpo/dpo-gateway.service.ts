import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayProvider } from '../../interfaces/payment-gateway.interface';
import { PaymentGatewayType } from '../../enums/payment-gateway.enum';
import { XMLValidatorService } from '../../../shared/security/xml-validator.service';
import { SecurityLoggerService, SecurityEventType } from '../../../shared/security/security-logger.service';
import { timeout, catchError } from 'rxjs/operators';

interface DPOConfig {
  companyToken: string;
  apiUrl: string;
  testMode: boolean;
}

interface DPOCreateTokenRequest {
  CompanyToken: string;
  Request: string;
  Transaction: {
    PaymentAmount: number;
    PaymentCurrency: string;
    CompanyRef: string;
    RedirectURL?: string;
    BackURL?: string;
    CompanyRefUnique: number;
    PTL: number;
    customerEmail?: string;
    customerFirstName?: string;
    customerLastName?: string;
    customerPhone?: string;
    customerCountry?: string;
    DefaultPayment?: string;
    DefaultPaymentCountry?: string;
    DefaultPaymentMNO?: string;
    TransactionSource: string;
    MetaData?: string;
  };
  Services: Array<{
    ServiceType: number;
    ServiceDescription: string;
    ServiceDate: string;
  }>;
}

interface DPOCreateTokenResponse {
  Result: string;
  ResultExplanation: string;
  TransToken?: string;
  TransRef?: string;
}

interface DPOVerifyTokenResponse {
  Result: string;
  ResultExplanation: string;
  customerName?: string;
  customerCredit?: string;
  customerCreditType?: string;
  transactionApproval?: string;
  transactionCurrency?: string;
  transactionAmount?: string;
  fraudAlert?: string;
  fraudExplnation?: string;
  transactionNetAmount?: string;
  transactionSettlementDate?: string;
  customerPhone?: string;
  customerCountry?: string;
  customerAddress?: string;
  customerCity?: string;
  customerZip?: string;
  accRef?: string;
}

// African countries supported by DPO Pay with their currencies and payment methods
const AFRICAN_COUNTRIES_CURRENCIES = {
  'UG': { 
    currency: 'UGX', 
    name: 'Uganda', 
    paymentMethods: ['MO', 'CC', 'BT'], // Mobile Money, Credit Card, Bank Transfer
    mobileNetworks: ['MTN', 'Airtel'],
    defaultPayment: 'MO',
    defaultMNO: 'MTN'
  },
  'KE': { 
    currency: 'KES', 
    name: 'Kenya', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Safaricom', 'Airtel'],
    defaultPayment: 'MO',
    defaultMNO: 'Safaricom'
  },
  'TZ': { 
    currency: 'TZS', 
    name: 'Tanzania', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Vodacom', 'Airtel', 'Tigo'],
    defaultPayment: 'MO',
    defaultMNO: 'Vodacom'
  },
  'RW': { 
    currency: 'RWF', 
    name: 'Rwanda', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['MTN', 'Airtel'],
    defaultPayment: 'MO',
    defaultMNO: 'MTN'
  },
  'GH': { 
    currency: 'GHS', 
    name: 'Ghana', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['MTN', 'Vodafone', 'AirtelTigo'],
    defaultPayment: 'MO',
    defaultMNO: 'MTN'
  },
  'ZM': { 
    currency: 'ZMW', 
    name: 'Zambia', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['MTN', 'Airtel'],
    defaultPayment: 'MO',
    defaultMNO: 'MTN'
  },
  'CI': { 
    currency: 'XOF', 
    name: 'Côte d\'Ivoire', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Orange', 'MTN'],
    defaultPayment: 'MO',
    defaultMNO: 'Orange'
  },
  'NA': { 
    currency: 'NAD', 
    name: 'Namibia', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['MTC', 'Telecom'],
    defaultPayment: 'MO',
    defaultMNO: 'MTC'
  },
  'BW': { 
    currency: 'BWP', 
    name: 'Botswana', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Mascom', 'Orange'],
    defaultPayment: 'MO',
    defaultMNO: 'Mascom'
  },
  'ZA': { 
    currency: 'ZAR', 
    name: 'South Africa', 
    paymentMethods: ['CC', 'BT', 'MO'], // Cards more popular than mobile money
    mobileNetworks: ['Vodacom', 'MTN', 'Cell C'],
    defaultPayment: 'CC',
    defaultMNO: 'Vodacom'
  },
  'MW': { 
    currency: 'MWK', 
    name: 'Malawi', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['TNM', 'Airtel'],
    defaultPayment: 'MO',
    defaultMNO: 'TNM'
  },
  'NG': { 
    currency: 'NGN', 
    name: 'Nigeria', 
    paymentMethods: ['CC', 'BT', 'MO'], // Cards and bank transfers more popular
    mobileNetworks: ['MTN', 'Airtel', 'Glo', '9mobile'],
    defaultPayment: 'CC',
    defaultMNO: 'MTN'
  },
  'AE': { 
    currency: 'AED', 
    name: 'UAE', 
    paymentMethods: ['CC', 'BT'],
    mobileNetworks: ['Etisalat', 'du'],
    defaultPayment: 'CC',
    defaultMNO: 'Etisalat'
  },
  'ET': { 
    currency: 'ETB', 
    name: 'Ethiopia', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Ethio Telecom'],
    defaultPayment: 'MO',
    defaultMNO: 'Ethio Telecom'
  },
  'SN': { 
    currency: 'XOF', 
    name: 'Senegal', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Orange', 'Free'],
    defaultPayment: 'MO',
    defaultMNO: 'Orange'
  },
  'ML': { 
    currency: 'XOF', 
    name: 'Mali', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Orange', 'Malitel'],
    defaultPayment: 'MO',
    defaultMNO: 'Orange'
  },
  'BF': { 
    currency: 'XOF', 
    name: 'Burkina Faso', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Orange', 'Telecel'],
    defaultPayment: 'MO',
    defaultMNO: 'Orange'
  },
  'MZ': { 
    currency: 'MZN', 
    name: 'Mozambique', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Vodacom', 'mCel'],
    defaultPayment: 'MO',
    defaultMNO: 'Vodacom'
  },
  'AO': { 
    currency: 'AOA', 
    name: 'Angola', 
    paymentMethods: ['CC', 'BT', 'MO'],
    mobileNetworks: ['Unitel', 'Movicel'],
    defaultPayment: 'CC',
    defaultMNO: 'Unitel'
  },
  'CM': { 
    currency: 'XAF', 
    name: 'Cameroon', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Orange', 'MTN'],
    defaultPayment: 'MO',
    defaultMNO: 'Orange'
  },
  'CD': { 
    currency: 'CDF', 
    name: 'Democratic Republic of Congo', 
    paymentMethods: ['MO', 'CC', 'BT'],
    mobileNetworks: ['Vodacom', 'Airtel', 'Orange'],
    defaultPayment: 'MO',
    defaultMNO: 'Vodacom'
  }
};

@Injectable()
export class DpoGatewayService extends PaymentGatewayProvider {
  private readonly logger = new Logger(DpoGatewayService.name);
  private readonly config: DPOConfig;
  private readonly httpService: HttpService;

  constructor(
    private readonly configService: ConfigService,
    private readonly xmlValidator: XMLValidatorService,
    private readonly securityLogger: SecurityLoggerService,
  ) {
    super();
    this.config = {
      companyToken: this.configService.get<string>('dpo.companyToken'),
      apiUrl: this.configService.get<string>('dpo.apiUrl', 'https://secure.3gdirectpay.com/API/v6/'),
      testMode: this.configService.get<boolean>('dpo.testMode', false),
    };
    this.httpService = new HttpService();
  }

  get name(): string {
    return 'dpo';
  }

  get type(): PaymentGatewayType {
    return PaymentGatewayType.DPO;
  }

  get supportedCurrencies(): string[] {
    return Object.values(AFRICAN_COUNTRIES_CURRENCIES).map(country => country.currency);
  }

  /**
   * Detect user's location and return appropriate currency with payment methods
   */
  async detectUserCurrency(userCountry?: string, userIp?: string): Promise<string> {
    // If user country is provided and supported, use it
    if (userCountry && AFRICAN_COUNTRIES_CURRENCIES[userCountry.toUpperCase()]) {
      return AFRICAN_COUNTRIES_CURRENCIES[userCountry.toUpperCase()].currency;
    }

    // If IP is provided, try to detect country using GeoIP service
    if (userIp) {
      try {
        const geoIpUrl = this.configService.get<string>('localization.geoIpService');
        if (geoIpUrl) {
          const response = await firstValueFrom(
            this.httpService.get(`${geoIpUrl}/${userIp}`)
          );
          const detectedCountry = response.data.country_code;
          if (detectedCountry && AFRICAN_COUNTRIES_CURRENCIES[detectedCountry.toUpperCase()]) {
            this.logger.log(`Detected country ${detectedCountry} from IP ${userIp}`);
            return AFRICAN_COUNTRIES_CURRENCIES[detectedCountry.toUpperCase()].currency;
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to detect country from IP ${userIp}: ${error.message}`);
      }
    }

    // Default to UGX (Uganda) as MindLyf's primary market
    return 'UGX';
  }

  /**
   * Get available payment methods for a country
   */
  getPaymentMethodsForCountry(countryCode: string): string[] {
    const country = AFRICAN_COUNTRIES_CURRENCIES[countryCode.toUpperCase()];
    return country ? country.paymentMethods : ['CC']; // Default to credit cards
  }

  /**
   * Get available mobile networks for a country
   */
  getMobileNetworksForCountry(countryCode: string): string[] {
    const country = AFRICAN_COUNTRIES_CURRENCIES[countryCode.toUpperCase()];
    return country ? country.mobileNetworks : [];
  }

  /**
   * Check if DPO Pay supports a specific country
   */
  isCountrySupported(countryCode: string): boolean {
    return !!AFRICAN_COUNTRIES_CURRENCIES[countryCode.toUpperCase()];
  }

  /**
   * Get country info by currency
   */
  private getCountryByCurrency(currency: string): any {
    const entry = Object.entries(AFRICAN_COUNTRIES_CURRENCIES).find(
      ([_, country]) => country.currency === currency
    );
    return entry ? { code: entry[0], ...entry[1] } : null;
  }

  async createCustomer(customerData: any): Promise<any> {
    // DPO doesn't have a separate customer creation endpoint
    // Customer data is included in the payment request
    return {
      id: `dpo_customer_${Date.now()}`,
      email: customerData.email,
      name: customerData.name,
      metadata: customerData.metadata,
    };
  }

  /**
   * Create payment intent with DPO Pay
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResult> {
    try {
      this.logger.log(`Creating DPO payment intent for amount: ${data.amount} ${data.currency}`);

      // Validate currency support
      if (!this.isCurrencySupported(data.currency)) {
        throw new Error(`Currency ${data.currency} is not supported by DPO Pay`);
      }

      // Create secure XML request using validator
      const requestData = {
        API3G: {
          CompanyToken: this.configService.get('dpo.companyToken'),
          Request: 'createToken',
          Transaction: {
            PaymentAmount: data.amount.toString(),
            PaymentCurrency: data.currency,
            CompanyRef: data.paymentId,
            RedirectURL: data.successUrl,
            BackURL: data.cancelUrl,
            CompanyRefUnique: `${data.paymentId}-${Date.now()}`,
            PTL: '5',
            PTLtype: 'minutes',
            Services: {
              Service: [{
                ServiceType: data.metadata?.serviceType || 'Mental Health Services',
                ServiceDescription: data.metadata?.description || 'MindLyf Platform Services',
                ServiceDate: new Date().toISOString().split('T')[0],
              }]
            }
          }
        }
      };

      // Create secure XML using validator
      const xmlRequest = this.xmlValidator.createDPORequestXML(requestData);

      // Send request to DPO Pay
      const response = await this.sendDPORequest(xmlRequest);

      // Validate and parse response
      const parsedResponse = await this.xmlValidator.validateDPOResponse(response);

      if (parsedResponse.API3G.Result !== '00') {
        throw new Error(`DPO Pay error: ${parsedResponse.API3G.ResultExplanation}`);
      }

      const paymentUrl = `${this.configService.get('dpo.paymentUrl')}/${parsedResponse.API3G.TransToken}`;

      this.logger.log(`✅ DPO payment intent created successfully: ${parsedResponse.API3G.TransToken}`);

      return {
        id: parsedResponse.API3G.TransToken,
        clientSecret: parsedResponse.API3G.TransToken,
        status: 'requires_action',
        paymentUrl,
        metadata: {
          gateway: 'dpo',
          transRef: parsedResponse.API3G.TransRef,
          companyRef: data.paymentId,
        },
      };

    } catch (error) {
      this.logger.error('DPO payment intent creation failed:', error);
      
      // Log security event for payment failures
      await this.securityLogger.logPaymentSecurityEvent(
        SecurityEventType.PAYMENT_FAILURE,
        data.userId || 'unknown',
        data.metadata?.userIp || 'unknown',
        {
          gateway: 'dpo',
          amount: data.amount,
          currency: data.currency,
          error: error.message,
        }
      );

      throw error;
    }
  }

  /**
   * Verify payment status with DPO Pay
   */
  async verifyPayment(paymentIntentId: string): Promise<PaymentVerificationResult> {
    try {
      this.logger.log(`Verifying DPO payment: ${paymentIntentId}`);

      // Create verification request
      const requestData = {
        API3G: {
          CompanyToken: this.configService.get('dpo.companyToken'),
          Request: 'verifyToken',
          TransToken: paymentIntentId,
        }
      };

      // Create secure XML using validator
      const xmlRequest = this.xmlValidator.createDPORequestXML(requestData);

      // Send verification request
      const response = await this.sendDPORequest(xmlRequest);

      // Validate and parse response
      const parsedResponse = await this.xmlValidator.validateDPOResponse(response);

      const isSuccessful = parsedResponse.API3G.Result === '00';
      const status = isSuccessful ? 'succeeded' : 'failed';

      this.logger.log(`DPO payment verification result: ${status}`);

      return {
        id: paymentIntentId,
        status,
        amount: 0, // DPO doesn't return amount in verification
        currency: 'UGX', // Default currency
        metadata: {
          gateway: 'dpo',
          result: parsedResponse.API3G.Result,
          explanation: parsedResponse.API3G.ResultExplanation,
          transRef: parsedResponse.API3G.TransRef,
        },
      };

    } catch (error) {
      this.logger.error('DPO payment verification failed:', error);
      throw error;
    }
  }

  /**
   * Process refund with DPO Pay
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<RefundResult> {
    try {
      this.logger.log(`Processing DPO refund for payment: ${paymentIntentId}`);

      // Create refund request
      const requestData = {
        API3G: {
          CompanyToken: this.configService.get('dpo.companyToken'),
          Request: 'refundToken',
          TransToken: paymentIntentId,
          RefundAmount: amount?.toString() || '', // Empty for full refund
        }
      };

      // Create secure XML using validator
      const xmlRequest = this.xmlValidator.createDPORequestXML(requestData);

      // Send refund request
      const response = await this.sendDPORequest(xmlRequest);

      // Validate and parse response
      const parsedResponse = await this.xmlValidator.validateDPOResponse(response);

      const isSuccessful = parsedResponse.API3G.Result === '00';

      this.logger.log(`DPO refund result: ${isSuccessful ? 'successful' : 'failed'}`);

      return {
        id: `refund_${paymentIntentId}_${Date.now()}`,
        status: isSuccessful ? 'succeeded' : 'failed',
        amount: amount || 0,
        reason: parsedResponse.API3G.ResultExplanation,
        metadata: {
          gateway: 'dpo',
          originalPayment: paymentIntentId,
          result: parsedResponse.API3G.Result,
        },
      };

    } catch (error) {
      this.logger.error('DPO refund failed:', error);
      throw error;
    }
  }

  /**
   * Handle webhook from DPO Pay
   */
  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    try {
      this.logger.log('Processing DPO webhook');

      // DPO Pay sends XML in the webhook
      if (typeof payload === 'string') {
        // Validate and parse webhook XML
        const parsedPayload = await this.xmlValidator.validateDPOResponse(payload);
        
        const eventType = this.mapDPOResultToEventType(parsedPayload.API3G.Result);
        
        return {
          eventType,
          paymentIntentId: parsedPayload.API3G.TransToken || '',
          data: parsedPayload,
          processed: true,
        };
      }

      // Handle JSON webhook format if applicable
      return {
        eventType: 'payment.unknown',
        paymentIntentId: payload.TransToken || '',
        data: payload,
        processed: true,
      };

    } catch (error) {
      this.logger.error('DPO webhook processing failed:', error);
      
      // Log security event for webhook failures
      await this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_VIOLATION,
        severity: 'medium',
        details: {
          gateway: 'dpo',
          webhookError: error.message,
          payload: typeof payload === 'string' ? '[XML_DATA]' : payload,
        },
      });

      throw error;
    }
  }

  /**
   * Send secure request to DPO Pay API
   */
  private async sendDPORequest(xmlData: string): Promise<string> {
    try {
      const dpoUrl = this.configService.get('dpo.apiUrl');
      
      const response = await firstValueFrom(
        this.httpService.post(dpoUrl, xmlData, {
          headers: {
            'Content-Type': 'application/xml',
            'User-Agent': 'MindLyf-Payment-Gateway/1.0',
          },
          timeout: 30000, // 30 seconds timeout
        }).pipe(
          timeout(30000),
          catchError((error) => {
            this.logger.error('DPO API request failed:', error.message);
            throw new Error(`DPO API request failed: ${error.message}`);
          })
        )
      );

      if (!response.data) {
        throw new Error('Empty response from DPO Pay API');
      }

      return response.data;

    } catch (error) {
      this.logger.error('DPO API communication error:', error);
      throw error;
    }
  }

  /**
   * Map DPO result codes to event types
   */
  private mapDPOResultToEventType(result: string): string {
    switch (result) {
      case '00':
        return 'payment.succeeded';
      case '01':
      case '02':
      case '03':
        return 'payment.failed';
      case '04':
        return 'payment.cancelled';
      default:
        return 'payment.unknown';
    }
  }

  /**
   * Build XML request for createToken
   */
  private buildXmlRequest(request: DPOCreateTokenRequest): string {
    const services = request.Services.map(service => `
      <Service>
        <ServiceType>${service.ServiceType}</ServiceType>
        <ServiceDescription>${this.escapeXml(service.ServiceDescription)}</ServiceDescription>
        <ServiceDate>${service.ServiceDate}</ServiceDate>
      </Service>
    `).join('');

    return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${request.CompanyToken}</CompanyToken>
  <Request>${request.Request}</Request>
  <Transaction>
    <PaymentAmount>${request.Transaction.PaymentAmount}</PaymentAmount>
    <PaymentCurrency>${request.Transaction.PaymentCurrency}</PaymentCurrency>
    <CompanyRef>${this.escapeXml(request.Transaction.CompanyRef)}</CompanyRef>
    ${request.Transaction.RedirectURL ? `<RedirectURL>${this.escapeXml(request.Transaction.RedirectURL)}</RedirectURL>` : ''}
    ${request.Transaction.BackURL ? `<BackURL>${this.escapeXml(request.Transaction.BackURL)}</BackURL>` : ''}
    <CompanyRefUnique>${request.Transaction.CompanyRefUnique}</CompanyRefUnique>
    <PTL>${request.Transaction.PTL}</PTL>
    ${request.Transaction.customerEmail ? `<customerEmail>${this.escapeXml(request.Transaction.customerEmail)}</customerEmail>` : ''}
    ${request.Transaction.customerFirstName ? `<customerFirstName>${this.escapeXml(request.Transaction.customerFirstName)}</customerFirstName>` : ''}
    ${request.Transaction.customerLastName ? `<customerLastName>${this.escapeXml(request.Transaction.customerLastName)}</customerLastName>` : ''}
    ${request.Transaction.customerPhone ? `<customerPhone>${this.escapeXml(request.Transaction.customerPhone)}</customerPhone>` : ''}
    ${request.Transaction.customerCountry ? `<customerCountry>${request.Transaction.customerCountry}</customerCountry>` : ''}
    ${request.Transaction.DefaultPayment ? `<DefaultPayment>${request.Transaction.DefaultPayment}</DefaultPayment>` : ''}
    ${request.Transaction.DefaultPaymentCountry ? `<DefaultPaymentCountry>${this.escapeXml(request.Transaction.DefaultPaymentCountry)}</DefaultPaymentCountry>` : ''}
    ${request.Transaction.DefaultPaymentMNO ? `<DefaultPaymentMNO>${this.escapeXml(request.Transaction.DefaultPaymentMNO)}</DefaultPaymentMNO>` : ''}
    <TransactionSource>${request.Transaction.TransactionSource}</TransactionSource>
    ${request.Transaction.MetaData ? `<MetaData><![CDATA[${request.Transaction.MetaData}]]></MetaData>` : ''}
  </Transaction>
  <Services>
    ${services}
  </Services>
</API3G>`;
  }

  /**
   * Build XML request for refund
   */
  private buildRefundXmlRequest(request: any): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${request.CompanyToken}</CompanyToken>
  <Request>${request.Request}</Request>
  <TransactionToken>${request.TransactionToken}</TransactionToken>
  <refundAmount>${request.refundAmount}</refundAmount>
  <refundDetails>${this.escapeXml(request.refundDetails)}</refundDetails>
  <refundRef>${request.refundRef}</refundRef>
</API3G>`;
  }

  /**
   * Build XML request for verify token
   */
  private buildVerifyXmlRequest(request: any): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${request.CompanyToken}</CompanyToken>
  <Request>${request.Request}</Request>
  <TransactionToken>${request.TransactionToken}</TransactionToken>
</API3G>`;
  }

  /**
   * Parse XML response from DPO
   */
  private async parseXmlResponse(xmlData: string): Promise<any> {
    // Simple XML parsing - in production, use a proper XML parser
    const result: any = {};
    
    // Extract basic fields
    const resultMatch = xmlData.match(/<Result>(.*?)<\/Result>/);
    if (resultMatch) result.Result = resultMatch[1];
    
    const explanationMatch = xmlData.match(/<ResultExplanation>(.*?)<\/ResultExplanation>/);
    if (explanationMatch) result.ResultExplanation = explanationMatch[1];
    
    const transTokenMatch = xmlData.match(/<TransToken>(.*?)<\/TransToken>/);
    if (transTokenMatch) result.TransToken = transTokenMatch[1];
    
    const transRefMatch = xmlData.match(/<TransRef>(.*?)<\/TransRef>/);
    if (transRefMatch) result.TransRef = transRefMatch[1];

    // Extract verification fields
    const customerNameMatch = xmlData.match(/<customerName>(.*?)<\/customerName>/);
    if (customerNameMatch) result.customerName = customerNameMatch[1];
    
    const transactionAmountMatch = xmlData.match(/<transactionAmount>(.*?)<\/transactionAmount>/);
    if (transactionAmountMatch) result.transactionAmount = transactionAmountMatch[1];
    
    const transactionCurrencyMatch = xmlData.match(/<transactionCurrency>(.*?)<\/transactionCurrency>/);
    if (transactionCurrencyMatch) result.transactionCurrency = transactionCurrencyMatch[1];
    
    const transactionApprovalMatch = xmlData.match(/<transactionApproval>(.*?)<\/transactionApproval>/);
    if (transactionApprovalMatch) result.transactionApproval = transactionApprovalMatch[1];

    return result;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * Calculate next billing date based on cycle
   */
  private calculateNextBillingDate(cycle: string = 'monthly'): Date {
    const now = new Date();
    switch (cycle) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }
} 
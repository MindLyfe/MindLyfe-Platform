import { PaymentGatewayType } from '../enums/payment-gateway.enum';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3006,
  environment: process.env.NODE_ENV || 'development',
  
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'mindlyfe_payment',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'mindlyfe-auth-secret-key-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      serviceToken: process.env.AUTH_SERVICE_TOKEN || 'mindlyfe-auth-service-token',
    },
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
  },
  
  payment: {
    defaultGateway: process.env.DEFAULT_PAYMENT_GATEWAY || 'dpo',
    currency: process.env.DEFAULT_CURRENCY || 'usd',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'mindlyfe-payment-webhook-secret',
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.STRIPE_CURRENCY || 'usd',
    apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16',
  },
  
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
  },
  
  square: {
    applicationId: process.env.SQUARE_APPLICATION_ID || '',
    accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
    locationId: process.env.SQUARE_LOCATION_ID || '',
    environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
  },
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  
  braintree: {
    merchantId: process.env.BRAINTREE_MERCHANT_ID || '',
    publicKey: process.env.BRAINTREE_PUBLIC_KEY || '',
    privateKey: process.env.BRAINTREE_PRIVATE_KEY || '',
    environment: process.env.BRAINTREE_ENVIRONMENT || 'sandbox',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  
  dpo: {
    companyToken: process.env.DPO_COMPANY_TOKEN || '',
    apiUrl: process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/',
    testMode: process.env.DPO_TEST_MODE === 'true' || process.env.NODE_ENV !== 'production',
    webhookUrl: process.env.DPO_WEBHOOK_URL || 'http://localhost:3006/api/payments/webhook/dpo',
    redirectUrl: process.env.DPO_REDIRECT_URL || 'http://localhost:3000/payment/success',
    backUrl: process.env.DPO_BACK_URL || 'http://localhost:3000/payment/cancel',
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
    ],
  },
  
  localization: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'UGX',
    defaultCountry: process.env.DEFAULT_COUNTRY || 'UG',
    supportedCurrencies: process.env.SUPPORTED_CURRENCIES?.split(',') || [
      'UGX', 'KES', 'TZS', 'RWF', 'GHS', 'ZMW', 'XOF', 'NAD', 'BWP', 'ZAR', 'MWK', 'NGN', 'AED',
      'ETB', 'MZN', 'AOA', 'XAF', 'CDF', 'USD', 'EUR', 'GBP',
    ],
    geoIpService: process.env.GEO_IP_SERVICE_URL || '',
  },

  currency: {
    exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || '',
    fixerApiKey: process.env.FIXER_API_KEY || '',
    currencyApiKey: process.env.CURRENCY_API_KEY || '',
    cacheExpiryMinutes: parseInt(process.env.CURRENCY_CACHE_EXPIRY, 10) || 15,
    fallbackRatesEnabled: process.env.FALLBACK_RATES_ENABLED !== 'false',
  },
});
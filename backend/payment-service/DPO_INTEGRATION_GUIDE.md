# DPO Pay Integration Guide for MindLyf

## Overview

DPO Pay has been integrated as the **primary payment gateway** for MindLyf, specifically designed for African markets. This integration provides seamless payment processing with automatic currency detection based on user location and comprehensive support for mobile money and other African payment methods.

## Features

### 🌍 Location-Based Currency Detection
- Automatic currency detection based on user country
- Support for 13+ African currencies
- Fallback to Uganda Shillings (UGX) as default
- IP-based location detection (extensible with GeoIP services)

### 💳 Payment Methods Supported
- **Mobile Money**: MTN, Safaricom, Vodacom, Orange, etc.
- **Bank Cards**: Visa, Mastercard, American Express
- **Bank Transfers**: Direct bank transfers
- **Digital Wallets**: Various African digital payment solutions

### 🔄 Multi-Gateway Architecture
- DPO Pay as primary gateway for African users
- Stripe as secondary gateway for international users
- Automatic gateway selection based on user location
- Easy switching between gateways

## Supported Countries & Currencies

| Country | Currency | Code | Mobile Network |
|---------|----------|------|----------------|
| Uganda | Uganda Shilling | UGX | MTN |
| Kenya | Kenyan Shilling | KES | Safaricom |
| Tanzania | Tanzanian Shilling | TZS | Vodacom |
| Rwanda | Rwandan Franc | RWF | MTN |
| Ghana | Ghanaian Cedi | GHS | MTN |
| Zambia | Zambian Kwacha | ZMW | MTN |
| Côte d'Ivoire | West African CFA Franc | XOF | Orange |
| Namibia | Namibian Dollar | NAD | MTC |
| Botswana | Botswana Pula | BWP | Mascom |
| South Africa | South African Rand | ZAR | Vodacom |
| Malawi | Malawian Kwacha | MWK | TNM |
| Nigeria | Nigerian Naira | NGN | MTN |
| UAE | UAE Dirham | AED | Etisalat |

## Environment Configuration

### Required Environment Variables

```bash
# DPO Pay Configuration (Primary Gateway)
DPO_COMPANY_TOKEN=your-dpo-company-token
DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
DPO_TEST_MODE=true  # Set to false for production
DPO_WEBHOOK_URL=https://your-domain.com/api/payments/webhook/dpo
DPO_REDIRECT_URL=https://your-domain.com/payment/success
DPO_BACK_URL=https://your-domain.com/payment/cancel

# Default Gateway and Currency Settings
DEFAULT_PAYMENT_GATEWAY=dpo
DEFAULT_CURRENCY=UGX
DEFAULT_COUNTRY=UG

# Supported Currencies (comma-separated)
SUPPORTED_CURRENCIES=UGX,KES,TZS,RWF,GHS,ZMW,XOF,NAD,BWP,ZAR,MWK,NGN,AED,USD,EUR,GBP

# Optional: GeoIP Service for enhanced location detection
GEO_IP_SERVICE_URL=https://your-geoip-service.com/api
```

### Docker Environment

Add to your `.env` file:

```bash
# DPO Pay Credentials (Get from DPO Pay Dashboard)
DPO_COMPANY_TOKEN=your-actual-company-token

# Optional: Other payment gateways
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

## API Endpoints

### 1. Get Payment Configuration
**GET** `/api/payments/config`

Automatically detects the best payment gateway and currency for the user.

```bash
curl -X GET "https://api.mindlyf.com/payments/config?country=UG&currency=UGX" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "gateway": {
    "type": "dpo",
    "name": "dpo",
    "publishableKey": "your-dpo-company-token"
  },
  "currency": {
    "detected": "UGX",
    "supported": ["UGX", "KES", "TZS", "RWF", "GHS", "ZMW", "XOF", "NAD", "BWP", "ZAR", "MWK", "NGN", "AED"],
    "default": "UGX"
  },
  "location": {
    "country": "UG",
    "ip": "192.168.1.1"
  },
  "user": {
    "id": "user-id",
    "country": "UG",
    "email": "user@example.com"
  }
}
```

### 2. Detect Currency
**POST** `/api/payments/detect-currency`

Detects the appropriate currency based on user location.

```bash
curl -X POST "https://api.mindlyf.com/payments/detect-currency" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country": "KE", "ip": "192.168.1.1"}'
```

**Response:**
```json
{
  "currency": "KES",
  "gateway": "dpo",
  "country": "KE",
  "supported_currencies": ["UGX", "KES", "TZS", "RWF", "GHS", "ZMW", "XOF", "NAD", "BWP", "ZAR", "MWK", "NGN", "AED"]
}
```

### 3. Create Payment
**POST** `/api/payments`

Creates a payment with automatic gateway and currency selection.

```bash
curl -X POST "https://api.mindlyf.com/payments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "type": "therapy",
    "description": "Therapy Session Payment",
    "metadata": {
      "userCountry": "UG",
      "customerEmail": "user@example.com",
      "customerFirstName": "John",
      "customerLastName": "Doe",
      "customerPhone": "+256700000000"
    }
  }'
```

**Response:**
```json
{
  "id": "payment-uuid",
  "userId": "user-id",
  "gateway": "dpo",
  "gatewayPaymentId": "dpo-transaction-token",
  "amount": 50000,
  "currency": "UGX",
  "status": "pending",
  "type": "therapy",
  "description": "Therapy Session Payment",
  "metadata": {
    "gateway_response": {
      "id": "dpo-transaction-token",
      "payment_url": "https://secure.3gdirectpay.com/payv2.php?ID=token",
      "currency": "UGX",
      "status": "requires_payment_method"
    },
    "user_location": {
      "country": "UG",
      "detected_currency": "UGX",
      "ip": "192.168.1.1"
    }
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 4. Get Available Gateways
**GET** `/api/payments/gateways`

Returns all available payment gateways and their configuration status.

```bash
curl -X GET "https://api.mindlyf.com/payments/gateways" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "gateways": [
    {
      "type": "dpo",
      "name": "DPO Pay",
      "configured": true
    },
    {
      "type": "stripe",
      "name": "Stripe",
      "configured": true
    },
    {
      "type": "paypal",
      "name": "PayPal",
      "configured": false
    }
  ],
  "default": "dpo"
}
```

### 5. Get Supported Currencies
**GET** `/api/payments/currencies`

Returns supported currencies for a specific gateway or all gateways.

```bash
curl -X GET "https://api.mindlyf.com/payments/currencies?gateway=dpo" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "currencies": ["UGX", "KES", "TZS", "RWF", "GHS", "ZMW", "XOF", "NAD", "BWP", "ZAR", "MWK", "NGN", "AED"],
  "gateway": "dpo"
}
```

## Frontend Integration

### 1. Get Payment Configuration
```javascript
// Get payment configuration for current user
const getPaymentConfig = async () => {
  try {
    const response = await fetch('/api/payments/config', {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Failed to get payment config:', error);
  }
};
```

### 2. Create Payment
```javascript
// Create a payment with automatic gateway selection
const createPayment = async (paymentData) => {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        type: paymentData.type,
        description: paymentData.description,
        metadata: {
          userCountry: userCountry, // Detected from user profile or IP
          customerEmail: user.email,
          customerFirstName: user.firstName,
          customerLastName: user.lastName,
          customerPhone: user.phone,
          redirectUrl: `${window.location.origin}/payment/success`,
          backUrl: `${window.location.origin}/payment/cancel`
        }
      })
    });
    
    const payment = await response.json();
    
    // For DPO Pay, redirect to payment URL
    if (payment.metadata?.gateway_response?.payment_url) {
      window.location.href = payment.metadata.gateway_response.payment_url;
    }
    
    return payment;
  } catch (error) {
    console.error('Failed to create payment:', error);
  }
};
```

### 3. Currency Detection
```javascript
// Detect appropriate currency for user
const detectCurrency = async (country, ip) => {
  try {
    const response = await fetch('/api/payments/detect-currency', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ country, ip })
    });
    
    const result = await response.json();
    return result.currency;
  } catch (error) {
    console.error('Failed to detect currency:', error);
    return 'UGX'; // Default fallback
  }
};
```

## Webhook Handling

DPO Pay sends webhooks to notify about payment status changes. The webhook endpoint is automatically configured at `/api/payments/webhook/dpo`.

### Webhook Events
- **Payment Successful**: When a payment is completed successfully
- **Payment Failed**: When a payment fails
- **Payment Cancelled**: When a user cancels the payment

### Webhook Verification
The system automatically verifies webhooks using DPO's verification API to ensure authenticity.

## Testing

### Test Mode Configuration
Set `DPO_TEST_MODE=true` in your environment variables to use DPO's test environment.

### Test Cards
DPO Pay provides test card numbers for different scenarios:
- **Successful Payment**: 4000000000000002
- **Failed Payment**: 4000000000000010
- **Insufficient Funds**: 4000000000000341

### Test Mobile Money
Use test mobile money numbers provided by DPO Pay for testing mobile money payments.

## Error Handling

The system includes comprehensive error handling:

### Common Error Responses
```json
{
  "statusCode": 400,
  "message": "Currency UGX not supported by DPO Pay",
  "error": "Bad Request"
}
```

### Error Types
- **Invalid Currency**: Currency not supported by the selected gateway
- **Gateway Error**: Error from DPO Pay API
- **Authentication Error**: Invalid or expired JWT token
- **Validation Error**: Invalid request parameters

## Security Considerations

### 1. Environment Variables
- Never commit DPO company tokens to version control
- Use different tokens for test and production environments
- Rotate tokens regularly

### 2. Webhook Security
- Webhooks are verified using DPO's verification API
- All webhook requests are logged for audit purposes
- Failed verification attempts are blocked and logged

### 3. Data Protection
- Payment data is encrypted at rest
- PCI DSS compliance through DPO Pay
- User data is handled according to GDPR and local privacy laws

## Monitoring and Logging

### Payment Logs
All payment activities are logged with the following information:
- User ID and payment details
- Gateway used and response
- Location and currency detection
- Error messages and stack traces

### Metrics
Monitor the following metrics:
- Payment success rates by gateway
- Currency distribution
- Geographic distribution of payments
- Average payment processing time

## Support and Troubleshooting

### Common Issues

1. **Currency Not Detected**
   - Ensure user country is set in profile
   - Check IP detection configuration
   - Verify supported currencies list

2. **Payment Fails**
   - Check DPO Pay dashboard for error details
   - Verify company token is correct
   - Ensure test mode settings match environment

3. **Webhook Not Received**
   - Verify webhook URL is accessible
   - Check firewall settings
   - Review DPO Pay webhook logs

### Getting Help
- Check DPO Pay documentation: https://docs.dpopay.com/
- Contact DPO Pay support for gateway-specific issues
- Review MindLyf payment service logs for integration issues

## Migration from Other Gateways

If migrating from Stripe or other gateways:

1. **Data Migration**: Existing payment records remain unchanged
2. **New Payments**: Will automatically use DPO Pay for African users
3. **Backward Compatibility**: Existing Stripe integrations continue to work
4. **Gradual Rollout**: Can be configured per user or region

## Conclusion

The DPO Pay integration provides MindLyf with a robust, Africa-focused payment solution that automatically adapts to user location and preferences. The system maintains backward compatibility while providing enhanced functionality for African markets.

For additional support or questions, please refer to the main payment service documentation or contact the development team. 
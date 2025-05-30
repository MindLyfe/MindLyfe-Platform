# Payment Service Integration Test Guide

## Overview

This guide provides comprehensive testing procedures for the MindLyf payment service with DPO Pay integration, currency conversion, and multi-gateway support.

## Prerequisites

1. **Environment Setup**
   ```bash
   # Required environment variables
   DPO_COMPANY_TOKEN=your-dpo-company-token
   DPO_TEST_MODE=true
   EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
   STRIPE_SECRET_KEY=your-stripe-test-key
   ```

2. **Services Running**
   ```bash
   docker-compose up -d
   ```

## Test Scenarios

### 1. Currency Detection Tests

#### Test 1.1: Ugandan User Currency Detection
```bash
curl -X POST "http://localhost:3000/payments/detect-currency" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country": "UG"}'

# Expected Response:
{
  "currency": "UGX",
  "gateway": "dpo",
  "country": "UG",
  "supported_currencies": ["UGX", "KES", "TZS", ...]
}
```

#### Test 1.2: Kenyan User Currency Detection
```bash
curl -X POST "http://localhost:3000/payments/detect-currency" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country": "KE"}'

# Expected Response:
{
  "currency": "KES",
  "gateway": "dpo",
  "country": "KE",
  "supported_currencies": ["UGX", "KES", "TZS", ...]
}
```

#### Test 1.3: Non-African User Currency Detection
```bash
curl -X POST "http://localhost:3000/payments/detect-currency" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country": "US"}'

# Expected Response:
{
  "currency": "USD",
  "gateway": "stripe",
  "country": "US",
  "supported_currencies": ["USD", "EUR", "GBP", ...]
}
```

### 2. Payment Configuration Tests

#### Test 2.1: DPO Configuration for African User
```bash
curl -X GET "http://localhost:3000/payments/config?country=UG" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "gateway": {
    "type": "dpo",
    "name": "dpo",
    "publishableKey": "your-dpo-company-token"
  },
  "currency": {
    "detected": "UGX",
    "supported": ["UGX", "KES", "TZS", ...],
    "default": "UGX"
  },
  "location": {
    "country": "UG",
    "ip": "..."
  }
}
```

#### Test 2.2: Stripe Configuration for Non-African User
```bash
curl -X GET "http://localhost:3000/payments/config?country=US" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "gateway": {
    "type": "stripe",
    "name": "stripe",
    "publishableKey": "pk_test_..."
  },
  "currency": {
    "detected": "USD",
    "supported": ["USD", "EUR", "GBP", ...],
    "default": "UGX"
  }
}
```

### 3. Payment Methods Tests

#### Test 3.1: Uganda Payment Methods
```bash
curl -X GET "http://localhost:3000/payments/payment-methods/UG" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "gateway": "dpo",
  "supported": true,
  "paymentMethods": ["MO", "CC", "BT"],
  "mobileNetworks": ["MTN", "Airtel"],
  "country": "UG"
}
```

#### Test 3.2: Kenya Payment Methods
```bash
curl -X GET "http://localhost:3000/payments/payment-methods/KE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "gateway": "dpo",
  "supported": true,
  "paymentMethods": ["MO", "CC", "BT"],
  "mobileNetworks": ["Safaricom", "Airtel"],
  "country": "KE"
}
```

#### Test 3.3: Non-Supported Country Payment Methods
```bash
curl -X GET "http://localhost:3000/payments/payment-methods/US" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "gateway": "stripe",
  "supported": false,
  "paymentMethods": ["CC"],
  "mobileNetworks": [],
  "country": "US"
}
```

### 4. Currency Conversion Tests

#### Test 4.1: UGX to USD Conversion
```bash
curl -X POST "http://localhost:3000/payments/convert-currency" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "fromCurrency": "UGX",
    "toCurrency": "USD"
  }'

# Expected Response:
{
  "fromCurrency": "UGX",
  "toCurrency": "USD",
  "amount": 100000,
  "convertedAmount": 27.03,
  "exchangeRate": 0.00027,
  "timestamp": "2024-01-15T10:30:00Z",
  "formatted": {
    "original": "UGX 100,000",
    "converted": "$27.03"
  }
}
```

#### Test 4.2: USD to KES Conversion
```bash
curl -X POST "http://localhost:3000/payments/convert-currency" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "fromCurrency": "USD",
    "toCurrency": "KES"
  }'

# Expected Response:
{
  "fromCurrency": "USD",
  "toCurrency": "KES",
  "amount": 100,
  "convertedAmount": 12900,
  "exchangeRate": 129,
  "timestamp": "2024-01-15T10:30:00Z",
  "formatted": {
    "original": "$100.00",
    "converted": "KSh 12,900"
  }
}
```

### 5. Exchange Rates Tests

#### Test 5.1: Get UGX Exchange Rates
```bash
curl -X GET "http://localhost:3000/payments/exchange-rates?base=UGX&targets=USD,EUR,KES" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "baseCurrency": "UGX",
  "rates": {
    "USD": 0.00027,
    "EUR": 0.00023,
    "KES": 0.035
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 6. Payment Creation Tests

#### Test 6.1: DPO Payment for Ugandan User
```bash
curl -X POST "http://localhost:3000/payments" \
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

# Expected Response:
{
  "id": "payment-uuid",
  "userId": "user-id",
  "gateway": "dpo",
  "gatewayPaymentId": "dpo-transaction-token",
  "amount": 50000,
  "currency": "UGX",
  "status": "pending",
  "type": "therapy",
  "metadata": {
    "gateway_response": {
      "payment_url": "https://secure.3gdirectpay.com/payv2.php?ID=token",
      "availablePaymentMethods": ["MO", "CC", "BT"],
      "availableMobileNetworks": ["MTN", "Airtel"]
    }
  }
}
```

#### Test 6.2: Stripe Payment for US User
```bash
curl -X POST "http://localhost:3000/payments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2999,
    "currency": "USD",
    "type": "subscription",
    "description": "Premium Subscription",
    "metadata": {
      "userCountry": "US",
      "customerEmail": "user@example.com"
    }
  }'

# Expected Response:
{
  "id": "payment-uuid",
  "userId": "user-id",
  "gateway": "stripe",
  "gatewayPaymentId": "pi_...",
  "amount": 2999,
  "currency": "USD",
  "status": "pending",
  "type": "subscription"
}
```

### 7. Gateway Selection Tests

#### Test 7.1: Available Gateways
```bash
curl -X GET "http://localhost:3000/payments/gateways" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
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

### 8. Error Handling Tests

#### Test 8.1: Unsupported Currency
```bash
curl -X POST "http://localhost:3000/payments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "JPY",
    "type": "therapy",
    "gateway": "dpo"
  }'

# Expected Response:
{
  "statusCode": 400,
  "message": "Currency JPY is not supported by dpo",
  "error": "Bad Request"
}
```

#### Test 8.2: Invalid Country Code
```bash
curl -X GET "http://localhost:3000/payments/payment-methods/XX" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "gateway": "stripe",
  "supported": false,
  "paymentMethods": ["CC"],
  "mobileNetworks": [],
  "country": "XX"
}
```

## Integration Verification

### 1. Service Communication Test
```bash
# Check if payment service can communicate with auth service
curl -X GET "http://localhost:3000/payments/config" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return user-specific configuration
```

### 2. Notification Integration Test
```bash
# Create a payment and verify notification is sent
curl -X POST "http://localhost:3000/payments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "type": "therapy",
    "metadata": {"userCountry": "UG"}
  }'

# Check notification service logs for payment_created notification
```

### 3. Database Verification
```sql
-- Check payment record in database
SELECT * FROM payments WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 1;

-- Verify gateway and currency fields are populated correctly
```

## Performance Tests

### 1. Currency Conversion Performance
```bash
# Test multiple concurrent currency conversions
for i in {1..10}; do
  curl -X POST "http://localhost:3000/payments/convert-currency" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount": 1000, "fromCurrency": "UGX", "toCurrency": "USD"}' &
done
wait

# All requests should complete within 5 seconds
```

### 2. Gateway Selection Performance
```bash
# Test rapid gateway selection
for i in {1..20}; do
  curl -X GET "http://localhost:3000/payments/config?country=UG" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" &
done
wait

# All requests should complete within 3 seconds
```

## Expected Results Summary

1. **DPO Pay Integration**: ✅ African countries use DPO Pay automatically
2. **Stripe Fallback**: ✅ Non-African countries use Stripe
3. **Currency Detection**: ✅ Automatic currency detection based on country
4. **Payment Methods**: ✅ Country-specific payment methods returned
5. **Currency Conversion**: ✅ Real-time exchange rates with fallback
6. **Service Communication**: ✅ Auth service integration working
7. **Notifications**: ✅ Payment notifications sent properly
8. **Error Handling**: ✅ Graceful error handling for edge cases

## Troubleshooting

### Common Issues

1. **DPO Company Token Invalid**
   - Verify token in DPO dashboard
   - Check test mode settings

2. **Currency API Rate Limits**
   - Verify API keys are valid
   - Check fallback rates are working

3. **Service Communication Failures**
   - Check Docker network connectivity
   - Verify service tokens are correct

4. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check database credentials

### Debug Commands

```bash
# Check service logs
docker-compose logs payment-service
docker-compose logs auth-service
docker-compose logs notification-service

# Check database connectivity
docker-compose exec postgres psql -U postgres -d mindlyf_payment -c "SELECT COUNT(*) FROM payments;"

# Test service-to-service communication
docker-compose exec payment-service curl http://auth-service:3001/health
```

This comprehensive test suite ensures the payment service integration is working correctly with proper DPO Pay support, currency conversion, and service communication. 
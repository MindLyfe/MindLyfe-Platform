# MindLyfe Payment Service

## 🚀 Overview

The MindLyfe Payment Service is a secure, scalable microservice designed to handle all payment-related operations for the MindLyfe mental health platform. It provides a gateway-agnostic architecture supporting multiple payment providers with comprehensive security hardening and African market focus through DPO Pay integration.

## 🏗️ Architecture

### Gateway-Agnostic Design

The payment service implements a modular architecture that abstracts payment gateway operations through a common interface:

```
┌─────────────────────────┐
│   Payment Controller    │
└─────────┬───────────────┘
          │
┌─────────▼───────────────┐
│   Payment Service       │
└─────────┬───────────────┘
          │
┌─────────▼───────────────┐
│ Gateway Factory Service │
└─────────┬───────────────┘
          │
    ┌─────▼─────┐
    │ Gateways  │
    ├───────────┤
    │ Stripe    │
    │ DPO Pay   │
    │ PayPal    │
    │ Square    │
    │ Razorpay  │
    │ Braintree │
    └───────────┘
```

### Core Components

```
src/
├── controllers/
│   ├── payment.controller.ts           # REST API endpoints
│   └── webhook.controller.ts           # Webhook handlers
├── services/
│   ├── payment.service.ts              # Core business logic
│   ├── payment-gateway-factory.service.ts  # Gateway factory
│   └── currency-converter.service.ts   # Multi-currency support
├── gateways/
│   ├── stripe/
│   │   └── stripe-gateway.service.ts   # Stripe implementation
│   ├── dpo/
│   │   └── dpo-gateway.service.ts      # DPO Pay implementation
│   ├── paypal/
│   │   └── paypal-gateway.service.ts   # PayPal implementation
│   ├── square/
│   │   └── square-gateway.service.ts   # Square implementation
│   ├── razorpay/
│   │   └── razorpay-gateway.service.ts # Razorpay implementation
│   └── braintree/
│       └── braintree-gateway.service.ts # Braintree implementation
├── entities/
│   ├── payment.entity.ts               # Payment data model
│   └── subscription.entity.ts          # Subscription data model
├── dto/
│   ├── create-payment.dto.ts           # Payment creation DTO
│   ├── create-subscription.dto.ts      # Subscription creation DTO
│   └── webhook.dto.ts                  # Webhook payload DTOs
├── interfaces/
│   └── payment-gateway.interface.ts    # Gateway interface
├── enums/
│   └── payment-gateway.enum.ts         # Gateway types
└── shared/
    ├── security/                       # Security services
    ├── secrets-manager/                # AWS Secrets Manager
    └── errors/                         # Error handling
```

## 🌍 Supported Payment Gateways

### Production Ready

#### 1. **Stripe** (Global)
- ✅ Payment intents
- ✅ Subscriptions
- ✅ Refunds
- ✅ Webhooks
- ✅ Customer management
- ✅ Multi-currency support

#### 2. **DPO Pay** (African Markets)
- ✅ 20+ African countries
- ✅ Mobile money integration
- ✅ Credit/debit cards
- ✅ Bank transfers
- ✅ Multi-currency (UGX, KES, TZS, RWF, GHS, etc.)
- ✅ XML security validation
- ✅ Webhook processing

### In Development

#### 3. **PayPal** (Global)
- 🔄 Payment processing
- 🔄 Subscription management
- 🔄 Refund handling

#### 4. **Square** (US, Canada, Australia, UK)
- 🔄 Payment processing
- 🔄 In-person payments
- 🔄 Subscription management

#### 5. **Razorpay** (India, Southeast Asia)
- 🔄 Payment processing
- 🔄 UPI integration
- 🔄 Local payment methods

#### 6. **Braintree** (Global)
- 🔄 PayPal integration
- 🔄 Venmo support
- 🔄 Advanced fraud protection

## 🔐 Security Features

### Comprehensive Security Hardening

- **AWS Secrets Manager Integration**: Secure credential management
- **Input Sanitization**: XSS and injection prevention with DOMPurify
- **XML Validation**: XXE attack prevention for DPO Pay
- **Rate Limiting**: Payment-specific rate limiting (10 requests/minute)
- **Security Logging**: Comprehensive audit trails
- **Error Handling**: User-friendly error messages with security awareness
- **Request Validation**: Comprehensive input validation
- **Encryption**: End-to-end encryption for sensitive data

### Payment Security

- **PCI DSS Compliance**: Secure payment data handling
- **Fraud Detection**: Real-time fraud monitoring
- **3D Secure**: Enhanced authentication for card payments
- **Webhook Verification**: Cryptographic signature validation
- **Idempotency**: Duplicate payment prevention

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose
- AWS CLI (for production)

### Local Development

1. **Clone and Install**
```bash
git clone <repository-url>
cd backend/payment-service
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

3. **Database Setup**
```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run migrations
npm run migration:run
```

4. **Start Development Server**
```bash
npm run start:dev
```

The service will be available at `http://localhost:3006`

### Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start with rebuild
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f payment-service
```

## 📋 Configuration

### Environment Variables

#### Core Configuration
```bash
# Service Configuration
NODE_ENV=development
PORT=3006
SERVICE_NAME=payment-service

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_payments

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h
```

#### Payment Gateway Configuration
```bash
# Default Gateway
DEFAULT_PAYMENT_GATEWAY=stripe
DEFAULT_CURRENCY=usd

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# DPO Pay Configuration
DPO_COMPANY_TOKEN=your_dpo_company_token
DPO_SERVICE_TYPE=your_service_type
DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
DPO_PAYMENT_URL=https://secure.3gdirectpay.com/payv2.php
DPO_TEST_MODE=true

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox

# Currency Converter
CURRENCY_API_KEY=your_currency_api_key
EXCHANGERATE_API_KEY=your_exchangerate_api_key
FIXER_API_KEY=your_fixer_api_key
```

#### Security Configuration
```bash
# AWS Secrets Manager
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Security Settings
MAX_REQUEST_SIZE=10mb
REQUEST_TIMEOUT=30000
RATE_LIMIT_MAX=100
PAYMENT_RATE_LIMIT_MAX=10

# Monitoring
MONITORING_ENABLED=true
MONITORING_WEBHOOK_URL=your_webhook_url
```

## 🔌 API Documentation

### Authentication

All endpoints require JWT authentication:
```http
Authorization: Bearer <jwt_token>
```

### Payment Operations

#### Create Payment Intent
```http
POST /api/payments
Content-Type: application/json

{
  "amount": 2999,
  "currency": "usd",
  "type": "one_time",
  "gateway": "stripe",
  "description": "Premium subscription",
  "metadata": {
    "feature": "premium",
    "userId": "user_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_xyz",
    "status": "requires_payment_method",
    "amount": 2999,
    "currency": "usd",
    "paymentUrl": "https://checkout.stripe.com/...",
    "metadata": {
      "gateway": "stripe"
    }
  }
}
```

#### Get User Payments
```http
GET /api/payments?page=1&limit=10&status=succeeded
```

#### Process Refund
```http
POST /api/payments/{paymentId}/refund
Content-Type: application/json

{
  "amount": 1000,
  "reason": "Customer request"
}
```

### Subscription Operations

#### Create Subscription
```http
POST /api/payments/subscriptions
Content-Type: application/json

{
  "plan": "premium",
  "priceId": "price_1234567890",
  "gateway": "stripe",
  "billingCycle": "monthly",
  "trialPeriodDays": 14
}
```

#### Cancel Subscription
```http
DELETE /api/payments/subscriptions/{subscriptionId}
```

### Gateway Management

#### Get Available Gateways
```http
GET /api/payments/gateways
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "stripe",
      "name": "Stripe",
      "configured": true,
      "supportedCurrencies": ["usd", "eur", "gbp"],
      "supportedCountries": ["US", "CA", "GB", "EU"]
    },
    {
      "type": "dpo",
      "name": "DPO Pay",
      "configured": true,
      "supportedCurrencies": ["ugx", "kes", "tzs", "rwf"],
      "supportedCountries": ["UG", "KE", "TZ", "RW"]
    }
  ]
}
```

#### Get Gateway Configuration
```http
GET /api/payments/config?gateway=stripe
```

### Currency Operations

#### Get Exchange Rates
```http
GET /api/payments/currency/rates?from=usd&to=ugx
```

#### Convert Currency
```http
POST /api/payments/currency/convert
Content-Type: application/json

{
  "amount": 100,
  "from": "usd",
  "to": "ugx"
}
```

### Webhook Endpoints

#### Stripe Webhooks
```http
POST /api/payments/webhooks/stripe
```

#### DPO Pay Webhooks
```http
POST /api/payments/webhooks/dpo
```

## 📚 Additional Resources

- [DPO Pay Integration Guide](./DPO_INTEGRATION_GUIDE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Integration Testing](./INTEGRATION_TEST.md)
- [Security Hardening Implementation](../SECURITY_HARDENING_IMPLEMENTATION.md)
- [API Documentation](http://localhost:3006/api/docs) (when running locally)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and guides

---

**MindLyfe Payment Service** - Secure, scalable payment processing for mental health services. 
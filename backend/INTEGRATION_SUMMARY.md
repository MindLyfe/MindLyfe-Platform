# MindLyfe Services Integration Summary

## Overview

This document outlines the complete integration between all MindLyfe services, with special focus on the payment service and auth service communication patterns.

## Service Architecture

### Core Services
- **Auth Service** (Port 3001) - Authentication, authorization, user management, local payments (UGX)
- **Payment Service** (Port 3006) - International payments (Stripe, PayPal, etc.)
- **Resources Service** (Port 3007) - Admin/support file management
- **API Gateway** (Port 3000) - Central routing and authentication

### Supporting Services
- **Teletherapy Service** (Port 3002)
- **Chat Service** (Port 3003)
- **Community Service** (Port 3004)
- **Notification Service** (Port 3005)
- **AI Service** (Port 8000)
- **Journal Service** (Port 8001)
- **Recommender Service** (Port 8002)
- **LyfBot Service** (Port 8003)

## Payment System Integration

### Dual Payment Architecture

The MindLyfe platform supports two payment systems:

1. **Local Payments (Auth Service)**
   - Currency: UGX (Ugandan Shillings)
   - Methods: Mobile Money, Bank Transfer, Cash
   - Target: Local users in Uganda
   - Features: Organization subscriptions, monthly memberships, session credits

2. **International Payments (Payment Service)**
   - Currency: USD, EUR, etc.
   - Methods: Stripe, PayPal, Square, Razorpay, Braintree
   - Target: International users
   - Features: Gateway-agnostic architecture, multiple providers

### Auth Service ↔ Payment Service Communication

#### Payment Access Validation
```http
POST /auth/validate-payment-access
Authorization: Bearer <service_token>
X-Service-Name: payment-service

{
  "userId": "user-uuid",
  "paymentType": "subscription",
  "amount": 2999
}

Response:
{
  "canMakePayment": true,
  "userId": "user-uuid",
  "paymentType": "subscription",
  "amount": 2999
}
```

#### User Information Retrieval
```http
GET /auth/users/{userId}
Authorization: Bearer <service_token>
X-Service-Name: payment-service

Response:
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "status": "active",
    "emailVerified": true,
    "twoFactorEnabled": false
  }
}
```

#### Payment Notifications
```http
POST /auth/users/{userId}/payment-notification
Authorization: Bearer <service_token>
X-Service-Name: payment-service

{
  "type": "payment_succeeded",
  "paymentId": "payment-uuid",
  "amount": 2999,
  "currency": "usd",
  "gateway": "stripe",
  "metadata": {}
}
```

#### Subscription Status Check
```http
GET /auth/users/{userId}/subscription-status
Authorization: Bearer <service_token>
X-Service-Name: payment-service

Response:
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "subscription": {
    "hasActiveSubscription": true,
    "subscriptions": [...],
    "userType": "individual",
    "organizationId": null,
    "canMakePayments": true
  }
}
```

## API Gateway Routing

### Public Routes (No Authentication)
- `GET /api/auth/*` - Authentication endpoints
- `POST /api/payments/webhook` - Payment gateway webhooks

### Protected Routes (JWT Required)
- `GET /api/payments/*` - Payment operations
- `GET /api/resources/*` - Resource management
- `GET /api/users/*` - User management
- `GET /api/ai/*` - AI services
- `GET /api/journal/*` - Journal services
- `GET /api/lyfbot/*` - LyfBot services
- `GET /api/recommender/*` - Recommendation services
- `GET /api/chat/*` - Chat services
- `GET /api/teletherapy/*` - Teletherapy services
- `GET /api/community/*` - Community services
- `GET /api/notifications/*` - Notification services

### Service Discovery
All services are configured in the API Gateway:
```typescript
services: {
  auth: { url: 'http://auth-service:3001' },
  payment: { url: 'http://payment-service:3006' },
  resources: { url: 'http://resources-service:3007' },
  // ... other services
}
```

## Payment Service Features

### Gateway-Agnostic Architecture
- **Stripe Gateway**: Full implementation with payments, subscriptions, refunds
- **PayPal Gateway**: Skeleton implementation ready for development
- **Factory Pattern**: Easy addition of new payment gateways
- **Universal Webhooks**: Auto-detection of gateway type from headers

### Key Endpoints
```http
# Create Payment
POST /api/payments
{
  "amount": 2999,
  "currency": "usd",
  "type": "one_time",
  "gateway": "stripe",
  "description": "Premium subscription"
}

# Create Subscription
POST /api/payments/subscriptions
{
  "plan": "premium",
  "priceId": "price_1234567890",
  "gateway": "stripe",
  "billingCycle": "monthly"
}

# Get Available Gateways
GET /api/payments/gateways

# Get Gateway Configuration
GET /api/payments/config?gateway=stripe

# Universal Webhook
POST /api/payments/webhook
```

### Payment Flow Integration
1. **User initiates payment** → API Gateway → Payment Service
2. **Payment Service validates access** → Auth Service
3. **Payment Service gets user info** → Auth Service
4. **Payment Service creates payment** → Gateway (Stripe/PayPal)
5. **Payment Service saves to database**
6. **Payment Service sends notifications** → Notification Service
7. **Payment Service notifies auth** → Auth Service

### Webhook Flow Integration
1. **Gateway sends webhook** → API Gateway → Payment Service
2. **Payment Service processes webhook**
3. **Payment Service updates database**
4. **Payment Service sends notifications** → Notification Service
5. **Payment Service notifies auth** → Auth Service

## Resources Service Features

### Admin-Only Resource Management
- **File Upload**: Support for documents, images, videos, audio
- **Access Control**: Only admin/support roles can create/modify
- **Public Access**: All users can view published resources
- **Categories**: Anxiety, depression, stress, mindfulness, etc.
- **File Validation**: 10MB limit, MIME type restrictions

### Key Endpoints
```http
# Upload Resource (Admin Only)
POST /api/resources
Content-Type: multipart/form-data

# Get Resources (Public)
GET /api/resources?category=anxiety&type=article

# Get Resource by ID (Public)
GET /api/resources/{id}

# Update Resource (Admin Only)
PUT /api/resources/{id}

# Delete Resource (Admin Only)
DELETE /api/resources/{id}
```

## Service Communication Patterns

### Authentication Flow
1. **User authenticates** → Auth Service
2. **JWT token issued** → Client
3. **Client makes requests** → API Gateway
4. **API Gateway validates JWT** → Auth Service
5. **Request forwarded** → Target Service

### Service-to-Service Authentication
- **Service Token**: Each service has a unique service token
- **Header**: `X-Service-Name` identifies the calling service
- **Validation**: Auth service validates service tokens

### Error Handling
- **Gateway Errors**: 500 with service identification
- **Auth Errors**: 401/403 with clear messages
- **Payment Errors**: Gateway-specific error mapping
- **Validation Errors**: 400 with detailed field errors

## Database Integration

### Payment Service Database
- **Payments Table**: Gateway-agnostic with legacy Stripe fields
- **Subscriptions Table**: Multi-gateway support
- **Indexes**: Optimized for user queries and gateway lookups

### Auth Service Database
- **Users Table**: Enhanced with payment-related fields
- **Local Payments Table**: UGX payments and mobile money
- **Subscriptions Table**: Local subscription management
- **Organizations Table**: Bulk payment management

## Monitoring and Logging

### Service Health Checks
- `GET /health` - Basic service health
- `GET /api/health` - API Gateway health with service status

### Logging Patterns
- **Structured Logging**: JSON format with service context
- **Request Tracing**: Unique request IDs across services
- **Error Tracking**: Detailed error logs with stack traces
- **Performance Metrics**: Response times and throughput

## Security Considerations

### Payment Security
- **PCI Compliance**: No sensitive payment data stored locally
- **Webhook Verification**: Signature validation for all webhooks
- **Service Tokens**: Secure service-to-service communication
- **Rate Limiting**: Protection against abuse

### Access Control
- **JWT Validation**: All protected endpoints require valid JWT
- **Role-Based Access**: Admin/support roles for resource management
- **Payment Authorization**: Auth service validates payment permissions
- **Minor Protection**: Special rules for users under 18

## Deployment Configuration

### Docker Compose Services
```yaml
payment-service:
  ports: ["3006:3006"]
  environment:
    - DEFAULT_PAYMENT_GATEWAY=stripe
    - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    - AUTH_SERVICE_URL=http://auth-service:3001

resources-service:
  ports: ["3007:3007"]
  environment:
    - AUTH_SERVICE_URL=http://auth-service:3001
    - MAX_FILE_SIZE=10485760

api-gateway:
  ports: ["3000:3000"]
  environment:
    - PAYMENT_SERVICE_URL=http://payment-service:3006
    - RESOURCES_SERVICE_URL=http://resources-service:3007
```

### Environment Variables
- **Payment Gateways**: Stripe, PayPal, Square, Razorpay, Braintree
- **Service URLs**: All service endpoints configured
- **Security**: JWT secrets and service tokens
- **File Upload**: Size limits and allowed types

## Future Enhancements

### Payment Service
- **Additional Gateways**: Square, Razorpay, Braintree implementation
- **Recurring Billing**: Advanced subscription management
- **Multi-Currency**: Dynamic currency conversion
- **Payment Analytics**: Detailed reporting and metrics

### Integration Improvements
- **Event Streaming**: Real-time event propagation
- **Circuit Breakers**: Resilience patterns for service failures
- **Caching**: Redis-based caching for frequently accessed data
- **API Versioning**: Backward compatibility for API changes

## Payment Service Integration with DPO Pay

### DPO Pay as Primary Gateway
- **Default Gateway**: DPO Pay is now the primary payment gateway for African users
- **Location-Based Selection**: Automatic gateway selection based on user country and currency
- **Currency Detection**: Automatic currency detection for 13+ African countries
- **Mobile Money Support**: Native support for MTN, Safaricom, Vodacom, Orange, and other African mobile networks

### Supported African Countries & Currencies
| Country | Currency | Code | Mobile Network |
|---------|----------|------|----------------|
| Uganda | Uganda Shilling | UGX | MTN |
| Kenya | Kenyan Shilling | KES | Safaricom |
| Tanzania | Tanzanian Shilling | TZS | Vodacom |
| Rwanda | Rwandan Franc | RWF | MTN |
| Ghana | Ghanaian Cedi | GHS | MTN |
| Zambia | Zambian Kwacha | ZMW | MTN |
| Nigeria | Nigerian Naira | NGN | MTN |
| South Africa | South African Rand | ZAR | Vodacom |
| And 5+ more African countries |

### Enhanced Payment Endpoints
- `GET /api/payments/config` - Get payment configuration with automatic gateway/currency detection
- `POST /api/payments/detect-currency` - Detect appropriate currency based on location
- `GET /api/payments/currencies` - Get supported currencies by gateway
- `GET /api/payments/gateways` - Get available payment gateways
- `POST /api/payments/webhook/dpo` - DPO Pay webhook endpoint

### Gateway Selection Logic
1. **African Countries**: Automatically use DPO Pay for users from supported African countries
2. **African Currencies**: Use DPO Pay for payments in African currencies
3. **IP Detection**: Fallback to IP-based location detection
4. **Manual Override**: Users can manually select preferred gateway
5. **International Fallback**: Use Stripe for non-African users

### Payment Flow Integration
1. **User Registration**: Country detection during signup for currency preference
2. **Payment Creation**: Automatic gateway and currency selection
3. **Auth Service**: Payment access validation and user data retrieval
4. **Notification Service**: Payment status notifications
5. **Webhook Processing**: Real-time payment status updates

### Configuration
```bash
# DPO Pay Configuration (Primary Gateway)
DEFAULT_PAYMENT_GATEWAY=dpo
DPO_COMPANY_TOKEN=your-dpo-company-token
DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
DPO_TEST_MODE=true

# Localization Settings
DEFAULT_CURRENCY=UGX
DEFAULT_COUNTRY=UG
SUPPORTED_CURRENCIES=UGX,KES,TZS,RWF,GHS,ZMW,XOF,NAD,BWP,ZAR,MWK,NGN,AED,USD,EUR,GBP
```

This integration ensures a robust, scalable, and secure payment system that works seamlessly with the existing MindLyfe architecture while providing flexibility for future enhancements.
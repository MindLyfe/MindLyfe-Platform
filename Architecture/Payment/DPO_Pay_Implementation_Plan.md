# DPO Pay Implementation Plan for MindLyf Platform

**Version:** 1.0  
**Date:** 2024-07-15  
**Author:** Harbi, Backend Engineer  
**Reviewers:** @Bob (Architect), @Ibrah (Team Lead), @Andrew (Security/QA)

## 1. Executive Summary

This document outlines the technical implementation plan for integrating DPO Pay payment processing into the MindLyf platform. It focuses on secure handling of UGX currency transactions, PCI compliance, and supporting all required payment models (individual subscriptions, à la carte purchases, organizational memberships, and student plans).

## 2. Technical Architecture

### 2.1 Payment Service Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  MindLyf UI     │────▶│  API Gateway    │────▶│  Auth Service   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Payment Service │◀───▶│  DPO Pay API   │     │  User Service   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Payment DB     │     │  Subscription   │◀───▶│  User DB        │
│                 │     │  Service        │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Component Descriptions

#### Payment Service
A dedicated microservice responsible for all payment-related operations:
- Initiating transactions with DPO Pay (`createToken`)
- Verifying transaction status (`verifyToken`)
- Managing payment records and transaction history
- Handling subscription lifecycle events
- Implementing retry mechanisms for failed transactions

#### Subscription Service
Manages subscription states and business rules:
- Subscription tier management
- Renewal scheduling and notifications
- Access control based on subscription status
- Organization and student plan management

#### Payment Database
Stores all payment-related data with the following key entities:
- Transactions (with DPO Pay references)
- Payment history
- Subscription records
- Organization billing accounts

## 3. API Implementation

### 3.1 `createToken` Implementation

```typescript
// Payment Service API
interface CreatePaymentRequest {
  userId: string;
  paymentType: 'SUBSCRIPTION' | 'ONE_TIME' | 'ORGANIZATION' | 'STUDENT';
  amount: number; // Always in UGX
  description: string;
  metadata: {
    tier?: string;
    duration?: string;
    itemId?: string;
    organizationId?: string;
    seats?: number;
  };
}

interface CreatePaymentResponse {
  success: boolean;
  paymentId: string; // Internal reference
  redirectUrl: string; // DPO payment page URL with token
  transactionRef: string; // DPO TransRef
}

// Internal DPO Pay client implementation
interface DPOCreateTokenRequest {
  CompanyToken: string; // Securely stored in environment variables
  Request: {
    Transaction: {
      PaymentAmount: number;
      PaymentCurrency: string; // Always "UGX"
      CompanyRef: string; // Our internal reference
      RedirectURL: string;
      BackURL: string;
    };
    Services: {
      Service: {
        ServiceType: string;
        ServiceDescription: string;
        ServiceDate: string;
      };
    };
  };
}
```

#### Implementation Notes
1. All DPO Pay API credentials will be stored in AWS Secrets Manager, not hardcoded
2. XML request generation will use a validated library with proper encoding
3. All amounts will be validated to ensure they're in UGX and within acceptable ranges
4. Comprehensive error handling with specific error codes and messages
5. All API calls will be logged for audit purposes (excluding sensitive data)

### 3.2 `verifyToken` Implementation

```typescript
// Payment Service API
interface VerifyPaymentRequest {
  paymentId: string; // Our internal reference
  transToken: string; // DPO TransToken
  transRef: string;  // DPO TransRef
}

interface VerifyPaymentResponse {
  success: boolean;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  transactionDetails: {
    amount: number;
    currency: string;
    date: string;
    paymentMethod: string;
    resultCode: string;
    resultDesc: string;
  };
}

// Internal DPO Pay client implementation
interface DPOVerifyTokenRequest {
  CompanyToken: string;
  Request: {
    Transaction: {
      TransactionToken: string;
    };
  };
}
```

#### Implementation Notes
1. Verification will be attempted immediately after redirect and via background jobs
2. Implement idempotent processing to handle multiple verification attempts
3. Comprehensive logging of verification attempts and results
4. Webhook endpoint for asynchronous notifications (if supported by DPO)

## 4. Database Schema

### 4.1 Transactions Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
  payment_type VARCHAR(20) NOT NULL, -- SUBSCRIPTION, ONE_TIME, ORGANIZATION, STUDENT
  description TEXT NOT NULL,
  metadata JSONB,
  status VARCHAR(20) NOT NULL, -- INITIATED, PENDING, COMPLETED, FAILED, REFUNDED
  dpo_company_ref VARCHAR(100) NOT NULL,
  dpo_trans_token VARCHAR(100),
  dpo_trans_ref VARCHAR(100),
  dpo_result_code VARCHAR(10),
  dpo_result_desc TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_organization_id ON transactions(organization_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

### 4.2 Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  tier VARCHAR(20) NOT NULL, -- BASIC, PREMIUM, PRO, ORGANIZATION, STUDENT
  status VARCHAR(20) NOT NULL, -- ACTIVE, INACTIVE, PENDING, CANCELLED
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
  renewal_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  last_transaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (last_transaction_id) REFERENCES transactions(id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
```

### 4.3 Organization Accounts Table

```sql
CREATE TABLE organization_accounts (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  plan_type VARCHAR(20) NOT NULL,
  seats_purchased INTEGER NOT NULL,
  seats_allocated INTEGER NOT NULL DEFAULT 0,
  billing_cycle VARCHAR(20) NOT NULL, -- MONTHLY, QUARTERLY, ANNUAL
  next_billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL, -- ACTIVE, INACTIVE, PENDING, CANCELLED
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_org_accounts_organization_id ON organization_accounts(organization_id);
CREATE INDEX idx_org_accounts_next_billing_date ON organization_accounts(next_billing_date);
```

## 5. Security Implementation

### 5.1 PCI Compliance Measures

1. **Card Data Flow**
   - MindLyf will **never** store, process, or transmit full credit card details
   - All payment capture occurs on DPO Pay's secure payment pages
   - Implement proper iframe integration if DPO supports embedded payment forms

2. **Tokenization**
   - If DPO Pay supports tokenization for recurring payments, implement secure token storage
   - Tokens will be encrypted at rest using AES-256

3. **Audit Logging**
   - Implement comprehensive logging of all payment operations (excluding sensitive data)
   - Log all administrative actions related to payment configuration
   - Retain logs for at least 1 year with proper access controls

4. **Access Controls**
   - Implement role-based access control for payment administration
   - Restrict access to payment data to authorized personnel only
   - Implement IP restrictions for administrative access to payment systems

### 5.2 API Security

1. **Transport Security**
   - All API communication with DPO Pay will use TLS 1.2+ with strong cipher suites
   - Certificate validation will be strictly enforced
   - Implement certificate pinning for DPO Pay API endpoints

2. **Authentication**
   - Securely store the DPO Pay `CompanyToken` in AWS Secrets Manager
   - Rotate credentials according to security policy (minimum every 90 days)
   - Implement proper key rotation procedures

3. **Request/Response Validation**
   - Validate all incoming and outgoing data against schemas
   - Implement proper XML/JSON encoding to prevent injection attacks
   - Sanitize all user inputs before including in payment requests

### 5.3 UGX Currency Security

1. **Amount Validation**
   - Implement strict validation of payment amounts
   - Enforce minimum and maximum transaction limits
   - Validate currency codes to ensure UGX is used consistently

2. **Fraud Prevention**
   - Implement velocity checks to detect unusual payment patterns
   - Monitor for suspicious transaction patterns (multiple failed attempts, etc.)
   - Implement IP-based geolocation validation for high-risk transactions

3. **Reconciliation**
   - Implement daily reconciliation with DPO Pay settlement reports
   - Automate detection of discrepancies
   - Maintain detailed transaction logs for audit purposes

## 6. Subscription Management

### 6.1 Individual Subscriptions

1. **Subscription Lifecycle**
   - Create subscription record upon successful payment verification
   - Track subscription status (active, pending, cancelled, expired)
   - Implement renewal reminders (7 days, 3 days, 1 day before expiration)

2. **Renewal Process**
   - If DPO Pay supports tokenization:
     - Implement automatic renewal using stored payment token
     - Handle failed renewals with retry logic and user notifications
   - If manual renewal is required:
     - Implement reminder system with direct payment links
     - Provide grace period for renewal (configurable, default 3 days)

3. **Tier Management**
   - Implement access control based on subscription tier
   - Support tier upgrades/downgrades at renewal time
   - Prorate charges for mid-cycle tier changes if supported

### 6.2 Organizational Subscriptions

1. **Organization Account Management**
   - Track purchased seats vs. allocated seats
   - Implement seat allocation/deallocation APIs
   - Support organization admin dashboard for seat management

2. **Billing Cycles**
   - Support monthly, quarterly, and annual billing cycles
   - Implement renewal process similar to individual subscriptions
   - Support adding seats mid-cycle with prorated charges

3. **User Management**
   - Track organization membership for users
   - Support bulk user import/onboarding
   - Implement access revocation when users are removed

### 6.3 Student Plans

1. **Verification**
   - Implement student status verification (email domain, ID upload)
   - Support bulk verification for university partnerships
   - Track verification expiration and renewal requirements

2. **University Billing**
   - Support direct university billing for student access
   - Track allocation of student licenses
   - Support usage reporting for universities

## 7. Error Handling & Resilience

### 7.1 Error Scenarios

1. **Payment Initiation Failures**
   - Network errors connecting to DPO Pay
   - Invalid request parameters
   - DPO Pay service unavailability
   - Currency or amount validation failures

2. **Payment Verification Failures**
   - User abandons payment process
   - Payment declined by issuing bank
   - Verification API failures
   - Timeout during payment process

3. **Subscription Management Failures**
   - Failed renewal attempts
   - Database transaction failures
   - Inconsistent state between systems

### 7.2 Resilience Strategies

1. **Retry Mechanisms**
   - Implement exponential backoff for API calls
   - Set appropriate timeouts for all external calls
   - Implement circuit breakers to prevent cascading failures

2. **Asynchronous Processing**
   - Use message queues for payment verification
   - Implement idempotent processing for all payment operations
   - Support manual reconciliation for edge cases

3. **Monitoring & Alerting**
   - Real-time monitoring of payment success rates
   - Alerts for unusual failure patterns
   - Dashboard for payment system health

## 8. Testing Strategy

### 8.1 Unit Testing

- Test all payment service methods in isolation
- Mock DPO Pay API responses for various scenarios
- Achieve >90% code coverage for payment service

### 8.2 Integration Testing

- Test integration with DPO Pay sandbox environment
- Verify correct handling of all response codes
- Test subscription lifecycle flows end-to-end

### 8.3 Security Testing

- Conduct penetration testing of payment flows
- Verify PCI compliance measures
- Test encryption and key management

### 8.4 Performance Testing

- Benchmark payment processing latency
- Test system under peak load conditions
- Verify database query performance for payment operations

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

- Set up payment service infrastructure
- Implement database schema
- Create DPO Pay API client with `createToken` and `verifyToken`
- Implement basic error handling and logging

### Phase 2: Core Payment Flows (Weeks 3-4)

- Implement individual subscription payment flow
- Implement à la carte purchase flow
- Create payment history and receipt generation
- Develop basic admin interface for payment management

### Phase 3: Advanced Features (Weeks 5-6)

- Implement organization billing and seat management
- Develop student plan verification and management
- Create subscription renewal system
- Implement reconciliation and reporting

### Phase 4: Optimization & Security (Weeks 7-8)

- Conduct security review and penetration testing
- Optimize database queries and API performance
- Implement advanced monitoring and alerting
- Develop comprehensive admin dashboard

## 10. Appendices

### Appendix A: DPO Pay API Reference

- API Endpoint: https://secure.dpopay.com/api/
- Documentation: https://docs.dpopay.com/api/index.html
- Support Contact: support@dpopay.com

### Appendix B: Error Codes & Handling

| Error Code | Description | Handling Strategy |
|------------|-------------|-------------------|
| 000 | Transaction successful | Process payment completion |
| 801 | Invalid company token | Alert system administrators, retry with correct token |
| 802 | Invalid XML format | Log error, fix request formatting |
| 900 | Invalid transaction token | Restart payment process |
| 904 | Currency not supported | Verify UGX is configured correctly |
| 905 | Amount below minimum | Inform user of minimum amount |
| 906 | Amount above maximum | Inform user of maximum amount |

### Appendix C: Security Checklist

- [ ] PCI DSS compliance review completed
- [ ] Secure credential storage implemented
- [ ] TLS 1.2+ enforced for all API communication
- [ ] Input validation implemented for all user inputs
- [ ] Proper error handling without information disclosure
- [ ] Audit logging implemented for all payment operations
- [ ] Access controls implemented for payment administration
- [ ] Encryption of sensitive data at rest and in transit
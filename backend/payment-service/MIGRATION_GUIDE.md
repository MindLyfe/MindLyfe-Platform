# Payment Service Migration Guide

## Overview

This guide covers the migration from the Stripe-only payment service to the new gateway-agnostic architecture. The new implementation maintains backward compatibility while adding support for multiple payment providers.

## Database Schema Changes

### New Columns Added

#### Payments Table
```sql
-- Add new gateway-agnostic columns
ALTER TABLE payments 
ADD COLUMN gateway_payment_id VARCHAR,
ADD COLUMN gateway_customer_id VARCHAR,
ADD COLUMN gateway_subscription_id VARCHAR,
ADD COLUMN gateway payment_gateway_type DEFAULT 'stripe';

-- Create indexes for new columns
CREATE INDEX idx_payments_gateway_payment_id ON payments(gateway_payment_id);
CREATE INDEX idx_payments_gateway ON payments(gateway);

-- Make gateway_payment_id unique
ALTER TABLE payments ADD CONSTRAINT uk_payments_gateway_payment_id UNIQUE (gateway_payment_id);
```

#### Subscriptions Table
```sql
-- Add new gateway-agnostic columns
ALTER TABLE subscriptions 
ADD COLUMN gateway_subscription_id VARCHAR,
ADD COLUMN gateway_customer_id VARCHAR,
ADD COLUMN gateway_price_id VARCHAR,
ADD COLUMN gateway payment_gateway_type DEFAULT 'stripe';

-- Create indexes for new columns
CREATE INDEX idx_subscriptions_gateway_subscription_id ON subscriptions(gateway_subscription_id);
CREATE INDEX idx_subscriptions_gateway ON subscriptions(gateway);

-- Make gateway_subscription_id unique
ALTER TABLE subscriptions ADD CONSTRAINT uk_subscriptions_gateway_subscription_id UNIQUE (gateway_subscription_id);
```

### Data Migration

#### Migrate Existing Payment Data
```sql
-- Copy Stripe data to new gateway-agnostic columns
UPDATE payments 
SET 
  gateway_payment_id = stripe_payment_intent_id,
  gateway_customer_id = stripe_customer_id,
  gateway_subscription_id = stripe_subscription_id,
  gateway = 'stripe'
WHERE stripe_payment_intent_id IS NOT NULL;
```

#### Migrate Existing Subscription Data
```sql
-- Copy Stripe data to new gateway-agnostic columns
UPDATE subscriptions 
SET 
  gateway_subscription_id = stripe_subscription_id,
  gateway_customer_id = stripe_customer_id,
  gateway_price_id = stripe_price_id,
  gateway = 'stripe'
WHERE stripe_subscription_id IS NOT NULL;
```

### Index Updates

#### Remove Old Indexes
```sql
-- Remove old Stripe-specific indexes
DROP INDEX IF EXISTS idx_payments_stripe_payment_intent_id;
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;
```

#### Update Unique Constraints
```sql
-- Update payments table
ALTER TABLE payments DROP CONSTRAINT IF EXISTS uk_payments_stripe_payment_intent_id;

-- Update subscriptions table  
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS uk_subscriptions_stripe_subscription_id;
```

## Configuration Migration

### Environment Variables

#### Old Configuration (Stripe Only)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
```

#### New Configuration (Multi-Gateway)
```bash
# Default Gateway Configuration
DEFAULT_PAYMENT_GATEWAY=stripe
DEFAULT_CURRENCY=usd

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd

# PayPal Configuration (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_SECRET=your_paypal_webhook_secret
PAYPAL_ENVIRONMENT=sandbox

# Additional gateways can be added as needed
```

## API Changes

### Backward Compatibility

All existing API endpoints remain functional with the same request/response formats. The service automatically uses the default gateway (Stripe) when no gateway is specified.

### New Features

#### Gateway Selection
```typescript
// Create payment with specific gateway
POST /api/payments
{
  "amount": 2999,
  "currency": "usd",
  "type": "one_time",
  "gateway": "stripe",  // New optional field
  "description": "Premium subscription"
}
```

#### Gateway Management
```typescript
// Get available gateways
GET /api/payments/gateways

// Get gateway configuration
GET /api/payments/config?gateway=stripe
```

### Webhook Changes

#### Old Webhook Endpoint
```typescript
POST /api/payments/webhook
Headers: {
  "stripe-signature": "..."
}
```

#### New Universal Webhook Endpoint
```typescript
POST /api/payments/webhook
Headers: {
  "stripe-signature": "...",      // For Stripe
  "paypal-transmission-id": "..." // For PayPal
}
```

The service automatically detects the gateway type based on headers.

## Code Migration

### Service Layer Changes

#### Old Implementation
```typescript
// Direct Stripe service usage
constructor(
  private readonly stripeService: StripeService,
) {}

async createPayment(userId: string, dto: CreatePaymentDto) {
  const paymentIntent = await this.stripeService.createPaymentIntent(...);
  // ...
}
```

#### New Implementation
```typescript
// Gateway factory usage
constructor(
  private readonly gatewayFactory: PaymentGatewayFactory,
) {}

async createPayment(userId: string, dto: CreatePaymentDto) {
  const gateway = dto.gateway 
    ? this.gatewayFactory.getGateway(dto.gateway)
    : this.gatewayFactory.getDefaultGateway();
    
  const paymentIntent = await gateway.createPaymentIntent(...);
  // ...
}
```

### Entity Changes

#### Old Entity Fields
```typescript
@Entity('payments')
export class Payment {
  @Column({ name: 'stripe_payment_intent_id', unique: true })
  stripePaymentIntentId: string;
  
  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;
}
```

#### New Entity Fields
```typescript
@Entity('payments')
export class Payment {
  // New gateway-agnostic fields
  @Column({ name: 'gateway_payment_id', unique: true })
  gatewayPaymentId: string;
  
  @Column({ name: 'gateway_customer_id', nullable: true })
  gatewayCustomerId?: string;
  
  @Column({ type: 'enum', enum: PaymentGatewayType, default: PaymentGatewayType.STRIPE })
  gateway: PaymentGatewayType;
  
  // Legacy fields (maintained for backward compatibility)
  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId?: string;
  
  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;
}
```

## Testing Migration

### Unit Tests

#### Test Gateway Abstraction
```typescript
describe('PaymentGatewayFactory', () => {
  it('should return Stripe gateway by default', () => {
    const gateway = factory.getDefaultGateway();
    expect(gateway.name).toBe('stripe');
  });
  
  it('should return specific gateway when requested', () => {
    const gateway = factory.getGateway(PaymentGatewayType.PAYPAL);
    expect(gateway.name).toBe('paypal');
  });
});
```

#### Test Backward Compatibility
```typescript
describe('Backward Compatibility', () => {
  it('should work with existing payment data', async () => {
    // Test that existing payments can be retrieved and processed
    const payment = await service.getPaymentById(existingPaymentId, userId);
    expect(payment).toBeDefined();
  });
});
```

### Integration Tests

#### Test Multi-Gateway Support
```typescript
describe('Multi-Gateway Integration', () => {
  it('should create payment with Stripe', async () => {
    const payment = await service.createPayment(userId, {
      ...baseDto,
      gateway: PaymentGatewayType.STRIPE
    });
    expect(payment.gateway).toBe(PaymentGatewayType.STRIPE);
  });
  
  it('should create payment with PayPal', async () => {
    const payment = await service.createPayment(userId, {
      ...baseDto,
      gateway: PaymentGatewayType.PAYPAL
    });
    expect(payment.gateway).toBe(PaymentGatewayType.PAYPAL);
  });
});
```

## Deployment Strategy

### Phase 1: Preparation
1. Deploy new code with feature flags disabled
2. Run database migrations
3. Verify backward compatibility

### Phase 2: Migration
1. Enable new gateway features
2. Migrate existing data
3. Update webhook configurations

### Phase 3: Validation
1. Test all payment flows
2. Verify webhook processing
3. Monitor error rates and performance

### Phase 4: Cleanup (Optional)
1. Remove legacy Stripe-specific columns (after sufficient time)
2. Clean up old webhook endpoints
3. Update documentation

## Rollback Plan

### Database Rollback
```sql
-- If rollback is needed, the legacy columns are still available
-- Simply switch back to using the old column names

-- Verify data integrity
SELECT COUNT(*) FROM payments WHERE stripe_payment_intent_id IS NOT NULL;
SELECT COUNT(*) FROM payments WHERE gateway_payment_id IS NOT NULL;
```

### Code Rollback
1. Revert to previous service implementation
2. Update environment variables
3. Restore old webhook endpoints

## Monitoring and Alerts

### Key Metrics to Monitor
- Payment success rates by gateway
- Webhook processing latency
- Gateway availability
- Error rates by gateway type

### Alerts to Set Up
- Gateway configuration errors
- Webhook signature validation failures
- Payment processing failures
- Database migration issues

## Support and Troubleshooting

### Common Issues

#### Gateway Not Configured
```
Error: Payment gateway paypal is not properly configured
Solution: Ensure all required environment variables are set
```

#### Webhook Signature Validation Failed
```
Error: Invalid webhook signature
Solution: Verify webhook secret configuration and endpoint URLs
```

#### Legacy Data Access
```
Error: Payment not found
Solution: Check both new and legacy column mappings
```

### Debug Commands

#### Check Gateway Status
```bash
curl http://localhost:3006/api/payments/gateways
```

#### Verify Configuration
```bash
curl http://localhost:3006/api/payments/config
```

#### Test Webhook Processing
```bash
curl -X POST http://localhost:3006/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{"test": "webhook"}'
```

## Post-Migration Validation

### Checklist

- [ ] All existing payments are accessible
- [ ] New payments can be created with different gateways
- [ ] Webhooks are processed correctly for all gateways
- [ ] API documentation is updated
- [ ] Monitoring and alerts are configured
- [ ] Team is trained on new features

### Performance Validation

- [ ] Payment creation latency is within acceptable limits
- [ ] Database queries are optimized
- [ ] Memory usage is stable
- [ ] No significant increase in error rates

## Conclusion

This migration maintains full backward compatibility while adding powerful multi-gateway support. The phased approach ensures minimal risk and allows for easy rollback if needed. The new architecture provides a solid foundation for adding additional payment providers in the future. 
# MindLyf Subscription System

This document outlines the restructured authentication service with the new subscription and payment system for the MindLyf mental health platform.

## Overview

The new system supports three types of users and payment plans:

1. **Organization Members** - Annual plan (680,000 UGX per user, 8 sessions)
2. **Individual Monthly Members** - Monthly plan (200,000 UGX, 4 sessions)
3. **Individual Credit Users** - Pay-per-session (76,000 UGX per session)

## Key Features

### Session Management
- **Weekly Limit**: All users can only book one session per week, regardless of plan
- **Session Credits**: Users can purchase additional credits when their plan sessions are exhausted
- **Automatic Deduction**: Sessions are automatically deducted from subscriptions or credits when used

### Payment Plans

#### Organization Plan
- **Cost**: 680,000 UGX per user annually
- **Sessions**: 8 sessions per user per year
- **Features**: 
  - Organization admin can manage users
  - Bulk billing for all organization members
  - Users can purchase additional credits when sessions are exhausted

#### Monthly Membership
- **Cost**: 200,000 UGX per month
- **Sessions**: 4 sessions per month
- **Features**:
  - Auto-renewal option
  - Can purchase additional credits
  - Access to all platform features

#### Session Credits
- **Cost**: 76,000 UGX per session
- **Expiry**: 90 days from purchase
- **Features**:
  - No subscription required
  - Can be purchased by any user type
  - Flexible payment option

## API Endpoints

### Subscription Management

#### Get Available Plans
```http
GET /api/subscriptions/plans
Authorization: Bearer <token>
```

#### Get Subscription Status
```http
GET /api/subscriptions/status
Authorization: Bearer <token>
```

#### Create Subscription
```http
POST /api/subscriptions/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "monthly",
  "paymentMethod": "mobile_money",
  "phoneNumber": "+256700000000"
}
```

#### Purchase Credits
```http
POST /api/subscriptions/credits/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "credits": 2,
  "paymentMethod": "mobile_money",
  "phoneNumber": "+256700000000"
}
```

#### Confirm Payment
```http
POST /api/subscriptions/payment/{paymentId}/confirm
Authorization: Bearer <token>
```

#### Use Session
```http
POST /api/subscriptions/session/{sessionId}/use
Authorization: Bearer <token>
```

### Organization Management

#### Create Organization
```http
POST /api/organizations/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "phoneNumber": "+256700000000",
  "address": "Kampala, Uganda",
  "maxUsers": 50
}
```

#### Create Organization Subscription
```http
POST /api/organizations/{organizationId}/subscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "bank_transfer",
  "phoneNumber": "+256700000000"
}
```

#### Add User to Organization
```http
POST /api/organizations/{organizationId}/users/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "userEmail": "user@example.com"
}
```

#### Remove User from Organization
```http
DELETE /api/organizations/{organizationId}/users/{userId}
Authorization: Bearer <token>
```

#### Get Organization Details
```http
GET /api/organizations/{organizationId}
Authorization: Bearer <token>
```

## Database Schema

### New Entities

#### Organization
- Manages organization details and subscription
- Tracks user limits and current usage
- Handles annual billing

#### Subscription
- Individual user subscriptions
- Tracks sessions used and credits available
- Manages expiration and auto-renewal

#### TherapySession
- Records all therapy sessions
- Links to subscriptions for payment tracking
- Enforces weekly booking limits

#### Payment
- Tracks all payments and transactions
- Supports multiple payment methods
- Handles payment confirmation workflow

### Updated User Entity
- Added organization relationship
- Added user type classification
- Added minor status and guardian information
- Enhanced role system with organization admin

## Business Rules

### Session Booking Rules
1. Users can only book one session per week
2. Sessions must be paid for (subscription or credits)
3. Organization members get 8 sessions annually
4. Monthly members get 4 sessions per month
5. Credits expire after 90 days

### Payment Rules
1. Organization payments are annual and cover all users
2. Monthly subscriptions auto-renew by default
3. Credits can be purchased by any user type
4. Payments expire after 30 minutes (subscriptions) or 1 hour (organizations)

### Access Rules
1. Only users with active subscriptions or credits can chat with therapists
2. Organization admins can manage their organization users
3. Users can purchase credits even with active subscriptions
4. Weekly session limit applies regardless of available sessions/credits

## User Types and Permissions

### Individual Users
- Can purchase monthly subscriptions or credits
- Can access all platform features with active subscription
- Subject to weekly session limits

### Organization Members
- Managed by organization admin
- Get sessions through organization subscription
- Can purchase additional credits
- Cannot purchase individual monthly subscriptions

### Organization Admins
- Can create and manage organization
- Can add/remove users from organization
- Can initiate organization subscription payments
- Have all organization member privileges

### Minors
- Special user type for users under 18
- Require guardian information
- Follow same subscription rules as individual users

## Payment Integration

The system is designed to integrate with various payment providers:

### Supported Payment Methods
- Mobile Money (MTN, Airtel)
- Bank Transfer
- Credit Card
- Cash (for offline payments)

### Payment Flow
1. User initiates subscription/credit purchase
2. Payment record created with unique reference
3. Payment provider processes transaction
4. Webhook/callback confirms payment
5. Subscription/credits activated automatically

## Error Handling

### Common Error Scenarios
- Insufficient sessions/credits
- Weekly limit reached
- Payment failures
- Organization user limits exceeded
- Invalid subscription types for user type

### Error Responses
All errors follow standard HTTP status codes with descriptive messages:

```json
{
  "statusCode": 400,
  "message": "User already has an active monthly subscription",
  "error": "Bad Request"
}
```

## Security Considerations

### Authentication
- All endpoints require JWT authentication
- Role-based access control for organization management
- Service-to-service authentication for internal calls

### Data Protection
- Payment information is securely stored
- PII is protected according to GDPR/local regulations
- Audit trails for all financial transactions

### Rate Limiting
- API endpoints are rate-limited to prevent abuse
- Payment endpoints have additional security measures

## Monitoring and Analytics

### Key Metrics
- Subscription conversion rates
- Session utilization rates
- Payment success rates
- Organization growth metrics
- User engagement by subscription type

### Alerts
- Failed payments
- Subscription expirations
- Unusual usage patterns
- System errors

## Future Enhancements

### Planned Features
- Family plans for multiple users
- Corporate wellness packages
- Flexible session rollover policies
- Advanced analytics dashboard
- Integration with HR systems

### Technical Improvements
- Automated subscription renewals
- Advanced payment retry logic
- Real-time usage analytics
- Mobile app integration
- Webhook management system

## Testing

### Test Scenarios
- Subscription creation and activation
- Credit purchase and usage
- Organization management workflows
- Payment confirmation flows
- Session booking and limits
- Error handling and edge cases

### Test Data
The system includes test data for:
- Sample organizations
- Test payment methods
- Mock payment confirmations
- Various user scenarios

## Deployment

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mindlyf_auth

# JWT
JWT_SECRET=your-jwt-secret

# Payment Integration
PAYMENT_PROVIDER_API_KEY=your-payment-api-key
PAYMENT_WEBHOOK_SECRET=your-webhook-secret

# Feature Flags
ENABLE_ORGANIZATION_PLANS=true
ENABLE_CREDIT_SYSTEM=true
ENABLE_AUTO_RENEWAL=true
```

### Migration
Run the migration script to set up the new database schema:
```bash
npm run migration:run
```

### Health Checks
The service includes health check endpoints to monitor:
- Database connectivity
- Payment provider status
- Subscription system health
- Organization management status

## Support and Troubleshooting

### Common Issues
1. **Payment not confirmed**: Check payment provider status and webhook configuration
2. **Session booking failed**: Verify user has available sessions/credits and hasn't exceeded weekly limit
3. **Organization user limit**: Check organization subscription status and user count

### Logging
All operations are logged with appropriate levels:
- INFO: Normal operations
- WARN: Potential issues
- ERROR: System errors requiring attention

### Contact
For technical support or questions about the subscription system, contact the development team. 
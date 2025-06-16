# Payment Screens Documentation

## Overview
The Payment screens provide secure, scalable payment processing for the MindLyfe platform through a gateway-agnostic architecture supporting multiple payment providers. The service includes comprehensive security hardening, multi-currency support, and African market focus through DPO Pay integration.

## 💳 Core Features
- Gateway-agnostic payment processing with multiple providers (Stripe, DPO Pay, PayPal, Square, Razorpay, Braintree)
- Subscription management with multiple plan tiers
- Multi-currency support for global accessibility
- Comprehensive security with PCI DSS compliance and fraud detection
- African market integration through DPO Pay with mobile money support
- Webhook processing for real-time payment status updates
- Family plan management and billing history

## 📱 Screen Specifications

### 1. Subscription Plans (`/payment/plans`)

#### Purpose
Display available subscription tiers with feature comparison and plan selection.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [☰] Choose Your Plan       [?] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Monthly][Yearly][Family]   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🆓 Basic Plan               │ │
│ │ Free Forever                │ │
│ │                             │ │
│ │ ✅ Basic journaling         │ │
│ │ ✅ Community access         │ │
│ │ ✅ Limited AI insights      │ │
│ │ ✅ Basic resources          │ │
│ │ ❌ Unlimited therapy        │ │
│ │ ❌ Premium AI features      │ │
│ │                             │ │
│ │ [Current Plan]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⭐ Premium Plan             │ │
│ │ $29.99/month                │ │
│ │ Save 20% with yearly        │ │
│ │                             │ │
│ │ ✅ Everything in Basic      │ │
│ │ ✅ Unlimited therapy        │ │
│ │ ✅ Advanced AI insights     │ │
│ │ ✅ Premium resources        │ │
│ │ ✅ Priority support         │ │
│ │ ✅ Advanced analytics       │ │
│ │                             │ │
│ │ [Upgrade Now]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👨‍👩‍👧‍👦 Family Plan (4 users) │ │
│ │ $79.99/month                │ │
│ │ Save 33% vs individual      │ │
│ │                             │ │
│ │ ✅ Everything in Premium    │ │
│ │ ✅ Up to 4 family members   │ │
│ │ ✅ Shared family dashboard  │ │
│ │ ✅ Parental controls        │ │
│ │ ✅ Family therapy sessions  │ │
│ │                             │ │
│ │ [Choose Family Plan]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔒 Secure payment • Cancel anytime│
└─────────────────────────────────┘
```

### 2. Payment Methods (`/payment/methods`)

#### Purpose
Manage payment methods with support for multiple gateways and currencies.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Payment Methods        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Saved Payment Methods       │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 💳 Visa •••• 4242       │ │ │
│ │ │ Expires 12/25           │ │ │
│ │ │ Default method          │ │ │
│ │ │ [Edit] [Remove]         │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📱 M-Pesa Mobile Money  │ │ │
│ │ │ +254 7XX XXX XXX        │ │ │
│ │ │ Kenya Shillings (KES)   │ │ │
│ │ │ [Edit] [Remove]         │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Add New Payment Method      │ │
│ │                             │ │
│ │ Payment Gateway:            │ │
│ │ [Stripe ▼]                  │ │
│ │                             │ │
│ │ Payment Type:               │ │
│ │ ● Credit/Debit Card         │ │
│ │ ○ Mobile Money (DPO Pay)    │ │
│ │ ○ Bank Transfer             │ │
│ │ ○ PayPal                    │ │
│ │                             │ │
│ │ Currency:                   │ │
│ │ [USD ▼]                     │ │
│ │                             │ │
│ │ [Add Payment Method]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Supported Currencies        │ │
│ │                             │ │
│ │ 🌍 Global: USD, EUR, GBP    │ │
│ │ 🌍 Africa: KES, UGX, TZS    │ │
│ │ 🌍 Africa: RWF, GHS, NGN    │ │
│ │ 🌍 Asia: INR, SGD, MYR      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 3. Payment Processing (`/payment/checkout`)

#### Purpose
Secure payment processing with multiple gateway options and fraud protection.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Complete Payment       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Order Summary               │ │
│ │                             │ │
│ │ Premium Plan (Monthly)      │ │
│ │ $29.99 USD                  │ │
│ │                             │ │
│ │ Tax (8.5%): $2.55           │ │
│ │ Total: $32.54 USD           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Payment Gateway             │ │
│ │ ● Stripe (Recommended)      │ │
│ │ ○ DPO Pay (Africa)          │ │
│ │ ○ PayPal                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Payment Details             │ │
│ │                             │ │
│ │ Card Number                 │ │
│ │ [1234 5678 9012 3456]       │ │
│ │                             │ │
│ │ Expiry Date    CVV          │ │
│ │ [12/25]       [123]         │ │
│ │                             │ │
│ │ Cardholder Name             │ │
│ │ [John Doe]                  │ │
│ │                             │ │
│ │ ☑ Save for future payments │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Security Features           │ │
│ │ 🔒 256-bit SSL encryption   │ │
│ │ 🛡️ PCI DSS compliant       │ │
│ │ 🔍 Fraud detection active   │ │
│ │ 🏦 3D Secure enabled        │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Complete Payment - $32.54]     │
│                                 │
│ 🔒 Your payment is secure       │
└─────────────────────────────────┘
```

### 4. Billing History (`/payment/history`)

#### Purpose
View transaction history, receipts, and payment status across all gateways.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Billing History        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [All][Successful][Failed]   │ │
│ │ [This Month][Last 3 Months] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ January 2024                │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ ✅ Premium Subscription │ │ │
│ │ │ Jan 15, 2024            │ │ │
│ │ │ $32.54 USD via Stripe   │ │ │
│ │ │ Invoice #INV-2024-001   │ │ │
│ │ │ [Download] [View]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ ✅ Therapy Session      │ │ │
│ │ │ Jan 10, 2024            │ │ │
│ │ │ $120.00 USD via Stripe  │ │ │
│ │ │ Dr. Sarah Johnson       │ │ │
│ │ │ [Download] [View]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ ❌ Payment Failed       │ │ │
│ │ │ Jan 5, 2024             │ │ │
│ │ │ $29.99 USD via DPO Pay  │ │ │
│ │ │ Insufficient funds      │ │ │
│ │ │ [Retry] [Update Method] │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Monthly Summary             │ │
│ │                             │ │
│ │ Total Paid: $182.53         │ │
│ │ Successful: 4 payments      │ │
│ │ Failed: 1 payment           │ │
│ │ Next billing: Feb 15, 2024  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Export Statements] [Tax Summary]│
└─────────────────────────────────┘
```

### 5. Subscription Management (`/payment/subscription`)

#### Purpose
Manage active subscriptions, billing cycles, and plan changes.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Subscription Details   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Current Plan                │ │
│ │                             │ │
│ │ ⭐ Premium Plan              │ │
│ │ $29.99/month                │ │
│ │ Active since: Dec 15, 2023  │ │
│ │ Next billing: Feb 15, 2024  │ │
│ │                             │ │
│ │ Payment method:             │ │
│ │ Visa •••• 4242              │ │
│ │                             │ │
│ │ Status: ✅ Active           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Plan Management             │ │
│ │                             │ │
│ │ [Upgrade to Family Plan]    │ │
│ │ [Switch to Yearly]          │ │
│ │ [Change Payment Method]     │ │
│ │ [Update Billing Address]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Usage This Month            │ │
│ │                             │ │
│ │ 🎥 Therapy sessions: 4/∞    │ │
│ │ 🤖 AI conversations: 45/∞   │ │
│ │ 📚 Premium resources: 12/∞  │ │
│ │ 📊 Advanced analytics: ✅   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Billing Preferences         │ │
│ │                             │ │
│ │ Email receipts:             │ │
│ │ [Toggle: ON] 📧             │ │
│ │                             │ │
│ │ Auto-renewal:               │ │
│ │ [Toggle: ON] 🔄             │ │
│ │                             │ │
│ │ Billing notifications:      │ │
│ │ [Toggle: ON] 🔔             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚠️ Danger Zone              │ │
│ │                             │ │
│ │ [Pause Subscription]        │ │
│ │ [Cancel Subscription]       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 6. Family Plan Management (`/payment/family`)

#### Purpose
Manage family plan members, permissions, and billing for multi-user subscriptions.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Family Plan            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Family Plan Overview        │ │
│ │                             │ │
│ │ 👨‍👩‍👧‍👦 4 members (4/4 used)  │ │
│ │ $79.99/month                │ │
│ │ Next billing: Feb 15, 2024  │ │
│ │ Plan admin: You             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Family Members              │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 John Doe (You)       │ │ │
│ │ │ Admin • Full access     │ │ │
│ │ │ Joined: Dec 15, 2023    │ │ │
│ │ │ [Manage Account]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Jane Doe             │ │ │
│ │ │ Member • Full access    │ │ │
│ │ │ Joined: Dec 16, 2023    │ │ │
│ │ │ [Manage] [Remove]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Alex Doe (Teen)      │ │ │
│ │ │ Teen • Restricted       │ │ │
│ │ │ Joined: Dec 17, 2023    │ │ │
│ │ │ [Manage] [Remove]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Sam Doe (Child)      │ │ │
│ │ │ Child • Parental ctrl   │ │ │
│ │ │ Joined: Dec 18, 2023    │ │ │
│ │ │ [Manage] [Remove]       │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Family Settings             │ │
│ │                             │ │
│ │ Shared family dashboard:    │ │
│ │ [Toggle: ON] 📊             │ │
│ │                             │ │
│ │ Cross-member messaging:     │ │
│ │ [Toggle: OFF] 💬            │ │
│ │                             │ │
│ │ Parental controls:          │ │
│ │ [Toggle: ON] 👨‍👩‍👧‍👦         │ │
│ │                             │ │
│ │ [Manage Permissions]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Invite Member] [Plan Settings] │
└─────────────────────────────────┘
```

## 🔄 Screen Flow Patterns

### Payment Navigation Flow
```
Plan Selection
├─ Compare Plans → Select Plan → Payment Gateway → Payment Processing → Confirmation
├─ Family Plan → Member Invitation → Permission Setup → Billing Configuration
├─ Payment Methods → Gateway Selection → Method Addition → Verification → Activation
└─ Subscription Management → Plan Changes → Billing Updates → Confirmation

Payment Processing Flow
├─ Gateway Selection → Payment Details → Security Verification → Processing → Confirmation
├─ Failed Payment → Error Handling → Retry Options → Alternative Methods → Success
├─ Webhook Processing → Status Updates → User Notification → Account Activation
└─ Refund Processing → Verification → Gateway Communication → Confirmation → Notification

Multi-Gateway Support
├─ Stripe → Global Cards → 3D Secure → Instant Processing
├─ DPO Pay → African Markets → Mobile Money → Local Banking
├─ PayPal → Global Wallets → Express Checkout → Instant Transfer
└─ Regional Gateways → Local Payment Methods → Currency Support → Compliance
```

## 📊 Performance Metrics

### Payment Success
- **Payment Success Rate**: 95%+ target across all gateways
- **Processing Time**: < 5 seconds for card payments
- **Mobile Money Processing**: < 30 seconds for DPO Pay
- **Failed Payment Recovery**: 60%+ retry success rate

### User Experience
- **Checkout Completion**: 85%+ completion rate
- **Payment Method Diversity**: Multiple options per region
- **Currency Support**: Local currency availability
- **Security Confidence**: User trust in payment security

## 🔒 Security & Privacy

### Payment Security
- PCI DSS Level 1 compliance across all gateways
- End-to-end encryption for all payment data
- 3D Secure authentication for enhanced security
- Real-time fraud detection and prevention
- Secure tokenization of payment methods

### Data Protection
- No storage of sensitive payment data on servers
- Gateway-specific security implementations
- Audit logging for all payment transactions
- Compliance with regional financial regulations
- User consent for payment data processing

---

This documentation provides comprehensive coverage of all payment screens based on the actual backend implementation, focusing on the gateway-agnostic architecture with multiple payment providers, comprehensive security, and global accessibility through multi-currency support. 
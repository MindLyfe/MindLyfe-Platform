# MindLyf Platform: Payment Processing Strategy (DPO Pay Integration)

**Version:** 1.0
**Date:** {{Current Date}}
**Author:** Martha, AI Product Manager
**Contributors:** @Bob (Architect), @Harbi (Backend)

## 1. Introduction

### 1.1 Purpose
This document outlines the strategy for integrating payment processing capabilities into the MindLyf platform. It focuses on leveraging the DPO Pay gateway to support various business models, primarily using Ugandan Shilling (UGX) as the currency, to cater to our initial target market in Uganda.

### 1.2 Scope
This document covers:
*   Overview of DPO Pay API relevant to MindLyf's needs.
*   Payment models to be supported:
    *   Individual User Subscriptions (Tiered)
    *   À La Carte Purchases (e.g., single therapy sessions)
    *   Organizational Memberships
    *   Student Plans (via University Partnerships)
*   Key considerations for implementation, including currency, security, and user experience.

### 1.3 Payment Gateway: DPO Pay
*   **Developer Portal:** [https://docs.dpopay.com/api/index.html](https://docs.dpopay.com/api/index.html) <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
*   **Primary Currency:** UGX (Ugandan Shilling)

## 2. DPO Pay API Overview & Key Operations

Based on the DPO Pay API documentation, the following operations are key for MindLyf: <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>

*   **`createToken` Operation:** <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   This is the fundamental operation to initiate a transaction with DPO Pay. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   It involves sending an XML request with several levels of information: <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
        *   **Transaction Level (Mandatory):** Basic transaction details like `PaymentAmount`, `PaymentCurrency` (this will be UGX for us), `CompanyRef` (our internal reference for the transaction), `RedirectURL` (where the user is sent after payment attempt), `BackURL` (where the user is sent if they cancel or go back). <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
        *   **Services Level (Mandatory):** Details about the service/product being purchased (e.g., "Monthly Subscription - Tier 1", "Therapy Session with Dr. X"). Must include `ServiceType`, `ServiceDescription`, `ServiceDate`. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   Upon successful creation, DPO Pay returns a `TransToken` and `TransRef`. The `TransToken` is crucial for redirecting the user to DPO's payment page and for subsequent verification. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>

*   **`verifyToken` Operation:** <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   This operation is mandatory to confirm the status of a transaction after the user returns from the DPO payment page. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   It helps ensure the payment was successful before granting access to services or content. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>

**Important Considerations from DPO Documentation:** <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
*   **Company Token:** A unique token provided by DPO Pay is required for all API requests. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
*   **Currency Support:** We must ensure UGX is actively supported and configured in our DPO Pay merchant account. The documentation mentions `Currency not supported` (error 904) as a possible issue. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
*   **Transaction Limits:** Be aware of potential limits on transaction amounts or monthly volumes (errors 905, 906). <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
*   **Error Handling:** The API provides various result codes (e.g., 000 for success, 8xx for token/request issues, 9xx for transaction/data issues) that our system must handle gracefully. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>

## 3. MindLyf Payment Models & DPO Integration Strategy

### 3.1 Individual User Subscriptions (Tiered)
*   **Description:** Users can subscribe to different tiers (e.g., Basic, Premium, Pro) offering varying levels of access to platform features, content, and therapist interactions.
*   **DPO Integration:**
    *   **Initial Subscription:** Use `createToken` to initiate the first payment. The `ServiceDescription` will detail the subscription tier and duration (e.g., "MindLyf Premium - Monthly").
    *   **Recurring Payments:** The DPO Pay API documentation provided does not explicitly detail recurring billing or tokenization for PCI-compliant card storage for automatic renewals. This is a CRITICAL area for further investigation with DPO Pay support or more detailed API documentation. We need to determine if DPO Pay offers:
        *   A mechanism to store payment details securely (tokenization) and charge them automatically for subsequent billing cycles.
        *   A subscription management feature within their portal or via API.
    *   If DPO Pay does not directly support automated recurring billing in a way that meets our needs, we may need to:
        *   Implement a reminder system for users to manually renew their subscriptions.
        *   Explore if DPO offers a 'tokenization' service where they store card details and we can initiate subsequent payments using a reference token (this is common with many gateways).
    *   **Tier Management:** Handled within MindLyf. After successful payment verification (`verifyToken`), MindLyf updates the user's account status and access level.

### 3.2 À La Carte Purchases
*   **Description:** Non-subscribed users or subscribed users wanting services outside their tier can make one-time purchases (e.g., a single teletherapy session, a specific workshop).
*   **DPO Integration:**
    *   Straightforward use of `createToken` for each purchase. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   `ServiceDescription` will clearly state the item purchased (e.g., "Therapy Session - Dr. Aiko - 2024-08-15"). <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   `verifyToken` confirms payment before service access is granted. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>

### 3.3 Organizational Memberships
*   **Description:** Businesses, NGOs, or other organizations can purchase bulk memberships or a subscription plan for their employees/members.
*   **DPO Integration & Workflow:**
    *   **Admin Interface:** MindLyf will need an admin portal for organizational administrators to manage their subscription, number of users, and payments.
    *   **Payment:**
        *   The organization admin would initiate payment for the agreed number of licenses/seats for a specific period (e.g., "ABC Corp - 50 User Licenses - Annual Plan").
        *   This could be a single large transaction via `createToken` or potentially invoiced with manual payment reconciliation if DPO supports such B2B flows (needs clarification).
    *   **User Onboarding:** Once payment is confirmed, the organization admin can onboard their users onto the MindLyf platform under the organizational plan. MindLyf's system will manage license allocation.
    *   **Recurring Billing for Organizations:** Similar to individual subscriptions, the mechanism for recurring organizational payments needs clarification from DPO Pay.

### 3.4 Student Plans (via University Partnerships)
*   **Description:** Universities can partner with MindLyf to offer subsidized or free access to their students.
*   **DPO Integration & Workflow:**
    *   This model might involve direct billing to the university rather than individual student payments through DPO Pay for each student.
    *   **Scenario 1: University Pays in Bulk:** Similar to organizational memberships. The university pays for a block of student accounts. MindLyf provides access codes or an onboarding mechanism for eligible students.
    *   **Scenario 2: Highly Subsidized Student Self-Pay:** If students pay a nominal fee, they would follow the individual subscription model, possibly with a special 'student tier' and pricing, processed via `createToken`. Verification of student status would be handled by MindLyf (e.g., university email domain, student ID upload).
    *   The exact DPO integration depends on the commercial agreement with the university.

## 4. Key Implementation Considerations

*   **Currency (UGX):**
    *   All `PaymentAmount` fields in `createToken` requests to DPO Pay will be in UGX. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   The MindLyf platform UI must clearly display all prices in UGX.
    *   Confirm DPO Pay's settlement currency and process if it differs from UGX (though unlikely if they support UGX transactions).

*   **Security & PCI Compliance:**
    *   MindLyf will **not** store full credit card details. We rely on DPO Pay's secure payment pages for capturing sensitive payment information. This significantly reduces our PCI DSS scope.
    *   All communication with the DPO Pay API must be over HTTPS.
    *   Securely manage the `CompanyToken` provided by DPO Pay. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>

*   **User Experience (UX):**
    *   Seamless redirection to and from DPO Pay's payment page.
    *   Clear communication to users about payment status (pending, success, failure).
    *   Easy access to payment history within their MindLyf profile.
    *   Graceful handling of payment failures with clear instructions.

*   **Transaction Management & Reconciliation:**
    *   MindLyf's backend must maintain a robust record of all transactions initiated, their DPO `TransRef` and `TransToken`, and their verified status. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
    *   Regular reconciliation with DPO Pay settlement reports will be necessary.

*   **Refunds & Cancellations:**
    *   The provided DPO Pay API documentation snippet does not cover refunds. This process needs to be clarified with DPO Pay (whether it's API-driven or manual via their merchant portal).
    *   MindLyf needs clear policies and internal procedures for handling refund requests and subscription cancellations.

## 5. Outstanding Questions for DPO Pay / Further Research

1.  **Automated Recurring Billing/Subscriptions:** How does DPO Pay support automated recurring payments for subscriptions? Is there a tokenization service for securely storing payment methods for reuse?
2.  **Subscription Management API:** Does DPO Pay offer API endpoints for managing subscriptions (e.g., upgrades, downgrades, cancellations) if they host the subscription logic?
3.  **Refund API:** Is there an API for processing full or partial refunds? Or is this a manual process via the DPO Pay merchant portal?
4.  **Detailed Error Codes & Scenarios:** Request more comprehensive documentation on all possible API error codes and their meanings beyond the snippet provided. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>
5.  **Webhook/IPN Support:** Does DPO Pay offer Instant Payment Notifications (IPNs) or webhooks to asynchronously notify our system about transaction status changes (e.g., successful payment, chargebacks)? This is more robust than relying solely on user redirection and `verifyToken`.
6.  **B2B/Invoicing Features:** Are there specific features or recommendations for handling payments from organizations (e.g., invoicing, different payment methods suitable for businesses)?
7.  **Testing Environment/Sandbox:** Details on accessing and using a DPO Pay sandbox environment for development and testing.
8.  **UGX Specifics:** Any specific considerations or best practices for transacting in UGX with DPO Pay.

## 6. Next Steps

1.  **Contact DPO Pay Support:** @Harbi or @Ibrah to reach out to DPO Pay with the outstanding questions listed above to get clarifications crucial for backend design.
2.  **Backend Design - Payment Module:** @Bob and @Harbi to design the payment module architecture within MindLyf, considering the DPO Pay API and our business requirements.
3.  **Frontend Design - Payment Flows:** @Hussein and @Lydia to design the user interface for all payment-related flows (subscription selection, checkout, payment history).
4.  **Develop Proof of Concept (PoC):** Once sandbox access is available, develop a PoC for `createToken` and `verifyToken` flows. <mcreference link="https://docs.dpopay.com/api/index.html" index="0">0</mcreference>

This document will be updated as more information is gathered from DPO Pay and as our implementation progresses.
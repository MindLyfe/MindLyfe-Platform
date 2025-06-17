# 🔐 MindLyf Auth Service - API Endpoints Documentation

## Overview

The MindLyf Auth Service provides comprehensive authentication, authorization, and user management capabilities for the MindLyf mental health platform. This service handles user registration, login, session management, multi-factor authentication, and role-based access control.

**Base URL:** `http://localhost:3001/api`  
**Authentication:** Bearer JWT tokens  
**Content-Type:** `application/json`  
**Interactive Documentation:** http://localhost:3001/api/docs

---

## 📋 Quick Reference

| Category | Endpoints | Description |
|----------|-----------|-------------|
| 🔐 **Auth** | 21 endpoints | Registration, login, password management |
| 🔄 **Sessions** | 5 endpoints | Session management, device tracking |
| 🛡️ **MFA** | 4 endpoints | Multi-factor authentication setup |
| 👤 **Users** | 3 endpoints | User profile management |
| 🏢 **Organizations** | 7 endpoints | Organization management |
| 💳 **Subscriptions** | 7 endpoints | Billing and subscription management |
| 🎧 **Support** | 28 endpoints | Support team and request management |
| 🩺 **Therapists** | 9 endpoints | Therapist application and management |
| ❤️ **Health** | 2 endpoints | Service monitoring |

**Total:** 86 endpoints

---

## 🔐 Authentication Endpoints (21)

### 1. Register New User
```http
POST /auth/register
```

Creates a new user account. Email verification required before login.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "9a5edcea-c4cf-4240-bc76-f9db36a171f1",
  "isMinor": false
}
```

**Rate Limit:** 5 requests/minute

---

### 2. Register Therapist
```http
POST /auth/register/therapist
```

Registers a new therapist (requires admin approval).

**Request:**
```json
{
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "email": "dr.smith@therapy.com",
  "password": "SecurePassword123!",
  "licenseNumber": "LIC123456789",
  "specialization": ["Anxiety", "Depression", "PTSD"],
  "credentials": ["PhD in Psychology"],
  "hourlyRate": 150
}
```

---

### 3. Register Organization User
```http
POST /auth/register/organization-user
```
🔒 **Requires:** Admin or Organization Admin role

**Request:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@company.com",
  "organizationId": "org-uuid-123"
}
```

---

### 4. Register Support Team Member  
```http
POST /auth/register/support-team
```
🔒 **Requires:** Admin role

**Request:**
```json
{
  "firstName": "Support",
  "lastName": "Agent",
  "email": "support@mindlyf.com",
  "password": "SecurePassword123!",
  "department": "Customer Support"
}
```

---

### 5. User Login
```http
POST /auth/login
```

Authenticates user and returns JWT tokens.

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200) - Success:**
```json
{
  "userId": "uuid-string",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe", 
  "role": "user",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "session-uuid"
}
```

**Response (200) - MFA Required:**
```json
{
  "requiresMfa": true,
  "message": "MFA verification required",
  "userId": "uuid-string",
  "tempToken": "temp-jwt-token"
}
```

**Rate Limit:** 5 requests/minute

---

### 6. Verify Email
```http
POST /auth/verify-email
```

**Request:**
```json
{
  "token": "email-verification-token"
}
```

---

### 7. Refresh Token
```http
POST /auth/refresh-token
```

**Request:**
```json
{
  "refreshToken": "refresh-jwt-token"
}
```

---

### 8. Logout
```http
POST /auth/logout
```
🔒 **Requires:** Authentication

**Headers:**
- `Authorization: Bearer <access-token>`
- `x-session-id: <session-id>`

---

### 9. Change Password
```http
PATCH /auth/change-password
```
🔒 **Requires:** Authentication

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "newPasswordConfirmation": "NewPassword123!"
}
```

---

### 10. Forgot Password
```http
POST /auth/forgot-password
```

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

---

### 11. Reset Password
```http
POST /auth/reset-password
```

**Request:**
```json
{
  "token": "reset-token",
  "password": "NewPassword123!",
  "passwordConfirmation": "NewPassword123!"
}
```

---

### 12. Get Profile
```http
GET /auth/me
```
🔒 **Requires:** Authentication

**Response:**
```json
{
  "id": "uuid-string",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "status": "active",
  "emailVerified": true,
  "mfaEnabled": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### 13-21. Additional Auth Endpoints
- `POST /auth/validate-token` - Validate JWT token
- `POST /auth/validate-service-token` - Service-to-service validation
- `POST /auth/revoke-token` - Revoke specific token
- `GET /auth/users/{userId}` - Get user info (service-to-service)
- `GET /auth/users/{userId}/subscription-status` - Get subscription status
- `POST /auth/users/{userId}/payment-notification` - Handle payment notifications
- `POST /auth/validate-payment-access` - Validate payment permissions
- `POST /api/test-login` - Test login endpoint
- `GET /ping` - Simple ping endpoint

---

## 🔄 Session Management (5)

### 1. Get My Sessions
```http
GET /sessions/me
```
🔒 **Requires:** Authentication

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "deviceInfo": "Chrome on Windows",
      "ipAddress": "192.168.1.1", 
      "lastActivity": "2024-01-01T12:00:00Z",
      "isCurrent": true,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Revoke Session
```http
DELETE /sessions/me/{sessionId}
```
🔒 **Requires:** Authentication

---

### 3. Revoke All Sessions  
```http
DELETE /sessions/me
```
🔒 **Requires:** Authentication

---

### 4. Get User Sessions (Admin)
```http
GET /sessions/user/{userId}
```
🔒 **Requires:** Admin role

---

### 5. Revoke User Sessions (Admin)
```http
DELETE /sessions/user/{userId}
```
🔒 **Requires:** Admin role

---

## 🛡️ Multi-Factor Authentication (4)

### 1. Generate MFA Secret
```http
POST /mfa/generate
```
🔒 **Requires:** Authentication

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": ["123456", "789012", "345678"]
}
```

---

### 2. Enable MFA
```http
POST /mfa/enable
```
🔒 **Requires:** Authentication

**Request:**
```json
{
  "token": "123456"
}
```

---

### 3. Verify MFA
```http
POST /mfa/verify
```

**Request:**
```json
{
  "token": "123456",
  "tempToken": "temporary-jwt-token"
}
```

---

### 4. Disable MFA
```http
POST /mfa/disable
```
🔒 **Requires:** Authentication

**Request:**
```json
{
  "password": "CurrentPassword123!"
}
```

---

## 👤 User Management (3)

### 1. Get All Users
```http
GET /users
```
🔒 **Requires:** Admin role

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10) 
- `role`: Filter by role
- `status`: Filter by status

---

### 2. Get User by ID  
```http
GET /users/{id}
```
🔒 **Requires:** Admin role or own user

---

### 3. Deactivate User
```http
PUT /users/{id}/deactivate
```
🔒 **Requires:** Admin role

---

## 🏢 Organization Management (7)

### 1. Create Organization
```http
POST /organizations/create
```
🔒 **Requires:** Authentication

**Request:**
```json
{
  "name": "Healthcare Corp",
  "type": "healthcare_provider",
  "contactEmail": "admin@healthcare.com",
  "contactPhone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City", 
    "state": "State",
    "zipCode": "12345",
    "country": "US"
  }
}
```

---

### 2-7. Additional Organization Endpoints
- `GET /organizations/{organizationId}` - Get organization details
- `GET /organizations/my/organization` - Get current user's organization
- `POST /organizations/{organizationId}/users/add` - Add user to organization
- `DELETE /organizations/{organizationId}/users/{userId}` - Remove user
- `POST /organizations/{organizationId}/subscription` - Create organization subscription
- `POST /organizations/payment/{paymentId}/confirm` - Confirm payment

---

## 💳 Subscription Management (7)

### 1. Get Available Plans
```http
GET /subscriptions/plans
```
🔒 **Requires:** Authentication

**Response:**
```json
{
  "plans": [
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 29.99,
      "currency": "USD",
      "sessionsIncluded": 4,
      "features": ["Basic therapy sessions", "Chat support"]
    }
  ]
}
```

---

### 2. Get Subscription Status
```http
GET /subscriptions/status
```
🔒 **Requires:** Authentication

**Response:**
```json
{
  "status": "active",
  "plan": "basic", 
  "currentPeriodEnd": "2024-02-01T00:00:00Z",
  "remainingSessions": 3,
  "autoRenew": true
}
```

---

### 3-7. Additional Subscription Endpoints
- `POST /subscriptions/create` - Create new subscription
- `POST /subscriptions/credits/purchase` - Purchase session credits
- `POST /subscriptions/payment/{paymentId}/confirm` - Confirm payment
- `POST /subscriptions/consume-session/{userId}` - Consume session (for teletherapy)
- `GET /subscriptions/validate-booking/{userId}` - Validate booking permissions

---

## 🎧 Support System (28)

### Support Team Management

#### 1. Register Support Team Member
```http
POST /support/team/register
```
🔒 **Requires:** Admin role

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Support",
  "email": "john@mindlyf.com",
  "password": "SecurePassword123!",
  "phoneNumber": "+1234567890",
  "department": "Customer Support",
  "preferredShifts": ["MORNING", "EVENING"]
}
```

---

#### 2. Get Support Team Members
```http
GET /support/team
```
🔒 **Requires:** Admin or Support role

---

#### 3. Get Support Team Member by ID
```http
GET /support/team/{id}
```
🔒 **Requires:** Admin or Support role

---

#### 4. Update Support Team Member Status
```http
PUT /support/team/{id}/status
```
🔒 **Requires:** Admin role

**Request:**
```json
{
  "isActive": false
}
```

---

### Shift Management

#### 5. Create Shift
```http
POST /support/shifts
```
🔒 **Requires:** Admin role

**Request:**
```json
{
  "shiftType": "MORNING",
  "shiftDate": "2024-01-15",
  "assignedUserId": "support-user-uuid",
  "notes": "Special instructions"
}
```

---

#### 6. Get Shifts
```http
GET /support/shifts
```
🔒 **Requires:** Admin or Support role

**Query Parameters:**
- `startDate`: Filter from date
- `endDate`: Filter to date
- `shiftType`: Filter by shift type
- `status`: Filter by status
- `assignedUserId`: Filter by assigned user

---

#### 7-13. Additional Shift Endpoints
- `GET /support/shifts/my` - Get current user's shifts
- `GET /support/shifts/{id}` - Get shift by ID
- `PUT /support/shifts/{id}` - Update shift
- `DELETE /support/shifts/{id}` - Delete shift  
- `POST /support/shifts/{id}/start` - Start shift (check-in)
- `POST /support/shifts/{id}/end` - End shift (check-out)
- `POST /support/shifts/templates` - Create shift template
- `POST /support/shifts/generate` - Generate shifts from template

---

### Support Request Management

#### 14. Create Support Request
```http
POST /support/requests
```
🔒 **Requires:** Authentication

**Request:**
```json
{
  "requestType": "technical_support",
  "priority": "medium",
  "description": "Unable to access my therapy sessions",
  "metadata": {
    "browser": "Chrome",
    "version": "91.0"
  }
}
```

---

#### 15. Get Support Requests
```http
GET /support/requests
```
🔒 **Requires:** Support role

**Query Parameters:**
- `status`: Filter by status
- `requestType`: Filter by type  
- `priority`: Filter by priority
- `assignedSupportUserId`: Filter by assignee
- `requesterId`: Filter by requester
- `startDate` / `endDate`: Date range
- `limit` / `offset`: Pagination

---

#### 16-23. Additional Request Endpoints
- `GET /support/requests/my` - Get current user's requests
- `GET /support/requests/assigned` - Get assigned requests
- `GET /support/requests/{id}` - Get request by ID
- `PUT /support/requests/{id}` - Update request
- `POST /support/requests/{id}/assign` - Assign request
- `POST /support/requests/{id}/take` - Take ownership
- `POST /support/requests/{id}/escalate` - Escalate request

---

### Dashboard & Analytics

#### 24. Get Support Dashboard
```http
GET /support/dashboard
```
🔒 **Requires:** Admin or Support role

**Response:**
```json
{
  "totalRequests": 150,
  "pendingRequests": 25,
  "inProgressRequests": 45,
  "resolvedRequests": 75,
  "escalatedRequests": 5,
  "averageResponseTime": 15.5,
  "averageResolutionTime": 240.8,
  "activeShifts": 8,
  "availableAgents": 12,
  "requestsByType": {
    "technical_support": 60,
    "billing_inquiry": 30,
    "general_inquiry": 35
  },
  "requestsByPriority": {
    "low": 50,
    "medium": 70,
    "high": 25,
    "urgent": 5
  }
}
```

---

#### 25-28. Additional Dashboard & Admin Endpoints
- `GET /support/dashboard/my` - Personal dashboard
- `PUT /support/notifications/preferences` - Update notification preferences
- `GET /support/routing/status` - Get auto-routing status
- `POST /support/routing/toggle` - Toggle auto-routing

---

## 🩺 Therapist Management (9)

### 1. Get Pending Therapists
```http
GET /therapists/pending
```
🔒 **Requires:** Admin or Support role

**Query Parameters:**
- `page` / `limit`: Pagination
- `sortBy` / `sortOrder`: Sorting
- `licenseState`: Filter by license state
- `specialization`: Filter by specialization

---

### 2. Get All Therapists
```http
GET /therapists/all
```
🔒 **Requires:** Admin or Support role

---

### 3. Get Therapist by ID
```http
GET /therapists/{id}
```
🔒 **Requires:** Admin/Support or own therapist

---

### 4. Approve Therapist
```http
POST /therapists/{id}/approve
```
🔒 **Requires:** Admin or Support role

**Request:**
```json
{
  "approvalNotes": "Credentials verified successfully",
  "licenseState": "CA",
  "licenseStatus": "active"
}
```

---

### 5. Reject Therapist
```http
POST /therapists/{id}/reject
```
🔒 **Requires:** Admin or Support role

**Request:**
```json
{
  "rejectionReason": "Invalid license credentials",
  "rejectionNotes": "License could not be verified"
}
```

---

### 6-9. Additional Therapist Endpoints
- `PUT /therapists/{id}/status` - Update therapist status (Admin only)
- `PUT /therapists/{id}/suspend` - Suspend therapist
- `PUT /therapists/{id}/reactivate` - Reactivate suspended therapist
- `GET /therapists/profile/me` - Get current therapist profile

---

## ❤️ Health & Monitoring (2)

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "auth-service"
}
```

---

### 2. Ping Endpoint
```http
GET /health/ping
```

**Response:**
```json
{
  "message": "pong",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "error": "Error Type", 
  "statusCode": 400,
  "timestamp": "2024-01-01T12:00:00Z",
  "path": "/api/auth/login"
}
```

### Common Error Codes
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found  
- **409 Conflict**: Resource already exists
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

---

## 🚦 Rate Limiting

Different endpoints have different rate limits:

- **Registration**: 5 requests/minute
- **Login**: 5 requests/minute  
- **Therapist Registration**: 3 requests/minute
- **Password Reset**: 3 requests/hour
- **General Endpoints**: 100 requests/minute
- **Admin Endpoints**: Higher limits

Rate limit headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640995200
```

---

## 🔐 Authentication Flow Examples

### 1. Standard User Registration & Login
```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com", 
    "password": "SecurePassword123!"
  }'

# 2. Verify Email (check email for token)
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "email-verification-token"}'

# 3. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'

# 4. Use access token for authenticated requests
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

### 2. MFA-Enabled Login Flow
```bash
# 1. Login (returns MFA challenge)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
# Response: {"requiresMfa": true, "tempToken": "..."}

# 2. Verify MFA token
curl -X POST http://localhost:3001/api/mfa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456",
    "tempToken": "TEMP_JWT_TOKEN"
  }'
# Response: Full login response with access tokens
```

---

## 📝 Notes

1. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
2. **UUIDs**: Used for all entity identifiers
3. **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
4. **Email Verification**: Required for account activation
5. **JWT Expiration**: Access tokens (15 minutes), Refresh tokens (7 days)
6. **HIPAA Compliance**: Maintained for healthcare data
7. **Audit Logging**: All authentication events are logged
8. **Service-to-Service**: Special endpoints for microservice communication

---

## 🔗 Related Documentation

- [User Management Guide](./USER_MANAGEMENT.md)
- [Interactive API Documentation](http://localhost:3001/api/docs)
- [Security Architecture](../Architecture/Security/SecurityArchitectureBlueprint.md) 
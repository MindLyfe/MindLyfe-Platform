# Authentication Screens Documentation

## Overview
The Authentication screens provide comprehensive user authentication and account management for the MindLyfe platform. The service includes JWT-based authentication, multi-factor authentication (MFA), session management, email verification, password reset, and role-based access control with support for individual users, organization members, and minors.

## 🔐 Core Features
- JWT-based authentication with access and refresh tokens
- Multi-factor authentication (MFA) using TOTP (Time-based One-Time Password)
- Email verification with secure token-based verification
- Password reset with secure token expiration
- Session management with device tracking and multi-session support
- Role-based access control (User, Admin, Therapist, Organization Admin)
- User type support (Individual, Organization Member, Minor)
- Rate limiting and security logging
- Service-to-service authentication for microservices

## 📱 Screen Specifications

### 1. User Registration (`/auth/register`)

#### Purpose
Multi-step user registration with email verification and account activation.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Create Account         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Welcome to MindLyfe         │ │
│ │ Start your wellness journey │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Personal Information        │ │
│ │                             │ │
│ │ First Name                  │ │
│ │ [John]                      │ │
│ │                             │ │
│ │ Last Name                   │ │
│ │ [Doe]                       │ │
│ │                             │ │
│ │ Email Address               │ │
│ │ [user@mindlyfe.org]         │ │
│ │                             │ │
│ │ Password                    │ │
│ │ [••••••••••••••••••]        │ │
│ │ ✅ 8+ characters            │ │
│ │ ✅ Uppercase letter         │ │
│ │ ✅ Lowercase letter         │ │
│ │ ✅ Number                   │ │
│ │ ✅ Special character        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Account Type                │ │
│ │ ● Individual User           │ │
│ │ ○ Organization Member       │ │
│ │ ○ Minor (Under 18)          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ☑ I agree to Terms of Service│ │
│ │ ☑ I agree to Privacy Policy │ │
│ │ ☐ Subscribe to newsletter   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Create Account]                │
│                                 │
│ Already have an account?        │
│ [Sign In]                       │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `POST /auth/register`
- **Rate Limit**: 5 requests per minute
- **Validation**: Strong password requirements, email format validation
- **Response**: Registration success with email verification instructions

### 2. Email Verification (`/auth/verify-email`)

#### Purpose
Verify user email address using token sent via email.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Verify Your Email      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📧 Check Your Email         │ │
│ │                             │ │
│ │ We've sent a verification   │ │
│ │ link to:                    │ │
│ │                             │ │
│ │ user@mindlyfe.org           │ │
│ │                             │ │
│ │ Click the link in the email │ │
│ │ to verify your account.     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Enter Verification Code     │ │
│ │                             │ │
│ │ If you have the code:       │ │
│ │ [_ _ _ _ _ _]                 │ │
│ │                             │ │
│ │ [Verify Code]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Didn't receive the email?   │ │
│ │                             │ │
│ │ • Check your spam folder    │ │
│ │ • Wait up to 5 minutes      │ │
│ │ • [Resend Email]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Change Email Address]          │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `POST /auth/verify-email`
- **Token**: UUID-based verification token
- **Events**: Triggers email verification completed event

### 3. User Login (`/auth/login`)

#### Purpose
Secure user authentication with optional MFA verification.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Welcome Back           │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Sign In to MindLyfe         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Email Address               │ │
│ │ [user@mindlyfe.org]         │ │
│ │                             │ │
│ │ Password                    │ │
│ │ [••••••••••••••••••]        │ │
│ │                             │ │
│ │ ☐ Remember me               │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Sign In]                       │
│                                 │
│ [Forgot Password?]              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Or sign in with:            │ │
│ │ [Google] [Apple] [Microsoft]│ │
│ └─────────────────────────────┘ │
│                                 │
│ Don't have an account?          │
│ [Create Account]                │
│                                 │
│ 🔒 Secure login with rate       │
│ limiting protection             │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `POST /auth/login`
- **Rate Limit**: 5 requests per minute
- **Response**: Access token, refresh token, user profile, session ID
- **MFA Flow**: If enabled, returns `requiresMfa: true` with temp token

### 4. Multi-Factor Authentication (`/mfa/verify`)

#### Purpose
TOTP-based MFA verification for enhanced security.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Two-Factor Auth        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔐 Enter Authentication Code│ │
│ │                             │ │
│ │ Open your authenticator app │ │
│ │ and enter the 6-digit code: │ │
│ │                             │ │
│ │ [_ _ _] [_ _ _]               │ │
│ │                             │ │
│ │ Code expires in: 00:25      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Verify Code]                   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Having trouble?             │ │
│ │                             │ │
│ │ • Make sure your device     │ │
│ │   time is synchronized      │ │
│ │ • Try generating a new code │ │
│ │ • [Use Backup Code]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Cancel Login]                  │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `POST /mfa/verify`
- **TOTP**: Time-based One-Time Password verification
- **Backup Codes**: Alternative authentication method

### 5. MFA Setup (`/mfa/generate`)

#### Purpose
Set up TOTP-based multi-factor authentication.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Setup 2FA              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Step 1: Install App         │ │
│ │                             │ │
│ │ Download an authenticator:  │ │
│ │ • Google Authenticator      │ │
│ │ • Microsoft Authenticator  │ │
│ │ • Authy                     │ │
│ │ • 1Password                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Step 2: Scan QR Code        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ ████ ██ ████ ██ ████   │ │ │
│ │ │ ██ ████ ██ ████ ██ ██  │ │ │
│ │ │ ████ ██ ████ ██ ████   │ │ │
│ │ │ ██ ████ ██ ████ ██ ██  │ │ │
│ │ │ ████ ██ ████ ██ ████   │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ Or enter manually:          │ │
│ │ HXDMVJECJJWSRB3HWIZR4MKV    │ │
│ │ [Copy Code]                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Step 3: Verify Setup        │ │
│ │                             │ │
│ │ Enter the 6-digit code:     │ │
│ │ [_ _ _] [_ _ _]               │ │
│ │                             │ │
│ │ [Verify & Enable 2FA]       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `POST /mfa/generate`
- **QR Code**: Base64 encoded QR code for authenticator apps
- **Secret**: TOTP secret for manual entry

### 6. Password Reset (`/auth/forgot-password`)

#### Purpose
Secure password reset with email token verification.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Reset Password         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Forgot Your Password?       │ │
│ │                             │ │
│ │ Enter your email address    │ │
│ │ and we'll send you a link   │ │
│ │ to reset your password.     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Email Address               │ │
│ │ [user@mindlyfe.org]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Send Reset Link]               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📧 Check Your Email         │ │
│ │                             │ │
│ │ If an account exists with   │ │
│ │ this email, you'll receive  │ │
│ │ a password reset link.      │ │
│ │                             │ │
│ │ The link expires in 1 hour. │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Back to Sign In]               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Didn't receive the email?   │ │
│ │ • Check spam folder         │ │
│ │ • Wait a few minutes        │ │
│ │ • [Try Again]               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `POST /auth/forgot-password`
- **Security**: Email existence not revealed to prevent enumeration
- **Token Expiry**: 1 hour expiration for security

### 7. Set New Password (`/auth/reset-password`)

#### Purpose
Set new password using secure reset token.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Set New Password       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Create New Password         │ │
│ │                             │ │
│ │ Choose a strong password    │ │
│ │ for your account.           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ New Password                │ │
│ │ [••••••••••••••••••]        │ │
│ │                             │ │
│ │ Password Requirements:      │ │
│ │ ✅ 8+ characters            │ │
│ │ ✅ Uppercase letter         │ │
│ │ ✅ Lowercase letter         │ │
│ │ ✅ Number                   │ │
│ │ ✅ Special character        │ │
│ │                             │ │
│ │ Confirm Password            │ │
│ │ [••••••••••••••••••]        │ │
│ │ ✅ Passwords match          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Update Password]               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔒 Security Notice          │ │
│ │                             │ │
│ │ After updating your         │ │
│ │ password, you'll be signed  │ │
│ │ out of all devices for      │ │
│ │ security.                   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `POST /auth/reset-password`
- **Validation**: Strong password requirements enforced
- **Security**: All sessions invalidated after password change

### 8. Session Management (`/sessions`)

#### Purpose
Manage active sessions across multiple devices.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Active Sessions        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Your Active Sessions        │ │
│ │                             │ │
│ │ Manage where you're signed  │ │
│ │ in to MindLyfe.             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📱 iPhone 14 Pro (Current) │ │
│ │ Safari • San Francisco, CA  │ │
│ │ Last active: Now            │ │
│ │ Session ID: 7e8f9g0h...     │ │
│ │ [This Device]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💻 MacBook Pro              │ │
│ │ Chrome • San Francisco, CA  │ │
│ │ Last active: 2 hours ago    │ │
│ │ Session ID: 1i2j3k4l...     │ │
│ │ [Sign Out]                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🖥️ Windows PC               │ │
│ │ Edge • New York, NY         │ │
│ │ Last active: 1 day ago      │ │
│ │ Session ID: 5m6n7o8p...     │ │
│ │ [Sign Out]                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Security Actions            │ │
│ │ [Sign Out All Devices]      │ │
│ │ [Download Session Log]      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `GET /sessions` (user sessions)
- **Device Tracking**: IP address, user agent, device info
- **Session Control**: Individual or bulk session termination

## 🔄 Screen Flow Patterns

### Authentication Navigation Flow
```
Registration Flow
├─ Registration Form → Email Verification → Account Activation → Login
├─ Organization Registration → Admin Approval → Account Activation
├─ Minor Registration → Guardian Consent → Account Activation
└─ Email Verification → Welcome Email → Onboarding

Login Flow
├─ Login Form → MFA Verification (if enabled) → Dashboard
├─ Failed Login → Rate Limiting → Account Lockout (if needed)
├─ Unverified Email → Verification Prompt → Email Verification
└─ Password Reset → New Password → Session Invalidation → Login

Security Flow
├─ MFA Setup → QR Code → Verification → Backup Codes → Activation
├─ Password Change → Current Password → New Password → Session Invalidation
├─ Session Management → Device List → Session Control → Security Audit
└─ Account Recovery → Email Verification → Identity Verification → Access Restoration
```

## 📊 Performance Metrics

### Authentication Security
- **Rate Limiting**: 5 login attempts per minute per IP
- **Session Management**: Multi-device session tracking
- **Token Security**: JWT with 15-minute access token expiry
- **MFA Adoption**: TOTP-based multi-factor authentication

### User Experience
- **Registration Completion**: Email verification required
- **Login Success Rate**: Track failed login attempts
- **Password Reset Usage**: Monitor password reset frequency
- **Session Duration**: Average session length tracking

## 🔒 Security & Privacy

### Authentication Security
- **Password Requirements**: Strong password policy enforced
- **JWT Tokens**: Secure token generation with configurable expiry
- **Rate Limiting**: Protection against brute force attacks
- **Session Security**: Secure session management with device tracking
- **MFA Support**: TOTP-based multi-factor authentication

### Data Protection
- **Email Verification**: Required for account activation
- **Password Hashing**: bcrypt with salt for password storage
- **Token Expiration**: Secure token expiry for password reset
- **Audit Logging**: Comprehensive security event logging
- **Service Authentication**: Secure service-to-service communication

### User Types & Roles
- **Individual Users**: Standard platform access
- **Organization Members**: Enterprise account management
- **Minors**: Age verification and guardian consent
- **Therapists**: Professional verification required
- **Admins**: Platform administration capabilities

---

This documentation provides comprehensive coverage of all authentication screens based on the actual backend implementation, focusing on JWT authentication, MFA, session management, and comprehensive security features for the MindLyfe platform. 
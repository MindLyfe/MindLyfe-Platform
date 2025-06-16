import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('🔐 Auth Service Documentation')
@Controller('docs/auth')
export class AuthDocsController {
  
  @Get('overview')
  @Public()
  @ApiOperation({ 
    summary: '🔐 Auth Service API Overview',
    description: `
## 🔐 MindLyf Authentication Service

The Auth Service provides comprehensive user authentication, authorization, and account management for the MindLyf platform.

### 🚀 Key Features

#### 🔑 **Authentication**
- **User Registration** - Email-based account creation with verification
- **Secure Login** - JWT-based authentication with refresh tokens
- **Multi-Factor Authentication (MFA)** - TOTP and SMS-based 2FA
- **Password Management** - Reset, change, and strength validation
- **Session Management** - Multiple device sessions with selective logout

#### 👤 **User Management**
- **Profile Management** - User information and preferences
- **Role-Based Access Control** - User, therapist, admin roles
- **Account Verification** - Email verification and account activation
- **Privacy Controls** - Data access and deletion requests

#### 🔒 **Security Features**
- **JWT Tokens** - Secure access and refresh token management
- **Rate Limiting** - Protection against brute force attacks
- **Audit Logging** - Comprehensive security event tracking
- **Device Management** - Track and manage user devices
- **IP Whitelisting** - Enhanced security for sensitive accounts

#### 🏢 **Organization Support**
- **Multi-tenant Architecture** - Organization-based user isolation
- **Subscription Management** - Payment and billing integration
- **Admin Controls** - Organization-level user management
- **Compliance** - HIPAA and GDPR compliance features

### 🔗 **Service Integration**
- **Teletherapy Service** - Therapist-client relationship validation
- **Chat Service** - User identity and permission management
- **Notification Service** - Account alerts and security notifications
- **Payment Service** - Subscription and billing integration

### 📊 **Monitoring & Analytics**
- **Health Checks** - Service availability monitoring
- **Security Metrics** - Login attempts, failed authentications
- **User Analytics** - Registration trends and user activity
- **Performance Monitoring** - Response times and error rates

### 🛡️ **Compliance & Privacy**
- **HIPAA Compliance** - Healthcare data protection
- **GDPR Compliance** - European privacy regulations
- **Data Encryption** - At-rest and in-transit encryption
- **Audit Trails** - Comprehensive activity logging
- **Right to Deletion** - User data removal capabilities

### 🔧 **Technical Specifications**
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis for session management
- **Authentication**: JWT with RS256 signing
- **Rate Limiting**: Redis-based throttling
- **Validation**: Class-validator with custom rules
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Auth Service overview and capabilities',
    schema: {
      type: 'object',
      properties: {
        service: { type: 'string', example: 'auth-service' },
        version: { type: 'string', example: '1.0.0' },
        status: { type: 'string', example: 'operational' },
        features: {
          type: 'array',
          items: { type: 'string' },
          example: ['authentication', 'authorization', 'user-management', 'mfa', 'session-management']
        },
        endpoints: { type: 'number', example: 25 },
        documentation: { type: 'string', example: 'http://localhost:3001/api/docs' }
      }
    }
  })
  async getAuthOverview() {
    return {
      service: 'auth-service',
      version: '1.0.0',
      status: 'operational',
      description: 'MindLyf Authentication and User Management Service',
      features: [
        'user-registration',
        'secure-login',
        'multi-factor-authentication',
        'password-management',
        'session-management',
        'role-based-access-control',
        'organization-support',
        'subscription-management',
        'security-auditing',
        'compliance-features'
      ],
      endpoints: 25,
      documentation: 'http://localhost:3001/api/docs',
      integrations: [
        'teletherapy-service',
        'chat-service',
        'notification-service',
        'payment-service'
      ],
      security: {
        authentication: 'JWT with RS256',
        encryption: 'AES-256',
        rateLimiting: 'Redis-based',
        compliance: ['HIPAA', 'GDPR']
      }
    };
  }

  @Get('endpoints')
  @Public()
  @ApiOperation({ 
    summary: '📋 Auth Service Endpoints',
    description: `
## 📋 Authentication Service Endpoints

Complete list of all available endpoints in the Auth Service with detailed descriptions.

### 🔑 **Authentication Endpoints**

#### **POST /api/auth/register**
- **Purpose**: Register a new user account
- **Rate Limit**: 5 requests per minute
- **Validation**: Email format, password strength, terms acceptance
- **Response**: User ID and verification email sent confirmation
- **Security**: Email verification required before account activation

#### **POST /api/auth/verify-email**
- **Purpose**: Verify email address with token
- **Validation**: Token format and expiration check
- **Response**: Account activation confirmation
- **Security**: Single-use tokens with 24-hour expiration

#### **POST /api/auth/login**
- **Purpose**: Authenticate user and issue tokens
- **Rate Limit**: 5 requests per minute per IP
- **MFA**: Triggers MFA flow if enabled
- **Response**: JWT access token, refresh token, user profile
- **Security**: Account lockout after 5 failed attempts

#### **POST /api/auth/refresh-token**
- **Purpose**: Refresh expired access tokens
- **Validation**: Valid refresh token required
- **Response**: New access token and refresh token
- **Security**: Refresh token rotation for enhanced security

#### **POST /api/auth/logout**
- **Purpose**: Invalidate user session
- **Options**: Single session or all sessions
- **Response**: Logout confirmation
- **Security**: Token blacklisting and session cleanup

### 🔐 **Multi-Factor Authentication**

#### **POST /api/auth/mfa/setup**
- **Purpose**: Enable MFA for user account
- **Methods**: TOTP (Google Authenticator), SMS
- **Response**: QR code for TOTP setup or SMS confirmation
- **Security**: Backup codes generated for recovery

#### **POST /api/auth/mfa/verify**
- **Purpose**: Verify MFA code during login
- **Validation**: TOTP or SMS code verification
- **Response**: Complete authentication with tokens
- **Security**: Time-based code validation with drift tolerance

#### **POST /api/auth/mfa/disable**
- **Purpose**: Disable MFA for user account
- **Validation**: Current password and MFA code required
- **Response**: MFA disabled confirmation
- **Security**: Audit log entry for security tracking

### 🔑 **Password Management**

#### **POST /api/auth/forgot-password**
- **Purpose**: Initiate password reset process
- **Rate Limit**: 3 requests per hour per email
- **Response**: Reset email sent confirmation
- **Security**: Secure reset tokens with 1-hour expiration

#### **POST /api/auth/reset-password**
- **Purpose**: Reset password with token
- **Validation**: Token validity and password strength
- **Response**: Password reset confirmation
- **Security**: Token invalidation after use

#### **PATCH /api/auth/change-password**
- **Purpose**: Change password for authenticated user
- **Validation**: Current password verification
- **Response**: Password change confirmation
- **Security**: Session invalidation for security

### 👤 **User Management**

#### **GET /api/auth/profile**
- **Purpose**: Get current user profile
- **Authentication**: JWT required
- **Response**: Complete user profile data
- **Privacy**: Sensitive data filtering based on permissions

#### **PATCH /api/auth/profile**
- **Purpose**: Update user profile information
- **Validation**: Field-specific validation rules
- **Response**: Updated profile data
- **Security**: Change audit logging

### 🔧 **Service Integration**

#### **POST /api/auth/validate-token**
- **Purpose**: Validate JWT token for other services
- **Authentication**: Service-to-service token required
- **Response**: Token validity and user information
- **Security**: Service authentication and rate limiting

#### **GET /api/auth/user/{userId}**
- **Purpose**: Get user information for service integration
- **Authentication**: Service token required
- **Response**: User profile for service operations
- **Privacy**: Limited data exposure for service needs

### 📊 **Monitoring & Health**

#### **GET /api/health**
- **Purpose**: Service health check
- **Public**: No authentication required
- **Response**: Service status and dependencies
- **Monitoring**: Database, Redis, and external service status
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Complete list of Auth Service endpoints',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'object',
          properties: {
            authentication: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  method: { type: 'string', example: 'POST' },
                  path: { type: 'string', example: '/api/auth/login' },
                  description: { type: 'string', example: 'Authenticate user and issue tokens' },
                  rateLimit: { type: 'string', example: '5 requests per minute' },
                  authentication: { type: 'string', example: 'none' }
                }
              }
            },
            mfa: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  method: { type: 'string', example: 'POST' },
                  path: { type: 'string', example: '/api/auth/mfa/setup' },
                  description: { type: 'string', example: 'Enable MFA for user account' },
                  authentication: { type: 'string', example: 'JWT required' }
                }
              }
            },
            userManagement: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  method: { type: 'string', example: 'GET' },
                  path: { type: 'string', example: '/api/auth/profile' },
                  description: { type: 'string', example: 'Get current user profile' },
                  authentication: { type: 'string', example: 'JWT required' }
                }
              }
            }
          }
        },
        totalEndpoints: { type: 'number', example: 25 },
        publicEndpoints: { type: 'number', example: 8 },
        protectedEndpoints: { type: 'number', example: 17 }
      }
    }
  })
  async getAuthEndpoints() {
    return {
      categories: {
        authentication: [
          {
            method: 'POST',
            path: '/api/auth/register',
            description: 'Register a new user account',
            rateLimit: '5 requests per minute',
            authentication: 'none',
            validation: 'Email format, password strength, terms acceptance'
          },
          {
            method: 'POST',
            path: '/api/auth/verify-email',
            description: 'Verify email address with token',
            authentication: 'none',
            validation: 'Token format and expiration'
          },
          {
            method: 'POST',
            path: '/api/auth/login',
            description: 'Authenticate user and issue tokens',
            rateLimit: '5 requests per minute',
            authentication: 'none',
            mfa: 'Triggers MFA flow if enabled'
          },
          {
            method: 'POST',
            path: '/api/auth/refresh-token',
            description: 'Refresh expired access tokens',
            authentication: 'Refresh token required',
            security: 'Token rotation'
          },
          {
            method: 'POST',
            path: '/api/auth/logout',
            description: 'Invalidate user session',
            authentication: 'JWT required',
            options: 'Single session or all sessions'
          }
        ],
        mfa: [
          {
            method: 'POST',
            path: '/api/auth/mfa/setup',
            description: 'Enable MFA for user account',
            authentication: 'JWT required',
            methods: 'TOTP, SMS'
          },
          {
            method: 'POST',
            path: '/api/auth/mfa/verify',
            description: 'Verify MFA code during login',
            authentication: 'Temporary token',
            validation: 'TOTP or SMS code'
          },
          {
            method: 'POST',
            path: '/api/auth/mfa/disable',
            description: 'Disable MFA for user account',
            authentication: 'JWT + MFA code required',
            security: 'Audit logging'
          }
        ],
        passwordManagement: [
          {
            method: 'POST',
            path: '/api/auth/forgot-password',
            description: 'Initiate password reset process',
            rateLimit: '3 requests per hour',
            authentication: 'none'
          },
          {
            method: 'POST',
            path: '/api/auth/reset-password',
            description: 'Reset password with token',
            authentication: 'Reset token required',
            validation: 'Password strength'
          },
          {
            method: 'PATCH',
            path: '/api/auth/change-password',
            description: 'Change password for authenticated user',
            authentication: 'JWT required',
            validation: 'Current password verification'
          }
        ],
        userManagement: [
          {
            method: 'GET',
            path: '/api/auth/profile',
            description: 'Get current user profile',
            authentication: 'JWT required',
            privacy: 'Filtered based on permissions'
          },
          {
            method: 'PATCH',
            path: '/api/auth/profile',
            description: 'Update user profile information',
            authentication: 'JWT required',
            validation: 'Field-specific rules'
          }
        ],
        serviceIntegration: [
          {
            method: 'POST',
            path: '/api/auth/validate-token',
            description: 'Validate JWT token for other services',
            authentication: 'Service token required',
            purpose: 'Service-to-service validation'
          },
          {
            method: 'GET',
            path: '/api/auth/user/{userId}',
            description: 'Get user information for service integration',
            authentication: 'Service token required',
            privacy: 'Limited data exposure'
          }
        ],
        monitoring: [
          {
            method: 'GET',
            path: '/api/health',
            description: 'Service health check',
            authentication: 'none',
            monitoring: 'Database, Redis, external services'
          }
        ]
      },
      totalEndpoints: 25,
      publicEndpoints: 8,
      protectedEndpoints: 17,
      serviceEndpoints: 5,
      rateLimitedEndpoints: 12
    };
  }

  @Get('security')
  @Public()
  @ApiOperation({ 
    summary: '🛡️ Auth Service Security Features',
    description: `
## 🛡️ Security Architecture & Features

Comprehensive security measures implemented in the Auth Service to protect user data and prevent unauthorized access.

### 🔐 **Authentication Security**

#### **JWT Token Management**
- **Algorithm**: RS256 (RSA with SHA-256)
- **Access Token Expiry**: 15 minutes
- **Refresh Token Expiry**: 7 days
- **Token Rotation**: Automatic refresh token rotation
- **Blacklisting**: Immediate token invalidation on logout
- **Signature Verification**: Public key validation

#### **Password Security**
- **Hashing**: bcrypt with salt rounds (12)
- **Strength Requirements**: Minimum 8 characters, mixed case, numbers, symbols
- **History**: Prevent reuse of last 5 passwords
- **Expiration**: Optional password expiration policies
- **Breach Detection**: Integration with HaveIBeenPwned API

#### **Multi-Factor Authentication**
- **TOTP Support**: Google Authenticator, Authy compatibility
- **SMS Backup**: Twilio integration for SMS codes
- **Backup Codes**: 10 single-use recovery codes
- **Time Drift**: 30-second window tolerance
- **Rate Limiting**: 3 attempts per 5 minutes

### 🚫 **Attack Prevention**

#### **Rate Limiting**
- **Login Attempts**: 5 attempts per minute per IP
- **Registration**: 3 registrations per hour per IP
- **Password Reset**: 3 requests per hour per email
- **API Calls**: 100 requests per minute per user
- **Sliding Window**: Redis-based implementation

#### **Account Protection**
- **Account Lockout**: 5 failed login attempts
- **Lockout Duration**: 15 minutes (exponential backoff)
- **IP Blocking**: Automatic blocking of suspicious IPs
- **Device Tracking**: New device notifications
- **Geolocation**: Unusual location alerts

#### **Input Validation**
- **SQL Injection**: Parameterized queries with TypeORM
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **Request Size**: 1MB maximum payload size
- **Content Type**: Strict content-type validation

### 🔍 **Monitoring & Auditing**

#### **Security Events**
- **Login Attempts**: Success and failure tracking
- **Password Changes**: Audit trail with timestamps
- **MFA Events**: Setup, verification, and bypass attempts
- **Token Usage**: Access and refresh token activities
- **Admin Actions**: All administrative operations

#### **Anomaly Detection**
- **Unusual Login Patterns**: Time, location, device analysis
- **Brute Force Detection**: Pattern recognition algorithms
- **Account Takeover**: Behavioral analysis
- **API Abuse**: Request pattern monitoring
- **Data Access**: Sensitive data access logging

#### **Compliance Logging**
- **HIPAA Audit Trails**: Healthcare data access logs
- **GDPR Compliance**: Data processing and consent logs
- **Retention Policies**: Automatic log rotation and archival
- **Encryption**: Logs encrypted at rest and in transit
- **Integrity**: Cryptographic log integrity verification

### 🏥 **Healthcare Compliance**

#### **HIPAA Requirements**
- **Access Controls**: Role-based access to PHI
- **Audit Logs**: Comprehensive access tracking
- **Data Encryption**: AES-256 encryption at rest
- **Transmission Security**: TLS 1.3 for data in transit
- **User Authentication**: Strong authentication requirements

#### **GDPR Compliance**
- **Data Minimization**: Collect only necessary data
- **Consent Management**: Granular consent tracking
- **Right to Access**: User data export capabilities
- **Right to Deletion**: Secure data removal processes
- **Data Portability**: Structured data export formats

### 🔧 **Infrastructure Security**

#### **Network Security**
- **TLS Encryption**: TLS 1.3 for all communications
- **Certificate Pinning**: Public key pinning for mobile apps
- **HSTS Headers**: Strict transport security enforcement
- **CSP Headers**: Content security policy implementation
- **CORS Configuration**: Strict origin validation

#### **Database Security**
- **Connection Encryption**: SSL/TLS database connections
- **Access Controls**: Database user privilege separation
- **Query Monitoring**: Slow query and anomaly detection
- **Backup Encryption**: Encrypted database backups
- **Schema Validation**: Database schema integrity checks

#### **Container Security**
- **Image Scanning**: Vulnerability scanning in CI/CD
- **Runtime Security**: Container runtime monitoring
- **Secrets Management**: Kubernetes secrets for sensitive data
- **Network Policies**: Pod-to-pod communication restrictions
- **Resource Limits**: CPU and memory constraints
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Auth Service security features and compliance information',
    schema: {
      type: 'object',
      properties: {
        authentication: {
          type: 'object',
          properties: {
            tokenAlgorithm: { type: 'string', example: 'RS256' },
            accessTokenExpiry: { type: 'string', example: '15 minutes' },
            refreshTokenExpiry: { type: 'string', example: '7 days' },
            passwordHashing: { type: 'string', example: 'bcrypt with 12 salt rounds' },
            mfaSupport: { type: 'array', items: { type: 'string' }, example: ['TOTP', 'SMS'] }
          }
        },
        rateLimiting: {
          type: 'object',
          properties: {
            loginAttempts: { type: 'string', example: '5 per minute per IP' },
            registration: { type: 'string', example: '3 per hour per IP' },
            passwordReset: { type: 'string', example: '3 per hour per email' },
            apiCalls: { type: 'string', example: '100 per minute per user' }
          }
        },
        compliance: {
          type: 'array',
          items: { type: 'string' },
          example: ['HIPAA', 'GDPR', 'SOC 2', 'ISO 27001']
        },
        encryption: {
          type: 'object',
          properties: {
            atRest: { type: 'string', example: 'AES-256' },
            inTransit: { type: 'string', example: 'TLS 1.3' },
            database: { type: 'string', example: 'SSL/TLS' }
          }
        }
      }
    }
  })
  async getAuthSecurity() {
    return {
      authentication: {
        tokenAlgorithm: 'RS256',
        accessTokenExpiry: '15 minutes',
        refreshTokenExpiry: '7 days',
        tokenRotation: true,
        passwordHashing: 'bcrypt with 12 salt rounds',
        passwordStrength: 'Minimum 8 characters, mixed case, numbers, symbols',
        mfaSupport: ['TOTP', 'SMS', 'Backup Codes'],
        breachDetection: 'HaveIBeenPwned integration'
      },
      rateLimiting: {
        loginAttempts: '5 per minute per IP',
        registration: '3 per hour per IP',
        passwordReset: '3 per hour per email',
        apiCalls: '100 per minute per user',
        implementation: 'Redis-based sliding window'
      },
      accountProtection: {
        accountLockout: '5 failed attempts',
        lockoutDuration: '15 minutes (exponential backoff)',
        ipBlocking: 'Automatic suspicious IP blocking',
        deviceTracking: 'New device notifications',
        geolocation: 'Unusual location alerts'
      },
      compliance: ['HIPAA', 'GDPR', 'SOC 2', 'ISO 27001'],
      encryption: {
        atRest: 'AES-256',
        inTransit: 'TLS 1.3',
        database: 'SSL/TLS',
        logs: 'Encrypted with integrity verification'
      },
      monitoring: {
        securityEvents: 'Comprehensive audit logging',
        anomalyDetection: 'Behavioral analysis',
        complianceLogging: 'HIPAA and GDPR audit trails',
        realTimeAlerts: 'Suspicious activity notifications'
      },
      infrastructure: {
        networkSecurity: 'TLS 1.3, HSTS, CSP, CORS',
        databaseSecurity: 'Encrypted connections, access controls',
        containerSecurity: 'Image scanning, runtime monitoring',
        secretsManagement: 'Kubernetes secrets'
      }
    };
  }
} 
# 🔐 MindLyf Authentication Service

## 📋 Overview

Production-ready NestJS authentication service for the MindLyf mental health platform. Handles user registration, authentication, and account management with HIPAA compliance and multi-user type support.

## 🌐 Service URLs

- **Production API**: `https://api.mindlyf.org/api`
- **Swagger Docs**: `https://api.mindlyf.org/api/docs` 
- **Local Dev**: `http://localhost:3001/api`

## 👥 Supported User Types

1. **Regular Users** - Clients seeking mental health support
2. **Therapists** - Licensed professionals (requires admin approval)
3. **Organization Users** - Healthcare org staff (admin-created)
4. **Support Team** - Customer support staff (admin-created)

## 🚀 Quick Start

### Adult User Registration
```bash
curl -X POST https://api.mindlyf.org/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123",
    "firstName": "John",
    "lastName": "Doe",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

### Minor User Registration (<18)
```bash
curl -X POST https://api.mindlyf.org/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teen@example.com",
    "password": "SecureP@ss123", 
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "2008-05-20",
    "guardianEmail": "parent@example.com",
    "guardianPhone": "+1-555-123-9876",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

### Therapist Registration
```bash
curl -X POST https://api.mindlyf.org/api/auth/register/therapist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.therapist@example.com",
    "password": "TherapistP@ss123",
    "firstName": "Dr. Sarah",
    "lastName": "Wilson", 
    "licenseNumber": "CA-PSY-12345",
    "specialization": ["Anxiety Disorders", "Depression"],
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

## 🔄 Key Flows

### Age-Based Registration Logic
- **Adults (18+)**: Standard registration
- **Minors (<18)**: Requires guardian email and phone
- System automatically validates age from `dateOfBirth`

### Therapist Approval Process
1. Submit professional credentials
2. Email verification
3. Admin review (2-5 business days)
4. Approval/rejection notification
5. Full platform access upon approval

## 📊 Core API Endpoints

| Method | Endpoint | Purpose | Rate Limit |
|--------|----------|---------|------------|
| POST | `/auth/register` | Register user | 5/min |
| POST | `/auth/register/therapist` | Register therapist | 3/min |
| POST | `/auth/login` | User login | 5/min |
| POST | `/auth/verify-email` | Verify email | Unlimited |
| POST | `/auth/refresh-token` | Refresh JWT | 10/min |
| POST | `/auth/logout` | User logout | Unlimited |

## 🛡️ Security Features

- **Password Requirements**: 8+ chars, mixed case, number, special char
- **HIPAA Compliant**: Encrypted health data storage
- **JWT Authentication**: RS256 signed tokens
- **Rate Limiting**: Brute force protection
- **Email Verification**: Required for account activation

## 🚨 Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "Password must contain at least 1 uppercase letter",
    "Guardian email is required for users under 18"
  ],
  "error": "Bad Request"
}
```

### User Exists (409)
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict",
  "suggestion": "Try logging in instead, or use forgot password if needed"
}
```

## 📱 Frontend Integration

### Age Validation Logic
```javascript
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Show guardian fields for minors
if (calculateAge(dateOfBirth) < 18) {
  showGuardianFields();
  makeGuardianFieldsRequired();
}
```

### Password Validation
```javascript
const validatePassword = (password) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password), 
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  return Object.values(requirements).every(Boolean);
};
```

## 🧪 Test Data

```javascript
const testUsers = {
  adult: {
    email: 'test.adult@mindlyf.test',
    password: 'TestP@ss123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-15'
  },
  minor: {
    email: 'test.minor@mindlyf.test',
    password: 'TestP@ss456',
    firstName: 'Jane', 
    lastName: 'Smith',
    dateOfBirth: '2008-05-20',
    guardianEmail: 'guardian@test.com',
    guardianPhone: '+1-555-123-9876'
  }
};
```

## 📚 Documentation

- **[Frontend Implementation Guide](./FRONTEND_IMPLEMENTATION_SUMMARY.md)** - Complete integration guide
- **[Complete Testing Guide](./COMPLETE_REGISTRATION_TESTING_GUIDE.md)** - Testing procedures
- **[User Management Guide](./USER_MANAGEMENT.md)** - User types and permissions
- **[API Endpoints](./API_ENDPOINTS.md)** - Detailed endpoint documentation

## 🔧 Development

### Local Setup
```bash
cd backend/auth-service
npm install
npm run start:dev
```

### Docker Setup
```bash
docker-compose up -d
```

## 📞 Support

- **API Documentation**: https://api.mindlyf.org/api/docs
- **Backend Team**: backend-team@mindlyf.com
- **Issues**: Create GitHub issue or contact team

---

**Production URL**: https://api.mindlyf.org  
**Last Updated**: December 2024  
**Version**: v1.0.0 
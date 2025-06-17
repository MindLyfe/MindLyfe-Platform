# 🧪 Complete Registration Testing Guide

## 📋 Overview
This guide provides step-by-step testing procedures for all MindLyf authentication endpoints with exact API calls, expected responses, and frontend integration examples.

## 🌐 Base Configuration

```javascript
const API_BASE = {
  local: 'http://localhost:3001/api',
  staging: 'https://staging-api.mindlyf.org/api',
  production: 'https://api.mindlyf.org/api'
};

const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'MindLyf-Frontend/1.0',
  'X-Forwarded-For': '127.0.0.1'
};
```

## 🧑 Test 1: Adult User Registration (18+)

### ✅ Valid Adult Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "User-Agent: MindLyf-Test/1.0" \
  -d '{
    "email": "john.adult@mindlyf.test",
    "password": "SecureP@ss123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1-555-123-4567",
    "dateOfBirth": "1990-01-15",
    "preferredLanguage": "en",
    "communicationPreference": "email",
    "timezone": "America/New_York",
    "agreeToTerms": true,
    "agreeToPrivacy": true,
    "marketingOptIn": false
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.adult@mindlyf.test",
  "verificationRequired": true,
  "nextSteps": [
    "Check your email for verification link",
    "Click the verification link to activate your account",
    "Return to login page after verification"
  ]
}
```

### Frontend Implementation:
```javascript
const registerAdultUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE.production}/auth/register`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        ...userData,
        agreeToTerms: true,
        agreeToPrivacy: true
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Show success message
      showSuccessMessage(data.message);
      // Redirect to email verification page
      redirectToEmailVerification(data.email);
    } else {
      handleRegistrationError(data, response.status);
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    showErrorMessage('Network error. Please try again.');
  }
};
```

## 👶 Test 2: Minor User Registration (<18)

### ✅ Valid Minor Registration (with Guardian Info)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.minor@mindlyf.test",
    "password": "SecureP@ss456",
    "firstName": "Jane",
    "lastName": "Smith",
    "phoneNumber": "+1-555-987-6543",
    "dateOfBirth": "2008-05-20",
    "guardianEmail": "parent.smith@example.com",
    "guardianPhone": "+1-555-123-9876",
    "preferredLanguage": "en",
    "communicationPreference": "email",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

### ❌ Invalid Minor Registration (Missing Guardian Info)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teen.invalid@mindlyf.test",
    "password": "SecureP@ss789",
    "firstName": "Teen",
    "lastName": "User",
    "dateOfBirth": "2008-05-20",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

**Expected Error (400):**
```json
{
  "statusCode": 400,
  "message": [
    "Guardian email is required for users under 18",
    "Guardian phone is required for users under 18"
  ],
  "error": "Bad Request"
}
```

### Frontend Age Validation:
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

const handleDateOfBirthChange = (dateOfBirth) => {
  const age = calculateAge(dateOfBirth);
  const guardianFields = document.getElementById('guardian-fields');
  
  if (age < 18) {
    guardianFields.style.display = 'block';
    guardianFields.querySelectorAll('input').forEach(input => {
      input.setAttribute('required', 'true');
    });
    showAgeNotice('Guardian information is required for users under 18');
  } else {
    guardianFields.style.display = 'none';
    guardianFields.querySelectorAll('input').forEach(input => {
      input.removeAttribute('required');
    });
    hideAgeNotice();
  }
};
```

## 🩺 Test 3: Therapist Registration

### ✅ Valid Therapist Registration
```bash
curl -X POST http://localhost:3001/api/auth/register/therapist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.sarah.wilson@mindlyf.test",
    "password": "TherapistP@ss123",
    "firstName": "Sarah",
    "lastName": "Wilson",
    "phoneNumber": "+1-555-789-0123",
    "dateOfBirth": "1985-03-15",
    "licenseNumber": "CA-PSY-12345",
    "specialization": [
      "Anxiety Disorders",
      "Depression",
      "Cognitive Behavioral Therapy",
      "Trauma and PTSD"
    ],
    "credentials": [
      "PhD in Clinical Psychology",
      "Licensed Clinical Psychologist",
      "Certified Trauma Specialist"
    ],
    "hourlyRate": 175,
    "professionalBio": "Dr. Sarah Wilson is a licensed clinical psychologist with over 12 years of experience treating anxiety, depression, and trauma. She specializes in cognitive behavioral therapy and has extensive training in trauma-informed care.",
    "education": "PhD in Clinical Psychology, Harvard University",
    "yearsOfExperience": 12,
    "languagesSpoken": ["English", "Spanish"],
    "licenseState": "California",
    "licenseExpirationDate": "2025-12-31",
    "preferredLanguage": "en",
    "communicationPreference": "email",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Therapist registration successful. Your application is under review.",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "email": "dr.sarah.wilson@mindlyf.test",
  "status": "pending_approval",
  "licenseNumber": "CA-PSY-12345",
  "approvalProcess": {
    "estimatedReviewTime": "2-5 business days",
    "nextSteps": [
      "Admin team will verify your professional license",
      "Background check may be conducted",
      "You will receive approval/rejection notification via email",
      "Check your email for verification link to activate basic account access"
    ]
  }
}
```

### Frontend Therapist Form:
```javascript
const therapistSpecializations = [
  'Anxiety Disorders',
  'Depression',
  'PTSD/Trauma',
  'Relationship Counseling',
  'Family Therapy',
  'Substance Abuse',
  'Eating Disorders',
  'Grief & Loss',
  'ADHD',
  'Bipolar Disorder',
  'OCD',
  'Autism Spectrum Disorders'
];

const validateTherapistForm = (formData) => {
  const errors = [];
  
  if (!formData.licenseNumber || formData.licenseNumber.length < 5) {
    errors.push('License number must be at least 5 characters');
  }
  
  if (!formData.specialization || formData.specialization.length === 0) {
    errors.push('At least one specialization is required');
  }
  
  if (formData.hourlyRate && (formData.hourlyRate < 1 || formData.hourlyRate > 500)) {
    errors.push('Hourly rate must be between $1 and $500');
  }
  
  if (formData.professionalBio && formData.professionalBio.length < 50) {
    errors.push('Professional bio must be at least 50 characters');
  }
  
  return errors;
};
```

## 🔑 Test 4: Login Flow

### ✅ Valid Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.adult@mindlyf.test",
    "password": "SecureP@ss123",
    "deviceType": "web",
    "rememberMe": false
  }'
```

**Expected Response (200):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.adult@mindlyf.test",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t"
}
```

## 📧 Test 5: Email Verification

### ✅ Email Verification
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "email_verification_token_123456",
    "redirectUrl": "https://app.mindlyf.com/dashboard"
  }'
```

## 🚨 Error Testing Scenarios

### Password Validation Errors
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.weak@mindlyf.test",
    "password": "weak",
    "firstName": "Test",
    "lastName": "User",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

### Duplicate Email Error
```bash
# Register the same email twice
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@mindlyf.test",
    "password": "SecureP@ss123",
    "firstName": "Duplicate",
    "lastName": "User",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

## 🛡️ Frontend Security Implementation

### Token Management
```javascript
class AuthTokenManager {
  static setTokens(accessToken, refreshToken) {
    // Use secure storage in production
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }
  
  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  
  static async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await fetch(`${API_BASE.production}/auth/refresh-token`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.accessToken, data.refreshToken);
      return data;
    }
    throw new Error('Token refresh failed');
  }
}
```

### Form Validation
```javascript
class RegistrationValidator {
  static validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  static validatePassword(password) {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements
    };
  }
  
  static validateName(name) {
    return name.length >= 2 && /^[A-Za-z\s\-']+$/.test(name);
  }
  
  static validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
    return phoneRegex.test(phone);
  }
}
```

## 📊 Testing Checklist

### ✅ User Registration Tests
- [ ] Adult user registration (18+)
- [ ] Minor user registration (<18) with guardian info
- [ ] Minor user registration without guardian info (should fail)
- [ ] Registration with weak password (should fail)
- [ ] Registration with invalid email (should fail)
- [ ] Registration with duplicate email (should fail)
- [ ] Registration without required consents (should fail)

### ✅ Therapist Registration Tests
- [ ] Valid therapist registration with all fields
- [ ] Therapist registration without license number (should fail)
- [ ] Therapist registration without specializations (should fail)
- [ ] Therapist registration with invalid hourly rate (should fail)
- [ ] Therapist registration with duplicate license number (should fail)

### ✅ Authentication Tests
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Login with unverified email (should fail)
- [ ] Token refresh functionality
- [ ] Logout functionality

### ✅ Email Verification Tests
- [ ] Valid email verification token
- [ ] Invalid email verification token (should fail)
- [ ] Expired email verification token (should fail)

## 🔧 Production Deployment Notes

### Environment Variables
```bash
# Production API URL
REACT_APP_API_BASE_URL=https://api.mindlyf.org/api

# Development API URL
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### HTTPS Requirements
- All API calls must use HTTPS in production
- Implement proper SSL certificate validation
- Use secure headers for all requests

### Rate Limiting Handling
```javascript
const handleRateLimit = (retryAfter) => {
  const seconds = parseInt(retryAfter);
  showErrorMessage(`Too many attempts. Please wait ${seconds} seconds before trying again.`);
  
  // Disable form for retry period
  disableForm(seconds * 1000);
  
  // Show countdown timer
  startCountdown(seconds);
};
```

---

**Last Updated**: December 2024
**Next Review**: January 2025 
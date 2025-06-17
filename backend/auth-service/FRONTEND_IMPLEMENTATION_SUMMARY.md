# 🚀 MindLyfe Auth System - Frontend Implementation Guide

## 📋 Quick Reference

**Production API Base URL**: `https://api.mindlyfe.com`
**Auth Endpoints**: `https://api.mindlyfe.com/api/auth/*` (routed through API Gateway)
**Swagger Documentation**: `https://api.mindlyfe.com/api/docs`
**Local Development**: `http://localhost:3000/api` (API Gateway) or `http://localhost:3001/api` (Direct Auth Service)

## ✅ **CRITICAL UPDATE: API Gateway Integration**

🎯 **All authentication and user management endpoints are now fully integrated through the API Gateway!**

### **What Changed:**
- ✅ **API Gateway**: All 123 endpoints now properly exposed through single entry point
- ✅ **Domain Correction**: Fixed domain to `mindlyfe.com` (with "E")
- ✅ **Swagger Documentation**: All auth and user endpoints now visible in API Gateway Swagger
- ✅ **Authentication Flow**: Complete auth endpoints integrated through gateway
- ✅ **User Management**: Full user CRUD operations available through gateway

### **New API Gateway Endpoints:**

#### **Authentication Endpoints** (`/api/auth/`)
- `POST /api/auth/login` - User login ✅
- `POST /api/auth/register` - Register adult/minor user ✅
- `POST /api/auth/register/therapist` - Register therapist ✅
- `POST /api/auth/register/organization-user` - Register organization user ✅
- `POST /api/auth/register/support-team` - Register support team ✅
- `POST /api/auth/refresh-token` - Refresh JWT token ✅
- `POST /api/auth/forgot-password` - Request password reset ✅
- `POST /api/auth/reset-password` - Reset password with token ✅
- `POST /api/auth/verify-email` - Verify email address ✅
- `GET /api/auth/me` - Get current user profile ✅
- `PATCH /api/auth/change-password` - Change password ✅
- `POST /api/auth/logout` - Logout user ✅
- `POST /api/auth/revoke-token` - Revoke refresh token ✅
- `POST /api/auth/validate-token` - Validate JWT token ✅
- `POST /api/auth/validate-service-token` - Validate service token ✅
- `POST /api/auth/validate-payment-access` - Validate payment access ✅

#### **User Management Endpoints** (`/api/users/`)
- `GET /api/users` - Get all users (admin only) ✅
- `GET /api/users/{id}` - Get user by ID ✅
- `PATCH /api/users/{id}` - Update user information ✅
- `DELETE /api/users/{id}` - Delete user account ✅
- `PATCH /api/users/{id}/password` - Update user password (admin) ✅

## 🔥 **Frontend Integration Examples**

### **Environment Configuration**
```javascript
// .env.production
REACT_APP_API_BASE_URL=https://api.mindlyfe.com
REACT_APP_API_VERSION=/api

// .env.development
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_API_VERSION=/api
```

### **API Service Setup**
```javascript
// services/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_VERSION = process.env.REACT_APP_API_VERSION;

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Registration Examples**

#### **Adult User Registration**
```javascript
// services/auth.js
export const registerAdult = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth, // Must be 18+ for adult
      phoneNumber: userData.phoneNumber,
      gender: userData.gender, // Optional
      emergencyContact: userData.emergencyContact // Optional
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### **Minor User Registration (with Guardian)**
```javascript
export const registerMinor = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth, // Must be under 18
      phoneNumber: userData.phoneNumber,
      
      // Required for minors
      guardianEmail: userData.guardianEmail,
      guardianPhone: userData.guardianPhone,
      guardianFirstName: userData.guardianFirstName,
      guardianLastName: userData.guardianLastName,
      guardianRelationship: userData.guardianRelationship
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### **Therapist Registration**
```javascript
export const registerTherapist = async (therapistData) => {
  try {
    const response = await apiClient.post('/auth/register/therapist', {
      email: therapistData.email,
      password: therapistData.password,
      firstName: therapistData.firstName,
      lastName: therapistData.lastName,
      dateOfBirth: therapistData.dateOfBirth,
      phoneNumber: therapistData.phoneNumber,
      
      // Therapist-specific fields
      licenseNumber: therapistData.licenseNumber,
      licenseState: therapistData.licenseState,
      specialization: therapistData.specialization, // Array of strings
      yearsOfExperience: therapistData.yearsOfExperience,
      education: therapistData.education,
      bio: therapistData.bio
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### **Authentication Flow**
```javascript
// Login
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    
    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh-token', {
      token: refreshToken
    });
    
    localStorage.setItem('authToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    throw error.response?.data || error;
  }
};
```

### **Password Management**
```javascript
// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', {
      email
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change password (authenticated user)
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.patch('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### **Email Verification**
```javascript
// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await apiClient.post('/auth/verify-email', {
      token
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

## 🔐 **Validation Rules**

### **Password Requirements**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Cannot contain common words or sequences

### **Email Validation**
- Must be valid email format
- Domain validation
- Unique across system

### **Name Validation**
- Only letters, spaces, hyphens, apostrophes allowed
- 2-50 characters
- No leading/trailing spaces

### **Phone Number**
- Must include country code
- Valid international format
- Example: +1234567890

### **Age-Based Logic**
- **Adults (18+)**: No guardian information required
- **Minors (<18)**: Guardian information mandatory
- Guardian relationship validation required

## 🎯 **Error Handling**

```javascript
// Universal error handler
export const handleApiError = (error) => {
  if (error?.message) {
    // Validation errors (array of strings)
    if (Array.isArray(error.message)) {
      return error.message.join(', ');
    }
    // Single error message
    return error.message;
  }
  
  // HTTP status errors
  switch (error?.statusCode) {
    case 400:
      return 'Invalid input data';
    case 401:
      return 'Authentication required';
    case 403:
      return 'Access forbidden';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Email already exists';
    case 429:
      return 'Too many requests, please try again later';
    default:
      return 'An unexpected error occurred';
  }
};
```

## 📱 **User Journey States**

### **Registration Flow**
1. **Email/Password Entry** → Validation
2. **Personal Info** → Age calculation
3. **Guardian Info** (if minor) → Validation
4. **Submit** → Registration API call
5. **Email Verification** → Check email for verification link
6. **Account Active** → Can log in

### **Login Flow**
1. **Email/Password** → Login API call
2. **Email Verified?** → If no, redirect to verification
3. **Authentication** → Store tokens
4. **Dashboard** → Redirect to main app

### **Email Verification Flow**
1. **Check Email** → Click verification link
2. **Token Verification** → API call to verify email
3. **Account Activated** → Redirect to login

## 🔄 **Token Management**

### **Access Token**
- **Lifetime**: 15 minutes
- **Usage**: API authentication
- **Storage**: Memory (not localStorage for security)

### **Refresh Token**
- **Lifetime**: 7 days
- **Usage**: Get new access token
- **Storage**: HttpOnly cookie (secure)

### **Auto-Refresh Logic**
```javascript
// Automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        // Retry original request
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## 🏗️ **API Gateway Architecture Benefits**

### **Single Entry Point**
- **Production**: `https://api.mindlyfe.com/api/*`
- **Development**: `http://localhost:3000/api/*`
- No need to manage multiple service URLs

### **Centralized Features**
- ✅ **Authentication**: JWT validation at gateway level
- ✅ **Rate Limiting**: Applied across all services
- ✅ **CORS**: Configured once for all endpoints
- ✅ **SSL Termination**: Single certificate management
- ✅ **Request Logging**: Centralized monitoring
- ✅ **Error Handling**: Consistent error responses

### **Frontend Benefits**
- **Simple Configuration**: Single base URL
- **Consistent Responses**: Standardized error format
- **Better Performance**: Optimized routing
- **Security**: Reduced attack surface

## 🚨 **Production Checklist**

### **Before Deployment**
- [ ] Update all environment variables to use `api.mindlyfe.com`
- [ ] Test all registration flows (adult, minor, therapist)
- [ ] Verify email verification flow
- [ ] Test password reset functionality
- [ ] Validate token refresh mechanism
- [ ] Test error handling scenarios
- [ ] Verify CORS configuration
- [ ] Check SSL certificate installation

### **Post-Deployment Verification**
- [ ] Test registration from production domain
- [ ] Verify email delivery (check spam folders)
- [ ] Test login flow end-to-end
- [ ] Validate API Gateway routing
- [ ] Monitor error logs
- [ ] Test mobile responsiveness
- [ ] Verify Swagger documentation accessibility

---

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **Email Not Verified**: Check spam folder, resend verification
2. **Password Reset Not Working**: Verify email delivery settings
3. **Guardian Validation**: Ensure all guardian fields for minors
4. **Token Expired**: Automatic refresh should handle this
5. **CORS Errors**: Check domain configuration

### **Debug Endpoints**
- **Health Check**: `GET /api/health`
- **Swagger Docs**: `GET /api/docs`
- **API Documentation**: `GET /api/docs-json`

**All systems are fully operational and tested! 🚀**

## 🎯 Key User Registration Flows

### 1. Standard User Registration

#### Adult Users (18+)
```javascript
POST https://api.mindlyfe.com/api/auth/register
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-123-4567",
  "dateOfBirth": "1990-01-15",
  "agreeToTerms": true,
  "agreeToPrivacy": true
}
```

#### Minor Users (<18) - Requires Guardian Information
```javascript
POST https://api.mindlyfe.com/api/auth/register
{
  "email": "teen@example.com", 
  "password": "SecureP@ss123",
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "2008-05-20",
  "guardianEmail": "parent@example.com",    // REQUIRED for <18
  "guardianPhone": "+1-555-123-9876",      // REQUIRED for <18
  "agreeToTerms": true,
  "agreeToPrivacy": true
}
```

### 2. Therapist Registration
```javascript
POST https://api.mindlyfe.com/api/auth/register/therapist
{
  "email": "dr.therapist@example.com",
  "password": "TherapistP@ss123", 
  "firstName": "Dr. Sarah",
  "lastName": "Wilson",
  "licenseNumber": "CA-PSY-12345",           // REQUIRED
  "specialization": ["Anxiety", "Depression"], // REQUIRED (1-10)
  "credentials": ["PhD in Clinical Psychology"],
  "hourlyRate": 175,
  "professionalBio": "Experienced therapist...",
  "agreeToTerms": true,
  "agreeToPrivacy": true
}
```

## 🔑 Critical Frontend Logic

### Age-Based Form Validation
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

// Show/hide guardian fields based on age
const handleDateOfBirthChange = (dateOfBirth) => {
  const age = calculateAge(dateOfBirth);
  const guardianFields = document.getElementById('guardian-fields');
  
  if (age < 18) {
    guardianFields.style.display = 'block';
    // Make guardian fields required
    document.getElementById('guardianEmail').required = true;
    document.getElementById('guardianPhone').required = true;
    showNotice('Guardian information is required for users under 18');
  } else {
    guardianFields.style.display = 'none';
    document.getElementById('guardianEmail').required = false;
    document.getElementById('guardianPhone').required = false;
  }
};
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
  
  const isValid = Object.values(requirements).every(Boolean);
  const strength = Object.values(requirements).filter(Boolean).length;
  
  return {
    isValid,
    strength: ['very-weak', 'weak', 'fair', 'good', 'strong'][strength],
    requirements
  };
};
```

## 📊 API Response Examples

### Successful Registration (201)
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "verificationRequired": true,
  "nextSteps": [
    "Check your email for verification link",
    "Click the verification link to activate your account", 
    "Return to login page after verification"
  ]
}
```

### Therapist Registration Success (201)
```json
{
  "success": true,
  "message": "Therapist registration successful. Your application is under review.",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "pending_approval",
  "approvalProcess": {
    "estimatedReviewTime": "2-5 business days",
    "nextSteps": [
      "Admin team will verify your professional license",
      "You will receive approval/rejection notification via email"
    ]
  }
}
```

### Validation Errors (400)
```json
{
  "statusCode": 400,
  "message": [
    "Password must contain at least 1 uppercase letter",
    "Guardian email is required for users under 18",
    "First name must be at least 2 characters"
  ],
  "error": "Bad Request"
}
```

### User Already Exists (409)
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict",
  "suggestion": "Try logging in instead, or use forgot password if needed"
}
```

## 🔐 Authentication Flow

### Login
```javascript
POST https://api.mindlyfe.com/api/auth/login
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "deviceType": "web",
  "rememberMe": false
}

// Response
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe", 
  "role": "user",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t"
}
```

### Email Verification
```javascript
POST /auth/verify-email
{
  "token": "email_verification_token_abc123",
  "redirectUrl": "https://app.mindlyf.com/dashboard"
}
```

## 🚨 Error Handling Implementation

```javascript
const handleRegistrationError = (error, response) => {
  switch (response.status) {
    case 400:
      // Validation errors - show field-specific messages
      error.message.forEach(msg => {
        if (msg.includes('Guardian')) {
          highlightGuardianFields();
        } else if (msg.includes('Password')) {
          showPasswordRequirements();
        }
        showFieldError(msg);
      });
      break;
      
    case 409:
      // User exists - suggest login
      showConflictDialog(error.message, error.suggestion);
      break;
      
    case 429:
      // Rate limit - disable form temporarily
      disableFormTemporarily(error.retryAfter);
      showRateLimitMessage(error.retryAfter);
      break;
      
    default:
      showGenericError('Registration failed. Please try again.');
  }
};
```

## 📱 Mobile Optimization

```javascript
// Optimize inputs for mobile devices
const optimizeForMobile = () => {
  // Email input
  document.querySelectorAll('input[type="email"]').forEach(input => {
    input.setAttribute('inputmode', 'email');
    input.setAttribute('autocomplete', 'email');
  });
  
  // Phone input
  document.querySelectorAll('input[name*="phone"]').forEach(input => {
    input.setAttribute('inputmode', 'tel');
    input.setAttribute('autocomplete', 'tel');
  });
  
  // Date input
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.setAttribute('autocomplete', 'bday');
  });
};
```

## 🎨 UI/UX Recommendations

### Progressive Form Disclosure
1. **Step 1**: Basic info (email, password, names)
2. **Step 2**: Contact & DOB (trigger age validation)
3. **Step 3**: Guardian info (if needed) + preferences
4. **Step 4**: Terms & privacy consent

### Real-time Validation
- Email availability check (debounced)
- Password strength indicator
- Name format validation
- Phone number formatting

### Visual Feedback
- Success checkmarks for valid fields
- Clear error messages below fields
- Progress indicators for multi-step forms
- Loading states during API calls

## 🧪 Testing Data

### Valid Test Users
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
  },
  
  therapist: {
    email: 'test.therapist@mindlyf.test',
    password: 'TherapistP@ss123',
    firstName: 'Dr. Sarah',
    lastName: 'Wilson',
    licenseNumber: 'TEST123456',
    specialization: ['Anxiety Disorders', 'Depression']
  }
};
```

## 📋 Implementation Checklist

### ✅ Registration Forms
- [ ] Adult user registration form
- [ ] Minor user registration with guardian fields
- [ ] Therapist registration with professional fields
- [ ] Age-based dynamic form behavior
- [ ] Real-time password validation
- [ ] Terms & privacy consent checkboxes

### ✅ Validation & Error Handling
- [ ] Client-side form validation
- [ ] Server error response handling
- [ ] Field-specific error messages
- [ ] Rate limiting feedback
- [ ] Network error handling

### ✅ Authentication
- [ ] Login form implementation
- [ ] Token storage and management
- [ ] Automatic token refresh
- [ ] Logout functionality
- [ ] Protected route handling

### ✅ Email Verification
- [ ] Email verification flow
- [ ] Resend verification email
- [ ] Verification success/error handling
- [ ] Redirect after verification

### ✅ Mobile & Accessibility
- [ ] Responsive design
- [ ] Touch-friendly inputs
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] High contrast support

## 🔧 Production Configuration

### Environment Variables
```javascript
// Production
REACT_APP_API_BASE_URL=https://api.mindlyfe.com/api
REACT_APP_ENV=production

// Staging  
REACT_APP_API_BASE_URL=https://staging-api.mindlyfe.com/api
REACT_APP_ENV=staging

// Development
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

### Security Headers
```javascript
const secureHeaders = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Cache-Control': 'no-cache'
};
```

## 📞 Support Resources

- **API Documentation**: https://api.mindlyfe.com/api/docs
- **Backend Team Slack**: #backend-support
- **Technical Issues**: backend-team@mindlyf.com
- **Design System**: [Link to Figma]
- **Component Library**: [Link to Storybook]

---

**Last Updated**: December 2024  
**API Version**: v1.0.0  
**Production URL**: https://api.mindlyfe.com 
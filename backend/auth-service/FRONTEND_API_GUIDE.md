# 🎨 MindLyf Auth Service - Frontend Developer API Guide

## Overview

This guide is specifically designed for **frontend developers** working with the MindLyf Auth Service. It includes all API endpoints, request/response examples, error handling patterns, and integration best practices.

**🚀 Base URL:** `http://localhost:3001/api`  
**📚 Interactive Docs:** http://localhost:3001/api/docs  
**🔒 Authentication:** Bearer JWT tokens  
**📝 Content-Type:** `application/json`

---

## 📋 Quick Start for Frontend

### 1. **Installation & Setup**
```bash
# Environment variables
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_AUTH_DOCS_URL=http://localhost:3001/api/docs
```

### 2. **HTTP Client Setup**
```javascript
// axios setup example
import axios from 'axios';

const authAPI = axios.create({
  baseURL: process.env.REACT_APP_AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. **Error Handling Pattern**
```javascript
// Standard error response format
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "email",
    "issue": "Email already exists"
  }
}
```

---

## 🎯 Frontend Integration Patterns

### User Authentication Flow
```javascript
// 1. Registration → 2. Email Verification → 3. Login → 4. Token Refresh
```

### State Management Structure
```javascript
const authState = {
  user: null,           // User object
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  sessionId: null,
  error: null
};
```

---

## 🔐 Authentication Endpoints

### 1. **User Registration**
`POST /auth/register`

**Frontend Use Case:** User signup form

**Request:**
```javascript
const registerUser = async (userData) => {
  try {
    const response = await authAPI.post('/auth/register', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber, // Optional
      dateOfBirth: userData.dateOfBirth  // Format: "YYYY-MM-DD"
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

**Success Response (201):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "9a5edcea-c4cf-4240-bc76-f9db36a171f1",
  "isMinor": false
}
```

**Minor User Response (201):**
```json
{
  "message": "Registration successful. Guardian notification sent.",
  "userId": "uuid-string",
  "isMinor": true,
  "guardianNotificationSent": true
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Guardian email and phone are required for users under 18",
  "error": "Bad Request"
}
```

**Frontend Handling:**
```javascript
// Age-based form validation
const handleRegistration = async (formData) => {
  // Calculate age
  const age = calculateAge(formData.dateOfBirth);
  
  // Show guardian fields if under 18
  if (age < 18) {
    setShowGuardianFields(true);
    setRequiredFields([...requiredFields, 'guardianEmail', 'guardianPhone']);
  }
  
  try {
    const result = await registerUser(formData);
    if (result.isMinor) {
      showGuardianNotificationMessage();
    } else {
      showEmailVerificationMessage();
    }
  } catch (error) {
    handleRegistrationError(error);
  }
};
```

---

### 2. **User Login**
`POST /auth/login`

**Frontend Use Case:** Login form

**Request:**
```javascript
const loginUser = async (credentials) => {
  try {
    const response = await authAPI.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

**Success Response (200):**
```json
{
  "userId": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "isMinor": false,
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "session-uuid-string"
}
```

**MFA Required Response (200):**
```json
{
  "requiresMfa": true,
  "message": "MFA verification required",
  "userId": "uuid-string",
  "tempToken": "temp-jwt-token"
}
```

**Frontend Handling:**
```javascript
const handleLogin = async (credentials) => {
  try {
    const result = await loginUser(credentials);
    
    if (result.requiresMfa) {
      // Redirect to MFA verification
      setTempToken(result.tempToken);
      navigate('/mfa-verification');
    } else {
      // Store tokens and user data
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      setUser(result);
      navigate('/dashboard');
    }
  } catch (error) {
    setLoginError(error.message);
  }
};
```

---

### 3. **Email Verification**
`POST /auth/verify-email`

**Frontend Use Case:** Email verification page

**Request:**
```javascript
const verifyEmail = async (token) => {
  try {
    const response = await authAPI.post('/auth/verify-email', {
      token: token
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

**URL Parameter Extraction:**
```javascript
// Extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const verificationToken = urlParams.get('token');

useEffect(() => {
  if (verificationToken) {
    verifyEmail(verificationToken)
      .then(() => {
        setVerificationStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(() => setVerificationStatus('error'));
  }
}, [verificationToken]);
```

---

### 4. **Token Refresh**
`POST /auth/refresh-token`

**Frontend Use Case:** Automatic token refresh

**Request:**
```javascript
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await authAPI.post('/auth/refresh-token', {
      refreshToken: refreshToken
    });
    
    // Update stored token
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    // Refresh token expired, redirect to login
    localStorage.clear();
    navigate('/login');
    throw error;
  }
};
```

**Automatic Refresh Setup:**
```javascript
// Add response interceptor for token refresh
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await refreshAccessToken();
        // Retry original request
        return authAPI.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        navigate('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 5. **Logout**
`POST /auth/logout`

**Frontend Use Case:** Logout button

**Request:**
```javascript
const logoutUser = async () => {
  try {
    await authAPI.post('/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login
    navigate('/login');
  } catch (error) {
    // Even if API call fails, clear local data
    localStorage.clear();
    navigate('/login');
  }
};
```

---

### 6. **Password Reset**
`POST /auth/forgot-password`

**Frontend Use Case:** Forgot password form

**Request:**
```javascript
const requestPasswordReset = async (email) => {
  try {
    const response = await authAPI.post('/auth/forgot-password', {
      email: email
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

**Reset Password:**
`POST /auth/reset-password`

```javascript
const resetPassword = async (token, newPassword) => {
  try {
    const response = await authAPI.post('/auth/reset-password', {
      token: token,
      newPassword: newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

---

## 👤 User Profile Endpoints

### 1. **Get Current User Profile**
`GET /users/profile`

**Frontend Use Case:** Profile page, user dashboard

**Request:**
```javascript
const getCurrentUser = async () => {
  try {
    const response = await authAPI.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": "user",
  "isMinor": false,
  "emailVerified": true,
  "mfaEnabled": false,
  "subscriptionStatus": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-12-17T10:30:00Z"
}
```

### 2. **Update User Profile**
`PUT /users/profile`

**Frontend Use Case:** Profile edit form

**Request:**
```javascript
const updateUserProfile = async (updates) => {
  try {
    const response = await authAPI.put('/users/profile', {
      firstName: updates.firstName,
      lastName: updates.lastName,
      phoneNumber: updates.phoneNumber
      // Email changes require separate verification
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

---

## 🛡️ Multi-Factor Authentication (MFA) Endpoints

### 1. **Setup TOTP MFA**
`POST /mfa/setup-totp`

**Frontend Use Case:** Security settings page

**Request:**
```javascript
const setupMFA = async () => {
  try {
    const response = await authAPI.post('/mfa/setup-totp');
    return {
      secret: response.data.secret,
      qrCode: response.data.qrCode,
      backupCodes: response.data.backupCodes
    };
  } catch (error) {
    throw error.response.data;
  }
};
```

**Frontend Implementation:**
```javascript
const MFASetupComponent = () => {
  const [mfaData, setMfaData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  
  const handleSetupMFA = async () => {
    try {
      const data = await setupMFA();
      setMfaData(data);
    } catch (error) {
      setError(error.message);
    }
  };
  
  const handleVerifySetup = async () => {
    try {
      await verifyMFASetup(verificationCode);
      setMfaEnabled(true);
    } catch (error) {
      setError('Invalid verification code');
    }
  };
  
  return (
    <div>
      {mfaData && (
        <>
          <img src={mfaData.qrCode} alt="QR Code" />
          <p>Secret: {mfaData.secret}</p>
          <input 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />
          <button onClick={handleVerifySetup}>Verify & Enable</button>
        </>
      )}
    </div>
  );
};
```

### 2. **Verify MFA During Login**
`POST /mfa/verify`

**Request:**
```javascript
const verifyMFA = async (code, tempToken) => {
  try {
    const response = await authAPI.post('/mfa/verify', {
      code: code
    }, {
      headers: {
        Authorization: `Bearer ${tempToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

---

## 🔄 Session Management Endpoints

### 1. **Get Active Sessions**
`GET /sessions`

**Frontend Use Case:** Security settings - device management

**Request:**
```javascript
const getActiveSessions = async () => {
  try {
    const response = await authAPI.get('/sessions');
    return response.data.sessions;
  } catch (error) {
    throw error.response.data;
  }
};
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "deviceInfo": "Chrome on Windows",
      "ipAddress": "192.168.1.1",
      "location": "New York, US",
      "lastActivity": "2024-12-17T10:30:00Z",
      "isCurrent": true
    }
  ]
}
```

### 2. **Revoke Session**
`DELETE /sessions/:sessionId`

**Request:**
```javascript
const revokeSession = async (sessionId) => {
  try {
    await authAPI.delete(`/sessions/${sessionId}`);
  } catch (error) {
    throw error.response.data;
  }
};
```

---

## 🎧 Support System Endpoints

### 1. **Create Support Request**
`POST /support/requests`

**Frontend Use Case:** Help/Contact form

**Request:**
```javascript
const createSupportRequest = async (requestData) => {
  try {
    const response = await authAPI.post('/support/requests', {
      type: requestData.type,           // 'TECHNICAL_SUPPORT' | 'BILLING' | 'GENERAL_INQUIRY'
      priority: requestData.priority,   // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      subject: requestData.subject,
      description: requestData.description,
      category: requestData.category
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

**Support Request Types:**
```javascript
const SUPPORT_TYPES = {
  TECHNICAL_SUPPORT: 'Technical Issue',
  BILLING: 'Billing Question', 
  GENERAL_INQUIRY: 'General Question',
  ACCOUNT_ACCESS: 'Account Access',
  FEATURE_REQUEST: 'Feature Request'
};

const PRIORITY_LEVELS = {
  LOW: 'Low Priority',
  MEDIUM: 'Medium Priority', 
  HIGH: 'High Priority',
  URGENT: 'Urgent'
};
```

### 2. **Get User's Support Requests**
`GET /support/requests/my-requests`

**Request:**
```javascript
const getMyRequests = async () => {
  try {
    const response = await authAPI.get('/support/requests/my-requests');
    return response.data.requests;
  } catch (error) {
    throw error.response.data;
  }
};
```

---

## ❤️ Health Check Endpoints

### 1. **Service Health**
`GET /health/ping`

**Frontend Use Case:** Service status monitoring

**Request:**
```javascript
const checkServiceHealth = async () => {
  try {
    const response = await authAPI.get('/health/ping');
    return response.data;
  } catch (error) {
    return { status: 'unhealthy' };
  }
};
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

---

## 🎨 Frontend Component Examples

### 1. **Age-Aware Registration Form**
```jsx
import React, { useState, useEffect } from 'react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    phoneNumber: '',
    guardianEmail: '',
    guardianPhone: ''
  });
  
  const [isMinor, setIsMinor] = useState(false);
  const [showGuardianFields, setShowGuardianFields] = useState(false);
  
  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      const minor = age < 18;
      setIsMinor(minor);
      setShowGuardianFields(minor);
    }
  }, [formData.dateOfBirth]);
  
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate guardian fields for minors
    if (isMinor && (!formData.guardianEmail || !formData.guardianPhone)) {
      setError('Guardian information is required for users under 18');
      return;
    }
    
    try {
      const result = await registerUser(formData);
      
      if (result.isMinor) {
        showSuccessMessage('Registration successful! Guardian notification sent.');
      } else {
        showSuccessMessage('Registration successful! Please verify your email.');
      }
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Basic fields */}
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        required
      />
      
      <input
        type="date"
        placeholder="Date of Birth"
        value={formData.dateOfBirth}
        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
        required
      />
      
      {/* Guardian fields - shown only for minors */}
      {showGuardianFields && (
        <div className="guardian-section">
          <h3>Guardian Information Required</h3>
          <p>Users under 18 require guardian consent.</p>
          
          <input
            type="email"
            placeholder="Guardian Email"
            value={formData.guardianEmail}
            onChange={(e) => setFormData({...formData, guardianEmail: e.target.value})}
            required={isMinor}
          />
          
          <input
            type="tel"
            placeholder="Guardian Phone Number"
            value={formData.guardianPhone}
            onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
            required={isMinor}
          />
        </div>
      )}
      
      <button type="submit">Register</button>
    </form>
  );
};
```

### 2. **Authentication Context Provider**
```jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Auto-login on app start
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && refreshToken) {
      // Verify token validity
      getCurrentUser()
        .then(user => {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, accessToken: token, refreshToken }
          });
        })
        .catch(() => {
          localStorage.clear();
        });
    }
  }, []);
  
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const result = await loginUser(credentials);
      
      if (result.requiresMfa) {
        // Handle MFA flow
        return { requiresMfa: true, tempToken: result.tempToken };
      }
      
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: result
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    localStorage.clear();
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      register: registerUser,
      updateProfile: updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 3. **Protected Route Component**
```jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Usage
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="super_admin">
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
```

---

## 🚨 Error Handling Best Practices

### 1. **Standard Error Response Format**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "email",
    "constraint": "isEmail"
  }
}
```

### 2. **Frontend Error Handler**
```javascript
const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    const { statusCode, message, details } = error.response.data;
    
    switch (statusCode) {
      case 400:
        return `Validation Error: ${message}`;
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission for this action';
      case 404:
        return 'Resource not found';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return 'An unexpected error occurred';
  }
};
```

### 3. **Field-Level Validation**
```javascript
const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid';
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
    errors.password = 'Password must contain uppercase, lowercase, number, and special character';
  }
  
  // Age-based validation
  if (formData.dateOfBirth) {
    const age = calculateAge(formData.dateOfBirth);
    if (age < 18 && (!formData.guardianEmail || !formData.guardianPhone)) {
      errors.guardian = 'Guardian information is required for users under 18';
    }
  }
  
  return errors;
};
```

---

## 📱 Mobile-Specific Considerations

### 1. **Phone Number Input**
```jsx
// Use international phone input component
import PhoneInput from 'react-phone-number-input';

const PhoneNumberField = ({ value, onChange }) => {
  return (
    <PhoneInput
      placeholder="Enter phone number"
      value={value}
      onChange={onChange}
      defaultCountry="US"
      international
      countryCallingCodeEditable={false}
    />
  );
};
```

### 2. **Biometric Authentication Support**
```javascript
// Check for biometric support
const checkBiometricSupport = () => {
  if ('credentials' in navigator) {
    return navigator.credentials.create !== undefined;
  }
  return false;
};

// Setup biometric login
const setupBiometricLogin = async () => {
  if (checkBiometricSupport()) {
    try {
      // WebAuthn implementation
      const credential = await navigator.credentials.create({
        publicKey: {
          // Configuration for biometric setup
        }
      });
      
      // Send credential to server
      await authAPI.post('/auth/setup-biometric', {
        credentialId: credential.id,
        publicKey: credential.response.publicKey
      });
    } catch (error) {
      console.error('Biometric setup failed:', error);
    }
  }
};
```

---

## 🎯 Performance Optimization

### 1. **Token Management**
```javascript
// Efficient token storage and retrieval
class TokenManager {
  static setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Set expiration timer
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresIn = (payload.exp * 1000) - Date.now() - 60000; // Refresh 1 min before expiry
    
    setTimeout(() => {
      this.refreshToken();
    }, expiresIn);
  }
  
  static async refreshToken() {
    try {
      const newToken = await refreshAccessToken();
      this.setTokens(newToken, localStorage.getItem('refreshToken'));
    } catch (error) {
      // Handle refresh failure
      this.clearTokens();
      window.location.href = '/login';
    }
  }
  
  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
```

### 2. **Request Caching**
```javascript
// Cache user profile data
const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const cachedProfile = sessionStorage.getItem('userProfile');
    
    if (cachedProfile) {
      setProfile(JSON.parse(cachedProfile));
      setLoading(false);
    } else {
      getCurrentUser()
        .then(userData => {
          setProfile(userData);
          sessionStorage.setItem('userProfile', JSON.stringify(userData));
        })
        .finally(() => setLoading(false));
    }
  }, []);
  
  return { profile, loading };
};
```

---

## 🔧 Development Tools

### 1. **API Testing Helper**
```javascript
// Development helper for testing API endpoints
const ApiTester = {
  async testRegistration() {
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      dateOfBirth: '1990-01-01'
    };
    
    try {
      const result = await registerUser(testUser);
      console.log('Registration test passed:', result);
    } catch (error) {
      console.error('Registration test failed:', error);
    }
  },
  
  async testMinorRegistration() {
    const testMinor = {
      firstName: 'Test',
      lastName: 'Minor',
      email: `minor-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      dateOfBirth: '2010-01-01',
      guardianEmail: 'guardian@example.com',
      guardianPhone: '+1555123456'
    };
    
    try {
      const result = await registerUser(testMinor);
      console.log('Minor registration test passed:', result);
    } catch (error) {
      console.error('Minor registration test failed:', error);
    }
  }
};

// Usage in development
if (process.env.NODE_ENV === 'development') {
  window.ApiTester = ApiTester;
}
```

### 2. **Debug Authentication State**
```javascript
// Debug helper for authentication state
const AuthDebugger = () => {
  const auth = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: 10, 
      borderRadius: 5,
      fontSize: 12,
      zIndex: 9999 
    }}>
      <div>Auth Status: {auth.isAuthenticated ? '✅' : '❌'}</div>
      <div>User: {auth.user?.firstName || 'None'}</div>
      <div>Role: {auth.user?.role || 'None'}</div>
      <div>Minor: {auth.user?.isMinor ? 'Yes' : 'No'}</div>
      <div>Token: {auth.accessToken ? '✅' : '❌'}</div>
    </div>
  );
};
```

---

## 📚 Additional Resources

### 1. **Useful Libraries**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react-hook-form": "^7.45.0",
    "react-query": "^4.0.0",
    "react-phone-number-input": "^3.3.0",
    "date-fns": "^2.30.0",
    "joi": "^17.9.0"
  }
}
```

### 2. **Environment Variables Template**
```bash
# .env.local
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_AUTH_DOCS_URL=http://localhost:3001/api/docs
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_DEBUG=true
```

### 3. **TypeScript Interfaces**
```typescript
// types/auth.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isMinor: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  subscriptionStatus?: string;
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'user' | 'therapist' | 'support_agent' | 'organization_admin' | 'super_admin';

export interface LoginResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isMinor: boolean;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  requiresMfa?: boolean;
  tempToken?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, any>;
}
```

---

## 🎉 Summary for Frontend Team

### ✅ **What You Need to Know:**

1. **Age-Based Registration**: Always check for minor users and show guardian fields
2. **Authentication Flow**: Handle both standard login and MFA verification
3. **Token Management**: Implement automatic token refresh
4. **Error Handling**: Use consistent error handling patterns
5. **User Types**: Support all 6 user types with appropriate UI/UX
6. **Security**: Never store sensitive data in local storage (except tokens)

### 📋 **Quick Implementation Checklist:**

- [ ] Set up axios interceptors for auth headers
- [ ] Implement token refresh logic
- [ ] Create age-aware registration form
- [ ] Add guardian fields for minor users
- [ ] Handle MFA verification flow
- [ ] Implement protected routes
- [ ] Add proper error handling
- [ ] Create user profile management
- [ ] Add session management UI
- [ ] Implement support request system

### 🔗 **Additional Resources:**
- **Interactive API Docs**: http://localhost:3001/api/docs
- **User Testing Guide**: [USER_MANAGEMENT.md](./USER_MANAGEMENT.md)
- **Service Health**: http://localhost:3001/health/ping

---

*Frontend API Guide - Last Updated: December 17, 2024*
*All endpoints tested and validated ✅* 
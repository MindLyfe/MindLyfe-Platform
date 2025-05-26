# Mindlyfe Application Architecture

## Overview
Mindlyfe is a comprehensive mental health and wellness platform that provides secure, personalized mental health services. The application is split into two main components:
- Backend API (api.mindlyfe.org)
- Frontend Application (app.mindlyfe.org)

## Brand Colors
- Primary Color: 
  - CMYK: 71%, 16%, 0%, 0%
  - RGB: 33, 169, 225
  - HEX: #21A9E1
- Secondary Color:
  - CMYK: 50%, 6%, 98%, 0%
  - RGB: 142, 188, 64
  - HEX: #8EBC40

## Backend Architecture

### Technology Stack
- NestJS (Node.js framework)
- PostgreSQL (Database)
- Redis (Session management)
- JWT (Authentication)
- Swagger/OpenAPI (API Documentation)

### Core Services

#### 1. Authentication Service
- **Endpoints:**
  - POST `/auth/register` - User registration
  - POST `/auth/login` - User login
  - POST `/auth/refresh` - Token refresh
  - POST `/auth/logout` - User logout
  - POST `/auth/forgot-password` - Password recovery
  - POST `/auth/reset-password` - Password reset

#### 2. Session Management
- **Endpoints:**
  - GET `/sessions` - List active sessions
  - DELETE `/sessions/{id}` - Terminate specific session
  - DELETE `/sessions` - Terminate all sessions

#### 3. Multi-Factor Authentication (MFA)
- **Endpoints:**
  - POST `/mfa/enable` - Enable MFA
  - POST `/mfa/verify` - Verify MFA code
  - POST `/mfa/disable` - Disable MFA
  - GET `/mfa/status` - Get MFA status

### Data Models

#### User Model
```typescript
interface User {
  id: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Session Model
```typescript
interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: Date;
  expiresAt: Date;
}
```

## Frontend Architecture

### Technology Stack
- React (Frontend framework)
- TypeScript
- Tailwind CSS (Styling)
- React Query (Data fetching)
- React Router (Routing)
- Zustand (State management)

### Core Features

#### 1. Authentication & Authorization
- **Pages:**
  - Login
  - Registration
  - Password Recovery
  - MFA Setup & Verification
  - Session Management

#### 2. User Dashboard
- **Components:**
  - Profile Overview
  - Active Sessions List
  - Security Settings
  - MFA Management

#### 3. Security Features
- Session timeout handling
- Automatic token refresh
- Secure password requirements
- MFA enforcement
- Device management

### Frontend Routes

```typescript
const routes = {
  // Public Routes
  public: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
  
  // Protected Routes
  protected: {
    dashboard: '/dashboard',
    profile: '/profile',
    security: '/security',
    sessions: '/sessions',
    settings: '/settings',
  },
  
  // Auth Routes
  auth: {
    mfa: {
      setup: '/mfa/setup',
      verify: '/mfa/verify',
    },
  },
};
```

### State Management

#### Auth Store
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
}
```

#### Session Store
```typescript
interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  
  // Actions
  fetchSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
}
```

### UI Components

#### 1. Common Components
- Button
- Input
- Card
- Modal
- Alert
- Loading Spinner
- Form Components
- Navigation Bar
- Sidebar

#### 2. Feature-Specific Components
- Session List
- MFA Setup Wizard
- Security Settings Panel
- Profile Editor
- Password Change Form

### API Integration

#### API Client
```typescript
interface ApiClient {
  // Auth
  auth: {
    login: (data: LoginDTO) => Promise<AuthResponse>;
    register: (data: RegisterDTO) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<AuthResponse>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (data: ResetPasswordDTO) => Promise<void>;
  };
  
  // MFA
  mfa: {
    enable: () => Promise<MfaSetupResponse>;
    verify: (code: string) => Promise<void>;
    disable: (code: string) => Promise<void>;
    status: () => Promise<MfaStatus>;
  };
  
  // Sessions
  sessions: {
    list: () => Promise<Session[]>;
    terminate: (sessionId: string) => Promise<void>;
    terminateAll: () => Promise<void>;
  };
  
  // User
  user: {
    profile: () => Promise<User>;
    updateProfile: (data: UpdateProfileDTO) => Promise<User>;
    changePassword: (data: ChangePasswordDTO) => Promise<void>;
  };
}
```

### Security Considerations

1. **Authentication**
   - JWT-based authentication
   - Secure password hashing
   - MFA support
   - Session management
   - Token refresh mechanism

2. **Data Protection**
   - HTTPS enforcement
   - CSRF protection
   - XSS prevention
   - Rate limiting
   - Input validation

3. **Session Security**
   - Session timeout
   - Device tracking
   - IP logging
   - Concurrent session management

### Error Handling

1. **API Errors**
   - Standardized error responses
   - HTTP status codes
   - Error messages
   - Validation errors

2. **Frontend Error Handling**
   - Global error boundary
   - Form validation
   - API error mapping
   - User-friendly error messages

### Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Caching strategies
   - Bundle optimization
   - Image optimization

2. **API**
   - Response caching
   - Rate limiting
   - Query optimization
   - Connection pooling

## Development Guidelines

### Code Organization
```
src/
├── components/
│   ├── common/
│   ├── features/
│   └── layouts/
├── hooks/
├── pages/
├── services/
├── stores/
├── types/
├── utils/
└── api/
```

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: kebab-case

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component documentation
- Test coverage requirements

## Deployment

### Backend (api.mindlyfe.org)
- Docker containerization
- CI/CD pipeline
- Environment configuration
- Database migrations
- Health monitoring

### Frontend (app.mindlyfe.org)
- Static file hosting
- CDN integration
- Build optimization
- Environment configuration
- Analytics integration

## Monitoring and Analytics

### Backend Monitoring
- API performance metrics
- Error tracking
- User activity logs
- Security monitoring
- Database performance

### Frontend Analytics
- User engagement metrics
- Performance monitoring
- Error tracking
- User flow analysis
- Feature usage statistics 
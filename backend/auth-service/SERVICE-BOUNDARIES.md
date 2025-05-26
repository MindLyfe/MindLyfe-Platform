# MindLyf Service Boundaries & Communication

## Auth Service Responsibilities ✅

### Core Functions
- **Authentication & Authorization**
  - User registration, login, JWT tokens
  - Password reset, email verification
  - MFA (Multi-factor authentication)
  - Session management

- **User Management**
  - User profiles, roles, status
  - Individual users, organization members, minors
  - User permissions and access control

- **Organization Management**
  - Organization creation and configuration
  - Organization admin management
  - User addition/removal from organizations
  - Organization subscription management

- **Subscription & Payment Management**
  - All payment plans (Monthly, Organization, Credits)
  - Payment processing and confirmation
  - Subscription status and validation
  - Credit tracking and usage

### API Endpoints
- `POST /api/auth/*` - Authentication endpoints
- `GET/POST /api/users/*` - User management
- `GET/POST /api/organizations/*` - Organization management
- `GET/POST /api/subscriptions/*` - Subscription management

### Service-to-Service APIs
- `GET /api/subscriptions/validate-booking/:userId` - For teletherapy service
- `POST /api/subscriptions/consume-session/:userId` - For teletherapy service

---

## Teletherapy Service Responsibilities

### Core Functions
- **Session Management**
  - Session booking and scheduling
  - Session start/end/cancel operations
  - Therapist availability management
  - Video conferencing integration

- **Therapist Management**
  - Therapist profiles and specializations
  - Schedule management
  - Session notes and documentation

- **Communication with Auth Service**
  - Validate user can book sessions
  - Consume sessions from user subscriptions
  - Verify user authentication status

### Expected API Endpoints
- `POST /api/sessions/book` - Book therapy sessions
- `GET /api/sessions/my` - Get user sessions
- `POST /api/sessions/:id/start` - Start session
- `POST /api/sessions/:id/complete` - Complete session
- `GET /api/therapists/available` - Get available therapists

---

## Service Communication Pattern

### Auth → Teletherapy
- User authentication via JWT tokens
- Subscription validation via service tokens

### Teletherapy → Auth
```javascript
// 1. Validate user can book session
const validation = await authService.validateBooking(userId);
if (!validation.canBook) {
  throw new Error(validation.reason);
}

// 2. Book session in teletherapy system
const session = await createSession(sessionData);

// 3. Consume session from subscription
const result = await authService.consumeSession(userId);
await updateSession(session.id, result);
```

### Security
- JWT tokens for user authentication
- Service tokens for inter-service communication
- Role-based access control (user, therapist, organization_admin)

---

## Current Implementation Status

✅ **Auth Service**: Fully implemented with correct boundaries
✅ **User Management**: Complete with organizations
✅ **Subscription System**: All payment plans working
✅ **Payment Processing**: Multi-method support
✅ **Service APIs**: Ready for teletherapy integration

🔄 **Next Steps**: 
1. Implement session management in teletherapy service
2. Set up service-to-service communication
3. Test end-to-end booking flow
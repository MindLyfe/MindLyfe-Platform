# MindLyfe Authentication Service

## Overview

The MindLyfe Authentication Service is a comprehensive, production-ready microservice built with NestJS that handles all authentication and authorization needs for the MindLyfe mental health platform.

The Auth Service is the central authentication and authorization provider for the MindLyfe platform, handling user management, authentication, and access control across all services.

## Features

- User registration and account management
- Secure authentication with JWT
- Role-based access control
- Two-factor authentication
- Service-to-service authentication
- Password recovery and reset
- Email verification
- User roles and permissions
- User profile data management

## Architecture

The Auth Service is built with:
- NestJS framework for TypeScript-based backend
- PostgreSQL for user data storage
- Redis for token management and rate limiting
- JWT for secure token-based authentication

## Service Dependencies

The Auth Service is a foundational service that all other services depend on:

1. **Teletherapy Service**
   - Uses auth service for user validation
   - Gets therapist role information

2. **Chat Service**
   - Validates users and roles for message permissions
   - Uses service tokens for internal communication

3. **Community Service**
   - Handles user authentication and role verification
   - Manages user profiles linked to auth identities

## Business Rules

### User Management
- Users can register with email or social login
- Email verification is required for new accounts
- Passwords must meet complexity requirements
- User roles include: user, therapist, moderator, admin

### Authentication
- Access tokens expire after 15 minutes
- Refresh tokens allow generating new access tokens
- Two-factor authentication is supported but optional
- Service-to-service authentication uses dedicated service tokens

### Role Management
- Only admins can assign admin and moderator roles
- Therapist role requires verification process
- Role-based access controls enforced across all services

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh-token` - Get a new access token
- `POST /auth/logout` - Invalidate tokens
- `POST /auth/validate-token` - Validate token

### User Management
- `GET /auth/users/:id` - Get user by ID
- `PATCH /auth/users/:id` - Update user
- `DELETE /auth/users/:id` - Delete user
- `GET /auth/users` - Get users (admin only)

### Account Management
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email address

### Service Authentication
- `POST /auth/validate-service-token` - Validate service token
- `POST /auth/service-token` - Get service token (admin only)
- `DELETE /auth/service-token/:id` - Revoke service token

## Environment Configuration

The Auth Service requires the following environment variables:

```
# Server config
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_auth
DB_SYNC=false
DB_LOGGING=false

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_SERVICE_EXPIRES_IN=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@mindlyfe.com
EMAIL_PASSWORD=your-email-password
```

## Integration with Notification Service

The Auth Service integrates with the MindLyfe Notification Service to:

- Send welcome emails to new users upon registration
- Send password reset emails when requested
- Send email verification links
- Notify users of suspicious login attempts

### Configuration

To enable notifications, set the `NOTIFICATION_SERVICE_URL` environment variable:

```
NOTIFICATION_SERVICE_URL=http://notification-service:3005
```

If not set, the service will automatically attempt to connect to `http://notification-service:3005`.

## Setup and Development

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- Redis

### Installation
```bash
# Install dependencies
npm install

# Start the service
npm run start:dev
```

### Testing
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Deployment

The Auth Service is designed to be deployed as a Docker container:

```bash
# Build the Docker image
docker build -t mindlyfe/auth-service .

# Run the container
docker run -p 3001:3001 mindlyfe/auth-service
``` 
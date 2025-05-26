# Session Management System

## Overview

This document outlines the implementation of the persistent session management system for the MindLyf authentication service. The system replaces the previous in-memory session store with a database-backed solution, providing improved security, reliability, and compliance with regulations like PDPO and GDPR.

## Features

- Persistent session storage in the database
- Automatic cleanup of expired sessions
- Automatic cleanup of inactive sessions
- Session revocation capabilities
- Detailed session metadata tracking (IP address, user agent, device info)
- Configurable session expiration and cleanup intervals

## Database Schema

The `UserSession` entity includes the following fields:

- `id`: Unique identifier for the session
- `userId`: Reference to the user who owns the session
- `refreshToken`: The refresh token used to generate new access tokens
- `ipAddress`: The IP address from which the session was created
- `userAgent`: The user agent string from the client
- `deviceInfo`: Additional device information
- `lastUsedAt`: Timestamp of when the session was last used
- `isRevoked`: Flag indicating if the session has been revoked
- `revokedAt`: Timestamp of when the session was revoked
- `revokedReason`: Reason for revocation
- `createdAt`: Timestamp of when the session was created
- `updatedAt`: Timestamp of when the session was last updated
- `expiresAt`: Timestamp of when the session expires

## Configuration

Session management can be configured through environment variables:

```
# Session Configuration
SESSION_CLEANUP_INTERVAL=0 0 * * *  # Cron expression for cleanup job (default: daily at midnight)
SESSION_MAX_INACTIVE_DAYS=30       # Days of inactivity before session cleanup (default: 30)
```

## Database Migrations

A migration script is provided to create the `user_session` table. To run the migration:

```bash
npm run migration:run
```

To revert the migration:

```bash
npm run migration:revert
```

## Session Cleanup

The system includes an automatic session cleanup service that runs on a configurable schedule. It performs two types of cleanup:

1. **Expired Sessions**: Removes sessions that have passed their expiration date
2. **Inactive Sessions**: Removes sessions that haven't been used for a configurable period (default: 30 days)

## Security Considerations

- All sessions are tied to specific IP addresses and user agents by default
- Sessions can be revoked individually or all at once for a user
- Password changes automatically revoke all sessions for security
- Refresh tokens are stored securely in the database

## API Usage

### Creating a Session

Sessions are automatically created during login:

```typescript
// In AuthService.login()
const session = await this.sessionService.createSession({
  userId: user.id,
  refreshToken,
  ipAddress: metadata?.ipAddress,
  userAgent: metadata?.userAgent,
  deviceInfo: metadata?.deviceInfo,
});
```

### Refreshing a Token

```typescript
// In AuthService.refreshToken()
const newSession = await this.sessionService.createSession({
  userId: session.userId,
  refreshToken: newRefreshToken,
  ipAddress: metadata?.ipAddress,
  userAgent: metadata?.userAgent,
  deviceInfo: metadata?.deviceInfo,
});
```

### Revoking Sessions

```typescript
// Revoke a specific session
await this.sessionService.revokeSession(sessionId, 'User-initiated logout');

// Revoke all sessions for a user
await this.sessionService.revokeAllUserSessions(userId, 'Password changed');
```

## Compliance

This implementation helps with compliance with various regulations:

- **GDPR**: Provides mechanisms to track and revoke user sessions
- **PDPO**: Ensures proper handling of personal data in session management
- **Security Best Practices**: Follows industry standards for session management
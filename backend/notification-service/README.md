# MindLyfe Notification Service

The Notification Service is responsible for sending notifications to users through multiple channels based on their preferences and real-time context.

## Architecture

The notification service follows a modular design with the following components:

### Core Components

1. **Notification Service**: Central orchestration service for handling notification creation, routing, and status tracking.
2. **Channel Adapters**: Pluggable components for different communication channels:
   - Email Adapter (AWS SES)
   - SMS Adapter (Twilio)
   - Push Notification Adapter (Firebase Cloud Messaging)
   - In-App Notification Adapter
3. **Notification Queue**: Asynchronous processing with priority-based handling and retry mechanisms.
4. **User Preference Service**: Manages user notification settings and preferences.
5. **Template Engine**: Handles personalized content generation with Handlebars templates.

### Smart Notification Delivery

The service uses a context-aware approach to notification delivery:

1. **User Presence Detection**: When a user is actively using the app, the system prioritizes in-app notifications over email/SMS for non-critical communications.

2. **Do Not Disturb Mode**: Users can set quiet hours during which notifications are queued and delivered after DND period ends (except for critical notifications).

3. **Frequency Limits**: Prevents notification fatigue by enforcing daily and weekly caps on notification volume.

4. **Time Window Preferences**: Users can specify preferred delivery times for different channels (e.g., emails only during work hours).

5. **Notification Type Filtering**: Different handling for:
   - Transactional notifications (account, therapy sessions)
   - Marketing notifications (only sent with explicit consent)
   - Gamification notifications (streaks, achievements, etc.)

### Interfaces

The notification service uses a consistent interface for all channel adapters:

```typescript
interface NotificationChannel {
  // Send a notification through this channel
  send(notification: NotificationEntity): Promise<NotificationResult>;
  
  // Validate a template for this channel
  validateTemplate(templateId: string): Promise<{
    valid: boolean;
    errors?: string[];
  }>;
  
  // Get delivery status from the channel provider
  getDeliveryStatus(notificationId: string, externalId: string): Promise<DeliveryStatus>;
  
  // Get channel-specific capabilities
  getCapabilities(): ChannelCapabilities;
}
```

## Running the Service

### Prerequisites

- Node.js 16+
- PostgreSQL
- AWS account with SES access (for email notifications)
- Twilio account (for SMS notifications)
- Firebase project (for push notifications)

### Environment Configuration

Create a `.env` file with the following variables:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=mindlyfe_notification

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=1h

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_SOURCE_EMAIL=noreply@mindlyfe.com

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# System
SYSTEM_API_TOKEN=system-token-for-service-communication
```

### Installation

```bash
npm install
```

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Send Notification

```
POST /notification
```

```json
{
  "userId": "user-id",
  "type": "therapy",
  "title": "Your session is starting soon",
  "message": "Your therapy session with Dr. Smith starts in 15 minutes",
  "templateId": "template-id",
  "recipientEmail": "user@example.com",
  "metadata": {
    "sessionId": "session-id",
    "therapistName": "Dr. Smith",
    "category": "streak"
  },
  "channels": ["email", "push", "in_app"],
  "scheduledAt": "2023-09-15T15:00:00Z"
}
```

### Get User Notifications

```
GET /notification/my?page=1&limit=10&type=therapy&read=false
```

### Mark Notification as Read

```
PATCH /notification/:id/read
```

### Mark All Notifications as Read

```
PATCH /notification/mark-all-read
```

### Update User Status (for Context-Aware Delivery)

```
PATCH /notification/user-status
```

```json
{
  "isOnline": true
}
```

### Delete Notification

```
DELETE /notification/:id
```

## User Preferences

Users can set detailed notification preferences:

```json
{
  "channels": {
    "email": {
      "enabled": true,
      "timeWindows": [
        { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00" },
        { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00" },
        { "dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00" },
        { "dayOfWeek": 4, "startTime": "09:00", "endTime": "17:00" },
        { "dayOfWeek": 5, "startTime": "09:00", "endTime": "17:00" }
      ],
      "contentTypes": ["therapy", "account"],
      "consentGiven": true
    },
    "sms": {
      "enabled": true,
      "contentTypes": ["therapy"],
      "consentGiven": true
    },
    "push": { "enabled": true },
    "in_app": { "enabled": true }
  },
  "doNotDisturb": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "07:00",
    "timezone": "America/New_York"
  },
  "frequency": {
    "daily": 10,
    "weekly": 50
  },
  "gamification": {
    "streaks": true,
    "achievements": true,
    "challenges": false,
    "milestones": true
  },
  "receiveTransactional": true,
  "receiveMarketing": false
}
```

## Architecture Decisions

1. **Context-Aware Delivery**: The system intelligently selects notification channels based on user's current activity status, preferences, and notification priority.

2. **Channel Adapter Pattern**: The service uses the adapter pattern to support multiple notification channels with a consistent interface, making it easy to add new channels in the future.

3. **Asynchronous Processing**: All notifications are processed asynchronously via a queue to ensure reliability and prevent blocking the main application flow.

4. **Priority-Based Processing**: Notifications are processed based on their priority, with critical notifications (therapy sessions, account-related) taking precedence.

5. **Retry Mechanism**: Failed notifications are automatically retried using an exponential backoff strategy.

6. **Consent Management**: Explicit tracking of user consent for different notification types, ensuring regulatory compliance.

7. **Time-Aware Delivery**: Respects user-defined time windows and do-not-disturb periods for non-critical notifications.

## Future Enhancements

1. **Webhook Adapter**: Implementation for integration with external systems.
2. **WhatsApp Adapter**: Integration with WhatsApp Business API.
3. **Analytics Dashboard**: Tracking delivery rates, engagement, and conversion metrics.
4. **Advanced User Preferences**: More granular control over notification timing and frequency.
5. **A/B Testing**: Testing different message formats and delivery times for optimal engagement.
6. **Behavioral Analysis**: Using AI to determine optimal notification timing based on user behavior patterns. 
# Preference Center Technical Specification

This document outlines the technical specifications for the MindLyfe Preference Center, enabling users to manage their notification settings across various channels and categories.

## 1. System Overview

The Preference Center is a critical component of the MindLyfe platform, empowering users to customize how, when, and for what reasons they receive notifications. It aims to enhance user satisfaction by providing control and reducing notification fatigue, thereby improving engagement with relevant communications.

### 1.1 Goals

- Provide a centralized and intuitive interface for managing all notification preferences.
- Allow granular control over notification channels (SMS, Email, Push, WhatsApp, In-App).
- Enable users to subscribe/unsubscribe from specific notification categories.
- Offer frequency controls and Do Not Disturb (DND) settings.
- Ensure secure management of contact information and preferences.
- Comply with data privacy regulations (PDPO, GDPR).

### 1.2 Architecture Integration

```
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│   User Profile Service  ├─────►│   Preference Service    ├─────► Database (Preferences)
│                         │      │       (This System)     │
└───────────┬─────────────┘      └─────────┬────┬──────────┘
            │                              │    │
            │                              │    │
┌───────────▼─────────────┐      ┌─────────▼────▼──────────┐
│                         │      │                         │
│   Frontend (React App)  │◄─────┤   Notification Service  │
│   (Preference Center UI)│      │                         │
└─────────────────────────┘      └─────────────────────────┘
```

## 2. Core Components

### 2.1 User Interface (UI)

- **Framework**: React with TypeScript
- **State Management**: Zustand or Redux Toolkit
- **Styling**: TailwindCSS or Styled Components
- **Key Sections**:
    - **My Contact Information**: Manage and verify email addresses and phone numbers.
    - **Channel Preferences**: Toggle on/off for SMS, Email, Push, WhatsApp, In-App.
    - **Notification Categories**: Fine-grained control for types like Appointment Reminders, Wellness Tips, Community Updates, etc.
    - **Frequency & Timing**: Options for digests (daily/weekly), immediate alerts, and DND schedules.
    - **Global Settings**: Master opt-out/opt-in.

### 2.2 Preference Service (Backend API)

- **Language/Framework**: Node.js with Express.js/NestJS (or align with existing backend stack)
- **Authentication**: JWT-based, integrated with MindLyfe's Auth Service.
- **API Endpoints**: RESTful API for CRUD operations on user preferences.

### 2.3 Data Model

(Refer to `MultiChannelNotificationSystemSpec.md` Section 3.1 for `UserNotificationPreferences` and `NotificationCategory` interfaces. Additional specific models below.)

```typescript
// User contact methods (managed within Preference Center but potentially stored in User Profile Service)
interface UserContactMethod {
  id: string;
  userId: string;
  type: 'email' | 'phone';
  value: string; // Email address or phone number
  isPrimary: boolean;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User preferences for a specific notification category
interface UserCategoryPreference {
  userId: string;
  categoryId: string; // Foreign key to NotificationCategory
  channels: {
    sms: { enabled: boolean };
    email: { enabled: boolean };
    whatsapp: { enabled: boolean };
    push: { enabled: boolean };
    inApp: { enabled: boolean };
  };
  updatedAt: Date;
}
```

## 3. Functional Requirements

### 3.1 Contact Information Management

- Users can add multiple email addresses and phone numbers.
- Users can set a primary email and phone number.
- Verification process (OTP via email/SMS) for new contact methods.
- Users can remove contact methods (unless it's the primary for account recovery, which needs special handling).

### 3.2 Channel Preferences

- Global toggle for each channel (SMS, Email, Push, WhatsApp, In-App).
- Disabling a channel mutes all notifications via that channel, overriding category settings.
- Push notification preferences will link to device-specific settings where applicable.

### 3.3 Notification Category Preferences

- List all available notification categories (e.g., `appointment`, `wellness`, `billing`).
- For each category, users can enable/disable specific channels.
- Some critical notifications (e.g., security alerts, ToS updates) may be non-configurable or have limited opt-out.

### 3.4 Frequency and Timing Controls

- **Digests**: Option to receive summaries (e.g., daily, weekly) for certain categories instead of immediate alerts.
- **Do Not Disturb (DND)**:
    - Users can set a DND period (start time, end time, timezone).
    - Notifications (except critical ones) will be queued and delivered after the DND period.

### 3.5 Global Opt-Out

- A master switch to opt-out of all non-critical communications.
- Clear indication of what constitutes a critical notification.

## 4. Technical Design

### 4.1 Frontend (React Components)

- `PreferenceLayoutComponent`: Main container for preference sections.
- `ContactInfoManagementComponent`: Handles adding, verifying, and removing contact details.
- `ChannelToggleComponent`: Reusable component for enabling/disabling a channel.
- `CategoryPreferencesListComponent`: Displays categories and their channel toggles.
- `DNDSettingsComponent`: UI for setting Do Not Disturb times.
- `FrequencyControlComponent`: UI for selecting digest options.
- **API Interaction**: Use `axios` or `fetch` for API calls, with robust error handling and loading states.

### 4.2 Backend (Preference Service API)

#### 4.2.1 API Endpoints

- `GET /users/me/preferences`: Retrieve current user's preferences.
- `PUT /users/me/preferences`: Update overall preferences (e.g., DND, global opt-out).
- `GET /users/me/preferences/categories`: Retrieve category-specific preferences.
- `PUT /users/me/preferences/categories/{categoryId}`: Update preferences for a specific category.
- `PUT /users/me/preferences/channels/{channelType}`: Update global preference for a channel.

- `POST /users/me/contact-methods`: Add a new contact method.
- `POST /users/me/contact-methods/{contactMethodId}/send-verification`: Resend verification code.
- `POST /users/me/contact-methods/{contactMethodId}/verify`: Verify a contact method with OTP.
- `PUT /users/me/contact-methods/{contactMethodId}`: Update a contact method (e.g., set as primary).
- `DELETE /users/me/contact-methods/{contactMethodId}`: Remove a contact method.

- `GET /notification-categories`: List all available notification categories.

#### 4.2.2 Service Logic

- **Validation**: Ensure input data is valid (e.g., correct email format, valid phone numbers, existing category IDs).
- **Authorization**: Confirm the authenticated user has permission to modify their own preferences.
- **Atomicity**: Ensure preference updates are atomic, especially when modifying multiple settings.
- **Integration with Notification Service**: The Notification Service will query the Preference Service before sending any notification to respect user settings.

### 4.3 Database Schema

- **`UserNotificationPreferences` Table**:
    - `userId` (PK, FK to Users table)
    - `globalSmsEnabled` (Boolean, default true)
    - `globalEmailEnabled` (Boolean, default true)
    - `globalPushEnabled` (Boolean, default true)
    - `globalWhatsAppEnabled` (Boolean, default true)
    - `globalInAppEnabled` (Boolean, default true)
    - `dndEnabled` (Boolean, default false)
    - `dndStartTime` (Time, nullable)
    - `dndEndTime` (Time, nullable)
    - `dndTimezone` (String, nullable)
    - `updatedAt` (Timestamp)

- **`UserCategoryPreferences` Table**:
    - `userId` (PK, FK to Users table)
    - `categoryId` (PK, FK to NotificationCategories table)
    - `smsEnabled` (Boolean, default true)
    - `emailEnabled` (Boolean, default true)
    - `pushEnabled` (Boolean, default true)
    - `whatsAppEnabled` (Boolean, default true)
    - `inAppEnabled` (Boolean, default true)
    - `updatedAt` (Timestamp)

- **`NotificationCategories` Table** (as defined in MultiChannelNotificationSystemSpec.md, managed centrally)
    - `id` (PK)
    - `name` (String)
    - `description` (String)
    - `defaultChannels` (JSON/Array of strings)
    - `importance` ('critical' | 'high' | 'medium' | 'low')
    - `allowOptOut` (Boolean)

- **`UserContactMethods` Table** (potentially part of User Profile Service)
    - `id` (PK)
    - `userId` (FK to Users table)
    - `type` ('email' | 'phone')
    - `value` (String)
    - `isPrimary` (Boolean)
    - `isVerified` (Boolean)
    - `verificationCode` (String, nullable, hashed)
    - `verificationCodeExpiresAt` (Timestamp, nullable)
    - `createdAt` (Timestamp)
    - `updatedAt` (Timestamp)

## 5. Security and Privacy

- **Data Encryption**: All sensitive data (contact info, preferences) encrypted at rest and in transit (HTTPS).
- **Consent Management**: Explicit consent for each notification channel and category where applicable. Records of consent changes maintained.
- **Access Control**: Only authenticated users can access and modify their own preferences.
- **Verification Codes**: OTPs should be short-lived, rate-limited, and securely generated.
- **Compliance**: Adherence to PDPO, GDPR, and other relevant privacy regulations. Privacy Impact Assessment (PIA) to be conducted.

## 6. Integration Points

- **User Onboarding**: New users should be guided to set initial preferences.
- **User Profile Settings**: Preference Center should be easily accessible from the main user profile/settings area.
- **Notification Service**: Must query the Preference Service in real-time or use a frequently updated cache to determine if a notification should be sent and via which channel.
- **Unsubscribe Links**: Emails must contain unsubscribe links that direct to the relevant section of the Preference Center.

## 7. Analytics and Monitoring

- Track changes to user preferences to understand trends (e.g., which channels are most/least popular, which categories are most frequently opted-out of).
- Monitor the impact of preference settings on notification engagement rates (open rates, click-through rates).
- Log API errors and UI interaction issues.

## 8. Implementation Considerations

- **Phased Rollout**: Start with core preferences (channel toggles, DND) and gradually introduce more granular controls.
- **UX Best Practices**: Design should be clear, concise, and easy to navigate. Avoid overwhelming users with too many options at once. Provide clear explanations for each setting.
- **Performance**: API responses should be fast. Preference lookups by the Notification Service must be highly performant.
- **Default Settings**: Sensible defaults should be applied, encouraging engagement while respecting user autonomy.
- **Accessibility**: Ensure the UI is WCAG compliant.

## 9. Testing Strategy

- **Unit Tests**: For individual React components and backend service methods (validation logic, database interactions).
- **Integration Tests**: Test API endpoints, interaction between Preference Service and Notification Service, and data consistency.
- **End-to-End (E2E) Tests**: Simulate user flows for setting various preferences and verify that notifications are sent/suppressed accordingly.
- **Usability Testing**: Gather feedback from real users on the clarity and ease of use of the Preference Center UI.
- **Security Testing**: Penetration testing and vulnerability scans.

## 10. Future Enhancements

- **AI-Driven Preference Suggestions**: Analyze user behavior to suggest optimal notification settings.
- **Granular Content-Type Preferences**: Allow users to opt-in/out of specific sub-types of content within a broader category.
- **Contextual Preferences**: Allow temporary muting of certain notifications based on user activity or location (if shared).
- **Batch Update Options**: Allow users to apply a setting (e.g., disable SMS) across multiple categories at once.
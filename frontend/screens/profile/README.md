# Profile Screens Documentation

## Overview
The profile screens handle user account management, personal settings, privacy controls, and data management. All screens are designed with mobile-first principles and comprehensive privacy protection.

## 👤 Core Features
- Personal information management
- Privacy and security controls
- Notification preferences
- Data export and deletion
- Account settings
- Emergency contact management

## 📱 Screen Specifications

### 1. Profile Overview (`/profile`)

#### Purpose
Central hub for viewing and managing user profile information and account status.

#### Mobile-First Design
- **Card-based Layout**: Information organized in swipeable cards
- **Quick Actions**: Large touch targets for common tasks
- **Avatar Management**: Touch-friendly photo upload/editing
- **Status Indicators**: Visual account health indicators
- **Accessibility**: Screen reader optimized

#### UI Components
```typescript
interface ProfileOverviewProps {
  user: UserProfile;
  accountStatus: AccountStatus;
  privacySettings: PrivacySettings;
  onEditProfile: () => void;
  onPrivacySettings: () => void;
  onAccountSettings: () => void;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  dateOfBirth: Date;
  gender: string;
  bio?: string;
  emergencyContact: EmergencyContact;
  joinedDate: Date;
  lastActive: Date;
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Profile          [⚙️] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │     [👤 Avatar Photo]       │ │
│ │                             │ │
│ │     John Doe                │ │
│ │     john.doe@email.com      │ │
│ │     Member since Jan 2024   │ │
│ │                             │ │
│ │     [Edit Profile]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Account Status              │ │
│ │ ✅ Email Verified           │ │
│ │ ✅ Profile Complete         │ │
│ │ ⚠️  MFA Not Enabled         │ │
│ │ [Improve Security]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Quick Actions               │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│ │ │🔒   │ │🔔   │ │📊   │   │ │
│ │ │Privacy│Notify│Data │   │ │
│ │ └─────┘ └─────┘ └─────┘   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Recent Activity             │ │
│ │ • Profile updated           │ │
│ │ • Privacy settings changed  │ │
│ │ • Password changed          │ │
│ │ [View All Activity]         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get user profile
GET /api/users/profile
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "avatar": "https://api.mindlyfe.org/uploads/avatars/user_123.jpg",
      "dateOfBirth": "1990-01-01",
      "gender": "male",
      "bio": "Mental health advocate and wellness enthusiast",
      "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+1234567890",
        "relationship": "spouse"
      },
      "joinedDate": "2024-01-01T00:00:00Z",
      "lastActive": "2024-01-15T10:30:00Z"
    },
    "accountStatus": {
      "emailVerified": true,
      "profileComplete": true,
      "mfaEnabled": false,
      "subscriptionActive": true,
      "dataExportRequested": false
    },
    "privacySettings": {
      "profileVisibility": "private",
      "dataSharing": false,
      "analyticsOptOut": false,
      "marketingOptOut": true
    }
  }
}
```

---

### 2. Edit Profile (`/profile/edit`)

#### Purpose
Comprehensive profile editing interface with real-time validation and photo management.

#### Mobile-First Design
- **Form Sections**: Collapsible sections for organization
- **Photo Upload**: Camera integration and cropping tools
- **Validation**: Real-time field validation
- **Auto-save**: Progress preservation
- **Accessibility**: Form labels and error announcements

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Edit Profile    [Save] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Profile Photo               │ │
│ │     [👤 Current Photo]      │ │
│ │ [📷 Take Photo] [📁 Upload] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Personal Information        │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ First Name              │ │ │
│ │ │ [John]                  │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Last Name               │ │ │
│ │ │ [Doe]                   │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Date of Birth           │ │ │
│ │ │ [01/01/1990] [📅]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Gender                  │ │ │
│ │ │ [Male ▼]                │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Bio                         │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Tell us about yourself  │ │ │
│ │ │ (optional)              │ │ │
│ │ │                         │ │ │
│ │ │ [Text area]             │ │ │
│ │ └─────────────────────────┘ │ │
│ │ 150/500 characters          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Emergency Contact           │ │
│ │ [Edit Emergency Contact]    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Update profile
PUT /api/users/profile
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bio": "Mental health advocate and wellness enthusiast",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567890",
    "relationship": "spouse"
  }
}

// Upload avatar
POST /api/users/profile/avatar
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- avatar: File (image file)
- cropData: JSON (crop coordinates)

Response:
{
  "success": true,
  "data": {
    "avatarUrl": "https://api.mindlyfe.org/uploads/avatars/user_123.jpg",
    "thumbnailUrl": "https://api.mindlyfe.org/uploads/avatars/thumb_user_123.jpg"
  }
}
```

---

### 3. Privacy Settings (`/profile/privacy`)

#### Purpose
Comprehensive privacy controls with granular permissions and data management options.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Privacy Settings       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Profile Visibility          │ │
│ │ ○ Public                    │ │
│ │ ● Private                   │ │
│ │ ○ Friends Only              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Data Sharing                │ │
│ │ Share data for research     │ │
│ │ [Toggle: OFF] 🔒            │ │
│ │                             │ │
│ │ Analytics tracking          │ │
│ │ [Toggle: ON] 📊             │ │
│ │                             │ │
│ │ Marketing communications    │ │
│ │ [Toggle: OFF] 📧            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Therapist Access            │ │
│ │ Allow therapists to view:   │ │
│ │ ☑️ Journal entries          │ │
│ │ ☑️ Mood tracking data       │ │
│ │ ☑️ Assessment results       │ │
│ │ ☐ Community activity        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Data Management             │ │
│ │ [Export My Data]            │ │
│ │ [Delete Account]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 4. Notification Preferences (`/profile/notifications`)

#### Purpose
Granular notification control across all communication channels and content types.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Notifications          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Delivery Methods            │ │
│ │ Push notifications          │ │
│ │ [Toggle: ON] 📱             │ │
│ │                             │ │
│ │ Email notifications         │ │
│ │ [Toggle: ON] 📧             │ │
│ │                             │ │
│ │ SMS notifications           │ │
│ │ [Toggle: OFF] 💬            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Content Types               │ │
│ │ Health reminders            │ │
│ │ [Toggle: ON] 🏥             │ │
│ │                             │ │
│ │ Appointment reminders       │ │
│ │ [Toggle: ON] 📅             │ │
│ │                             │ │
│ │ Community activity          │ │
│ │ [Toggle: ON] 👥             │ │
│ │                             │ │
│ │ LyfBot messages             │ │
│ │ [Toggle: ON] 🤖             │ │
│ │                             │ │
│ │ Crisis alerts               │ │
│ │ [Toggle: ON] 🆘 (Required)  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Quiet Hours                 │ │
│ │ From: [10:00 PM]            │ │
│ │ To:   [7:00 AM]             │ │
│ │ Timezone: [Auto-detect]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 5. Account Settings (`/profile/account`)

#### Purpose
Security settings, password management, and account administration.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Account Settings       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Security                    │ │
│ │ [Change Password]           │ │
│ │ [Two-Factor Authentication] │ │
│ │ [Biometric Settings]        │ │
│ │ [Active Sessions]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Subscription                │ │
│ │ Current Plan: Premium       │ │
│ │ Next billing: Feb 15, 2024  │ │
│ │ [Manage Subscription]       │ │
│ │ [Billing History]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Connected Accounts          │ │
│ │ Google: Connected ✅        │ │
│ │ Apple: Not connected        │ │
│ │ [Manage Connections]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Danger Zone                 │ │
│ │ [Deactivate Account]        │ │
│ │ [Delete Account]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 6. Data Export (`/profile/data-export`)

#### Purpose
GDPR-compliant data export functionality with comprehensive data package creation.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Export My Data         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Data Export Request         │ │
│ │ Download a copy of all your │ │
│ │ data from MindLyfe          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Select Data Types           │ │
│ │ ☑️ Profile information      │ │
│ │ ☑️ Journal entries          │ │
│ │ ☑️ Mood tracking data       │ │
│ │ ☑️ Assessment results       │ │
│ │ ☑️ Therapy session notes    │ │
│ │ ☑️ Community posts          │ │
│ │ ☑️ Chat conversations       │ │
│ │ ☑️ Payment history          │ │
│ │ ☐ System logs              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Export Format               │ │
│ │ ○ JSON (Machine readable)   │ │
│ │ ● PDF (Human readable)      │ │
│ │ ○ CSV (Spreadsheet)         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Request Export]            │ │
│ │                             │ │
│ │ ⚠️ Processing may take      │ │
│ │ up to 30 days               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Previous Exports            │ │
│ │ Jan 15, 2024 - Ready        │ │
│ │ [Download] [Delete]         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Request data export
POST /api/users/export
Authorization: Bearer {access_token}

Request Body:
{
  "dataTypes": [
    "profile",
    "journal",
    "mood_tracking",
    "assessments",
    "therapy_notes",
    "community_posts",
    "chat_conversations",
    "payment_history"
  ],
  "format": "pdf",
  "includeSystemLogs": false
}

Response:
{
  "success": true,
  "data": {
    "exportId": "export_123",
    "status": "processing",
    "estimatedCompletion": "2024-01-20T00:00:00Z",
    "downloadUrl": null
  }
}

// Get export status
GET /api/users/export/{exportId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "exportId": "export_123",
    "status": "completed",
    "createdAt": "2024-01-15T10:00:00Z",
    "completedAt": "2024-01-15T12:30:00Z",
    "downloadUrl": "https://api.mindlyfe.org/exports/user_123_export.pdf",
    "expiresAt": "2024-02-15T12:30:00Z",
    "fileSize": "2.5MB"
  }
}
```

## 🔄 Screen Flow Patterns

### Profile Management Flow
```
Profile Overview
├─ [Edit Profile] → Profile Editor → Save Confirmation
├─ [Privacy Settings] → Privacy Controls → Settings Update
├─ [Notifications] → Notification Preferences → Preference Update
├─ [Account Settings] → Security Settings → Account Management
└─ [Data Export] → Export Request → Download Ready

Profile Editor
├─ Photo Upload → Camera/Gallery → Crop Tool → Save Photo
├─ Personal Info → Form Validation → Auto-save
├─ Emergency Contact → Contact Editor → Verification
└─ [Save Changes] → Validation → Profile Update

Privacy Settings
├─ Visibility Controls → Permission Updates
├─ Data Sharing → Consent Management
├─ Therapist Access → Permission Granularity
└─ [Export Data] → Data Export Flow

Account Security
├─ Password Change → Current Password → New Password → Confirmation
├─ MFA Setup → Method Selection → Configuration → Verification
├─ Biometric Setup → Device Check → Configuration → Testing
└─ Session Management → Active Sessions → Revoke Options
```

## 📊 Performance Metrics

### Loading Performance
- **Profile Overview**: < 1.0s
- **Edit Profile**: < 0.8s
- **Settings Screens**: < 0.5s
- **Data Export**: < 2.0s

### User Engagement
- **Profile Completion Rate**: Target 90%
- **Privacy Settings Usage**: Track adoption
- **Data Export Requests**: Monitor frequency
- **Security Feature Adoption**: Track MFA setup

## 🔒 Security Considerations

### Data Protection
- Profile data encryption at rest
- Secure photo upload and storage
- Privacy setting enforcement
- Audit logging for sensitive changes

### Access Control
- User-only access to profile data
- Therapist permission management
- Admin oversight capabilities
- Emergency access protocols

---

This documentation provides comprehensive coverage of all profile screens with mobile-first design principles, detailed API integration, and security best practices. 
# MindLyfe API Endpoints Documentation

## Overview
This document provides comprehensive documentation for all API endpoints used by the MindLyfe frontend application. All endpoints are accessed through the API Gateway at `https://api.mindlyfe.org` and require proper authentication unless otherwise specified.

## 🔐 Authentication

### Base URL
```
Production: https://api.mindlyfe.org
Development: http://localhost:3000
```

### Authentication Headers
```typescript
// Standard authenticated request
headers: {
  'Authorization': 'Bearer {access_token}',
  'Content-Type': 'application/json',
  'X-Client-Version': '1.0.0',
  'X-Platform': 'web' | 'mobile'
}

// Service-to-service requests
headers: {
  'Authorization': 'Bearer {service_token}',
  'X-Service-Name': 'frontend-app',
  'Content-Type': 'application/json'
}
```

## 📚 Service Endpoints

### 🔐 Authentication Service (Port 3001)

#### User Authentication
```typescript
// User login
POST /api/auth/login
Request: {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceFingerprint?: string;
  mfaCode?: string;
}
Response: {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
    expiresIn: number;
  }
}

// User registration
POST /api/auth/register
Request: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: EmergencyContact;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}
Response: {
  success: boolean;
  data: {
    userId: string;
    email: string;
    verificationRequired: boolean;
  }
}

// Refresh token
POST /api/auth/refresh
Request: {
  refreshToken: string;
}
Response: {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: number;
  }
}

// Logout
POST /api/auth/logout
Request: {
  refreshToken: string;
}
Response: {
  success: boolean;
  message: string;
}

// Password reset request
POST /api/auth/forgot-password
Request: {
  email: string;
}
Response: {
  success: boolean;
  message: string;
}

// Password reset confirmation
POST /api/auth/reset-password
Request: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
Response: {
  success: boolean;
  message: string;
}

// Email verification
GET /api/auth/verify-email?token={verification_token}
Response: {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

// Resend verification email
POST /api/auth/resend-verification
Request: {
  email: string;
}
Response: {
  success: boolean;
  message: string;
}
```

#### Multi-Factor Authentication
```typescript
// Setup MFA
POST /api/auth/mfa/setup
Request: {
  method: 'totp' | 'email' | 'sms';
  phoneNumber?: string;
}
Response: {
  success: boolean;
  data: {
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
  }
}

// Verify MFA setup
POST /api/auth/mfa/verify-setup
Request: {
  code: string;
  secret: string;
}
Response: {
  success: boolean;
  message: string;
}

// Disable MFA
POST /api/auth/mfa/disable
Request: {
  password: string;
  code: string;
}
Response: {
  success: boolean;
  message: string;
}
```

#### Biometric Authentication
```typescript
// Register biometric
POST /api/auth/biometric/register
Request: {
  deviceId: string;
  biometricType: 'faceId' | 'fingerprint' | 'voiceId';
  publicKey: string;
}
Response: {
  success: boolean;
  data: {
    deviceId: string;
    registered: boolean;
  }
}

// Biometric authentication
POST /api/auth/biometric/authenticate
Request: {
  deviceId: string;
  signature: string;
  challenge: string;
}
Response: {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
  }
}
```

---

### 🏠 Dashboard Service

#### Dashboard Data
```typescript
// Get dashboard data
GET /api/dashboard
Response: {
  success: boolean;
  data: {
    user: UserProfile;
    wellnessMetrics: WellnessMetrics;
    recentActivity: Activity[];
    quickActions: QuickAction[];
    recommendations: Recommendation[];
    notifications: Notification[];
  }
}

// Refresh dashboard
POST /api/dashboard/refresh
Response: {
  success: boolean;
  data: DashboardData;
}

// Get progress data
GET /api/dashboard/progress?period={period}
Response: {
  success: boolean;
  data: {
    period: string;
    moodTrend: MoodDataPoint[];
    weeklyGoals: Goal[];
    achievements: Achievement[];
    insights: Insight[];
  }
}
```

#### Quick Actions
```typescript
// Get quick actions
GET /api/dashboard/quick-actions
Response: {
  success: boolean;
  data: {
    actions: QuickAction[];
    categories: string[];
  }
}

// Update quick actions order
PUT /api/dashboard/quick-actions/order
Request: {
  actions: Array<{
    id: string;
    position: number;
  }>;
}
Response: {
  success: boolean;
  message: string;
}

// Add custom action
POST /api/dashboard/quick-actions
Request: {
  title: string;
  icon: string;
  route: string;
  category: string;
}
Response: {
  success: boolean;
  data: QuickAction;
}
```

---

### 👤 User Profile Service

#### Profile Management
```typescript
// Get user profile
GET /api/users/profile
Response: {
  success: boolean;
  data: {
    user: UserProfile;
    preferences: UserPreferences;
    privacy: PrivacySettings;
  }
}

// Update profile
PUT /api/users/profile
Request: {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  avatar?: string;
  emergencyContact?: EmergencyContact;
}
Response: {
  success: boolean;
  data: UserProfile;
}

// Update preferences
PUT /api/users/preferences
Request: {
  language?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: NotificationPreferences;
}
Response: {
  success: boolean;
  data: UserPreferences;
}

// Update privacy settings
PUT /api/users/privacy
Request: {
  profileVisibility?: 'public' | 'private' | 'friends';
  dataSharing?: boolean;
  analyticsOptOut?: boolean;
  marketingOptOut?: boolean;
}
Response: {
  success: boolean;
  data: PrivacySettings;
}

// Delete account
DELETE /api/users/account
Request: {
  password: string;
  reason?: string;
}
Response: {
  success: boolean;
  message: string;
}

// Export user data
GET /api/users/export
Response: {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresAt: string;
  }
}
```

---

### 🧠 Mental Health Service

#### Assessments
```typescript
// Get initial assessment
GET /api/mental-health/assessment/initial
Response: {
  success: boolean;
  data: {
    questions: AssessmentQuestion[];
    categories: string[];
  }
}

// Submit assessment
POST /api/mental-health/assessment/initial
Request: {
  responses: Array<{
    questionId: string;
    answer: string | number | string[];
  }>;
}
Response: {
  success: boolean;
  data: {
    assessmentId: string;
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }
}

// Get assessment history
GET /api/mental-health/assessments?page={page}&limit={limit}
Response: {
  success: boolean;
  data: {
    assessments: Assessment[];
    pagination: PaginationInfo;
  }
}
```

#### Mood Tracking
```typescript
// Log mood
POST /api/mental-health/mood
Request: {
  score: number; // 1-10
  emotions: string[];
  notes?: string;
  triggers?: string[];
  activities?: string[];
}
Response: {
  success: boolean;
  data: {
    moodId: string;
    timestamp: string;
    insights?: string[];
  }
}

// Get mood history
GET /api/mental-health/mood?period={period}&page={page}
Response: {
  success: boolean;
  data: {
    moods: MoodEntry[];
    trends: MoodTrend[];
    insights: MoodInsight[];
    pagination: PaginationInfo;
  }
}

// Get mood analytics
GET /api/mental-health/mood/analytics?period={period}
Response: {
  success: boolean;
  data: {
    averageScore: number;
    trendDirection: 'up' | 'down' | 'stable';
    patterns: MoodPattern[];
    correlations: MoodCorrelation[];
  }
}
```

#### Goals and Tracking
```typescript
// Create wellness goal
POST /api/mental-health/goals
Request: {
  title: string;
  description: string;
  category: string;
  targetValue: number;
  targetUnit: string;
  deadline?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}
Response: {
  success: boolean;
  data: Goal;
}

// Get goals
GET /api/mental-health/goals?status={status}
Response: {
  success: boolean;
  data: {
    goals: Goal[];
    progress: GoalProgress[];
  }
}

// Update goal progress
POST /api/mental-health/goals/{goalId}/progress
Request: {
  value: number;
  notes?: string;
}
Response: {
  success: boolean;
  data: GoalProgress;
}
```

---

### 🩺 Teletherapy Service (Port 3002)

#### Therapist Discovery
```typescript
// Search therapists
GET /api/teletherapy/therapists/search?specialization={spec}&location={loc}&availability={avail}
Response: {
  success: boolean;
  data: {
    therapists: TherapistProfile[];
    filters: SearchFilters;
    pagination: PaginationInfo;
  }
}

// Get therapist profile
GET /api/teletherapy/therapists/{therapistId}
Response: {
  success: boolean;
  data: {
    therapist: TherapistProfile;
    availability: AvailabilitySlot[];
    reviews: Review[];
    specializations: Specialization[];
  }
}

// Get AI-powered therapist recommendations
GET /api/teletherapy/therapists/recommendations
Response: {
  success: boolean;
  data: {
    recommendations: TherapistRecommendation[];
    matchingCriteria: MatchingCriteria;
  }
}
```

#### Appointment Management
```typescript
// Book appointment
POST /api/teletherapy/appointments
Request: {
  therapistId: string;
  dateTime: string;
  duration: number;
  sessionType: 'video' | 'audio' | 'chat';
  notes?: string;
}
Response: {
  success: boolean;
  data: {
    appointmentId: string;
    confirmationCode: string;
    sessionDetails: SessionDetails;
  }
}

// Get appointments
GET /api/teletherapy/appointments?status={status}&page={page}
Response: {
  success: boolean;
  data: {
    appointments: Appointment[];
    pagination: PaginationInfo;
  }
}

// Cancel appointment
PUT /api/teletherapy/appointments/{appointmentId}/cancel
Request: {
  reason?: string;
}
Response: {
  success: boolean;
  data: {
    refundAmount?: number;
    cancellationFee?: number;
  }
}

// Reschedule appointment
PUT /api/teletherapy/appointments/{appointmentId}/reschedule
Request: {
  newDateTime: string;
  reason?: string;
}
Response: {
  success: boolean;
  data: Appointment;
}
```

#### Video Sessions
```typescript
// Start session
POST /api/teletherapy/sessions/{appointmentId}/start
Response: {
  success: boolean;
  data: {
    sessionId: string;
    roomToken: string;
    serverUrl: string;
    expiresAt: string;
  }
}

// End session
POST /api/teletherapy/sessions/{sessionId}/end
Request: {
  duration: number;
  rating?: number;
  feedback?: string;
}
Response: {
  success: boolean;
  data: {
    sessionSummary: SessionSummary;
    nextSteps?: string[];
  }
}

// Get session history
GET /api/teletherapy/sessions?page={page}&limit={limit}
Response: {
  success: boolean;
  data: {
    sessions: SessionHistory[];
    pagination: PaginationInfo;
  }
}
```

---

### 🤖 LyfBot Service (Port 8003)

#### Chat Interface
```typescript
// Start conversation
POST /api/lyfbot/conversations
Request: {
  initialMessage?: string;
  context?: ConversationContext;
}
Response: {
  success: boolean;
  data: {
    conversationId: string;
    response: BotResponse;
    sessionToken: string;
  }
}

// Send message
POST /api/lyfbot/conversations/{conversationId}/messages
Request: {
  message: string;
  messageType: 'text' | 'voice' | 'image';
  metadata?: MessageMetadata;
}
Response: {
  success: boolean;
  data: {
    messageId: string;
    response: BotResponse;
    suggestions?: string[];
    actions?: BotAction[];
  }
}

// Get conversation history
GET /api/lyfbot/conversations/{conversationId}/messages?page={page}
Response: {
  success: boolean;
  data: {
    messages: ChatMessage[];
    pagination: PaginationInfo;
  }
}

// Get conversations list
GET /api/lyfbot/conversations?page={page}&limit={limit}
Response: {
  success: boolean;
  data: {
    conversations: ConversationSummary[];
    pagination: PaginationInfo;
  }
}
```

#### Crisis Detection
```typescript
// Report crisis situation
POST /api/lyfbot/crisis/report
Request: {
  conversationId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  immediateHelp: boolean;
}
Response: {
  success: boolean;
  data: {
    crisisId: string;
    resources: CrisisResource[];
    escalationLevel: string;
    supportContactInfo: ContactInfo;
  }
}

// Get crisis resources
GET /api/lyfbot/crisis/resources?location={location}
Response: {
  success: boolean;
  data: {
    hotlines: CrisisHotline[];
    localResources: LocalResource[];
    emergencyContacts: EmergencyContact[];
  }
}
```

---

### 👥 Community Service (Port 3004)

#### Community Feed
```typescript
// Get community feed
GET /api/community/feed?page={page}&filter={filter}
Response: {
  success: boolean;
  data: {
    posts: CommunityPost[];
    pagination: PaginationInfo;
    filters: FeedFilter[];
  }
}

// Create post
POST /api/community/posts
Request: {
  content: string;
  type: 'text' | 'image' | 'poll' | 'story';
  visibility: 'public' | 'friends' | 'group';
  groupId?: string;
  tags?: string[];
  anonymous?: boolean;
}
Response: {
  success: boolean;
  data: CommunityPost;
}

// React to post
POST /api/community/posts/{postId}/reactions
Request: {
  type: 'like' | 'love' | 'support' | 'celebrate';
}
Response: {
  success: boolean;
  data: {
    reactionId: string;
    totalReactions: ReactionCount;
  }
}

// Comment on post
POST /api/community/posts/{postId}/comments
Request: {
  content: string;
  parentCommentId?: string;
  anonymous?: boolean;
}
Response: {
  success: boolean;
  data: Comment;
}
```

#### Support Groups
```typescript
// Get support groups
GET /api/community/groups?category={category}&page={page}
Response: {
  success: boolean;
  data: {
    groups: SupportGroup[];
    categories: GroupCategory[];
    pagination: PaginationInfo;
  }
}

// Join group
POST /api/community/groups/{groupId}/join
Request: {
  reason?: string;
}
Response: {
  success: boolean;
  data: {
    membershipId: string;
    status: 'pending' | 'approved';
  }
}

// Get group details
GET /api/community/groups/{groupId}
Response: {
  success: boolean;
  data: {
    group: SupportGroup;
    members: GroupMember[];
    recentActivity: GroupActivity[];
    rules: GroupRule[];
  }
}

// Create group discussion
POST /api/community/groups/{groupId}/discussions
Request: {
  title: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
}
Response: {
  success: boolean;
  data: Discussion;
}
```

---

### 📝 Journal Service (Port 8001)

#### Journal Entries
```typescript
// Create journal entry
POST /api/journal/entries
Request: {
  title?: string;
  content: string;
  mood?: number;
  emotions?: string[];
  tags?: string[];
  isPrivate: boolean;
  promptId?: string;
}
Response: {
  success: boolean;
  data: {
    entryId: string;
    insights?: JournalInsight[];
    moodAnalysis?: MoodAnalysis;
  }
}

// Get journal entries
GET /api/journal/entries?page={page}&filter={filter}&search={search}
Response: {
  success: boolean;
  data: {
    entries: JournalEntry[];
    pagination: PaginationInfo;
    filters: EntryFilter[];
  }
}

// Update journal entry
PUT /api/journal/entries/{entryId}
Request: {
  title?: string;
  content?: string;
  mood?: number;
  emotions?: string[];
  tags?: string[];
  isPrivate?: boolean;
}
Response: {
  success: boolean;
  data: JournalEntry;
}

// Delete journal entry
DELETE /api/journal/entries/{entryId}
Response: {
  success: boolean;
  message: string;
}
```

#### Journal Analytics
```typescript
// Get journal insights
GET /api/journal/insights?period={period}
Response: {
  success: boolean;
  data: {
    wordCount: number;
    entryCount: number;
    moodTrends: MoodTrend[];
    emotionPatterns: EmotionPattern[];
    topTags: TagFrequency[];
    writingStreak: number;
  }
}

// Get writing prompts
GET /api/journal/prompts?category={category}&difficulty={difficulty}
Response: {
  success: boolean;
  data: {
    prompts: WritingPrompt[];
    categories: PromptCategory[];
  }
}
```

---

### 📚 Resources Service (Port 3007)

#### Resource Library
```typescript
// Get resources
GET /api/resources?type={type}&category={category}&page={page}&search={search}
Response: {
  success: boolean;
  data: {
    resources: Resource[];
    categories: ResourceCategory[];
    types: ResourceType[];
    pagination: PaginationInfo;
  }
}

// Get resource details
GET /api/resources/{resourceId}
Response: {
  success: boolean;
  data: {
    resource: Resource;
    relatedResources: Resource[];
    userProgress?: ResourceProgress;
  }
}

// Download resource
GET /api/resources/{resourceId}/download
Response: File download or {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresAt: string;
  }
}

// Track resource progress
POST /api/resources/{resourceId}/progress
Request: {
  progressPercentage: number;
  timeSpent: number;
  completed: boolean;
  notes?: string;
}
Response: {
  success: boolean;
  data: ResourceProgress;
}
```

#### Learning Paths
```typescript
// Get learning paths
GET /api/resources/learning-paths?category={category}
Response: {
  success: boolean;
  data: {
    learningPaths: LearningPath[];
    categories: string[];
  }
}

// Enroll in learning path
POST /api/resources/learning-paths/{pathId}/enroll
Response: {
  success: boolean;
  data: {
    enrollmentId: string;
    currentStep: number;
    estimatedCompletion: string;
  }
}

// Get learning path progress
GET /api/resources/learning-paths/{pathId}/progress
Response: {
  success: boolean;
  data: {
    progress: LearningPathProgress;
    currentStep: LearningStep;
    nextSteps: LearningStep[];
  }
}
```

---

### 💳 Payment Service (Port 3006)

#### Subscription Management
```typescript
// Get subscription plans
GET /api/payments/plans
Response: {
  success: boolean;
  data: {
    plans: SubscriptionPlan[];
    currentPlan?: UserSubscription;
    features: PlanFeature[];
  }
}

// Subscribe to plan
POST /api/payments/subscriptions
Request: {
  planId: string;
  paymentMethodId: string;
  billingCycle: 'monthly' | 'yearly';
  promoCode?: string;
}
Response: {
  success: boolean;
  data: {
    subscriptionId: string;
    status: string;
    nextBillingDate: string;
    amount: number;
  }
}

// Update subscription
PUT /api/payments/subscriptions/{subscriptionId}
Request: {
  planId?: string;
  billingCycle?: 'monthly' | 'yearly';
}
Response: {
  success: boolean;
  data: UserSubscription;
}

// Cancel subscription
POST /api/payments/subscriptions/{subscriptionId}/cancel
Request: {
  reason?: string;
  feedback?: string;
}
Response: {
  success: boolean;
  data: {
    cancellationDate: string;
    refundAmount?: number;
  }
}
```

#### Payment Methods
```typescript
// Get payment methods
GET /api/payments/methods
Response: {
  success: boolean;
  data: {
    paymentMethods: PaymentMethod[];
    defaultMethodId?: string;
  }
}

// Add payment method
POST /api/payments/methods
Request: {
  type: 'card' | 'bank' | 'mobile_money';
  token: string; // From payment gateway
  isDefault?: boolean;
}
Response: {
  success: boolean;
  data: PaymentMethod;
}

// Update payment method
PUT /api/payments/methods/{methodId}
Request: {
  isDefault?: boolean;
  billingAddress?: BillingAddress;
}
Response: {
  success: boolean;
  data: PaymentMethod;
}

// Delete payment method
DELETE /api/payments/methods/{methodId}
Response: {
  success: boolean;
  message: string;
}
```

#### Billing History
```typescript
// Get billing history
GET /api/payments/billing/history?page={page}&limit={limit}
Response: {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: PaginationInfo;
  }
}

// Get invoice details
GET /api/payments/billing/invoices/{invoiceId}
Response: {
  success: boolean;
  data: {
    invoice: Invoice;
    downloadUrl: string;
  }
}

// Request refund
POST /api/payments/refunds
Request: {
  transactionId: string;
  amount?: number;
  reason: string;
}
Response: {
  success: boolean;
  data: {
    refundId: string;
    status: string;
    estimatedProcessingTime: string;
  }
}
```

---

### 🎮 Gamification Service (Port 3008)

#### Achievements and Badges
```typescript
// Get user achievements
GET /api/gamification/achievements
Response: {
  success: boolean;
  data: {
    achievements: UserAchievement[];
    badges: UserBadge[];
    totalPoints: number;
    level: number;
  }
}

// Get leaderboards
GET /api/gamification/leaderboards?type={type}&period={period}
Response: {
  success: boolean;
  data: {
    leaderboard: LeaderboardEntry[];
    userRank: number;
    totalParticipants: number;
  }
}

// Get daily challenges
GET /api/gamification/challenges/daily
Response: {
  success: boolean;
  data: {
    challenges: DailyChallenge[];
    completedToday: number;
    streakDays: number;
  }
}

// Complete challenge
POST /api/gamification/challenges/{challengeId}/complete
Request: {
  evidence?: string;
  notes?: string;
}
Response: {
  success: boolean;
  data: {
    pointsEarned: number;
    badgesUnlocked: Badge[];
    newLevel?: number;
  }
}
```

#### Progress Tracking
```typescript
// Get user progress
GET /api/gamification/progress
Response: {
  success: boolean;
  data: {
    level: number;
    totalPoints: number;
    pointsToNextLevel: number;
    streaks: UserStreak[];
    recentAchievements: Achievement[];
  }
}

// Log activity
POST /api/gamification/activities
Request: {
  type: string;
  value: number;
  metadata?: Record<string, any>;
}
Response: {
  success: boolean;
  data: {
    pointsEarned: number;
    streakUpdated?: boolean;
    achievementsUnlocked?: Achievement[];
  }
}
```

---

### 🔔 Notification Service (Port 3005)

#### Notification Management
```typescript
// Get notifications
GET /api/notifications?category={category}&page={page}&limit={limit}
Response: {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    categories: NotificationCategory[];
    pagination: PaginationInfo;
  }
}

// Mark notification as read
PUT /api/notifications/{notificationId}/read
Response: {
  success: boolean;
  message: string;
}

// Mark all notifications as read
PUT /api/notifications/mark-all-read
Response: {
  success: boolean;
  message: string;
}

// Delete notification
DELETE /api/notifications/{notificationId}
Response: {
  success: boolean;
  message: string;
}

// Update notification preferences
PUT /api/notifications/preferences
Request: {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  categories: Record<string, boolean>;
}
Response: {
  success: boolean;
  data: NotificationPreferences;
}
```

#### Push Notifications
```typescript
// Register device for push notifications
POST /api/notifications/devices
Request: {
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo: DeviceInfo;
}
Response: {
  success: boolean;
  data: {
    deviceId: string;
    registered: boolean;
  }
}

// Unregister device
DELETE /api/notifications/devices/{deviceId}
Response: {
  success: boolean;
  message: string;
}
```

---

### 🆘 Crisis Support Service

#### Crisis Resources
```typescript
// Get crisis resources
GET /api/crisis/resources?location={location}&type={type}
Response: {
  success: boolean;
  data: {
    hotlines: CrisisHotline[];
    localResources: LocalResource[];
    emergencyContacts: EmergencyContact[];
    safetyPlan?: SafetyPlan;
  }
}

// Create safety plan
POST /api/crisis/safety-plan
Request: {
  warningSignals: string[];
  copingStrategies: string[];
  supportContacts: Contact[];
  professionalContacts: Contact[];
  environmentSafety: string[];
}
Response: {
  success: boolean;
  data: SafetyPlan;
}

// Report crisis
POST /api/crisis/report
Request: {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  immediateHelp: boolean;
}
Response: {
  success: boolean;
  data: {
    crisisId: string;
    resources: CrisisResource[];
    escalationLevel: string;
  }
}
```

---

### 🔍 Search Service

#### Global Search
```typescript
// Search across all content
GET /api/search?q={query}&category={category}&page={page}&limit={limit}
Response: {
  success: boolean;
  data: {
    query: string;
    results: SearchResult[];
    suggestions: string[];
    filters: SearchFilter[];
    pagination: PaginationInfo;
  }
}

// Get search suggestions
GET /api/search/suggestions?q={partial_query}
Response: {
  success: boolean;
  data: {
    suggestions: string[];
  }
}

// Save search
POST /api/search/history
Request: {
  query: string;
  category: string;
  resultsCount: number;
}
Response: {
  success: boolean;
  message: string;
}

// Get search history
GET /api/search/history?page={page}&limit={limit}
Response: {
  success: boolean;
  data: {
    searches: SearchHistory[];
    pagination: PaginationInfo;
  }
}
```

## 🔄 Common Response Patterns

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
  field?: string;
  code?: number;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### Pagination
```typescript
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}
```

## 🔒 Security Considerations

### Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- General API endpoints: 100 requests per 15 minutes
- Search endpoints: 50 requests per minute
- File upload endpoints: 10 requests per minute

### Error Handling
- Consistent error response format
- Appropriate HTTP status codes
- Detailed error messages in development
- Generic error messages in production
- Request ID tracking for debugging

### Data Validation
- Input sanitization on all endpoints
- Schema validation using DTOs
- File type and size validation
- Rate limiting per user and IP
- CORS policy enforcement

---

This comprehensive API documentation covers all endpoints used by the MindLyfe frontend application, providing detailed request/response schemas, authentication requirements, and usage examples for each service. 
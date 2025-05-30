# MindLyfe Gamification System - Technical Specification

This document provides detailed technical specifications for implementing the gamification elements of the MindLyfe platform's notification and engagement strategy.

## 1. System Overview

The Gamification System is designed to increase user engagement, motivation, and retention through game-like elements such as streaks, badges, achievements, and rewards. It integrates with the core platform to track user activities, recognize achievements, and deliver appropriate rewards.

### 1.1 Architecture Integration

```
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│   MindLyfe Core Platform ├─────►│   Gamification Service  │
│                         │      │                         │
└───────────┬─────────────┘      └─────────┬───────────────┘
            │                              │
            │                              │
            ▼                              ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│   Activity Tracking     │      │   Reward Management     │
│                         │      │                         │
└───────────┬─────────────┘      └─────────┬───────────────┘
            │                              │
            │                              │
            ▼                              ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│   Progress Calculation  │      │   Notification Service  │
│                         │      │                         │
└─────────────────────────┘      └─────────────────────────┘
```

## 2. Core Components

### 2.1 Streak System

#### 2.1.1 Data Model

```typescript
interface UserStreak {
  id: string;
  userId: string;
  streakType: string; // e.g., 'daily-login', 'therapy-attendance', 'meditation-completion'
  currentCount: number;
  lastActivityDate: Date;
  nextActivityDeadline: Date;
  longestStreak: number;
  totalActivities: number;
  milestones: StreakMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

interface StreakMilestone {
  id: string;
  streakId: string;
  threshold: number; // e.g., 7, 30, 100 days
  achieved: boolean;
  achievedAt?: Date;
  rewardId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StreakDefinition {
  id: string;
  type: string;
  displayName: string;
  description: string;
  activityType: string;
  resetCondition: 'daily' | 'weekly' | 'custom';
  resetInterval?: number; // In hours, for custom reset condition
  milestoneThresholds: number[];
  iconUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.1.2 Core Functions

```typescript
interface StreakService {
  // Initialize a streak for a user
  initializeStreak(userId: string, streakType: string): Promise<UserStreak>;
  
  // Record an activity and update streak
  recordActivity(userId: string, streakType: string, activityData?: any): Promise<UserStreak>;
  
  // Check if an activity would maintain the streak
  checkStreakStatus(userId: string, streakType: string): Promise<{
    active: boolean;
    currentCount: number;
    nextDeadline: Date;
    timeRemaining: number; // In milliseconds
  }>;
  
  // Reset a streak (manually or automatically)
  resetStreak(userId: string, streakType: string): Promise<UserStreak>;
  
  // Get all streaks for a user
  getUserStreaks(userId: string): Promise<UserStreak[]>;
  
  // Get specific streak details
  getStreakDetails(userId: string, streakType: string): Promise<UserStreak>;
  
  // Process streak milestones and trigger rewards
  processMilestones(streakId: string): Promise<StreakMilestone[]>;
}
```

#### 2.1.3 Implementation Details

- **Streak Calculation Logic**:
  - A streak is maintained when activities are performed within the defined reset interval
  - For daily streaks, activities must be performed before midnight in the user's timezone
  - For weekly streaks, activities must be performed at least once in each calendar week
  - Custom streaks allow for flexible time intervals between activities

- **Streak Recovery**:
  - Implement a "grace period" (e.g., 24 hours) where users can recover a broken streak
  - Optionally offer streak freezes as rewards for consistent engagement

- **Timezone Handling**:
  - All streak calculations must respect the user's local timezone
  - Store timezone information with the user profile
  - Calculate deadlines based on the user's local midnight

### 2.2 Badge System

#### 2.2.1 Data Model

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., 'achievement', 'participation', 'milestone'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: BadgeRequirement[];
  iconUrl: string;
  isHidden: boolean; // Whether badge is visible before being earned
  createdAt: Date;
  updatedAt: Date;
}

interface BadgeRequirement {
  id: string;
  badgeId: string;
  type: 'activity_count' | 'streak_milestone' | 'achievement_completion' | 'custom';
  threshold: number;
  activityType?: string;
  customLogic?: string; // JSON string containing custom evaluation logic
  createdAt: Date;
  updatedAt: Date;
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  progress: number; // 0-100%
  visible: boolean;
  metadata: Record<string, any>; // Additional data related to badge earning
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.2.2 Core Functions

```typescript
interface BadgeService {
  // Check and update progress for all applicable badges
  evaluateUserBadges(userId: string): Promise<UserBadge[]>;
  
  // Check specific badge progress
  evaluateBadgeProgress(userId: string, badgeId: string): Promise<UserBadge>;
  
  // Award a badge to a user
  awardBadge(userId: string, badgeId: string, metadata?: any): Promise<UserBadge>;
  
  // Get all badges for a user
  getUserBadges(userId: string, includeHidden?: boolean): Promise<UserBadge[]>;
  
  // Get all available badges in the system
  getAllBadges(includeHidden?: boolean): Promise<Badge[]>;
  
  // Get badges by category
  getBadgesByCategory(category: string, includeHidden?: boolean): Promise<Badge[]>;
}
```

#### 2.2.3 Implementation Details

- **Badge Progression**:
  - Implement a background job to regularly evaluate badge progress
  - Update progress in real-time for key user activities
  - Notify users when they make significant progress toward a badge

- **Badge Display**:
  - Create visual representations for different badge tiers
  - Implement a badge showcase in user profiles
  - Allow users to pin favorite badges to their profile

- **Badge Categories**:
  - **Engagement**: Login streaks, session attendance, content consumption
  - **Achievement**: Completing therapy milestones, wellness goals
  - **Community**: Participation in group activities, providing feedback
  - **Milestone**: Account age, number of sessions completed

### 2.3 Achievement System

#### 2.3.1 Data Model

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  steps: AchievementStep[];
  rewards: AchievementReward[];
  isHidden: boolean;
  prerequisites: string[]; // IDs of achievements that must be completed first
  iconUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AchievementStep {
  id: string;
  achievementId: string;
  description: string;
  order: number;
  activityType: string;
  requiredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number; // 0-100%
  currentStep: number;
  stepProgress: number[];
  completed: boolean;
  completedAt?: Date;
  rewardsDelivered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AchievementReward {
  id: string;
  achievementId: string;
  type: 'badge' | 'points' | 'feature_unlock' | 'content_unlock' | 'streak_freeze';
  value: any; // Depends on reward type
  description: string;
  iconUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.3.2 Core Functions

```typescript
interface AchievementService {
  // Update achievement progress based on user activity
  updateAchievementProgress(userId: string, activityType: string, activityData?: any): Promise<UserAchievement[]>;
  
  // Get all achievements for a user
  getUserAchievements(userId: string, includeHidden?: boolean): Promise<UserAchievement[]>;
  
  // Get specific achievement details for a user
  getUserAchievementDetails(userId: string, achievementId: string): Promise<UserAchievement>;
  
  // Complete an achievement and deliver rewards
  completeAchievement(userId: string, achievementId: string): Promise<{
    achievement: UserAchievement;
    rewards: AchievementReward[];
  }>;
  
  // Get available achievements for a user
  getAvailableAchievements(userId: string): Promise<Achievement[]>;
  
  // Get recommended next achievements for a user
  getRecommendedAchievements(userId: string, limit?: number): Promise<Achievement[]>;
}
```

#### 2.3.3 Implementation Details

- **Achievement Progression**:
  - Multi-step achievements with clear progress indicators
  - Automatic progress updates based on user activities
  - Manual verification for certain achievement types

- **Achievement Categories**:
  - **Wellness Journey**: Completing therapy programs, wellness assessments
  - **Skill Building**: Learning and applying mental health techniques
  - **Consistency**: Maintaining routines and healthy habits
  - **Personal Growth**: Setting and achieving personal goals

- **Achievement Display**:
  - Progress visualization with step completion indicators
  - Recommended achievements based on user behavior
  - Achievement roadmaps for guided progression

### 2.4 Reward System

#### 2.4.1 Data Model

```typescript
interface Reward {
  id: string;
  type: 'badge' | 'points' | 'feature_unlock' | 'content_unlock' | 'streak_freeze' | 'discount';
  value: any; // Depends on reward type
  displayName: string;
  description: string;
  iconUrl?: string;
  expiresAfter?: number; // In days, if applicable
  createdAt: Date;
  updatedAt: Date;
}

interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  source: 'streak' | 'badge' | 'achievement' | 'admin' | 'system';
  sourceId?: string; // ID of the source entity
  status: 'pending' | 'delivered' | 'claimed' | 'expired';
  issuedAt: Date;
  claimedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.4.2 Core Functions

```typescript
interface RewardService {
  // Issue a reward to a user
  issueReward(userId: string, rewardId: string, source: string, sourceId?: string): Promise<UserReward>;
  
  // Deliver pending rewards to a user
  deliverRewards(userId: string): Promise<UserReward[]>;
  
  // Claim a reward (for rewards requiring user action)
  claimReward(userId: string, userRewardId: string): Promise<UserReward>;
  
  // Get all rewards for a user
  getUserRewards(userId: string, status?: string): Promise<UserReward[]>;
  
  // Check for expired rewards and update status
  processExpiredRewards(): Promise<number>; // Returns count of expired rewards
  
  // Create a custom reward
  createCustomReward(rewardData: Partial<Reward>): Promise<Reward>;
}
```

#### 2.4.3 Implementation Details

- **Reward Types**:
  - **Badges**: Visual recognition of achievements
  - **Points**: Currency for in-app rewards or discounts
  - **Feature Unlocks**: Access to premium features
  - **Content Unlocks**: Access to exclusive content
  - **Streak Freezes**: Ability to maintain streaks during inactivity
  - **Discounts**: Reduced pricing for premium services

- **Reward Delivery**:
  - Immediate notification for earned rewards
  - Reward history in user profile
  - Expiration management for time-limited rewards

## 3. Event System

### 3.1 Activity Tracking

```typescript
interface ActivityEvent {
  userId: string;
  activityType: string;
  timestamp: Date;
  metadata: Record<string, any>;
  sessionId?: string;
  deviceInfo?: {
    type: 'mobile' | 'web' | 'tablet';
    os?: string;
    browser?: string;
  };
}

interface ActivityTrackingService {
  // Record a user activity
  trackActivity(event: ActivityEvent): Promise<void>;
  
  // Get recent activities for a user
  getUserActivities(userId: string, limit?: number): Promise<ActivityEvent[]>;
  
  // Get activities by type
  getActivitiesByType(userId: string, activityType: string, limit?: number): Promise<ActivityEvent[]>;
  
  // Get activity counts by type
  getActivityCounts(userId: string, activityTypes: string[]): Promise<Record<string, number>>;
}
```

### 3.2 Event Processing

- **Real-time Processing**:
  - WebSocket-based event streaming for immediate updates
  - Event-driven architecture for gamification triggers

- **Batch Processing**:
  - Scheduled jobs for complex calculations and aggregations
  - Daily streak reset and evaluation

- **Event Types**:
  - **User Actions**: Logins, content consumption, therapy sessions
  - **System Events**: Milestone achievements, streak updates
  - **Administrative Events**: Manual rewards, system adjustments

## 4. Frontend Integration

### 4.1 UI Components

#### 4.1.1 Streak Display

- Current streak counter with visual indicators
- Countdown to next activity deadline
- Streak history visualization
- Milestone progress indicators

#### 4.1.2 Badge Gallery

- Grid or carousel display of earned badges
- Badge details view with earning criteria
- Progress indicators for in-progress badges
- Badge showcase for profile customization

#### 4.1.3 Achievement Dashboard

- Achievement categories with completion status
- Progress tracking for active achievements
- Step-by-step guides for complex achievements
- Reward previews for upcoming completions

### 4.2 Notification Integration

- Toast notifications for immediate feedback
- Achievement celebration modals for significant milestones
- Daily/weekly digest of progress updates
- Reminder notifications for streak maintenance

### 4.3 API Endpoints

```typescript
// Frontend-facing API endpoints
interface GamificationAPI {
  // Streak endpoints
  GET /api/gamification/streaks
  GET /api/gamification/streaks/:type
  POST /api/gamification/streaks/:type/activity
  
  // Badge endpoints
  GET /api/gamification/badges
  GET /api/gamification/badges/:id
  GET /api/gamification/badges/categories
  
  // Achievement endpoints
  GET /api/gamification/achievements
  GET /api/gamification/achievements/:id
  GET /api/gamification/achievements/recommended
  
  // Reward endpoints
  GET /api/gamification/rewards
  POST /api/gamification/rewards/:id/claim
  
  // Profile endpoints
  GET /api/gamification/profile
  PATCH /api/gamification/profile/showcase
}
```

## 5. Analytics & Reporting

### 5.1 Key Metrics

- **Engagement Metrics**:
  - Active streak counts by type
  - Average streak length
  - Badge completion rates
  - Achievement progression rates

- **Retention Metrics**:
  - Correlation between gamification engagement and platform retention
  - Impact of streaks on session frequency
  - Effect of rewards on user behavior

- **Feature Effectiveness**:
  - Most popular badges and achievements
  - Most effective reward types
  - Gamification feature usage patterns

### 5.2 Reporting Dashboards

- User-level gamification summary
- Cohort analysis by engagement level
- A/B testing results for gamification features
- Trend analysis for engagement patterns

## 6. Security & Privacy

### 6.1 Data Protection

- Encryption of user achievement data
- Privacy controls for visible achievements and badges
- Data minimization in activity tracking

### 6.2 Anti-Abuse Measures

- Rate limiting for activity recording
- Anomaly detection for unusual activity patterns
- Verification mechanisms for high-value achievements

## 7. Implementation Considerations

### 7.1 Database Design

- Optimized schema for high-volume activity tracking
- Efficient indexing for streak and achievement queries
- Caching strategy for frequently accessed gamification data

### 7.2 Scalability

- Horizontal scaling for activity processing
- Asynchronous processing for complex calculations
- Efficient batch processing for daily evaluations

### 7.3 Performance Targets

- Activity tracking latency < 100ms
- Streak update processing < 500ms
- Achievement evaluation < 1s
- UI component rendering < 200ms

## 8. Testing Strategy

### 8.1 Unit Testing

- Core calculation logic for streaks and achievements
- Edge cases for streak maintenance and breaking
- Reward delivery and expiration handling

### 8.2 Integration Testing

- End-to-end flows from activity to reward
- Notification triggering for achievements
- API endpoint validation

### 8.3 User Testing

- Usability testing for gamification UI
- A/B testing for engagement effectiveness
- Satisfaction surveys for reward value perception

## 9. Rollout Strategy

### 9.1 Phased Implementation

1. **Phase 1**: Basic streak system and simple badges
2. **Phase 2**: Achievement system and expanded badges
3. **Phase 3**: Advanced rewards and personalization
4. **Phase 4**: Social features and leaderboards (optional)

### 9.2 Feature Flags

- Gradual rollout with feature flags
- A/B testing for engagement impact
- Easy rollback capability for problematic features

## 10. Maintenance & Evolution

### 10.1 Content Updates

- Regular addition of new badges and achievements
- Seasonal and special event gamification elements
- Refreshing of existing content to maintain engagement

### 10.2 System Tuning

- Adjustment of difficulty levels based on user data
- Optimization of reward schedules for maximum impact
- Performance tuning for growing user base

## Appendix A: Activity Type Reference

| Activity Type | Description | Applicable Gamification |
|--------------|-------------|-------------------------|
| login | User logs into the platform | Daily login streak |
| session_attendance | User attends a therapy session | Therapy attendance streak, Session badges |
| content_consumption | User consumes educational content | Learning badges, Content achievements |
| assessment_completion | User completes a wellness assessment | Assessment badges, Wellness journey achievements |
| exercise_completion | User completes a mental health exercise | Practice streak, Skill-building achievements |
| goal_setting | User sets a personal goal | Goal-setting badges, Personal growth achievements |
| goal_progress | User makes progress toward a goal | Progress badges, Achievement steps |
| goal_completion | User completes a personal goal | Milestone badges, Achievement completion |
| feedback_provision | User provides feedback | Community badges |
| profile_update | User updates their profile | Profile completion badges |
| referral | User refers someone to the platform | Community achievements |

## Appendix B: Reward Type Reference

| Reward Type | Description | Implementation Considerations |
|------------|-------------|------------------------------|
| badge | Visual recognition displayed on profile | Storage of badge earning history |
| points | Virtual currency for in-app rewards | Point balance management, anti-fraud measures |
| feature_unlock | Access to premium features | Feature access control integration |
| content_unlock | Access to exclusive content | Content access control integration |
| streak_freeze | Maintain streak during inactivity | Limit quantity, clear usage instructions |
| discount | Reduced pricing for premium services | Integration with payment system, expiration handling |
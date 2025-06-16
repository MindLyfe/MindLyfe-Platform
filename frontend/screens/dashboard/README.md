# Dashboard Screens Documentation

## Overview
The Dashboard screens provide a comprehensive wellness overview for users of the MindLyfe platform. The dashboard aggregates data from multiple services including therapy sessions, mental health metrics, community engagement, gamification progress, and personal wellness tracking to create a personalized wellness summary.

## 🏠 Core Features
- Personalized wellness summary with real-time metrics
- Therapy session tracking and progress visualization
- Mental health metrics and mood tracking
- Community engagement and social connections
- Gamification progress with streaks, badges, and achievements
- Quick actions for immediate access to key features
- Customizable dashboard widgets and layouts
- Real-time notifications and updates
- Analytics and insights for personal growth

## 📱 Screen Specifications

### 1. Main Dashboard (`/dashboard`)

#### Purpose
Central hub displaying personalized wellness overview with key metrics and quick actions.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [☰] Good morning, John    [🔔] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🌟 Wellness Summary         │ │
│ │                             │ │
│ │ Overall Score: 78/100       │ │
│ │ ████████████████░░░░         │ │
│ │                             │ │
│ │ 🎯 Goals: 3/5 completed     │ │
│ │ 🔥 Current streak: 12 days  │ │
│ │ 📈 Mood trend: Improving    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Today's Progress            │ │
│ │                             │ │
│ │ ✅ Morning mood check       │ │
│ │ ⏳ Therapy session (3 PM)   │ │
│ │ ⏳ Meditation (5 PM)        │ │
│ │ ⏳ Evening reflection       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Quick Actions               │ │
│ │                             │ │
│ │ [💬 Chat with LyfBot]       │ │
│ │ [📝 Journal Entry]          │ │
│ │ [🧘 Start Meditation]       │ │
│ │ [👥 Community Feed]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Recent Activity             │ │
│ │                             │ │
│ │ 🏆 Earned "Mindful Week"    │ │
│ │ 💬 3 new community replies  │ │
│ │ 📊 Weekly report ready      │ │
│ │ 🎯 Goal milestone reached   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `GET /api/analytics/overview?userId={userId}&timeframe=today`
- **User Metrics**: Real-time wellness score calculation
- **Activity Tracking**: Daily progress and goal completion
- **Notifications**: Recent achievements and updates

### 2. Wellness Analytics (`/dashboard/analytics`)

#### Purpose
Detailed analytics view showing wellness trends, progress charts, and insights.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Wellness Analytics     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [7 Days][30 Days][3 Months] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Mood Tracking               │ │
│ │                             │ │
│ │ Average: 7.2/10 (↗️ +0.8)   │ │
│ │                             │ │
│ │ 10 ┌─────────────────────┐   │ │
│ │  8 │     ╭─╮     ╭─╮     │   │ │
│ │  6 │   ╭─╯ ╰─╮ ╭─╯ ╰─╮   │   │ │
│ │  4 │ ╭─╯     ╰─╯     ╰─╮ │   │ │
│ │  2 │╱                 ╲│   │ │
│ │  0 └─────────────────────┘   │ │
│ │    Mon Tue Wed Thu Fri Sat   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Activity Summary            │ │
│ │                             │ │
│ │ 🧘 Meditation: 5 sessions   │ │
│ │ 📝 Journal: 7 entries       │ │
│ │ 👨‍⚕️ Therapy: 2 sessions    │ │
│ │ 💬 LyfBot: 12 conversations │ │
│ │ 👥 Community: 15 posts      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Insights & Recommendations  │ │
│ │                             │ │
│ │ 💡 Your mood improves on    │ │
│ │    days with meditation     │ │
│ │                             │ │
│ │ 📈 Therapy sessions show    │ │
│ │    positive correlation     │ │
│ │    with wellness score      │ │
│ │                             │ │
│ │ 🎯 Consider adding morning  │ │
│ │    routine for consistency  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `GET /api/analytics/users/metrics?userId={userId}&period=30d`
- **Mood Analytics**: Trend analysis and correlation insights
- **Activity Metrics**: Cross-service engagement tracking
- **AI Insights**: Personalized recommendations based on patterns

### 3. Progress Tracking (`/dashboard/progress`)

#### Purpose
Track progress towards wellness goals, therapy milestones, and personal achievements.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Progress Tracking      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Current Goals (3/5)         │ │
│ │                             │ │
│ │ 🎯 Daily meditation         │ │
│ │    ████████████████░░░░     │ │
│ │    12/15 days (80%)         │ │
│ │                             │ │
│ │ 📝 Weekly journaling        │ │
│ │    ████████████████████     │ │
│ │    4/4 weeks (100%) ✅      │ │
│ │                             │ │
│ │ 👥 Community engagement     │ │
│ │    ████████░░░░░░░░░░░░     │ │
│ │    8/15 posts (53%)         │ │
│ │                             │ │
│ │ 🧘 Mindfulness practice     │ │
│ │    ████████████████████     │ │
│ │    21/21 days (100%) ✅     │ │
│ │                             │ │
│ │ 💪 Therapy consistency      │ │
│ │    ████████████░░░░░░░░     │ │
│ │    6/8 sessions (75%)       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Milestones Achieved         │ │
│ │                             │ │
│ │ 🏆 30-Day Meditation Streak │ │
│ │    Completed Jan 15, 2024   │ │
│ │                             │ │
│ │ 📚 Completed Anxiety Course │ │
│ │    Completed Jan 10, 2024   │ │
│ │                             │ │
│ │ 🤝 First Community Post     │ │
│ │    Completed Jan 5, 2024    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Upcoming Milestones         │ │
│ │                             │ │
│ │ 🎯 50-Day Login Streak      │ │
│ │    3 days remaining         │ │
│ │                             │ │
│ │ 📖 Complete CBT Module      │ │
│ │    2 sessions remaining     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Set New Goal] [View All Goals] │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `GET /api/analytics/users/progress?userId={userId}`
- **Goal Tracking**: Personal wellness goals with completion metrics
- **Milestone System**: Achievement tracking across all platform features
- **Progress Analytics**: Detailed progress visualization and trends

### 4. Notifications Center (`/dashboard/notifications`)

#### Purpose
Centralized view of all notifications, updates, and important information.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Notifications     [⚙️] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [All][Unread][Therapy][Community]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔴 Today                    │ │
│ │                             │ │
│ │ 🏆 Achievement Unlocked     │ │
│ │    You earned "Mindful Week"│ │
│ │    2 hours ago              │ │
│ │                             │ │
│ │ 👨‍⚕️ Session Reminder       │ │
│ │    Therapy with Dr. Johnson │ │
│ │    in 1 hour                │ │
│ │                             │ │
│ │ 💬 New Message              │ │
│ │    LyfBot has insights      │ │
│ │    about your mood          │ │
│ │    3 hours ago              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Yesterday                   │ │
│ │                             │ │
│ │ 📊 Weekly Report Ready      │ │
│ │    Your wellness summary    │ │
│ │    is available             │ │
│ │                             │ │
│ │ 👥 Community Activity       │ │
│ │    3 people liked your post │ │
│ │                             │ │
│ │ 🎯 Goal Milestone           │ │
│ │    Meditation streak: 10    │ │
│ │    days achieved            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ This Week                   │ │
│ │                             │ │
│ │ 📚 New Resource Available   │ │
│ │    "Managing Anxiety"       │ │
│ │    course added             │ │
│ │                             │ │
│ │ 🔄 System Update            │ │
│ │    New features available   │ │
│ │    in the app               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `GET /api/notifications?userId={userId}&status=all`
- **Real-time Updates**: WebSocket connection for live notifications
- **Categorization**: Filtered views by notification type
- **Action Items**: Direct links to relevant features

### 5. Quick Actions Hub (`/dashboard/actions`)

#### Purpose
Fast access to frequently used features and emergency support options.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Quick Actions          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🚨 Emergency Support        │ │
│ │                             │ │
│ │ [Crisis Chat] [Call Hotline]│ │
│ │ [Emergency Contacts]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Daily Wellness              │ │
│ │                             │ │
│ │ [📝 Mood Check-in]          │ │
│ │ [🧘 5-Min Meditation]       │ │
│ │ [📖 Journal Entry]          │ │
│ │ [💬 Chat with LyfBot]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Therapy & Support           │ │
│ │                             │ │
│ │ [👨‍⚕️ Book Session]         │ │
│ │ [📋 Session Notes]          │ │
│ │ [💊 Medication Reminder]    │ │
│ │ [📞 Contact Therapist]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Community & Learning        │ │
│ │                             │ │
│ │ [👥 Community Feed]         │ │
│ │ [📚 Browse Resources]       │ │
│ │ [🎓 Continue Course]        │ │
│ │ [🏆 View Achievements]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Settings & Account          │ │
│ │                             │ │
│ │ [⚙️ App Settings]           │ │
│ │ [🔒 Privacy Controls]       │ │
│ │ [💳 Subscription]           │ │
│ │ [📊 Export Data]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
- **Crisis Support**: Direct integration with crisis intervention services
- **Feature Shortcuts**: Deep links to all major platform features
- **Personalization**: Customizable action buttons based on user preferences

### 6. Customizable Widgets (`/dashboard/customize`)

#### Purpose
Allow users to customize their dashboard layout with personalized widgets.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Customize Dashboard    │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Available Widgets           │ │
│ │                             │ │
│ │ [📊 Mood Chart] [+]         │ │
│ │ [🏆 Achievements] [+]       │ │
│ │ [📅 Upcoming Sessions] [+]  │ │
│ │ [🎯 Goal Progress] [+]      │ │
│ │ [👥 Community Feed] [+]     │ │
│ │ [📈 Wellness Score] [+]     │ │
│ │ [🔥 Streaks] [+]            │ │
│ │ [📝 Recent Journals] [+]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Current Layout              │ │
│ │                             │ │
│ │ ┌─────────┐ ┌─────────┐     │ │
│ │ │Wellness │ │ Mood    │ [×] │ │
│ │ │Score    │ │ Chart   │     │ │
│ │ └─────────┘ └─────────┘     │ │
│ │                             │ │
│ │ ┌─────────────────────┐     │ │
│ │ │ Goal Progress       │ [×] │ │
│ │ └─────────────────────┘     │ │
│ │                             │ │
│ │ ┌─────────┐ ┌─────────┐     │ │
│ │ │Streaks  │ │Community│ [×] │ │
│ │ │         │ │Feed     │     │ │
│ │ └─────────┘ └─────────┘     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Widget Settings             │ │
│ │                             │ │
│ │ Refresh Rate:               │ │
│ │ ● Real-time ○ 1 min ○ 5 min│ │
│ │                             │ │
│ │ Theme:                      │ │
│ │ ● Light ○ Dark ○ Auto      │ │
│ │                             │ │
│ │ Animations:                 │ │
│ │ ☑ Enable transitions       │ │
│ │ ☑ Auto-refresh indicators   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Layout] [Reset to Default]│
└─────────────────────────────────┘
```

#### API Integration
- **Endpoint**: `GET/PUT /api/dashboards/widgets?userId={userId}`
- **Widget Configuration**: Customizable dashboard layouts
- **Real-time Updates**: Live data refresh for all widgets
- **Personalization**: User-specific widget preferences

## 🔄 Screen Flow Patterns

### Dashboard Navigation Flow
```
Main Dashboard
├─ Wellness Analytics → Detailed Charts → Insights → Recommendations
├─ Progress Tracking → Goal Details → Milestone History → New Goals
├─ Notifications Center → Notification Details → Action Items → Feature Access
├─ Quick Actions → Feature Shortcuts → Emergency Support → Direct Access
└─ Customize Dashboard → Widget Selection → Layout Configuration → Save Preferences

Data Integration Flow
├─ User Metrics → Real-time Aggregation → Dashboard Display → Action Triggers
├─ Cross-Service Data → Analytics Processing → Insight Generation → User Notifications
├─ Goal Tracking → Progress Calculation → Milestone Detection → Achievement Unlocks
└─ Wellness Scoring → Multi-factor Analysis → Trend Identification → Personalized Recommendations
```

## 📊 Performance Metrics

### Dashboard Performance
- **Load Time**: < 2 seconds for initial dashboard load
- **Widget Refresh**: < 500ms for individual widget updates
- **Real-time Updates**: WebSocket connection for live data
- **Data Accuracy**: 99.9% accuracy for wellness metrics

### User Engagement
- **Daily Dashboard Views**: Track user engagement with dashboard
- **Widget Interaction**: Monitor most-used dashboard features
- **Goal Completion**: Track progress towards wellness goals
- **Feature Adoption**: Monitor usage of quick actions and shortcuts

## 🔒 Security & Privacy

### Data Protection
- **Personal Metrics**: Encrypted storage of all wellness data
- **Analytics Privacy**: Anonymized data aggregation where possible
- **User Consent**: Explicit consent for data collection and analysis
- **Data Retention**: Configurable data retention policies

### Access Control
- **User-Specific Data**: Dashboard shows only user's own data
- **Role-Based Access**: Different dashboard views for different user types
- **Session Security**: Secure session management for dashboard access
- **API Security**: JWT-based authentication for all dashboard endpoints

### Wellness Data Integration
- **Multi-Service Aggregation**: Data from therapy, community, gamification, and AI services
- **Real-time Analytics**: Live wellness score calculation and trend analysis
- **Personalized Insights**: AI-powered recommendations based on user patterns
- **Goal-Oriented Design**: Focus on user wellness goals and progress tracking

---

This documentation provides comprehensive coverage of all dashboard screens based on the actual backend implementation, focusing on user wellness tracking, analytics integration, and personalized dashboard experiences for the MindLyfe platform. 
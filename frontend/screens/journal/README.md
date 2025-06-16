# Journal Screens Documentation

## Overview
The journal screens provide comprehensive digital journaling capabilities with AI-powered insights, mood tracking integration, and privacy-focused design. All screens are optimized for reflective writing and personal growth.

## 📝 Core Features
- Rich text journaling with multimedia support
- AI-powered writing prompts and insights
- Mood and emotion tracking integration
- Privacy controls and encryption
- Analytics and progress visualization
- Export and backup capabilities

## 📱 Screen Specifications

### 1. Journal Dashboard (`/journal`)

#### Purpose
Central hub for journal management with entry overview, analytics, and quick access to writing tools.

#### Mobile-First Design
- **Card-based Layout**: Recent entries displayed as cards
- **Quick Actions**: Fast access to new entry creation
- **Visual Analytics**: Charts and graphs for mood trends
- **Search Integration**: Find entries by date, mood, or keywords
- **Privacy Indicators**: Clear visibility of privacy settings

#### UI Components
```typescript
interface JournalDashboardProps {
  recentEntries: JournalEntry[];
  analytics: JournalAnalytics;
  prompts: WritingPrompt[];
  streakData: StreakData;
  onCreateEntry: () => void;
  onViewEntry: (entryId: string) => void;
  onViewAnalytics: () => void;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodLevel;
  emotions: Emotion[];
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  tags: string[];
  isPrivate: boolean;
  hasMedia: boolean;
  aiInsights?: AIInsight[];
}

interface JournalAnalytics {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number;
  moodTrend: MoodTrendData[];
  topEmotions: EmotionFrequency[];
  writingFrequency: FrequencyData[];
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Journal          [⚙️] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 Your Journey             │ │
│ │ 🔥 7-day streak             │ │
│ │ 📝 23 entries this month    │ │
│ │ 😊 Average mood: Good       │ │
│ │ [View Full Analytics]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✏️ Quick Actions            │ │
│ │ [New Entry] [Voice Note]    │ │
│ │ [Photo Journal] [Mood Check]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💡 Today's Prompt           │ │
│ │ "What are three things you  │ │
│ │ are grateful for today?"    │ │
│ │ [Start Writing]             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Recent Entries              │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Today, 2:30 PM          │ │ │
│ │ │ "Feeling grateful..."   │ │ │
│ │ │ 😊 Happy • 156 words    │ │ │
│ │ │ 🔒 Private              │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Yesterday, 9:15 PM      │ │ │
│ │ │ "Challenging day at..." │ │ │
│ │ │ 😐 Neutral • 234 words  │ │ │
│ │ │ 🔒 Private              │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [View All Entries]          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get journal dashboard data
GET /api/journal/dashboard
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "analytics": {
      "totalEntries": 156,
      "currentStreak": 7,
      "longestStreak": 23,
      "averageMood": 4.2,
      "moodTrend": [
        {"date": "2024-01-15", "mood": 4},
        {"date": "2024-01-14", "mood": 5},
        {"date": "2024-01-13", "mood": 3}
      ],
      "topEmotions": [
        {"emotion": "grateful", "frequency": 45},
        {"emotion": "anxious", "frequency": 32},
        {"emotion": "hopeful", "frequency": 28}
      ]
    },
    "recentEntries": [
      {
        "id": "entry_123",
        "title": "Feeling grateful today",
        "content": "Today was a good day. I'm feeling grateful for...",
        "mood": 5,
        "emotions": ["grateful", "happy", "content"],
        "createdAt": "2024-01-15T14:30:00Z",
        "wordCount": 156,
        "tags": ["gratitude", "work"],
        "isPrivate": true,
        "hasMedia": false
      }
    ],
    "todaysPrompt": {
      "id": "prompt_456",
      "text": "What are three things you are grateful for today?",
      "category": "gratitude",
      "difficulty": "easy"
    }
  }
}
```

---

### 2. Entry Editor (`/journal/write`)

#### Purpose
Rich text editor for creating and editing journal entries with multimedia support and AI assistance.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] New Entry        [💾] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Title: "Today's thoughts"] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 😊 How are you feeling?     │ │
│ │ 😢 😐 😊 😄 🤩             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Today was a really good day.│ │
│ │ I woke up feeling energized │ │
│ │ and ready to tackle my      │ │
│ │ goals. The morning          │ │
│ │ meditation session helped   │ │
│ │ me center myself and...     │ │
│ │                             │ │
│ │ [Continue writing...]       │ │
│ │                             │ │
│ │ 📝 156 words • 2 min read   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏷️ Tags                     │ │
│ │ [gratitude] [meditation]    │ │
│ │ [+ Add tag]                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📎 Attachments              │ │
│ │ [📷 Photo] [🎤 Voice] [📍 Location]│
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔒 Privacy                  │ │
│ │ ● Private (only you)        │ │
│ │ ○ Share with therapist      │ │
│ │ ○ Anonymous community share │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🤖 AI Suggestions           │ │
│ │ "Consider exploring what    │ │
│ │ specific aspects of         │ │
│ │ meditation helped you most" │ │
│ │ [Use Suggestion]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Draft] [Publish Entry]    │
└─────────────────────────────────┘
```

---

### 3. Entry Analytics (`/journal/analytics`)

#### Purpose
Comprehensive analytics dashboard showing writing patterns, mood trends, and personal insights.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Journal Analytics      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 Writing Overview         │ │
│ │ Total entries: 156          │ │
│ │ Current streak: 7 days      │ │
│ │ Longest streak: 23 days     │ │
│ │ Average words: 234          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📈 Mood Trends (30 days)    │ │
│ │                             │ │
│ │     5 ●                     │ │
│ │     4   ●   ●               │ │
│ │     3     ●   ●   ●         │ │
│ │     2         ●             │ │
│ │     1                       │ │
│ │     ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐   │ │
│ │     1 5 10 15 20 25 30      │ │
│ │                             │ │
│ │ Average mood: 4.2/5 (Good)  │ │
│ │ Trend: ↗️ Improving         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎭 Top Emotions             │ │
│ │ 1. Grateful (45 mentions)   │ │
│ │ 2. Anxious (32 mentions)    │ │
│ │ 3. Hopeful (28 mentions)    │ │
│ │ 4. Content (25 mentions)    │ │
│ │ 5. Excited (22 mentions)    │ │
│ │ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📅 Writing Frequency        │ │
│ │ Mon ████████ 8 entries      │ │
│ │ Tue ██████ 6 entries        │ │
│ │ Wed ████████ 8 entries      │ │
│ │ Thu ████ 4 entries          │ │
│ │ Fri ██████ 6 entries        │ │
│ │ Sat ██████████ 10 entries   │ │
│ │ Sun ████████████ 12 entries │ │
│ │                             │ │
│ │ Best writing day: Sunday    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏷️ Popular Tags             │ │
│ │ #gratitude #work #anxiety   │ │
│ │ #meditation #goals #family  │ │
│ │ #therapy #progress #hope    │ │
│ │ └─────────────────────────────┘ │
│                                 │
│ [Export Data] [Share Progress]  │
└─────────────────────────────────┘
```

---

### 4. Entry History (`/journal/history`)

#### Purpose
Chronological view of all journal entries with search, filter, and organization capabilities.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Entry History     [🔍] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Search entries...]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [All][This Week][This Month]│ │
│ │ [Mood: All ▼][Tags: All ▼] │ │
│ │ └─────────────────────────────┘ │
│                                 │
│ Today - January 15, 2024        │
│ ┌─────────────────────────────┐ │
│ │ 2:30 PM • "Feeling grateful"│ │
│ │ 😊 Happy • 156 words        │ │
│ │ #gratitude #work            │ │
│ │ [View] [Edit] [Share]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Yesterday - January 14, 2024    │
│ ┌─────────────────────────────┐ │
│ │ 9:15 PM • "Challenging day" │ │
│ │ 😐 Neutral • 234 words      │ │
│ │ #anxiety #coping            │ │
│ │ [View] [Edit] [Share]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 7:45 AM • "Morning thoughts"│ │
│ │ 😊 Happy • 189 words        │ │
│ │ #meditation #goals          │ │
│ │ [View] [Edit] [Share]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ January 13, 2024                │
│ ┌─────────────────────────────┐ │
│ │ 8:30 PM • "Therapy session" │ │
│ │ 😊 Happy • 312 words        │ │
│ │ #therapy #breakthrough      │ │
│ │ [View] [Edit] [Share]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Load More Entries]             │
└─────────────────────────────────┘
```

---

### 5. Writing Prompts (`/journal/prompts`)

#### Purpose
Curated collection of writing prompts to inspire reflection and personal growth.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Writing Prompts        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Daily][Gratitude][Growth]  │ │
│ │ [Anxiety][Goals][Reflection]│ │
│ │ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🌟 Featured Prompt          │ │
│ │                             │ │
│ │ "What are three things you  │ │
│ │ learned about yourself this │ │
│ │ week? How can you use these │ │
│ │ insights to grow?"          │ │
│ │                             │ │
│ │ Category: Self-Reflection   │ │
│ │ Difficulty: Medium          │ │
│ │ [Start Writing]             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💡 Daily Prompts            │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "What made you smile    │ │ │
│ │ │ today, even if it was   │ │ │
│ │ │ something small?"       │ │ │
│ │ │ Gratitude • Easy        │ │ │
│ │ │ [Write] [Save for Later]│ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "Describe a challenge   │ │ │
│ │ │ you overcame recently.  │ │ │
│ │ │ What did you learn?"    │ │ │
│ │ │ Growth • Medium         │ │ │
│ │ │ [Write] [Save for Later]│ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "What would you tell    │ │ │
│ │ │ your younger self about │ │ │
│ │ │ handling anxiety?"      │ │ │
│ │ │ Anxiety • Medium        │ │ │
│ │ │ [Write] [Save for Later]│ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "What are three things   │ │ │
│ │ │ you are grateful for     │ │ │
│ │ │ today?"                  │ │ │
│ │ │ Gratitude • Medium       │ │ │
│ │ │ [Write] [Save for Later] │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📚 Saved Prompts (5)        │ │
│ │ [View Saved Prompts]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Personalized Suggestions │ │
│ │ Based on your recent entries│ │
│ │ and mood patterns           │ │
│ │ [View Suggestions]          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 6. Privacy Settings (`/journal/privacy`)

#### Purpose
Comprehensive privacy controls for journal entries and data sharing preferences.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Privacy Settings       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔒 Default Privacy          │ │
│ │                             │ │
│ │ New entries are:            │ │
│ │ ● Private (only you)        │ │
│ │ ○ Share with therapist      │ │
│ │ ○ Anonymous community share │ │
│ │                             │ │
│ │ [Update Default]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👨‍⚕️ Therapist Sharing       │ │
│ │                             │ │
│ │ Share journal insights with │ │
│ │ your therapist:             │ │
│ │ [Toggle: ON] 🔄             │ │
│ │                             │ │
│ │ Share mood trends:          │ │
│ │ [Toggle: ON] 📈             │ │
│ │                             │ │
│ │ Share entry summaries:      │ │
│ │ [Toggle: OFF] 📝            │ │
│ │                             │ │
│ │ [Manage Sharing]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🤖 AI Analysis              │ │
│ │                             │ │
│ │ Allow AI to analyze entries │ │
│ │ for insights:               │ │
│ │ [Toggle: ON] 🧠             │ │
│ │                             │ │
│ │ Include in mood predictions:│ │
│ │ [Toggle: ON] 🔮             │ │
│ │                             │ │
│ │ Generate writing suggestions:│ │
│ │ [Toggle: ON] ✍️             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💾 Data Management          │ │
│ │                             │ │
│ │ Auto-backup entries:        │ │
│ │ [Toggle: ON] ☁️             │ │
│ │                             │ │
│ │ Retention period:           │ │
│ │ [Forever ▼]                 │ │
│ │                             │ │
│ │ [Export All Data]           │ │
│ │ [Delete All Entries]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔐 Security                 │ │
│ │                             │ │
│ │ Require authentication:     │ │
│ │ [Toggle: ON] 🔑             │ │
│ │                             │ │
│ │ Biometric lock:             │ │
│ │ [Toggle: ON] 👆             │ │
│ │                             │ │
│ │ Auto-lock after:            │ │
│ │ [5 minutes ▼]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Settings]                 │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get journal entries
GET /api/journal/entries?page=1&limit=20&filter=all
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry_123",
        "title": "Feeling grateful today",
        "content": "Today was a good day...",
        "mood": 5,
        "emotions": ["grateful", "happy"],
        "createdAt": "2024-01-15T14:30:00Z",
        "wordCount": 156,
        "tags": ["gratitude", "work"],
        "isPrivate": true,
        "aiInsights": [
          {
            "type": "mood_pattern",
            "insight": "Your mood has been consistently positive when writing about work achievements",
            "confidence": 0.85
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "hasMore": true
    }
  }
}

// Create journal entry
POST /api/journal/entries
Authorization: Bearer {access_token}

Request Body:
{
  "title": "Today's reflections",
  "content": "I'm feeling grateful for the progress I've made...",
  "mood": 4,
  "emotions": ["grateful", "hopeful"],
  "tags": ["gratitude", "progress"],
  "isPrivate": true,
  "shareWithTherapist": false
}

Response:
{
  "success": true,
  "data": {
    "entryId": "entry_456",
    "aiInsights": [
      {
        "type": "writing_suggestion",
        "suggestion": "Consider exploring what specific aspects of your progress feel most meaningful",
        "confidence": 0.78
      }
    ],
    "moodTrend": "improving",
    "streakUpdated": true,
    "newStreak": 8
  }
}
```

## 🔄 Screen Flow Patterns

### Journal Writing Flow
```
Journal Dashboard
├─ New Entry → Editor → Mood Selection → Privacy Settings → Publish
├─ Prompt-based Writing → Prompt Selection → Editor → Reflection → Save
├─ Voice Journaling → Voice Recording → Transcription → Review → Save
└─ Photo Journaling → Image Capture → Caption Writing → Mood Tagging → Save

Analytics & Insights
├─ Dashboard Analytics → Detailed Charts → Trend Analysis → Insights
├─ Mood Tracking → Pattern Recognition → Predictions → Recommendations
├─ Writing Patterns → Frequency Analysis → Habit Formation → Goals
└─ AI Insights → Personal Growth → Therapy Integration → Progress Tracking

Privacy & Security
├─ Entry Privacy → Individual Settings → Bulk Updates → Sharing Controls
├─ Data Management → Export Options → Backup Settings → Retention Policies
├─ Therapist Sharing → Consent Management → Selective Sharing → Review Process
└─ Security Settings → Authentication → Biometric Lock → Auto-lock Configuration
```

## 📊 Performance Metrics

### Writing Engagement
- **Daily Active Writers**: Users creating entries daily
- **Writing Streak**: Consecutive days of journaling
- **Entry Completion**: Percentage of started entries completed
- **Word Count Trends**: Average words per entry over time

### Emotional Insights
- **Mood Tracking Accuracy**: Correlation between mood and content
- **Emotional Range**: Diversity of emotions expressed
- **Progress Indicators**: Positive trend identification
- **Crisis Detection**: Early warning system effectiveness

## 🔒 Privacy & Security

### Data Protection
- End-to-end encryption for all journal entries
- Local device storage with cloud backup options
- Granular privacy controls per entry
- Secure deletion and data retention policies

### AI Ethics
- Transparent AI analysis with user consent
- No personal data used for model training without permission
- Clear explanation of AI insights and limitations
- User control over AI feature usage

---

This documentation provides comprehensive coverage of all journal screens with privacy-first design, AI-powered insights, and therapeutic integration capabilities. 
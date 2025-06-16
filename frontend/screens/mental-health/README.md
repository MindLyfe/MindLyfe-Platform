# Mental Health Screens Documentation

## Overview
The mental health screens provide comprehensive assessment tools, mood tracking, wellness monitoring, and goal management. All screens are designed with clinical accuracy and mobile-first user experience.

## 🧠 Core Features
- Initial mental health assessment
- Daily mood tracking and analytics
- Wellness dashboard with insights
- Goal setting and progress tracking
- Crisis assessment and intervention
- Professional recommendations

## 📱 Screen Specifications

### 1. Initial Assessment (`/mental-health/assessment`)

#### Purpose
Comprehensive mental health evaluation using validated clinical instruments and AI-powered analysis.

#### Mobile-First Design
- **Progressive Disclosure**: Questions revealed progressively
- **Visual Scales**: Touch-friendly rating scales
- **Progress Indicators**: Clear completion status
- **Adaptive Questioning**: AI-driven question selection
- **Accessibility**: Screen reader compatible

#### UI Components
```typescript
interface AssessmentProps {
  questions: AssessmentQuestion[];
  currentQuestion: number;
  responses: AssessmentResponse[];
  onAnswer: (questionId: string, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
}

interface AssessmentQuestion {
  id: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'boolean';
  category: string;
  question: string;
  description?: string;
  options?: string[];
  scale?: {
    min: number;
    max: number;
    labels: string[];
  };
  required: boolean;
  skipLogic?: SkipLogic;
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Mental Health Assessment│
│                                 │
│ ████████████░░░░ 75% Complete   │
│                                 │
│ Question 15 of 20               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Over the past 2 weeks, how  │ │
│ │ often have you been bothered│ │
│ │ by feeling down, depressed, │ │
│ │ or hopeless?                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ○ Not at all                │ │
│ │ ○ Several days              │ │
│ │ ● More than half the days   │ │
│ │ ○ Nearly every day          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Additional notes (optional) │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ [Text area]             │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Previous]           [Next]     │
│                                 │
│ ⚠️ This assessment is not a     │
│ substitute for professional     │
│ medical advice                  │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get assessment questions
GET /api/mental-health/assessment/initial
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "assessmentId": "assessment_123",
    "questions": [
      {
        "id": "phq9_1",
        "type": "multiple_choice",
        "category": "depression",
        "question": "Over the past 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
        "options": [
          "Not at all",
          "Several days", 
          "More than half the days",
          "Nearly every day"
        ],
        "required": true
      }
    ],
    "categories": [
      "depression",
      "anxiety", 
      "stress",
      "sleep",
      "social_functioning"
    ]
  }
}

// Submit assessment responses
POST /api/mental-health/assessment/initial
Authorization: Bearer {access_token}

Request Body:
{
  "assessmentId": "assessment_123",
  "responses": [
    {
      "questionId": "phq9_1",
      "answer": "More than half the days",
      "score": 2
    }
  ],
  "completedAt": "2024-01-15T10:30:00Z"
}

Response:
{
  "success": true,
  "data": {
    "assessmentId": "assessment_123",
    "overallScore": 15,
    "categoryScores": {
      "depression": 8,
      "anxiety": 6,
      "stress": 7
    },
    "riskLevel": "moderate",
    "recommendations": [
      "Consider speaking with a mental health professional",
      "Practice daily mindfulness exercises",
      "Maintain regular sleep schedule"
    ],
    "nextSteps": [
      {
        "action": "book_therapy",
        "title": "Book Therapy Session",
        "description": "Connect with a licensed therapist"
      }
    ]
  }
}
```

---

### 2. Daily Mood Tracker (`/mental-health/mood`)

#### Purpose
Simple, engaging daily mood logging with emotion tracking and contextual insights.

#### Mobile-First Design
- **Visual Mood Scale**: Emoji-based mood selection
- **Quick Entry**: Minimal friction logging
- **Contextual Questions**: Adaptive follow-up questions
- **Streak Tracking**: Gamified consistency
- **Insights**: Pattern recognition and trends

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Daily Mood Check       │
│                                 │
│ How are you feeling today?      │
│ January 15, 2024                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  😢   😕   😐   🙂   😊    │ │
│ │   1    2    3    4    5     │ │
│ │                             │ │
│ │        [Selected: 😊]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ What emotions are you feeling?  │
│ ┌─────────────────────────────┐ │
│ │ [Happy] [Grateful] [Calm]   │ │
│ │ [Excited] [Peaceful]        │ │
│ │ [Confident] [Hopeful]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Any specific triggers today?    │
│ ┌─────────────────────────────┐ │
│ │ [Work] [Family] [Health]    │ │
│ │ [Finances] [Relationships]  │ │
│ │ [Other...]                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Notes (optional)            │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Had a great day at work │ │ │
│ │ │ and spent time with...  │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Mood Entry]               │
│                                 │
│ 🔥 7 day streak!                │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Log mood entry
POST /api/mental-health/mood
Authorization: Bearer {access_token}

Request Body:
{
  "score": 5,
  "emotions": ["happy", "grateful", "calm"],
  "triggers": ["work_success"],
  "activities": ["exercise", "socializing"],
  "notes": "Had a great day at work and spent time with friends",
  "timestamp": "2024-01-15T18:00:00Z"
}

Response:
{
  "success": true,
  "data": {
    "moodId": "mood_123",
    "timestamp": "2024-01-15T18:00:00Z",
    "streakDays": 7,
    "insights": [
      "Your mood has been consistently positive this week",
      "Exercise seems to correlate with better mood scores"
    ],
    "achievements": [
      {
        "id": "week_streak",
        "title": "Week Streak",
        "description": "Logged mood for 7 consecutive days"
      }
    ]
  }
}
```

---

### 3. Wellness Dashboard (`/mental-health/dashboard`)

#### Purpose
Comprehensive overview of mental health metrics, trends, and personalized insights.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Wellness Dashboard     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Current Status              │ │
│ │ Overall Wellness: Good 😊   │ │
│ │ Risk Level: Low ✅          │ │
│ │ Last Check-in: Today        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ This Week's Trends          │ │
│ │     📈 Mood Trend           │ │
│ │ 5 ┌─────────────────────┐   │ │
│ │ 4 │     ╭─╮     ╭─╮     │   │ │
│ │ 3 │   ╭─╯ ╰─╮ ╭─╯ ╰─╮   │   │ │
│ │ 2 │ ╭─╯     ╰─╯     ╰─╮ │   │ │
│ │ 1 │╭╯               ╰─╯│   │ │
│ │   └─────────────────────┘   │ │
│ │   M  T  W  T  F  S  S       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Key Metrics                 │ │
│ │ Average Mood: 4.2/5 ⬆️      │ │
│ │ Sleep Quality: 3.8/5 ➡️     │ │
│ │ Stress Level: 2.1/5 ⬇️      │ │
│ │ Energy Level: 4.0/5 ⬆️      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ AI Insights                 │ │
│ │ 🔍 Your mood improves on    │ │
│ │    days when you exercise   │ │
│ │                             │ │
│ │ 💡 Consider scheduling      │ │
│ │    therapy sessions on      │ │
│ │    Mondays when stress      │ │
│ │    tends to be higher       │ │
│ │                             │ │
│ │ [View All Insights]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Quick Actions               │ │
│ │ [Log Mood] [Take Assessment]│ │
│ │ [Set Goal] [Book Therapy]   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 4. Goal Setting (`/mental-health/goals`)

#### Purpose
SMART goal creation and tracking for mental health improvement with milestone celebrations.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Wellness Goals    [+]  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Active Goals (3)            │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧘 Daily Meditation     │ │ │
│ │ │ Progress: 5/7 days      │ │ │
│ │ │ ████████████░░░  71%    │ │ │
│ │ │ Due: This week          │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📝 Journal 3x/week      │ │ │
│ │ │ Progress: 2/3 entries   │ │ │
│ │ │ ████████░░░░░░░  67%    │ │ │
│ │ │ Due: End of week        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🚶 Walk 30min daily     │ │ │
│ │ │ Progress: 4/7 days      │ │ │
│ │ │ ████████░░░░░░░  57%    │ │ │
│ │ │ Due: This week          │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Completed Goals (12)        │ │
│ │ [View All Achievements]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Goal Templates              │ │
│ │ • Improve sleep schedule    │ │
│ │ • Reduce anxiety levels     │ │
│ │ • Build social connections  │ │
│ │ • Practice mindfulness      │ │
│ │ [Browse All Templates]      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 5. Progress Tracking (`/mental-health/progress`)

#### Purpose
Detailed analytics and visualization of mental health progress over time.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Progress Tracking      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Week][Month][3M][Year]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Overall Wellness Score      │ │
│ │                             │ │
│ │ Current: 7.8/10 ⬆️ +0.5     │ │
│ │                             │ │
│ │ 10 ┌─────────────────────┐  │ │
│ │  8 │         ╭─╮         │  │ │
│ │  6 │       ╭─╯ ╰─╮       │  │ │
│ │  4 │     ╭─╯     ╰─╮     │  │ │
│ │  2 │   ╭─╯         ╰─╮   │  │ │
│ │  0 └─────────────────────┘  │ │
│ │    Jan  Feb  Mar  Apr       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Category Breakdown          │ │
│ │                             │ │
│ │ Mood Stability    8.2/10 ⬆️ │ │
│ │ ████████████████░░░░        │ │
│ │                             │ │
│ │ Stress Management 7.5/10 ⬆️ │ │
│ │ ███████████████░░░░░        │ │
│ │                             │ │
│ │ Sleep Quality     6.8/10 ➡️ │ │
│ │ █████████████░░░░░░░        │ │
│ │                             │ │
│ │ Social Connection 7.9/10 ⬆️ │ │
│ │ ████████████████░░░░        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Milestones Achieved         │ │
│ │ 🏆 30-day mood tracking     │ │
│ │ 🎯 Completed 5 goals        │ │
│ │ 💪 Stress reduced by 20%    │ │
│ │ [View All Achievements]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 6. Crisis Assessment (`/mental-health/crisis`)

#### Purpose
Emergency mental health evaluation with immediate resource provision and professional referrals.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Crisis Assessment      │
│                                 │
│ ⚠️ If you're in immediate       │
│ danger, please call 911         │
│ [Call Emergency Services]       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Quick Safety Check          │ │
│ │                             │ │
│ │ Are you having thoughts of  │ │
│ │ hurting yourself or others? │ │
│ │                             │ │
│ │ [Yes] [No] [Not Sure]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Immediate Support           │ │
│ │                             │ │
│ │ 📞 Crisis Hotline           │ │
│ │ 988 Suicide & Crisis        │ │
│ │ Lifeline                    │ │
│ │ [Call Now]                  │ │
│ │                             │ │
│ │ 💬 Crisis Text Line         │ │
│ │ Text HOME to 741741         │ │
│ │ [Text Now]                  │ │
│ │                             │ │
│ │ 🤖 Talk to LyfBot           │ │
│ │ Immediate AI support        │ │
│ │ [Start Chat]                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Professional Help           │ │
│ │ [Find Emergency Therapist]  │ │
│ │ [Locate Crisis Center]      │ │
│ │ [Contact My Therapist]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Safety Planning             │ │
│ │ [Create Safety Plan]        │ │
│ │ [View My Safety Plan]       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Crisis assessment submission
POST /api/mental-health/crisis/assessment
Authorization: Bearer {access_token}

Request Body:
{
  "responses": [
    {
      "question": "suicidal_ideation",
      "answer": "yes",
      "severity": "high"
    }
  ],
  "immediateHelp": true,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}

Response:
{
  "success": true,
  "data": {
    "crisisId": "crisis_123",
    "riskLevel": "high",
    "immediateResources": [
      {
        "type": "hotline",
        "name": "988 Suicide & Crisis Lifeline",
        "phone": "988",
        "available24h": true
      },
      {
        "type": "text_line",
        "name": "Crisis Text Line",
        "number": "741741",
        "keyword": "HOME"
      }
    ],
    "localResources": [
      {
        "name": "NYC Crisis Center",
        "address": "123 Main St, New York, NY",
        "phone": "+1234567890",
        "distance": "2.3 miles"
      }
    ],
    "escalationTriggered": true,
    "followUpRequired": true
  }
}
```

## 🔄 Screen Flow Patterns

### Mental Health Journey Flow
```
Mental Health Entry
├─ Initial Assessment → Results → Recommendations
├─ Daily Mood Tracker → Mood Entry → Insights
├─ Wellness Dashboard → Metrics → Action Items
├─ Goal Setting → Goal Creation → Progress Tracking
├─ Progress Tracking → Analytics → Milestone Celebration
└─ Crisis Assessment → Emergency Resources → Professional Help

Assessment Flow
├─ Question Categories → Progressive Questions → Scoring
├─ Results Display → Risk Assessment → Recommendations
├─ Next Steps → Professional Referrals → Follow-up
└─ Retake Options → Progress Comparison → Trend Analysis

Mood Tracking Flow
├─ Quick Entry → Mood Scale → Emotion Selection
├─ Context Questions → Triggers → Activities
├─ Notes Entry → Save → Streak Update
└─ Insights Display → Pattern Recognition → Recommendations

Goal Management Flow
├─ Goal Templates → Custom Goals → SMART Criteria
├─ Progress Tracking → Milestone Markers → Celebrations
├─ Goal Adjustment → Timeline Updates → Success Metrics
└─ Completion → Achievement Unlock → New Goal Suggestions
```

## 📊 Performance Metrics

### Clinical Accuracy
- **Assessment Validity**: Validated clinical instruments
- **Risk Detection**: 95%+ accuracy for crisis identification
- **Progress Tracking**: Reliable trend analysis
- **Intervention Timing**: Appropriate resource provision

### User Engagement
- **Daily Mood Logging**: Target 80% completion rate
- **Assessment Completion**: Target 90% completion rate
- **Goal Achievement**: Track success rates
- **Crisis Response**: Monitor intervention effectiveness

## 🔒 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive data
- HIPAA-compliant data handling
- Secure assessment storage
- Privacy-preserving analytics

### Clinical Standards
- Evidence-based assessment tools
- Professional oversight
- Crisis intervention protocols
- Ethical AI implementation

---

This documentation provides comprehensive coverage of all mental health screens with clinical accuracy, mobile-first design, and robust security measures. 
# LyfBot Screens Documentation

## Overview
LyfBot is MindLyfe's AI-powered conversational mental health assistant. It provides personalized mental health support through intelligent conversations, leveraging user insights from journaling, personalized recommendations, and crisis detection capabilities. LyfBot operates as a standalone service that integrates with multiple backend services to provide contextual, personalized responses.

## 🤖 Core Features
- AI-powered conversational mental health support
- Context-aware responses using user data from journal and activity history
- Crisis detection and appropriate emergency response
- Integration with Journal Service for user insights
- Integration with Recommender Service for personalized suggestions
- Conversation history and context management
- Real-time streaming responses for natural conversation flow
- Feedback system for continuous improvement

## 📱 Screen Specifications

### 1. LyfBot Conversation Interface (`/lyfbot`)

#### Purpose
Main conversational interface for interacting with the AI mental health assistant.

#### Mobile-First Design
- **Chat-like Interface**: Familiar messaging interface optimized for mobile
- **Streaming Responses**: Real-time AI response generation with typing indicators
- **Context Awareness**: AI responses consider user's mental health journey
- **Crisis Detection**: Automatic detection of crisis language with appropriate responses
- **Quick Actions**: Suggested responses and common mental health topics

#### UI Components
```typescript
interface LyfBotConversationProps {
  currentConversation: Conversation;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onStartNewConversation: () => void;
  onProvideMessageFeedback: (messageId: string, feedback: MessageFeedback) => void;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessageAt: Date;
  context: ConversationContext;
  status: 'active' | 'archived' | 'crisis_detected';
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    crisisDetected?: boolean;
    recommendationsIncluded?: string[];
    journalInsightsUsed?: boolean;
    responseTime?: number;
  };
  feedback?: MessageFeedback;
}

interface ConversationContext {
  userMoodTrend: 'improving' | 'stable' | 'declining' | 'unknown';
  recentJournalThemes: string[];
  currentGoals: string[];
  preferredCopingStrategies: string[];
  riskLevel: 'low' | 'moderate' | 'high';
}

interface MessageFeedback {
  helpful: boolean;
  accurate: boolean;
  appropriate: boolean;
  comments?: string;
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ [☰] LyfBot Assistant      [⚙️] │
│ 🤖 Your AI Mental Health Guide  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🤖 LyfBot                   │ │
│ │ Hello! I'm here to support │ │
│ │ your mental health journey.│ │
│ │ How are you feeling today? │ │
│ │                       10:00 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ I've been feeling anxious   │ │
│ │ about work lately. It's     │ │
│ │ affecting my sleep.         │ │
│ │ 10:02                  ✓✓   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🤖 LyfBot                   │ │
│ │ I understand work anxiety   │ │
│ │ can be overwhelming. Based  │ │
│ │ on your recent journal      │ │
│ │ entries, I notice this has  │ │
│ │ been a recurring theme.     │ │
│ │                             │ │
│ │ Here are some strategies    │ │
│ │ that might help:            │ │
│ │                             │ │
│ │ 🧘 Progressive muscle       │ │
│ │    relaxation before bed    │ │
│ │ 📝 Write down tomorrow's    │ │
│ │    priorities tonight       │ │
│ │ 🌙 Try the 4-7-8 breathing  │ │
│ │    technique                │ │
│ │                             │ │
│ │ Would you like me to guide  │ │
│ │ you through any of these?   │ │
│ │ 👍 Helpful  👎 Not helpful  │ │
│ │                       10:03 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💭 LyfBot is typing...      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Quick Suggestions:          │ │
│ │ [Breathing Exercise]        │ │
│ │ [Sleep Hygiene Tips]        │ │
│ │ [Work Stress Management]    │ │
│ │ [Crisis Support]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Type your message...]      │ │
│ │ [😊] [🎤]              [➤] │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔒 Secure & Private             │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Send message to LyfBot
POST /api/lyfbot/v1/messages
Authorization: Bearer {access_token}

Request:
{
  "message": "I've been feeling anxious about work lately",
  "conversation_id": "conv_123",
  "stream": true
}

Response (Streaming):
{
  "message_id": "msg_456",
  "conversation_id": "conv_123",
  "response": "I understand work anxiety can be overwhelming...",
  "metadata": {
    "crisis_detected": false,
    "recommendations_included": ["breathing_exercise", "sleep_hygiene"],
    "journal_insights_used": true,
    "response_time": 1.2
  }
}
```

---

### 2. Conversation History (`/lyfbot/conversations`)

#### Purpose
View and manage previous conversations with LyfBot.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Conversation History   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Recent Conversations        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🤖 Work Anxiety Support │ │ │
│ │ │ "I understand work      │ │ │
│ │ │ anxiety can be..."      │ │ │
│ │ │ 15 messages • Today     │ │ │
│ │ │ [Continue] [Archive]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🤖 Sleep Improvement    │ │ │
│ │ │ "Let's work on your     │ │ │
│ │ │ sleep routine..."       │ │ │
│ │ │ 23 messages • Yesterday │ │ │
│ │ │ [Continue] [Archive]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🤖 Coping Strategies    │ │ │
│ │ │ "Here are some          │ │ │
│ │ │ techniques that..."     │ │ │
│ │ │ 8 messages • 3 days ago │ │ │
│ │ │ [Continue] [Archive]    │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Conversation Insights       │ │
│ │                             │ │
│ │ 📊 Total conversations: 12  │ │
│ │ 💬 Total messages: 156      │ │
│ │ 📈 Most discussed: Anxiety  │ │
│ │ 🎯 Progress: Improving      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Start New Conversation]      │
└─────────────────────────────────┘
```

---

### 3. LyfBot Settings (`/lyfbot/settings`)

#### Purpose
Configure LyfBot preferences, privacy settings, and conversation options.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] LyfBot Settings        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Conversation Preferences    │ │
│ │                             │ │
│ │ Response style              │ │
│ │ ● Supportive & Empathetic   │ │
│ │ ○ Direct & Solution-focused │ │
│ │ ○ Gentle & Encouraging      │ │
│ │                             │ │
│ │ Response length             │ │
│ │ ○ Brief                     │ │
│ │ ● Detailed                  │ │
│ │ ○ Comprehensive             │ │
│ │                             │ │
│ │ Include recommendations     │ │
│ │ [Toggle: ON] 💡             │ │
│ │                             │ │
│ │ Use journal insights        │ │
│ │ [Toggle: ON] 📝             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Privacy & Data              │ │
│ │                             │ │
│ │ Save conversation history   │ │
│ │ [Toggle: ON] 💾             │ │
│ │                             │ │
│ │ Share insights with journal │ │
│ │ [Toggle: ON] 🔗             │ │
│ │                             │ │
│ │ Crisis detection            │ │
│ │ [Toggle: ON] 🚨             │ │
│ │                             │ │
│ │ Data retention period       │ │
│ │ [6 months ▼]                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Notifications               │ │
│ │                             │ │
│ │ Daily check-in reminders    │ │
│ │ [Toggle: ON] 🔔             │ │
│ │                             │ │
│ │ Weekly progress summaries   │ │
│ │ [Toggle: ON] 📊             │ │
│ │                             │ │
│ │ Crisis support alerts       │ │
│ │ [Toggle: ON] 🆘             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Data Management             │ │
│ │                             │ │
│ │ [Export Conversations]      │ │
│ │ [Clear History]             │ │
│ │ [Reset Preferences]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Settings]                 │
└─────────────────────────────────┘
```

---

### 4. Crisis Support Interface (`/lyfbot/crisis`)

#### Purpose
Specialized interface when LyfBot detects crisis language or user explicitly requests crisis support.

#### Screen Layout
```
┌─────────────────────────────────┐
│ 🆘 Crisis Support - LyfBot      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🤖 LyfBot                   │ │
│ │ I'm concerned about what    │ │
│ │ you've shared. Your safety  │ │
│ │ and wellbeing are important.│ │
│ │                             │ │
│ │ I'm here to help, but I     │ │
│ │ want to connect you with    │ │
│ │ immediate professional      │ │
│ │ support as well.            │ │
│ │                       Now   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Immediate Support           │ │
│ │                             │ │
│ │ 📞 Crisis Hotline           │ │
│ │ 988 Suicide & Crisis        │ │
│ │ Lifeline (US)               │ │
│ │ [Call Now] [Text Chat]      │ │
│ │                             │ │
│ │ 🚨 Emergency Services       │ │
│ │ If in immediate danger      │ │
│ │ [Call 911] [Emergency Chat] │ │
│ │                             │ │
│ │ 👨‍⚕️ Your Therapist          │ │
│ │ Dr. Sarah Johnson           │ │
│ │ [Call] [Emergency Message]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Immediate Coping Tools      │ │
│ │                             │ │
│ │ 🧘 [Breathing Exercise]     │ │
│ │ 🎵 [Calming Sounds]         │ │
│ │ 📝 [Safety Planning]        │ │
│ │ 🤝 [Trusted Contacts]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Continue with LyfBot        │ │
│ │                             │ │
│ │ I'll stay here with you.    │ │
│ │ Let's talk through this     │ │
│ │ together while you get      │ │
│ │ professional support.       │ │
│ │                             │ │
│ │ [Continue Conversation]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔒 This conversation is         │
│ confidential and secure         │
└─────────────────────────────────┘
```

---

### 5. Personalized Recommendations (`/lyfbot/recommendations`)

#### Purpose
View and interact with AI-generated personalized recommendations from LyfBot conversations.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] LyfBot Recommendations │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Personalized for You        │ │
│ │ Based on your conversations │ │
│ │ and journal insights        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🧘 Mindfulness & Relaxation │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 4-7-8 Breathing         │ │ │
│ │ │ Recommended for anxiety │ │ │
│ │ │ ⭐⭐⭐⭐⭐ (From LyfBot) │ │ │
│ │ │ [Try Now] [Learn More]  │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Progressive Muscle      │ │ │
│ │ │ Relaxation              │ │ │
│ │ │ Great for sleep issues  │ │ │
│ │ │ ⭐⭐⭐⭐⭐ (From LyfBot) │ │ │
│ │ │ [Try Now] [Learn More]  │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📝 Journaling Prompts       │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "What am I grateful     │ │ │
│ │ │ for today?"             │ │ │
│ │ │ Suggested by LyfBot     │ │ │
│ │ │ [Start Journaling]      │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Goal Suggestions         │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Improve Sleep Quality   │ │ │
│ │ │ Based on recent         │ │ │
│ │ │ conversations           │ │ │
│ │ │ [Set Goal] [Customize]  │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📚 Learning Resources       │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Understanding Anxiety   │ │ │
│ │ │ Article • 5 min read    │ │ │
│ │ │ Matches your interests  │ │ │
│ │ │ [Read] [Save for Later] │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 6. Conversation Analytics (`/lyfbot/insights`)

#### Purpose
View insights and analytics from LyfBot conversations to track mental health progress.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Conversation Insights  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Your Progress with LyfBot   │ │
│ │                             │ │
│ │ 📊 Conversations this month │ │
│ │ ████████████████████ 24     │ │
│ │                             │ │
│ │ 📈 Mood trend               │ │
│ │ ↗️ Improving over 2 weeks   │ │
│ │                             │ │
│ │ 🎯 Goals achieved           │ │
│ │ 3 out of 5 active goals     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Common Topics Discussed     │ │
│ │                             │ │
│ │ 1. Work Stress (45%)        │ │
│ │ ████████████████████        │ │
│ │                             │ │
│ │ 2. Sleep Issues (30%)       │ │
│ │ ████████████                │ │
│ │                             │ │
│ │ 3. Anxiety Management (25%) │ │
│ │ ██████████                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Helpful Strategies          │ │
│ │                             │ │
│ │ ⭐ Most effective for you:  │ │
│ │ • Breathing exercises       │ │
│ │ • Progressive muscle        │ │
│ │   relaxation                │ │
│ │ • Journaling prompts        │ │
│ │                             │ │
│ │ 📝 Recommended to try:      │ │
│ │ • Mindfulness meditation   │ │
│ │ • Sleep hygiene routine     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Crisis Support History      │ │
│ │                             │ │
│ │ 🆘 Crisis interventions: 0  │ │
│ │ ✅ All conversations safe   │ │
│ │                             │ │
│ │ 📞 Emergency contacts used: │ │
│ │ None needed this month      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Export Insights] [Share with   │
│ Therapist]                      │
└─────────────────────────────────┘
```

## 🔄 Screen Flow Patterns

### LyfBot Navigation Flow
```
LyfBot Main Interface
├─ Start Conversation → AI Response → Context Integration → Recommendations
├─ View History → Select Conversation → Continue Chat → Updated Context
├─ Settings → Preferences → Privacy Controls → Notification Setup
└─ Crisis Detection → Emergency Resources → Professional Support → Follow-up

AI Integration Flow
├─ User Message → Crisis Detection → Context Gathering → AI Response
├─ Journal Insights → Mood Analysis → Personalized Response → Recommendations
├─ Recommender Service → Activity Suggestions → User Feedback → Learning
└─ Conversation Context → Historical Patterns → Adaptive Responses → Progress Tracking

Crisis Support Flow
├─ Crisis Language Detected → Immediate Resources → Professional Contacts
├─ Emergency Protocols → Safety Planning → Continuous Support → Follow-up
└─ Risk Assessment → Appropriate Response → Resource Connection → Monitoring
```

## 📊 Performance Metrics

### Conversation Engagement
- **Daily Active Conversations**: Users engaging with LyfBot daily
- **Message Response Time**: AI response generation speed (target: < 2 seconds)
- **Conversation Completion Rate**: Percentage of meaningful conversation exchanges
- **User Satisfaction**: Feedback ratings on AI responses

### AI Effectiveness
- **Crisis Detection Accuracy**: Precision and recall for crisis language detection
- **Recommendation Relevance**: User engagement with AI-suggested activities
- **Context Utilization**: How effectively AI uses journal and user data
- **Response Quality**: User feedback on helpfulness and appropriateness

## 🔒 Security & Privacy

### Data Protection
- All conversations encrypted in transit and at rest
- User context data anonymized for AI processing
- Crisis detection logs maintained for safety compliance
- Conversation history retention policies with user control

### AI Safety
- Crisis detection algorithms with human oversight
- Response filtering for inappropriate content
- Emergency escalation protocols for high-risk situations
- Continuous monitoring of AI response quality and safety

---

This documentation provides comprehensive coverage of all LyfBot screens based on the actual backend implementation, focusing on the standalone AI service that integrates with Journal, Recommender, and other services to provide personalized mental health support through intelligent conversations. 
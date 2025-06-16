# Resources Screens Documentation

## Overview
The resources screens provide comprehensive access to educational content, learning materials, and mental health resources. All screens are designed for easy discovery, personalized recommendations, and progress tracking.

## 📚 Core Features
- Curated mental health resource library
- Personalized learning paths
- Interactive content and exercises
- Progress tracking and bookmarks
- Offline content access
- Expert-reviewed materials

## 📱 Screen Specifications

### 1. Resource Library (`/resources`)

#### Purpose
Central hub for browsing and discovering mental health resources with personalized recommendations and category organization.

#### Mobile-First Design
- **Category Cards**: Visual organization by topic
- **Search Integration**: Quick content discovery
- **Recommendation Engine**: AI-powered content suggestions
- **Progress Indicators**: Track learning completion
- **Offline Access**: Download for offline use

#### UI Components
```typescript
interface ResourceLibraryProps {
  categories: ResourceCategory[];
  featuredResources: Resource[];
  recommendations: Resource[];
  recentlyViewed: Resource[];
  userProgress: ProgressData;
  onResourceSelect: (resourceId: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onSearch: (query: string) => void;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'exercise' | 'worksheet' | 'course';
  category: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  author: Author;
  rating: number;
  reviewCount: number;
  isBookmarked: boolean;
  isDownloaded: boolean;
  progress?: number; // 0-100
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  resourceCount: number;
  subcategories: Subcategory[];
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Resources        [🔍] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Search resources...]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🌟 Featured This Week       │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧠 "Managing Anxiety    │ │ │
│ │ │ in the Workplace"       │ │ │
│ │ │ Video • 15 min          │ │ │
│ │ │ ⭐ 4.8 (234 reviews)    │ │ │
│ │ │ [Watch Now]             │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📂 Browse Categories        │ │
│ │                             │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│ │ │ 🧠  │ │ 💙  │ │ 😰  │   │ │
│ │ │Anxiety│Depress│Stress │   │ │
│ │ │ 156 │ │ 89  │ │ 234 │   │ │
│ │ └─────┘ └─────┘ └─────┘   │ │
│ │                             │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│ │ │ 🧘  │ │ 💪  │ │ 💔  │   │ │
│ │ │Mindful│Coping │Grief  │   │ │
│ │ │ 78  │ │ 145 │ │ 67  │   │ │
│ │ └─────┘ └─────┘ └─────┘   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Recommended for You      │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📖 "Cognitive Behavioral│ │ │
│ │ │ Techniques for Anxiety" │ │ │
│ │ │ Article • 8 min read    │ │ │
│ │ │ ⭐ 4.9 (156 reviews)    │ │ │
│ │ │ [Read] [📥] [❤️]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🎧 "Sleep Meditation    │ │ │
│ │ │ for Anxiety Relief"     │ │ │
│ │ │ Audio • 20 min          │ │ │
│ │ │ ⭐ 4.7 (89 reviews)     │ │ │
│ │ │ [Listen] [📥] [❤️]     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📚 Continue Learning        │ │
│ │ "Anxiety Management Course" │ │
│ │ Progress: 60% complete      │ │
│ │ [Continue Course]           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get resource library data
GET /api/resources?category=all&page=1&limit=20
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "anxiety",
        "name": "Anxiety",
        "description": "Resources for managing anxiety and panic",
        "icon": "🧠",
        "color": "#4F46E5",
        "resourceCount": 156,
        "subcategories": [
          {"id": "panic", "name": "Panic Attacks", "count": 45},
          {"id": "social", "name": "Social Anxiety", "count": 67},
          {"id": "workplace", "name": "Workplace Anxiety", "count": 44}
        ]
      }
    ],
    "featuredResources": [
      {
        "id": "resource_123",
        "title": "Managing Anxiety in the Workplace",
        "description": "Practical strategies for handling work-related anxiety",
        "type": "video",
        "category": "anxiety",
        "duration": 15,
        "difficulty": "beginner",
        "tags": ["anxiety", "workplace", "coping"],
        "author": {
          "id": "author_456",
          "name": "Dr. Sarah Johnson",
          "credentials": "PhD, Licensed Psychologist",
          "avatar": "https://api.mindlyfe.org/uploads/authors/sarah_johnson.jpg"
        },
        "rating": 4.8,
        "reviewCount": 234,
        "isBookmarked": false,
        "isDownloaded": false,
        "thumbnail": "https://api.mindlyfe.org/uploads/resources/workplace_anxiety.jpg"
      }
    ],
    "recommendations": [
      {
        "id": "resource_789",
        "title": "Cognitive Behavioral Techniques for Anxiety",
        "type": "article",
        "duration": 8,
        "rating": 4.9,
        "reviewCount": 156,
        "reason": "Based on your recent mood patterns"
      }
    ]
  }
}
```

---

### 2. Learning Paths (`/resources/paths`)

#### Purpose
Structured learning journeys with curated content sequences for specific mental health topics.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Learning Paths         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Your Active Paths        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧠 Anxiety Management   │ │ │
│ │ │ 6 of 10 modules complete│ │ │
│ │ │ ████████░░ 60%          │ │ │
│ │ │ Next: "Breathing Techniques"│ │ │
│ │ │ [Continue Learning]     │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧘 Mindfulness Basics   │ │ │
│ │ │ 3 of 8 modules complete │ │ │
│ │ │ ████░░░░░░ 30%          │ │ │
│ │ │ Next: "Body Scan Meditation"│ │ │
│ │ │ [Continue Learning]     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🌟 Recommended Paths        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 💪 Building Resilience  │ │ │
│ │ │ 12 modules • 6 weeks    │ │ │
│ │ │ Beginner level          │ │ │
│ │ │ "Learn to bounce back   │ │ │
│ │ │ from life's challenges" │ │ │
│ │ │ ⭐ 4.8 (345 completions)│ │ │
│ │ │ [Start Path]            │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 😴 Better Sleep Habits  │ │ │
│ │ │ 8 modules • 4 weeks     │ │ │
│ │ │ Beginner level          │ │ │
│ │ │ "Improve sleep quality  │ │ │
│ │ │ and overcome insomnia"  │ │ │
│ │ │ ⭐ 4.6 (278 completions)│ │ │
│ │ │ [Start Path]            │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📂 Browse All Paths         │ │
│ │                             │ │
│ │ [Anxiety] [Depression]      │ │
│ │ [Stress] [Relationships]    │ │
│ │ [Self-Care] [Trauma]        │ │
│ │ [Addiction] [Grief]         │ │
│ │                             │ │
│ │ └────────────────────────────┘ │
│ │                                 │
│ │ ┌─────────────────────────────┐ │
│ │ │ 🏆 Completed Paths (2)      │ │
│ │ │ [View Certificates]         │ │
│ │ └─────────────────────────────┘ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 3. Resource Viewer (`/resources/view/:id`)

#### Purpose
Immersive content viewing experience with interactive features and progress tracking.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] [❤️] [📥] [📤]        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🧠 Managing Anxiety in the  │ │
│ │ Workplace                   │ │
│ │                             │ │
│ │ By Dr. Sarah Johnson        │ │
│ │ ⭐ 4.8 (234 reviews)        │ │
│ │ 15 min • Beginner           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📹 Video Player             │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │                         │ │ │
│ │ │    ▶️ Video Content     │ │ │
│ │ │                         │ │ │
│ │ │ ████████████░░░░░░░░░░  │ │ │
│ │ │ 8:45 / 15:00            │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [⏮️] [⏯️] [⏭️] [🔊] [⚙️]   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📝 Key Takeaways            │ │
│ │                             │ │
│ │ • Identify anxiety triggers │ │
│ │ • Practice breathing techniques│ │
│ │ • Set healthy boundaries    │ │
│ │ • Communicate with supervisor│ │
│ │                             │ │
│ │ [Add Personal Note]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Practice Exercise        │ │
│ │                             │ │
│ │ "Try the 4-7-8 breathing    │ │
│ │ technique for 2 minutes"    │ │
│ │                             │ │
│ │ [Start Exercise] [Skip]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📚 Related Resources        │ │
│ │                             │ │
│ │ • "Workplace Stress Quiz"   │ │
│ │ • "Setting Boundaries Guide"│ │
│ │ • "Anxiety Tracking Sheet"  │ │
│ │                             │ │
│ │ [View All Related]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Mark as Complete] [Next Resource]│
└─────────────────────────────────┘
```

---

### 4. Bookmarks & Downloads (`/resources/saved`)

#### Purpose
Personal library management for saved and downloaded resources with organization tools.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Saved Resources   [🔍] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [❤️ Bookmarks][📥 Downloads]│ │
│ │ [📚 Collections][📝 Notes] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📂 My Collections           │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧠 Anxiety Resources    │ │ │
│ │ │ 12 items • Created Jan 5│ │ │
│ │ │ [View Collection]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧘 Meditation Library   │ │ │
│ │ │ 8 items • Created Dec 20│ │ │
│ │ │ [View Collection]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [+ Create Collection]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ❤️ Recent Bookmarks         │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📖 "CBT for Anxiety"    │ │ │
│ │ │ Article • 8 min read    │ │ │
│ │ │ Bookmarked 2 days ago   │ │ │
│ │ │ [Read] [Remove] [📁]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🎧 "Sleep Meditation"   │ │ │
│ │ │ Audio • 20 min          │ │ │
│ │ │ Bookmarked 1 week ago   │ │ │
│ │ │ [Listen] [Remove] [📁]  │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📥 Downloaded Content       │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📹 "Workplace Anxiety"  │ │ │
│ │ │ Video • 15 min • 45 MB  │ │ │
│ │ │ Downloaded yesterday    │ │ │
│ │ │ [Watch] [Delete] [📁]   │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ Storage used: 234 MB / 1 GB │ │
│ │ [Manage Storage]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 5. Resource Search (`/resources/search`)

#### Purpose
Advanced search interface with filters, sorting, and discovery features.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Search Results         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Search: "anxiety coping"]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Filters                     │ │
│ │ Type: [All ▼]               │ │
│ │ Duration: [Any ▼]           │ │
│ │ Level: [All ▼]              │ │
│ │ Rating: [⭐⭐⭐⭐⭐]        │ │
│ │ [Apply Filters] [Clear]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ Found 23 resources              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📖 "5-Minute Anxiety Relief"│ │
│ │ Article • 5 min read        │ │
│ │ ⭐ 4.9 (156 reviews)        │ │
│ │ "Quick techniques for       │ │
│ │ immediate anxiety relief"   │ │
│ │ [Read] [❤️] [📥]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎧 "Anxiety Coping Meditation"│ │
│ │ Audio • 15 min              │ │
│ │ ⭐ 4.7 (89 reviews)         │ │
│ │ "Guided meditation for      │ │
│ │ anxiety management"         │ │
│ │ [Listen] [❤️] [📥]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📝 "Anxiety Thought Record" │ │
│ │ Worksheet • Interactive     │ │
│ │ ⭐ 4.8 (234 reviews)        │ │
│ │ "Track and challenge        │ │
│ │ anxious thoughts"           │ │
│ │ [Use] [❤️] [📥]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Load More Results]             │
└─────────────────────────────────┘
```

---

### 6. Progress Tracking (`/resources/progress`)

#### Purpose
Comprehensive progress dashboard showing learning achievements and completion statistics.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Learning Progress      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 Your Learning Stats      │ │
│ │                             │ │
│ │ Resources completed: 45     │ │
│ │ Total learning time: 12h 30m│ │
│ │ Current streak: 7 days      │ │
│ │ Certificates earned: 3      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Active Learning Paths    │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧠 Anxiety Management   │ │ │
│ │ │ ████████░░ 60%          │ │ │
│ │ │ 6 of 10 modules         │ │ │
│ │ │ Est. completion: 2 weeks│ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧘 Mindfulness Basics   │ │ │
│ │ │ ████░░░░░░ 30%          │ │ │
│ │ │ 3 of 8 modules          │ │ │
│ │ │ Est. completion: 4 weeks│ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📈 Weekly Activity          │ │
│ │                             │ │
│ │ Mon ████ 45 min             │ │
│ │ Tue ██ 15 min               │ │
│ │ Wed ████████ 60 min         │ │
│ │ Thu ██████ 30 min           │ │
│ │ Fri ████ 20 min             │ │
│ │ Sat ██████████ 75 min       │ │
│ │ Sun ████ 25 min             │ │
│ │                             │ │
│ │ This week: 4h 30m           │ │
│ │ Goal: 5h 00m (90% complete) │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏆 Recent Achievements      │ │
│ │                             │ │
│ │ 🎯 "Consistent Learner"     │ │
│ │ 7-day learning streak       │ │
│ │ Earned 2 days ago           │ │
│ │                             │ │
│ │ 📚 "Knowledge Seeker"       │ │
│ │ Completed 25 resources      │ │
│ │ Earned 1 week ago           │ │
│ │                             │ │
│ │ [View All Achievements]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Set Learning Goals] [Export Progress]│
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get user's resource progress
GET /api/resources/progress
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "stats": {
      "totalCompleted": 45,
      "totalLearningTime": 750, // minutes
      "currentStreak": 7,
      "certificatesEarned": 3,
      "weeklyGoal": 300, // minutes
      "weeklyProgress": 270 // minutes
    },
    "activePaths": [
      {
        "id": "path_123",
        "title": "Anxiety Management",
        "progress": 60,
        "completedModules": 6,
        "totalModules": 10,
        "estimatedCompletion": "2024-01-29T00:00:00Z"
      }
    ],
    "weeklyActivity": [
      {"day": "monday", "minutes": 45},
      {"day": "tuesday", "minutes": 15},
      {"day": "wednesday", "minutes": 60},
      {"day": "thursday", "minutes": 30},
      {"day": "friday", "minutes": 20},
      {"day": "saturday", "minutes": 75},
      {"day": "sunday", "minutes": 25}
    ],
    "recentAchievements": [
      {
        "id": "achievement_456",
        "title": "Consistent Learner",
        "description": "7-day learning streak",
        "icon": "🎯",
        "earnedAt": "2024-01-13T00:00:00Z"
      }
    ]
  }
}

// Track resource completion
POST /api/resources/{resourceId}/complete
Authorization: Bearer {access_token}

Request Body:
{
  "timeSpent": 15, // minutes
  "rating": 5,
  "notes": "Very helpful techniques for workplace anxiety"
}

Response:
{
  "success": true,
  "data": {
    "progressUpdated": true,
    "newAchievements": ["knowledge_seeker"],
    "streakUpdated": true,
    "newStreak": 8,
    "pathProgress": {
      "pathId": "path_123",
      "newProgress": 70,
      "nextModule": "breathing_techniques"
    }
  }
}
```

## 🔄 Screen Flow Patterns

### Resource Discovery Flow
```
Resource Library
├─ Category Browse → Resource List → Resource Details → Content Viewing
├─ Search Interface → Filter Application → Results Review → Resource Selection
├─ Recommendations → Personalized Content → Engagement → Progress Tracking
└─ Featured Content → Trending Resources → Community Favorites → Expert Picks

Learning Path Flow
├─ Path Discovery → Path Details → Enrollment → Module Progression
├─ Module Completion → Progress Tracking → Achievement Unlocking → Certificate Earning
├─ Path Customization → Personal Goals → Adaptive Learning → Outcome Measurement
└─ Path Sharing → Community Engagement → Peer Learning → Collaborative Progress

Content Management Flow
├─ Bookmarking → Collection Organization → Personal Library → Quick Access
├─ Download Management → Offline Access → Storage Optimization → Sync Management
├─ Progress Tracking → Analytics Review → Goal Setting → Achievement Celebration
└─ Content Sharing → Community Contribution → Expert Feedback → Quality Improvement
```

## 📊 Performance Metrics

### Learning Engagement
- **Content Completion Rate**: Percentage of started resources completed
- **Learning Time**: Average time spent on educational content
- **Path Progression**: Success rate of learning path completion
- **User Retention**: Return rate for continued learning

### Content Quality
- **User Ratings**: Average ratings and review quality
- **Expert Validation**: Professional review and approval process
- **Content Effectiveness**: Measured impact on user outcomes
- **Update Frequency**: Regular content refresh and improvement

## 🔒 Content Quality & Safety

### Expert Review Process
- Licensed mental health professionals review all content
- Evidence-based practices and current research integration
- Regular content updates and accuracy verification
- Cultural sensitivity and inclusivity standards

### User Safety
- Crisis content identification and appropriate warnings
- Professional disclaimer and limitations clearly stated
- Emergency resource integration and crisis intervention
- User feedback monitoring and content improvement

---

This documentation provides comprehensive coverage of all resource screens with educational excellence, personalized learning, and professional quality standards. 
# Community Screens Documentation

## Overview
The Community screens provide an anonymous social platform for mental health support. All interactions use generated pseudonyms to protect user privacy while enabling meaningful connections through posts, comments, reactions, and a follow system that enables chat access.

## 🌐 Core Features
- Anonymous posting with generated pseudonyms
- Post creation, viewing, and interaction
- Comments and reactions on posts
- Follow system for building connections
- Mutual follow relationships enable chat access
- Content moderation and reporting
- Privacy levels: public, anonymous, therapist-only, private
- Therapist verification and special content access

## 📱 Screen Specifications

### 1. Community Feed (`/community`)

#### Purpose
Main feed displaying community posts with anonymous interactions and engagement features.

#### Mobile-First Design
- **Post Feed Layout**: Scrollable list of community posts
- **Anonymous Identity**: All users shown with generated pseudonyms
- **Interaction Features**: Like, comment, follow, report
- **Content Filtering**: Filter by tags, search content
- **Privacy Awareness**: Clear indicators of post visibility levels

#### UI Components
```typescript
interface CommunityFeedProps {
  posts: Post[];
  currentUser: User;
  onCreatePost: () => void;
  onInteractWithPost: (postId: string, action: string) => void;
  onFollowUser: (anonymousUserId: string) => void;
  onFilterPosts: (filters: PostFilter[]) => void;
}

interface Post {
  id: string;
  author: {
    anonymousId: string;
    pseudonym: string;
    avatarColor: string;
    isVerifiedTherapist: boolean;
  };
  title: string;
  content: string;
  visibility: 'public' | 'anonymous' | 'therapists_only' | 'private';
  status: 'published' | 'under_review' | 'removed';
  tags: string[];
  viewCount: number;
  reportCount: number;
  reactions: Reaction[];
  comments: Comment[];
  createdAt: Date;
  isAnonymous: boolean;
  privacySettings: {
    allowComments: boolean;
    allowReactions: boolean;
    allowSharing: boolean;
  };
}

interface Reaction {
  id: string;
  type: 'like' | 'heart' | 'support' | 'helpful';
  anonymousUserId: string;
  createdAt: Date;
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ [☰] MindLyfe Community    [🔍] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [All][Anxiety][Depression]  │ │
│ │ [PTSD][Support][Therapists] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Mindful Dreamer • Follow │ │
│ │ 🟢 Verified Therapist       │ │
│ │                             │ │
│ │ "Managing Anxiety in Daily  │ │
│ │ Life: 5 Practical Tips"     │ │
│ │                             │ │
│ │ "As a therapist, I often    │ │
│ │ see clients struggling with │ │
│ │ daily anxiety. Here are     │ │
│ │ some evidence-based..."     │ │
│ │                             │ │
│ │ #anxiety #coping #therapy   │ │
│ │                             │ │
│ │ ❤️ 45  💬 12  👁️ 234       │ │
│ │ 2 hours ago • Therapist Only│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Peaceful Warrior • Follow│ │
│ │                             │ │
│ │ "My Journey with Depression"│ │
│ │                             │ │
│ │ "I wanted to share my story │ │
│ │ because I know how isolating│ │
│ │ depression can feel. Three  │ │
│ │ months ago, I was..."       │ │
│ │                             │ │
│ │ #depression #recovery #hope │ │
│ │                             │ │
│ │ ❤️ 89  💬 23  👁️ 567       │ │
│ │ 1 day ago • Anonymous       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Brave Soul • Follow      │ │
│ │                             │ │
│ │ "Breathing Exercise That    │ │
│ │ Changed My Life"            │ │
│ │                             │ │
│ │ "I discovered this simple   │ │
│ │ 4-7-8 breathing technique   │ │
│ │ and it's been a game..."    │ │
│ │                             │ │
│ │ #breathing #anxiety #tips   │ │
│ │                             │ │
│ │ ❤️ 67  💬 18  👁️ 345       │ │
│ │ 3 days ago • Public         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Create Post]                 │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get community posts
GET /api/posts?page=1&limit=20&tags=anxiety&visibility=public
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "post_123",
        "author": {
          "anonymousId": "anon_456",
          "pseudonym": "Mindful Dreamer",
          "avatarColor": "#4A90E2",
          "isVerifiedTherapist": true
        },
        "title": "Managing Anxiety in Daily Life: 5 Practical Tips",
        "content": "As a therapist, I often see clients struggling with daily anxiety...",
        "visibility": "therapists_only",
        "status": "published",
        "tags": ["anxiety", "coping", "therapy"],
        "viewCount": 234,
        "reactions": [
          {
            "type": "helpful",
            "count": 45
          }
        ],
        "comments": {
          "count": 12,
          "preview": "Thank you for sharing this..."
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "isAnonymous": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

---

### 2. Create Post (`/community/create`)

#### Purpose
Interface for creating new community posts with privacy controls and anonymous options.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [✕] Create Post           [✓] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Post Title                  │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ My Experience with...   │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Content                     │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ I wanted to share my    │ │ │
│ │ │ journey because I know  │ │ │
│ │ │ how isolating mental    │ │ │
│ │ │ health struggles can    │ │ │
│ │ │ feel. Last year I...    │ │ │
│ │ │                         │ │ │
│ │ │ 250/2000 characters     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tags                        │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ #anxiety #recovery #hope│ │ │
│ │ └─────────────────────────┘ │ │
│ │ Suggested: [depression]     │ │
│ │ [support] [therapy] [coping]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Visibility                  │ │
│ │ ● Public (Everyone)         │ │
│ │ ○ Anonymous (No therapists) │ │
│ │ ○ Therapists Only           │ │
│ │ ○ Private (Draft)           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Privacy Settings            │ │
│ │ ☑ Allow comments            │ │
│ │ ☑ Allow reactions           │ │
│ │ ☐ Allow sharing             │ │
│ │ ☑ Notify on interactions    │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Draft] [Publish]          │
└─────────────────────────────────┘
```

---

### 3. Post Details (`/community/post/{id}`)

#### Purpose
Detailed view of a single post with comments, reactions, and interaction options.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Post Details      [⋮] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Mindful Dreamer          │ │
│ │ 🟢 Verified Therapist       │ │
│ │ [Follow] [Message]          │ │
│ │                             │ │
│ │ "Managing Anxiety in Daily  │ │
│ │ Life: 5 Practical Tips"     │ │
│ │                             │ │
│ │ "As a therapist, I often    │ │
│ │ see clients struggling with │ │
│ │ daily anxiety. Here are     │ │
│ │ some evidence-based         │ │
│ │ strategies that can help... │ │
│ │                             │ │
│ │ 1. Deep breathing exercises │ │
│ │ 2. Progressive muscle       │ │
│ │    relaxation...            │ │
│ │                             │ │
│ │ #anxiety #coping #therapy   │ │
│ │                             │ │
│ │ ❤️ 45  💬 12  👁️ 234       │ │
│ │ 2 hours ago • Therapist Only│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Reactions                   │ │
│ │ ❤️ Helpful (45) 👍 Like (23)│ │
│ │ 🤗 Support (12) 💡 Insight (8)│
│ │ [Add Reaction]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Comments (12)               │ │
│ │                             │ │
│ │ 👤 Peaceful Warrior         │ │
│ │ "Thank you for sharing this.│ │
│ │ The breathing exercises     │ │
│ │ have been really helpful."  │ │
│ │ ❤️ 8  💬 Reply    1 hour ago│ │
│ │                             │ │
│ │ 👤 Brave Soul               │ │
│ │ "As someone with anxiety,   │ │
│ │ I can confirm these work!"  │ │
│ │ ❤️ 5  💬 Reply    30 min ago│ │
│ │                             │ │
│ │ [Load More Comments]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Write a comment...]        │ │
│ │ [😊] [📎]              [➤] │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 4. Follow Management (`/community/follows`)

#### Purpose
Manage follow relationships and view follow statistics.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Follow Management      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Follow Statistics           │ │
│ │                             │ │
│ │ 23        45        12      │ │
│ │ Following Followers Mutual  │ │
│ │                             │ │
│ │ Chat Partners: 12           │ │
│ │ (Mutual follows only)       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Following][Followers][Mutual]│
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Mutual Follows (12)         │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Mindful Dreamer      │ │ │
│ │ │ 🟢 Verified Therapist   │ │ │
│ │ │ Mutual since: Jan 2024  │ │ │
│ │ │ ✅ Chat enabled         │ │ │
│ │ │ [Message] [Unfollow]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Peaceful Warrior     │ │ │
│ │ │ Active community member │ │ │
│ │ │ Mutual since: Dec 2023  │ │ │
│ │ │ ✅ Chat enabled         │ │ │
│ │ │ [Message] [Unfollow]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Brave Soul           │ │ │
│ │ │ Anxiety support advocate│ │ │
│ │ │ Mutual since: Nov 2023  │ │ │
│ │ │ ✅ Chat enabled         │ │ │
│ │ │ [Message] [Unfollow]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Mindful Dreamer      │ │ │
│ │ │ 🟢 Verified Therapist   │ │ │
│ │ │ Mutual since: Jan 2024  │ │ │
│ │ │ ✅ Chat enabled         │ │ │
│ │ │ [Message] [Unfollow]    │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Privacy Settings            │ │
│ │ ☑ Allow follow notifications│ │
│ │ ☑ Allow mutual follow chat  │ │
│ │ ☑ Show real name in chat    │ │
│ │ ☐ Auto-follow back          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 5. User Profile (`/community/profile/{anonymousId}`)

#### Purpose
View another user's anonymous profile with their posts and follow options.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] @mindful_dreamer  [⋮] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │     [Anonymous Avatar]      │ │
│ │                             │ │
│ │      Mindful Dreamer        │ │
│ │   🟢 Verified Therapist     │ │
│ │                             │ │
│ │ 🧠 Mental health advocate   │ │
│ │ 📍 Sharing evidence-based   │ │
│ │    strategies for wellness  │ │
│ │                             │ │
│ │ 45      234     12          │ │
│ │ posts   followers following │ │
│ │                             │ │
│ │ [Follow] [Message] [Report] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Recent Posts (45)           │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "5 Breathing Techniques"│ │ │
│ │ │ ❤️ 67  💬 23  👁️ 345   │ │ │
│ │ │ 2 days ago              │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "Understanding Anxiety" │ │ │
│ │ │ ❤️ 89  💬 34  👁️ 567   │ │ │
│ │ │ 1 week ago              │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ "Mindfulness in Daily"  │ │ │
│ │ │ ❤️ 45  💬 18  👁️ 234   │ │ │
│ │ │ 2 weeks ago             │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [Load More Posts]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Follow to enable chat       │ │
│ │ Mutual follows can message  │ │
│ │ each other privately        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 6. Content Moderation (`/community/moderation`)

#### Purpose
Tools for moderators to review reported content and manage community safety.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Content Moderation     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Reported Content (8)        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Anonymous User       │ │ │
│ │ │ "Inappropriate content" │ │ │
│ │ │ Reports: 3 users        │ │ │
│ │ │ Reason: Spam/Off-topic  │ │ │
│ │ │ [Review] [Remove] [Keep]│ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Peaceful Warrior     │ │ │
│ │ │ "Triggering content"    │ │ │
│ │ │ Reports: 2 users        │ │ │
│ │ │ Reason: Harmful content │ │ │
│ │ │ [Review] [Remove] [Keep]│ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Moderation Actions          │ │
│ │                             │ │
│ │ [Warn User]                 │ │
│ │ [Remove Post]               │ │
│ │ [Restrict User]             │ │
│ │ [Ban User]                  │ │
│ │ [Add Content Warning]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Community Guidelines        │ │
│ │                             │ │
│ │ ☑ No personal attacks      │ │
│ │ ☑ No spam or self-promotion│ │
│ │ ☑ Respect privacy          │ │
│ │ ☑ Mental health focus      │ │
│ │ ☑ Professional boundaries  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🔄 Screen Flow Patterns

### Community Navigation Flow
```
Community Feed
├─ View Post → Post Details → Comments → Reactions
├─ Follow User → Mutual Follow → Chat Access Granted
├─ Create Post → Privacy Selection → Content Moderation → Published
└─ Search/Filter → Tag-based Results → User Discovery

User Interaction
├─ Anonymous Identity → Post Creation → Community Engagement
├─ Follow System → Mutual Relationships → Chat Eligibility
├─ Content Interaction → Comments/Reactions → Notifications
└─ Privacy Controls → Visibility Settings → Anonymous Protection

Moderation Flow
├─ Report Content → Moderation Queue → Review → Action Taken
├─ Community Guidelines → Violation Detection → User Warning
└─ Content Filtering → Automatic Moderation → Manual Review
```

## 📊 Performance Metrics

### Community Engagement
- **Daily Active Users**: Users engaging with community daily
- **Post Creation Rate**: New posts created per day/week
- **Interaction Rate**: Comments, reactions per post
- **Follow Growth**: New follow relationships established

### Content Quality
- **Moderation Rate**: Percentage of content requiring moderation
- **Report Resolution**: Time to resolve reported content
- **User Retention**: Users returning to community features
- **Therapist Participation**: Verified therapist engagement levels

## 🔒 Safety & Moderation

### Community Guidelines
- Mental health-focused content standards
- Anonymous interaction protection
- Professional boundary maintenance
- Crisis content handling protocols
- Spam and harassment prevention

### Privacy Protection
- Generated pseudonyms for all interactions
- No real identity exposure in community
- Mutual follow requirement for chat access
- Content visibility controls
- Anonymous reporting system

---

This documentation provides comprehensive coverage of all community screens based on the actual backend implementation, focusing on real features like anonymous posting, mutual follow relationships, content moderation, and privacy protection. 
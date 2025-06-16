# Chat Screens Documentation

## Overview
The Chat screens provide real-time messaging functionality for the MindLyfe platform. Users can engage in direct messaging, group chats, support groups, and therapy sessions. Chat access is based on mutual follow relationships from the community service.

## 💬 Core Features
- Real-time messaging with Socket.IO
- Multiple room types: direct, group, support, therapy
- Rich media attachments (images, documents, audio)
- Message reactions and replies
- Anonymous messaging options
- Read receipts and message status
- Content moderation and reporting
- Rate limiting and spam protection

## 📱 Screen Specifications

### 1. Chat Rooms List (`/chat`)

#### Purpose
Main chat interface showing all chat rooms the user participates in.

#### Mobile-First Design
- **Room List Layout**: Clean list of chat rooms with last message preview
- **Room Types**: Visual indicators for different room types
- **Status Indicators**: Unread counts, online status, typing indicators
- **Quick Actions**: Create new room, search conversations
- **Accessibility**: Screen reader optimized

#### UI Components
```typescript
interface ChatRoomsListProps {
  rooms: ChatRoom[];
  currentUser: User;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  onSearchRooms: (query: string) => void;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'support' | 'therapy';
  status: 'active' | 'archived' | 'hidden' | 'moderated';
  privacyLevel: 'public' | 'private' | 'encrypted';
  participants: string[];
  participantIdentities: ParticipantIdentity[];
  displayName: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCount: number;
  isModerated: boolean;
  isEncrypted: boolean;
  metadata?: Record<string, any>;
}

interface ParticipantIdentity {
  realUserId: string;
  anonymousDisplayName: string;
  allowRealNameInChat: boolean;
  realName?: string;
  avatarUrl?: string;
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ [☰] Chats              [🔍][+] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👥 Anxiety Support Group    │ │
│ │ "Thanks for sharing..."     │ │
│ │ 2:30 PM              [3]    │ │
│ │ 🔒 Encrypted                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👨‍⚕️ Dr. Sarah Johnson      │ │
│ │ "See you at our session..." │ │
│ │ Yesterday            ✓✓     │ │
│ │ 🔒 Therapy Session          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Mindful Dreamer          │ │
│ │ "Hope you're doing well"    │ │
│ │ 1 week ago           ✓✓     │ │
│ │ 💬 Direct Message           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👥 Depression Support       │ │
│ │ "Mike: That's helpful..."   │ │
│ │ 2 days ago           [1]    │ │
│ │ 🔒 Support Group            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [💬 New Chat]                   │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get user's chat rooms
GET /api/chat/rooms
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "room_123",
      "name": "Anxiety Support Group",
      "type": "support",
      "status": "active",
      "privacyLevel": "encrypted",
      "participants": ["user_456", "user_789", "user_012"],
      "participantIdentities": [
        {
          "realUserId": "user_456",
          "anonymousDisplayName": "Mindful Dreamer",
          "allowRealNameInChat": false
        }
      ],
      "displayName": "Anxiety Support Group",
      "lastMessageAt": "2024-01-15T14:30:00Z",
      "lastMessagePreview": "Thanks for sharing...",
      "unreadCount": 3,
      "isModerated": true,
      "isEncrypted": true
    }
  ]
}
```

---

### 2. Chat Room Messages (`/chat/room/{roomId}`)

#### Purpose
Message interface for a specific chat room with real-time messaging.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Anxiety Support   [⚙️] │
│ 8 participants • Moderated      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👨‍⚕️ Dr. Johnson (Moderator) │ │
│ │ Welcome everyone to today's │ │
│ │ group session. Let's start  │ │
│ │ with check-ins.             │ │
│ │                       10:00 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Mindful Dreamer          │ │
│ │ I've been practicing the    │ │
│ │ breathing techniques and    │ │
│ │ they're really helping.     │ │
│ │ ❤️ 3  💬 Reply         10:02 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Peaceful Warrior         │ │
│ │ That's great to hear! I'm   │ │
│ │ still struggling with       │ │
│ │ morning anxiety.            │ │
│ │                       10:03 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ I can relate to that. What  │ │
│ │ helps me is...              │ │
│ │ 10:04                  ✓✓   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Type a message...]    [📎] │ │
│ │ [😊] [🎤]              [➤] │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔒 End-to-end encrypted         │
└─────────────────────────────────┘
```

---

### 3. Create Chat Room (`/chat/create`)

#### Purpose
Interface for creating new chat rooms with different types and privacy settings.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [✕] Create Chat Room       [✓] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Room Type                   │ │
│ │ ● Direct Message            │ │
│ │ ○ Group Chat                │ │
│ │ ○ Support Group             │ │
│ │ ○ Therapy Session           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Room Name                   │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Anxiety Support Group   │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Description (Optional)      │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ A safe space to share   │ │ │
│ │ │ experiences and support │ │ │
│ │ │ each other...           │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Privacy Settings            │ │
│ │ ● Private                   │ │
│ │ ○ Public                    │ │
│ │ ○ Encrypted                 │ │
│ │                             │ │
│ │ ☑ Enable moderation        │ │
│ │ ☐ Anonymous messaging       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Add Participants            │ │
│ │ [Search chat partners...]   │ │
│ │                             │ │
│ │ Selected (2):               │ │
│ │ • Mindful Dreamer           │ │
│ │ • Peaceful Warrior          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Create Room]                   │
└─────────────────────────────────┘
```

---

### 4. Chat Partners (`/chat/partners`)

#### Purpose
List of users eligible for direct messaging based on mutual follow relationships.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Chat Partners     [🔍] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Mutual Follows (5)          │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Mindful Dreamer      │ │ │
│ │ │ Last active: 2 hours ago│ │ │
│ │ │ Mutual follow since Jan │ │ │
│ │ │ [Message] [View Profile]│ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Peaceful Warrior     │ │ │
│ │ │ Last active: 1 day ago  │ │ │
│ │ │ Mutual follow since Dec │ │ │
│ │ │ [Message] [View Profile]│ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Therapists (2)              │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👨‍⚕️ Dr. Sarah Johnson   │ │ │
│ │ │ Licensed Therapist      │ │ │
│ │ │ Active session client   │ │ │
│ │ │ [Message] [Book Session]│ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ No chat partners yet?       │ │
│ │ Follow users in the         │ │
│ │ community to start chatting │ │
│ │ [Go to Community]           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 5. Chat Settings (`/chat/settings`)

#### Purpose
Privacy controls, notification settings, and chat preferences.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Chat Settings          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Privacy & Security          │ │
│ │                             │ │
│ │ Read receipts               │ │
│ │ [Toggle: ON] ✓✓             │ │
│ │                             │ │
│ │ Anonymous messaging         │ │
│ │ [Toggle: ON] 👤             │ │
│ │                             │ │
│ │ Real name in therapy chats  │ │
│ │ [Toggle: ON] 👨‍⚕️           │ │
│ │                             │ │
│ │ Message encryption          │ │
│ │ [Toggle: ON] 🔒             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Notifications               │ │
│ │                             │ │
│ │ Message notifications       │ │
│ │ [Toggle: ON] 🔔             │ │
│ │                             │ │
│ │ Group notifications         │ │
│ │ [Toggle: ON] 👥             │ │
│ │                             │ │
│ │ Therapy notifications       │ │
│ │ [Toggle: ON] 👨‍⚕️           │ │
│ │                             │ │
│ │ Support group notifications │ │
│ │ [Toggle: ON] 🤝             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Message Management          │ │
│ │                             │ │
│ │ Auto-delete messages        │ │
│ │ [Never ▼]                   │ │
│ │                             │ │
│ │ Message backup              │ │
│ │ [Toggle: ON] ☁️             │ │
│ │                             │ │
│ │ [Export Chat History]       │ │
│ │ [Clear All Messages]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Settings]                 │
└─────────────────────────────────┘
```

---

### 6. Message Moderation (`/chat/moderation`)

#### Purpose
Tools for moderators to manage chat content and user behavior.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Moderation Tools       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Reported Messages (3)       │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Anonymous User       │ │ │
│ │ │ "Inappropriate content" │ │ │
│ │ │ Reported by: 2 users    │ │ │
│ │ │ [Review] [Remove] [Keep]│ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Moderation Actions          │ │
│ │                             │ │
│ │ [Warn User]                 │ │
│ │ [Mute User (1 hour)]        │ │
│ │ [Remove from Room]          │ │
│ │ [Ban User]                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Room Settings               │ │
│ │                             │ │
│ │ ☑ Enable message approval  │ │
│ │ ☑ Auto-moderate spam       │ │
│ │ ☐ Restrict to verified users│ │
│ │ ☑ Log all actions          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🔄 Screen Flow Patterns

### Chat Navigation Flow
```
Chat Rooms List
├─ Select Room → Messages → Send Message → Real-time Update
├─ Create Room → Select Type → Add Participants → Room Created
├─ Chat Partners → Select Partner → Start Direct Chat
└─ Settings → Privacy Controls → Notification Preferences

Message Interaction
├─ Send Message → Rate Limit Check → Delivery → Read Receipt
├─ Attach Media → Upload → Preview → Send
├─ React to Message → Emoji Selection → Real-time Update
└─ Reply to Message → Quote Original → Send Reply

Moderation Flow
├─ Report Message → Review Queue → Moderator Action → User Notification
├─ Auto-moderation → Spam Detection → Content Filter → Action Taken
└─ Manual Review → Moderator Decision → User Appeal → Final Action
```

## 📊 Performance Metrics

### Chat Engagement
- **Daily Active Chats**: Users engaging in conversations daily
- **Message Volume**: Total messages sent per day/week/month
- **Room Participation**: Activity levels in different room types
- **Response Time**: Average time between messages in conversations

### Technical Performance
- **Message Delivery**: 99.9% delivery rate target
- **Real-time Sync**: < 100ms message delivery via Socket.IO
- **Encryption**: End-to-end encryption for sensitive conversations
- **Offline Support**: Message queuing and sync when online

## 🔒 Security & Privacy

### Data Protection
- End-to-end encryption for therapy and sensitive conversations
- Anonymous messaging with generated pseudonyms
- Secure file sharing with virus scanning
- Message retention policies with automatic deletion options

### Access Control
- Mutual follow relationship verification for direct messages
- Therapist verification for professional conversations
- Group moderation and participant management
- Rate limiting to prevent spam and abuse

---

This documentation provides comprehensive coverage of all chat screens based on the actual backend implementation, focusing on real features like room types, anonymous messaging, mutual follow-based chat eligibility, and content moderation. 
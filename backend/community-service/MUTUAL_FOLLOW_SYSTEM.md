# Mutual Follow & Chat Eligibility System

## Overview

The MindLyf platform implements a **mutual follow system** that serves as the bridge between **anonymous community interactions** and **identified chat relationships**. This ensures privacy while enabling meaningful connections.

## System Flow

```
1. Community (Anonymous) → 2. Follow → 3. Mutual Follow → 4. Chat Access
```

### 1. **Community Phase** (Always Anonymous)
- Users interact in community with **pseudonyms only**
- All posts, comments, reactions are **completely anonymous**
- Real names are **NEVER** revealed in community context
- Users see names like "Mindful Dreamer", "Gentle Helper", etc.

### 2. **Follow Phase** (Still Anonymous)
- Users can follow others based on their **anonymous identities**
- Following is **one-way** and **not automatic**
- Follower sees the person they followed in their "following" list
- The followed person sees them in their "followers" list
- Both are still **anonymous** to each other

### 3. **Mutual Follow Phase** (Chat Eligibility)
- When **both users follow each other** → **Mutual follow established**
- This **automatically grants chat access**
- Both users become visible in each other's "chat partners" list
- **Still anonymous** until they enter chat service

### 4. **Chat Phase** (Identity Reveal Option)
- Users can now start private conversations
- **Chat service** can reveal real identities (if both consent)
- This is where real names like "John Doe" can be shown
- Users control their identity reveal preferences

## Technical Implementation

### Core Entities

#### Follow Entity
```typescript
{
  followerId: string;        // Real user ID (internal)
  followingId: string;       // Real user ID (internal)
  status: FollowStatus;      // ACTIVE, MUTED, BLOCKED
  isMutualFollow: boolean;   // Auto-computed when both follow
  chatAccessGranted: boolean; // Auto-granted on mutual follow
  mutualFollowEstablishedAt: Date;
  chatAccessGrantedAt: Date;
  privacySettings: {
    allowChatInvitation: boolean;
    notifyOnFollow: boolean;
    notifyOnMutualFollow: boolean;
    allowRealNameInChat: boolean;
  }
}
```

### Key Services

#### AnonymityService
- Generates consistent pseudonyms for community
- Converts between real and anonymous identities
- Ensures privacy in all community interactions

#### UserMappingService
- Converts anonymous IDs ↔ real user IDs
- Validates follow targets
- Handles ID mapping for follow operations

#### FollowsService
- Manages follow relationships
- Detects mutual follows automatically
- Grants/revokes chat access
- Provides chat partner lists

## API Endpoints

### Follow Management
```bash
# Follow a user (using their anonymous ID from community)
POST /follows
{
  "followingId": "anonymous-id-from-community",
  "followSource": "post",
  "sourceContentId": "post-uuid"
}

# Unfollow a user
DELETE /follows/:anonymousUserId

# List followers/following/mutual
GET /follows?type=followers&page=1&limit=20
GET /follows?type=following
GET /follows?type=mutual
```

### Chat Eligibility
```bash
# Check if you can chat with specific user
POST /follows/check-chat-eligibility
{
  "userId": "anonymous-id"
}

# Get all chat-eligible users (for chat service)
GET /follows/chat-partners

# Get follow statistics
GET /follows/stats
```

### Privacy Settings
```bash
# Update follow preferences
PATCH /follows/:followId/settings
{
  "allowRealNameInChat": true,
  "notifyOnMutualFollow": false
}
```

## Data Flow Examples

### Example 1: Following Someone
```
User A sees post by "Mindful Dreamer" in community
→ User A clicks "Follow" on that anonymous profile
→ System creates follow: A → B (one-way)
→ "Mindful Dreamer" appears in A's "following" list
→ User A appears in B's "followers" list (as their pseudonym)
→ NO chat access yet
```

### Example 2: Mutual Follow Established
```
User B decides to follow User A back
→ System detects mutual relationship
→ Both follow records marked as isMutualFollow=true
→ chatAccessGranted=true for both
→ Real-time event: "mutualFollowEstablished"
→ Both users now see each other in "chat partners"
→ Chat access is now available
```

### Example 3: Chat Service Integration
```
User A wants to chat with "Gentle Helper" (User B)
→ Frontend calls GET /follows/chat-partners
→ System returns list with User B's anonymous info + realUserId
→ Frontend redirects to chat service with both user IDs
→ Chat service can now reveal real names (if both allow)
→ Conversation shows: "John Doe" ↔ "Jane Smith"
```

## Privacy & Security

### Anonymous Identity Protection
- ✅ **Community**: Always anonymous pseudonyms
- ✅ **Follow Lists**: Still anonymous until mutual
- ✅ **Chat Eligibility**: Anonymous until chat service
- ✅ **Real Names**: Only in chat service with consent

### Data Segregation
```
Community Service: Stores anonymous interactions
└── Follow relationships (real user IDs internal only)
└── Chat eligibility status
└── Anonymous pseudonyms for UI

Chat Service: Handles real identity reveal
└── User consent for real names
└── Private conversations
└── Identity verification
```

### Security Measures
- Anonymous IDs generated deterministically but unpredictably
- Real user IDs never exposed in community API responses
- Follow relationships use real IDs internally for integrity
- UserMappingService validates all ID conversions
- Privacy settings control identity reveal in chat

## User Experience

### Frontend Integration

#### Community View
```typescript
// Posts show anonymous authors
{
  "author": {
    "id": "anon123abc",           // Anonymous ID
    "displayName": "Mindful Dreamer",
    "avatarColor": "#6366f1"
  },
  "content": "Struggling with anxiety...",
  "showFollowButton": true        // If not already following
}
```

#### Follow Management
```typescript
// Following list (still anonymous)
{
  "following": [
    {
      "id": "anon456def",
      "displayName": "Gentle Helper",
      "avatarColor": "#8b5cf6",
      "isMutualFollow": false,     // One-way follow
      "canChat": false
    }
  ]
}
```

#### Chat Partners
```typescript
// Mutual follows eligible for chat
{
  "chatPartners": [
    {
      "anonymousId": "anon789ghi",
      "displayName": "Wise Listener",
      "avatarColor": "#22c55e",
      "isMutualFollow": true,
      "canChat": true,
      "realUserId": "uuid-for-chat-service" // Hidden from UI
    }
  ]
}
```

## Integration with Chat Service

### Chat Service API Calls
```typescript
// Community service provides this data to chat service
interface ChatEligibilityData {
  user1: {
    realUserId: string;           // For database queries
    anonymousDisplayName: string; // Fallback if real name hidden
    allowRealNameInChat: boolean;
  };
  user2: {
    realUserId: string;
    anonymousDisplayName: string;
    allowRealNameInChat: boolean;
  };
  mutualFollowEstablishedAt: Date;
  relationshipType: 'mutual-follow';
}
```

### Chat Service Behavior
```typescript
// Chat service decides identity display
if (user1.allowRealNameInChat && user2.allowRealNameInChat) {
  // Show real names: "John Doe" ↔ "Jane Smith"
  return realIdentities;
} else {
  // Fallback to anonymous: "Mindful Dreamer" ↔ "Gentle Helper"
  return anonymousIdentities;
}
```

## Configuration

### Environment Variables
```bash
# Community Service
ANONYMIZATION_ENABLED=true
JWT_SECRET=secure-secret-for-pseudonym-generation

# Follow system
AUTO_GRANT_CHAT_ACCESS_ON_MUTUAL=true
MAX_FOLLOWS_PER_DAY=50
NOTIFY_ON_MUTUAL_FOLLOW=true
```

### Privacy Defaults
```typescript
const defaultPrivacySettings = {
  allowChatInvitation: true,      // Allow chat when mutual
  notifyOnFollow: true,           // Notify when someone follows
  notifyOnMutualFollow: true,     // Notify when mutual established
  allowRealNameInChat: true       // Allow real name in chat (user can change)
};
```

## Benefits

### For Users
- ✅ **Safe Community**: Anonymous discussions without fear
- ✅ **Meaningful Connections**: Can follow interesting people
- ✅ **Controlled Identity**: Choose when to reveal real name
- ✅ **Clear Boundaries**: Community vs Chat contexts separate

### For Platform
- ✅ **Privacy Compliance**: HIPAA-friendly anonymous community
- ✅ **User Engagement**: Follow system encourages interaction
- ✅ **Trust Building**: Gradual relationship development
- ✅ **Scalable**: Clear service boundaries and responsibilities

## Future Enhancements

### Planned Features
- **Follow Requests**: Optional approval system for follows
- **Interest-Based Matching**: Suggest follows based on content interaction
- **Group Chats**: Multi-user conversations for mutual followers
- **Follow Analytics**: Insights into community connections
- **Time-Limited Chat**: Temporary chat access for specific discussions

---

**Remember**: This system prioritizes **user privacy** and **consent** at every step. Users maintain control over their identity reveal while enabling meaningful connections through anonymous community interactions. 
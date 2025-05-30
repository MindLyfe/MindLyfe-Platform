# Chat Service - Mutual Follow Integration

## Overview

The Chat Service has been fully integrated with the Community Service's **mutual follow system** to enable **privacy-preserving chat relationships** with **selective identity reveal**. This ensures users can only chat with those they have mutual follow relationships with, while maintaining control over their identity display.

## Key Features

### 🔗 **Mutual Follow Enforcement**
- **Chat Creation**: Only users with mutual follow relationships can create direct chats
- **Therapist Exception**: Therapist-client relationships bypass mutual follow requirement
- **Admin Override**: Admins can chat with anyone (for support purposes)

### 🎭 **Identity Reveal System**
- **Anonymous Default**: All chat participants start with anonymous identities from community
- **Real Name Option**: Users can choose to reveal real names in direct/therapy chats
- **Fallback System**: If real identity unavailable, falls back to anonymous pseudonym
- **Per-Room Settings**: Identity reveal can be configured per chat room

### 🔒 **Privacy Protection**
- **Community Context**: Never reveals real identities outside of consent
- **Selective Reveal**: Users control when and where their real name is shown
- **Therapist Verification**: Therapist status is preserved across contexts

## System Integration Flow

### 1. **Chat Eligibility Check**
```typescript
// Before creating chat room
const canChat = await communityClient.validateMutualFollow(user1Id, user2Id);
if (!canChat) {
  throw new ForbiddenException('Mutual follow required for chat');
}
```

### 2. **Identity Resolution**
```typescript
// Get appropriate identity for display
const userIdentity = await communityClient.getUserIdentity(
  realUserId,    // Real user ID for lookup
  viewerUserId,  // Who is viewing this identity
  roomType       // 'direct', 'group', 'therapy', 'support'
);

// Returns:
{
  realUserId: "uuid-123",
  anonymousDisplayName: "Mindful Dreamer",
  allowRealNameInChat: true,
  realName: "John Doe",        // Only if allowed
  avatarUrl: "https://..."     // Only if allowed
}
```

### 3. **Chat Partner Discovery**
```typescript
// Get all users eligible for chat
const chatPartners = await communityClient.getChatPartners(userId);

// Returns list of mutual followers with chat permission
[
  {
    anonymousId: "anon123",
    displayName: "Gentle Helper",
    avatarColor: "#6366f1",
    realUserId: "uuid-456",          // For internal use
    allowRealNameInChat: true,
    mutualFollowEstablishedAt: "2024-01-01T00:00:00Z",
    canStartChat: true
  }
]
```

## API Endpoints

### **Chat Partner Management**
```bash
# Get all chat-eligible users
GET /api/chat/chat-partners
Authorization: Bearer <jwt-token>

Response:
{
  "chatPartners": [
    {
      "anonymousId": "anon123abc",
      "displayName": "Mindful Dreamer",
      "avatarColor": "#6366f1",
      "role": "user",
      "isVerifiedTherapist": false,
      "relationshipType": "mutual-follow",
      "mutualFollowEstablishedAt": "2024-01-01T00:00:00Z",
      "canStartChat": true
    }
  ]
}
```

### **Room Creation with Validation**
```bash
# Create chat room (validates mutual follow)
POST /api/chat/rooms
{
  "name": "Private Chat",
  "type": "direct",
  "participants": ["user-uuid-1", "user-uuid-2"]
}

# Automatic checks:
# - Mutual follow relationship exists
# - OR therapist-client relationship exists
# - OR admin permissions
```

### **Identity Settings**
```bash
# Update room identity reveal preferences
PATCH /api/chat/rooms/:roomId/identity-settings
{
  "allowRealNames": true,        # Show real names if both users allow
  "showAnonymousNames": true     # Show anonymous names as fallback
}
```

## Message Display Logic

### **Room Names**
```typescript
// Room display name logic
function getRoomDisplayName(room, participantIdentities, currentUserId) {
  if (room.type === 'direct' && participantIdentities.length === 1) {
    const otherUser = participantIdentities[0];
    
    // Prefer real name if allowed, fallback to anonymous
    if (otherUser.allowRealNameInChat && otherUser.realName) {
      return otherUser.realName;           // "John Doe"
    } else {
      return otherUser.anonymousDisplayName; // "Mindful Dreamer"
    }
  }
  
  // Group chats, therapy sessions, etc.
  return room.name || `${room.type} Chat`;
}
```

### **Message Senders**
```typescript
// Message sender display logic
function getMessageSenderName(message, senderIdentity, roomType) {
  // Explicit anonymous messages always show anonymous name
  if (message.isAnonymous) {
    return senderIdentity.anonymousDisplayName;
  }
  
  // Direct/therapy chats can show real names
  if ((roomType === 'direct' || roomType === 'therapy') && 
      senderIdentity.allowRealNameInChat && 
      senderIdentity.realName) {
    return senderIdentity.realName;
  }
  
  // Default to anonymous
  return senderIdentity.anonymousDisplayName;
}
```

## Privacy Safeguards

### **Identity Protection**
- ✅ **Real user IDs**: Never exposed in API responses
- ✅ **Anonymous IDs**: Used for frontend identification
- ✅ **Context Separation**: Community vs Chat identity handling
- ✅ **User Consent**: Real names only shown with explicit permission

### **Access Control**
- ✅ **Mutual Follow Required**: Enforced for all direct chats
- ✅ **Therapist Bypass**: Professional relationships override mutual follow
- ✅ **Admin Override**: Support and moderation access
- ✅ **Rate Limiting**: Prevents spam and abuse

### **Data Flow Security**
```
Frontend Request → Chat Service → Community Service → Identity Resolution
                                      ↓
                              Mutual Follow Validation
                                      ↓
                              Privacy-Filtered Response
```

## Integration Examples

### **Frontend Chat Partner List**
```typescript
// Get available chat partners
const response = await fetch('/api/chat/chat-partners', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { chatPartners } = await response.json();

// Display in UI with anonymous names
chatPartners.forEach(partner => {
  addChatPartnerToUI({
    displayName: partner.displayName,    // "Gentle Helper"
    avatarColor: partner.avatarColor,    // "#8b5cf6"
    isVerifiedTherapist: partner.isVerifiedTherapist,
    relationshipType: partner.relationshipType, // "mutual-follow"
    // Real user ID hidden from frontend
    onStartChat: () => createChatRoom(partner.anonymousId)
  });
});
```

### **Chat Room Display**
```typescript
// Room with identity-aware naming
{
  "id": "room-uuid",
  "type": "direct",
  "displayName": "John Doe",              // Real name (if allowed)
  "participantIdentities": [
    {
      "realUserId": "uuid-123",           // Hidden from frontend
      "anonymousDisplayName": "Mindful Dreamer",
      "allowRealNameInChat": true,
      "realName": "John Doe",
      "avatarUrl": "https://..."
    }
  ],
  "lastMessagePreview": "Hey there!",
  "metadata": {
    "identityRevealSettings": {
      "allowRealNames": true,
      "showAnonymousNames": true
    }
  }
}
```

### **Message History**
```typescript
// Messages with context-aware sender names
{
  "messages": [
    {
      "id": "msg-1",
      "content": "Hello! How are you doing?",
      "displayName": "John Doe",          // Real name in direct chat
      "senderIdentity": {
        "anonymousDisplayName": "Mindful Dreamer",
        "allowRealNameInChat": true,
        "realName": "John Doe"
      },
      "isOwnMessage": false,
      "isAnonymous": false,
      "createdAt": "2024-01-01T12:00:00Z"
    },
    {
      "id": "msg-2", 
      "content": "I'm doing well, thanks for asking!",
      "displayName": "You",               // Current user's message
      "isOwnMessage": true,
      "createdAt": "2024-01-01T12:01:00Z"
    }
  ]
}
```

## Configuration

### **Environment Variables**
```bash
# Community Service Integration
COMMUNITY_SERVICE_URL=http://community-service:3004
AUTH_SERVICE_URL=http://auth-service:3001
TELETHERAPY_SERVICE_URL=http://teletherapy-service:3002

# Chat Service Settings
ENFORCE_MUTUAL_FOLLOW=true              # Require mutual follow for direct chats
ALLOW_THERAPIST_BYPASS=true             # Therapists can chat without mutual follow
ALLOW_ADMIN_OVERRIDE=true               # Admins can chat with anyone
DEFAULT_IDENTITY_REVEAL=true            # Default to allowing real names
```

### **Privacy Defaults**
```typescript
const defaultIdentitySettings = {
  allowRealNames: true,          // Default to allow real names
  fallbackToAnonymous: true,     // Show anonymous if real name not available
  showAnonymousNames: true,      // Always show anonymous option
  respectUserPreferences: true   // Honor user's community privacy settings
};
```

## Error Handling

### **Common Scenarios**
```typescript
// Mutual follow required
{
  "error": "ForbiddenException",
  "message": "You can only chat with users who have mutual follow relationship with you",
  "code": "MUTUAL_FOLLOW_REQUIRED"
}

// Therapist session required
{
  "error": "ForbiddenException", 
  "message": "You can only chat with a therapist after booking a session with them",
  "code": "THERAPY_SESSION_REQUIRED"
}

// Community service unavailable
{
  "error": "ServiceUnavailableException",
  "message": "Unable to verify chat eligibility at this time",
  "code": "COMMUNITY_SERVICE_DOWN"
}
```

## Benefits

### **For Users**
- ✅ **Safe Connections**: Only chat with trusted mutual followers
- ✅ **Privacy Control**: Choose when to reveal real identity
- ✅ **Seamless Experience**: Anonymous community → private chat flow
- ✅ **Professional Access**: Easy therapist communication

### **For Platform**
- ✅ **Abuse Prevention**: Mutual follow requirement reduces spam
- ✅ **Privacy Compliance**: Strong data protection controls
- ✅ **Clear Boundaries**: Community vs chat context separation
- ✅ **Professional Support**: Therapist and admin access controls

---

**This integration creates a secure, privacy-preserving bridge from anonymous community interactions to meaningful private conversations, all while maintaining user control over identity disclosure.** 
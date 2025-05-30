# Community Service Anonymity System

## Overview

The MindLyf Community Service implements a comprehensive anonymity system that ensures **ALL content shared within the community platform is anonymous by default**. This is a fundamental privacy protection for users discussing sensitive mental health topics.

## Core Principles

### 1. **Default Anonymity**
- **ALL posts, comments, and reactions** in the community are anonymous by default
- Users cannot opt-out of anonymity in the community context
- Real names are **NEVER** exposed in community interactions

### 2. **Consistent Pseudonyms**
- Each user gets a **consistent anonymous identity** across the community
- The same user will always appear with the same pseudonym (e.g., "Mindful Dreamer")
- Pseudonyms are generated deterministically but appear random

### 3. **Context Separation**
- **Community**: Always anonymous (this service)
- **Chat/Therapy**: Real identities allowed (other services)
- **Clear boundaries** between anonymous and identified contexts

## How It Works

### Anonymous Identity Generation

```typescript
// Each user gets a consistent anonymous identity
const anonymousIdentity = {
  displayName: "Mindful Dreamer",    // Consistent pseudonym
  avatarColor: "#6366f1",           // Consistent color
  id: "a1b2c3d4e5f6"               // Anonymous ID (not real user ID)
};
```

### Name Pool System

The system uses predefined pools of meaningful names:

**First Names**: Mindful, Peaceful, Calm, Serene, Gentle, Kind, Brave, Strong, Wise, Caring, Hopeful, Bright, Warm, Quiet, Grace, Light, Dawn, Bloom, River, Ocean, Forest, Sky, Moon, Star, Phoenix, Harmony, Journey, Spirit, Dream, Wonder, Faith, Trust, Balance, Clarity, Focus, Energy, Vibrant, Radiant, Golden, Silver, Azure, Emerald, Crimson, Violet, Amber, Pearl, Ruby, Sapphire

**Last Names**: Walker, Seeker, Dreamer, Warrior, Guardian, Helper, Listener, Healer, Builder, Creator, Explorer, Traveler, Wanderer, Keeper, Finder, Giver, Sharer, Learner, Teacher, Student, Friend, Companion, Guide, Mentor, Soul, Heart, Mind, Spirit, Being, Voice, Path, Bridge, Mountain, Valley, River, Ocean, Forest, Garden, Meadow, Field, Sunrise, Sunset, Rainbow, Storm, Breeze, Wind, Rain, Snow

### Data Protection

#### What Gets Anonymized:
- ✅ Display names → Random pseudonyms
- ✅ User IDs → Anonymous IDs  
- ✅ Profile information → Sanitized/removed
- ✅ Personal metadata → Stripped
- ✅ Contact information → Removed

#### What's Preserved:
- ✅ User role (for therapist verification)
- ✅ Content timestamps
- ✅ Content structure (posts, comments, reactions)
- ✅ Interaction counts (anonymized)

## API Behavior

### Posts
```json
// Response Example
{
  "id": "post-123",
  "title": "Struggling with anxiety",
  "content": "...",
  "author": {
    "id": "a1b2c3d4e5f6",           // Anonymous ID
    "displayName": "Mindful Dreamer", // Pseudonym
    "avatarColor": "#6366f1",
    "role": "user",
    "isVerifiedTherapist": false
  },
  "isAnonymous": true,
  "pseudonym": "Mindful Dreamer",
  "createdAt": "2024-01-01T12:00:00Z"
  // Real authorId is NEVER exposed
}
```

### Comments
```json
// Response Example
{
  "id": "comment-456",
  "content": "Thank you for sharing...",
  "author": {
    "id": "b2c3d4e5f6a7",           // Different anonymous ID
    "displayName": "Gentle Helper",   // Different pseudonym
    "avatarColor": "#8b5cf6",
    "role": "therapist",
    "isVerifiedTherapist": true
  },
  "isAnonymous": true,
  "postId": "post-123",
  "createdAt": "2024-01-01T12:30:00Z"
}
```

### Reactions
```json
// Aggregated Response (most common)
{
  "counts": {
    "heart": 5,
    "supportive": 3,
    "helpful": 2
  },
  "userReactions": {
    "heart": true  // Current user's reactions only
  },
  "total": 10
}
```

## Service Architecture

### AnonymityService
- **Core anonymity logic**
- Consistent pseudonym generation
- Identity anonymization
- Context-aware privacy controls

### Key Methods:
```typescript
// Generate consistent anonymous identity
generateAnonymousIdentity(userId: string): AnonymousIdentity

// Anonymize content responses
anonymizeContentResponse(content: any, identity: AnonymousIdentity): any

// Sanitize sensitive information
sanitizeBio(bio: string): string
```

## Implementation Details

### Database Design
- Real user IDs stored internally for backend operations
- Anonymous IDs generated for API responses
- Pseudonyms stored but can be regenerated consistently

### Security Measures
- Deterministic but unpredictable pseudonym generation
- No reverse mapping from pseudonym to real identity
- JWT secret used in hash generation for security

### Performance Optimizations
- Consistent identity generation (no database lookups)
- Efficient content anonymization
- Minimal overhead on API responses

## Configuration

### Environment Variables
```bash
# Anonymity controls
ANONYMIZATION_ENABLED=true
JWT_SECRET=your-secure-secret  # Used in pseudonym generation

# Privacy settings
DEFAULT_POST_RETENTION_DAYS=365
DEFAULT_COMMENT_RETENTION_DAYS=180
```

## Service Integration

### Chat Service Integration
When users move from community to chat:
```typescript
// Community context - anonymous
if (context === 'community') {
  return anonymousIdentity; // "Mindful Dreamer"
}

// Chat context - real identity allowed
if (context === 'chat') {
  return realIdentity; // "John Doe" (if user consents)
}
```

## Best Practices

### For Frontend Development
1. **Never cache real user identities** in community context
2. **Use anonymous IDs** for all community interactions
3. **Display pseudonyms** consistently across sessions
4. **Respect context boundaries** (community vs chat)

### For Backend Development
1. **Always use AnonymityService** for community responses
2. **Strip sensitive data** before API responses
3. **Maintain audit logs** with real IDs (internal only)
4. **Validate context** before revealing identities

## Compliance & Privacy

### Privacy Benefits
- ✅ **HIPAA-friendly**: No PHI in community responses
- ✅ **User trust**: Complete anonymity in sensitive discussions
- ✅ **Reduced stigma**: No fear of identity exposure
- ✅ **Safe environment**: Focus on support, not identity

### Audit & Compliance
- Real user IDs maintained for:
  - Moderation purposes
  - Abuse prevention
  - Legal compliance
- But **NEVER exposed** in community API responses

## Testing

### Anonymity Verification
```bash
# Verify no real data leaks
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3004/posts | jq '.items[].author'

# Should only show pseudonyms, never real names
```

### Consistency Testing
```bash
# Same user should get same pseudonym across requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3004/posts
```

## Troubleshooting

### Common Issues
1. **Real names appearing**: Check AnonymityService integration
2. **Inconsistent pseudonyms**: Verify JWT secret configuration
3. **Missing anonymization**: Ensure service is injected properly

### Debug Mode
```typescript
// Add logging to verify anonymization
this.logger.debug(`Anonymized ${content.id}: ${originalName} → ${anonymizedName}`);
```

## Future Enhancements

### Planned Features
- **Time-based pseudonyms**: Optional rotating identities
- **Enhanced bio sanitization**: ML-powered PII detection
- **Anonymous direct messaging**: Private but anonymous chats
- **Pseudonym preferences**: User-influenced (but still random) names

---

**Remember**: The anonymity system is **mandatory** in community context. This is not optional - it's a core privacy protection for mental health discussions. 
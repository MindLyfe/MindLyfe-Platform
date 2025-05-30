# MindLyf Gamification Service

## 🎮 Overview

The MindLyf Gamification Service is a comprehensive microservice designed to enhance user engagement through game-like elements including streaks, badges, achievements, and rewards. It integrates seamlessly with the MindLyf mental health platform to motivate users in their wellness journey.

## 🏗️ Architecture

### Core Components

```
src/
├── controllers/
│   ├── streak.controller.ts            # Streak management endpoints
│   ├── badge.controller.ts             # Badge system endpoints
│   ├── achievement.controller.ts       # Achievement tracking endpoints
│   ├── reward.controller.ts            # Reward management endpoints
│   ├── activity.controller.ts          # Activity tracking endpoints
│   ├── leaderboard.controller.ts       # Leaderboard endpoints
│   └── health.controller.ts            # Health check endpoints
├── services/
│   ├── streak.service.ts               # Streak business logic
│   ├── badge.service.ts                # Badge management logic
│   ├── achievement.service.ts          # Achievement processing
│   ├── reward.service.ts               # Reward distribution
│   ├── activity.service.ts             # Activity tracking
│   ├── leaderboard.service.ts          # Leaderboard management
│   └── notification.service.ts         # Gamification notifications
├── entities/
│   ├── user-streak.entity.ts           # User streak data
│   ├── streak-definition.entity.ts     # Streak type definitions
│   ├── streak-milestone.entity.ts      # Streak milestone tracking
│   ├── badge.entity.ts                 # Badge definitions
│   ├── user-badge.entity.ts            # User badge ownership
│   ├── badge-requirement.entity.ts     # Badge earning criteria
│   ├── achievement.entity.ts           # Achievement definitions
│   ├── user-achievement.entity.ts      # User achievement progress
│   ├── achievement-step.entity.ts      # Achievement step tracking
│   ├── reward.entity.ts                # Reward definitions
│   ├── user-reward.entity.ts           # User reward ownership
│   ├── activity-event.entity.ts        # Activity tracking events
│   └── leaderboard-entry.entity.ts     # Leaderboard entries
├── dto/
│   ├── create-streak.dto.ts            # Streak creation DTO
│   ├── update-streak.dto.ts            # Streak update DTO
│   ├── badge-progress.dto.ts           # Badge progress DTO
│   ├── achievement-progress.dto.ts     # Achievement progress DTO
│   ├── reward-claim.dto.ts             # Reward claiming DTO
│   └── activity-event.dto.ts           # Activity event DTO
├── interfaces/
│   ├── gamification.interface.ts       # Core interfaces
│   ├── streak.interface.ts             # Streak interfaces
│   ├── badge.interface.ts              # Badge interfaces
│   ├── achievement.interface.ts        # Achievement interfaces
│   └── reward.interface.ts             # Reward interfaces
├── enums/
│   ├── streak-type.enum.ts             # Streak types
│   ├── badge-tier.enum.ts              # Badge tiers
│   ├── achievement-type.enum.ts        # Achievement types
│   ├── reward-type.enum.ts             # Reward types
│   └── activity-type.enum.ts           # Activity types
├── events/
│   ├── streak.events.ts                # Streak-related events
│   ├── badge.events.ts                 # Badge-related events
│   ├── achievement.events.ts           # Achievement-related events
│   └── reward.events.ts                # Reward-related events
└── modules/
    ├── streak.module.ts                # Streak module
    ├── badge.module.ts                 # Badge module
    ├── achievement.module.ts           # Achievement module
    ├── reward.module.ts                # Reward module
    ├── activity.module.ts              # Activity module
    ├── leaderboard.module.ts           # Leaderboard module
    └── health.module.ts                # Health check module
```

## 🎯 Features

### Streak System
- **Daily Login Streaks**: Track consecutive daily logins
- **Therapy Attendance Streaks**: Monitor therapy session consistency
- **Meditation Streaks**: Track meditation practice consistency
- **Exercise Streaks**: Monitor wellness activity completion
- **Custom Streaks**: Flexible streak definitions for various activities

### Badge System
- **Achievement Badges**: Earned through specific accomplishments
- **Participation Badges**: Awarded for engagement milestones
- **Milestone Badges**: Given for reaching significant thresholds
- **Hidden Badges**: Special badges revealed upon earning
- **Tiered Badges**: Bronze, Silver, Gold, and Platinum levels

### Achievement System
- **Wellness Journey**: Completing therapy programs and assessments
- **Skill Building**: Learning and applying mental health techniques
- **Consistency**: Maintaining routines and healthy habits
- **Personal Growth**: Setting and achieving personal goals
- **Community Engagement**: Participating in community features

### Reward System
- **Virtual Points**: Earned through various activities
- **Feature Unlocks**: Access to premium platform features
- **Content Access**: Exclusive educational content
- **Streak Freezes**: Maintain streaks during breaks
- **Customization Options**: Profile themes and badges

### Leaderboard System
- **Global Leaderboards**: Platform-wide rankings
- **Category Leaderboards**: Specific activity rankings
- **Friend Leaderboards**: Compare with connections
- **Time-based Leaderboards**: Weekly, monthly rankings

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose

### Local Development

1. **Clone and Install**
```bash
cd backend/gamification-service
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

3. **Database Setup**
```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run migrations
npm run migration:run
```

4. **Start Development Server**
```bash
npm run start:dev
```

The service will be available at `http://localhost:3008`

## 📋 Configuration

### Environment Variables

```bash
# Service Configuration
NODE_ENV=development
PORT=3008
SERVICE_NAME=gamification-service

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyf_gamification

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h

# Gamification Settings
STREAK_GRACE_PERIOD_HOURS=24
MAX_STREAK_COUNT=1000
ENABLE_STREAK_RECOVERY=true
ENABLE_HIDDEN_BADGES=true
MAX_BADGES_PER_USER=100
ENABLE_PROGRESS_NOTIFICATIONS=true
PROGRESS_NOTIFICATION_THRESHOLD=25
ENABLE_REWARD_EXPIRATION=true
DEFAULT_REWARD_EXPIRATION_DAYS=30
ENABLE_GLOBAL_LEADERBOARDS=true
LEADERBOARD_SIZE=100
LEADERBOARD_UPDATE_INTERVAL=15

# External Services
AUTH_SERVICE_URL=http://localhost:3001
NOTIFICATION_SERVICE_URL=http://localhost:3005
ANALYTICS_SERVICE_URL=http://localhost:3009
```

## 🔌 API Documentation

### Authentication

All endpoints require JWT authentication:
```http
Authorization: Bearer <jwt_token>
```

### Streak Operations

#### Get User Streaks
```http
GET /api/streaks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "streak_123",
      "streakType": "daily-login",
      "currentCount": 7,
      "longestStreak": 15,
      "isActive": true,
      "nextDeadline": "2024-01-15T23:59:59Z",
      "milestones": [
        {
          "threshold": 7,
          "achieved": true,
          "achievedAt": "2024-01-14T10:30:00Z"
        }
      ]
    }
  ]
}
```

#### Record Activity
```http
POST /api/streaks/{streakType}/activity
Content-Type: application/json

{
  "activityData": {
    "sessionDuration": 1800,
    "completionRate": 100
  }
}
```

#### Get Streak Details
```http
GET /api/streaks/{streakType}
```

### Badge Operations

#### Get User Badges
```http
GET /api/badges
```

#### Get Badge Progress
```http
GET /api/badges/{badgeId}/progress
```

#### Get Available Badges
```http
GET /api/badges/available
```

### Achievement Operations

#### Get User Achievements
```http
GET /api/achievements
```

#### Get Achievement Progress
```http
GET /api/achievements/{achievementId}/progress
```

#### Complete Achievement Step
```http
POST /api/achievements/{achievementId}/steps/{stepId}/complete
```

### Reward Operations

#### Get User Rewards
```http
GET /api/rewards
```

#### Claim Reward
```http
POST /api/rewards/{rewardId}/claim
```

#### Get Reward History
```http
GET /api/rewards/history
```

### Activity Tracking

#### Track Activity
```http
POST /api/activities
Content-Type: application/json

{
  "activityType": "meditation_completion",
  "metadata": {
    "duration": 600,
    "technique": "mindfulness"
  }
}
```

#### Get Activity History
```http
GET /api/activities?limit=50&offset=0
```

### Leaderboard Operations

#### Get Global Leaderboard
```http
GET /api/leaderboards/global?category=streaks&timeframe=weekly
```

#### Get User Ranking
```http
GET /api/leaderboards/ranking?category=badges
```

## 🎮 Gamification Rules

### Streak Rules

1. **Daily Streaks**: Reset at midnight in user's timezone
2. **Grace Period**: 24-hour window to maintain streak
3. **Streak Recovery**: One-time recovery option per month
4. **Maximum Count**: Streaks cap at 1000 to prevent overflow

### Badge Rules

1. **Unique Badges**: Each badge can only be earned once
2. **Hidden Badges**: Revealed only upon earning
3. **Tier Progression**: Must earn lower tiers before higher ones
4. **Retroactive Earning**: Past activities count toward badge requirements

### Achievement Rules

1. **Step-by-Step**: Multi-step achievements track individual progress
2. **Parallel Progress**: Multiple achievements can progress simultaneously
3. **Time-Limited**: Some achievements have expiration dates
4. **Prerequisite Chains**: Some achievements require others to be completed first

### Reward Rules

1. **Expiration**: Rewards expire after 30 days unless claimed
2. **One-Time Use**: Most rewards can only be claimed once
3. **Stacking**: Some rewards can be accumulated
4. **Transfer Restrictions**: Rewards are non-transferable

## 📊 Analytics Integration

### Event Tracking

The service emits events for analytics:

- `streak.started`
- `streak.maintained`
- `streak.broken`
- `streak.milestone.reached`
- `badge.earned`
- `badge.progress.updated`
- `achievement.completed`
- `achievement.step.completed`
- `reward.earned`
- `reward.claimed`
- `activity.tracked`

### Metrics

Key metrics tracked:
- Streak engagement rates
- Badge completion rates
- Achievement progression
- Reward redemption rates
- User activity patterns

## 🧪 Testing

### Unit Tests
```bash
npm test
npm run test:cov
```

### Integration Tests
```bash
npm run test:e2e
```

### Load Testing
```bash
# Install k6
npm install -g k6

# Run load tests
k6 run tests/load/gamification-load-test.js
```

## 🚀 Deployment

### Docker Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

- **Liveness**: `/health/live`
- **Readiness**: `/health/ready`
- **Detailed**: `/health/detailed`

## 🔧 Development

### Adding New Streak Types

1. **Define Streak Type**
```typescript
// src/enums/streak-type.enum.ts
export enum StreakType {
  DAILY_LOGIN = 'daily-login',
  THERAPY_ATTENDANCE = 'therapy-attendance',
  NEW_STREAK_TYPE = 'new-streak-type', // Add here
}
```

2. **Create Streak Definition**
```sql
INSERT INTO streak_definitions (type, display_name, description, reset_condition, milestone_thresholds)
VALUES ('new-streak-type', 'New Streak', 'Description', 'daily', ARRAY[7, 30, 100]);
```

3. **Update Activity Tracking**
```typescript
// Handle new activity type in activity.service.ts
```

### Adding New Badge Categories

1. **Define Badge Category**
2. **Create Badge Requirements**
3. **Implement Evaluation Logic**
4. **Add Badge Assets**

## 📚 Additional Resources

- [Gamification Best Practices](./docs/GAMIFICATION_BEST_PRACTICES.md)
- [API Documentation](http://localhost:3008/api/docs) (when running locally)
- [Event Schema Reference](./docs/EVENT_SCHEMA.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement gamification features
4. Add comprehensive tests
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and guides

---

 
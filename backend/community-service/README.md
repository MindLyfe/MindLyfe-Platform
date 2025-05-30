# MindLyfe Community Service

## Overview

The MindLyfe Community Service manages social features for the MindLyfe mental health platform, including user posts, comments, reactions, follows, and community interactions.

The Community Service manages the social aspects of the MindLyfe platform, enabling users to connect, share experiences, and support each other in a moderated environment.

## Features

- User profiles and connections
- Follow system for user relationships
- Public and private community forums
- Content moderation and reporting
- Post and comment management
- User reactions and engagement metrics
- User verification for therapists

## Architecture

The Community Service is built with:
- NestJS framework for TypeScript-based backend
- PostgreSQL for persistent data storage
- Redis for caching and rate limiting
- Socket.IO for real-time notifications

## Service Dependencies

The Community Service interacts with:

1. **Auth Service**
   - For user authentication and authorization
   - For role-based permission checks
   - For verifying user identity

2. **Chat Service**
   - Provides follow relationship data for chat permissions
   - Enables direct messaging between connected users

## Business Rules

### User Connections
- Users can follow other users to create connections
- Follow relationships are unidirectional but can be bidirectional
- Users can block followers to prevent unwanted connections
- Therapists undergo verification before receiving the therapist role

### Content Rules
- All content is subject to moderation
- Users can report inappropriate content
- Community guidelines are enforced by moderators
- Different visibility levels for content (public, followers, private)

### Privacy Controls
- Users can control who can follow them
- Users can remain anonymous in certain contexts
- User activity tracking is optional and configurable

## API Endpoints

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `POST /users/therapist/verify` - Request therapist verification
- `PATCH /users/:id/therapist` - Verify therapist status

### Follows
- `POST /follows` - Follow a user
- `DELETE /follows/:id` - Unfollow a user
- `GET /follows/followers` - Get user's followers
- `GET /follows/following` - Get users being followed
- `POST /follows/block/:id` - Block a follower
- `GET /follows/check` - Check follow relationship

### Posts
- `POST /posts` - Create a post
- `GET /posts` - Get feed posts
- `GET /posts/:id` - Get a specific post
- `PATCH /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

### Comments
- `POST /posts/:id/comments` - Add a comment
- `GET /posts/:id/comments` - Get comments on a post
- `PATCH /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment

### Reactions
- `POST /posts/:id/reactions` - React to a post
- `DELETE /posts/:id/reactions/:type` - Remove a reaction
- `GET /posts/:id/reactions` - Get reactions on a post

### Moderation
- `POST /moderation/report` - Report content
- `GET /moderation/reports` - Get moderation reports
- `PATCH /moderation/content/:id` - Moderate content

## Environment Configuration

The Community Service requires the following environment variables:

```
# Server config
NODE_ENV=development
PORT=3004

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_community
DB_SYNC=false
DB_LOGGING=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Service URLs
CHAT_SERVICE_URL=http://chat-service:3003
AUTH_SERVICE_URL=http://auth-service:3001
```

## Setup and Development

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- Redis

### Installation
```bash
# Install dependencies
npm install

# Start the service
npm run start:dev
```

### Testing
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Deployment

The Community Service is designed to be deployed as a Docker container:

```bash
# Build the Docker image
docker build -t mindlyfe/community-service .

# Run the container
1. Clone the repository:
   ```bash
   git clone https://github.com/mindlyfe/mindlyfe.git
   cd mindlyfe/backend/community-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run migrations:
   ```bash
   npm run migration:run
   ```

5. Start the service:
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

The Community Service follows REST principles with JWT authentication.

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Posts

- `POST /posts` - Create a post
- `GET /posts` - List posts
- `GET /posts/:id` - Get a post by ID
- `PATCH /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post
- `POST /posts/:id/report` - Report a post
- `PATCH /posts/:id/moderate` - Moderate a post (admin/moderator only)

#### Comments

- `POST /comments` - Create a comment
- `GET /comments` - List comments
- `GET /comments/:id` - Get a comment by ID
- `PATCH /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment
- `POST /comments/:id/report` - Report a comment
- `PATCH /comments/:id/moderate` - Moderate a comment (admin/moderator only)

#### Reactions

- `POST /reactions` - Add a reaction
- `DELETE /reactions` - Remove a reaction
- `GET /reactions` - List reactions

#### Users

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update current user profile
- `POST /users/therapist/verify-request` - Request therapist verification
- `PATCH /users/:id/therapist/verify` - Verify a therapist (admin/moderator only)

#### Moderation

- `POST /moderation/report` - Report content
- `PATCH /moderation/review/:id` - Review reported content (admin/moderator only)

### WebSocket Events

The service provides real-time updates through WebSocket connections at `/community`.

**Key Events**:

- `postCreated`, `postUpdated`, `postDeleted`
- `commentCreated`, `commentUpdated`, `commentDeleted`
- `reactionAdded`, `reactionRemoved`
- `contentReported`, `contentReviewed`

## Architecture

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic and data operations
- **DTOs**: Define data transfer objects with validation
- **Entities**: Define database models and relationships
- **Gateway**: Manage WebSocket connections and events

### Integrations

- **AuthClientService**: Communication with Auth Service for user validation
- **WebSockets**: Real-time event publishing via Socket.io
- **TypeORM**: Database operations and entity management

## Development

### Code Structure

```
src/
├── app.module.ts                 # Main application module
├── common/                       # Shared utilities
├── config/                       # Configuration
├── posts/                        # Posts feature module
│   ├── dto/                      # Data transfer objects
│   ├── entities/                 # Database entities
│   ├── posts.controller.ts       # REST endpoints
│   └── posts.service.ts          # Business logic
├── comments/                     # Comments feature module
├── reactions/                    # Reactions feature module
├── users/                        # Users feature module
├── moderation/                   # Moderation feature module
└── community.gateway.ts          # WebSocket gateway
```

### Style Guide

- Follow NestJS best practices and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Use async/await for asynchronous operations
- Implement comprehensive error handling
- Write unit and integration tests

### Testing

Run tests with:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Privacy Considerations

The Community Service implements several privacy-enhancing features:

- **Anonymous Posting**: Users can post without revealing identity
- **Content Visibility**: Granular control over who can view content
- **Data Minimization**: Only essential data is collected and stored
- **Secure Authentication**: JWT-based authentication with short-lived tokens
- **Role-Based Access**: Strict permission controls based on user roles

## License

This project is proprietary software of MindLyfe. 
# MindLyfe Chat Service

## Overview

The MindLyfe Chat Service enables real-time messaging functionality for the MindLyfe mental health platform. It supports both one-on-one conversations between users and therapists, as well as group discussions and community interactions.

The Chat Service is a crucial component of the MindLyfe mental health platform that enables secure communication between users, therapists, and support groups.

## Features

- Private one-on-one messaging
- Group chat for therapy sessions
- End-to-end encryption options for sensitive conversations
- Rich media attachments (images, documents, audio)
- Read receipts and typing indicators
- Message moderation and reporting
- Chat room privacy controls

## Architecture

The Chat Service is built with:
- NestJS framework for TypeScript-based backend
- PostgreSQL for message and room storage
- Socket.IO for real-time communication
- Redis for pub/sub and presence tracking

## Service Dependencies

The Chat Service interacts with:

1. **Auth Service**
   - For user authentication and authorization
   - For role-based permission checks

2. **Teletherapy Service**
   - Verifies if a user has booked sessions with a therapist
   - Receives chat room creation requests after therapy sessions

3. **Community Service**
   - Checks follow relationships between users

## Business Rules

### Chat Room Creation
- Only therapists and admins can create group chats
- Users can create direct (one-on-one) chats only if:
  - They are chatting with a therapist they've had sessions with
  - They are chatting with a user they follow or who follows them

### Message Permissions
- All participants in a room can send messages
- Rate limiting applies (10 messages per minute)
- Messages can be moderated by admins and moderators

## API Endpoints

### Chat Rooms
- `POST /chat/rooms` - Create a chat room
- `GET /chat/rooms` - Get user's chat rooms
- `GET /chat/rooms/:id` - Get a specific chat room

### Messages
- `POST /chat/messages` - Send a message
- `GET /chat/rooms/:id/messages` - Get messages in a room
- `POST /chat/rooms/:id/read` - Mark messages as read

### Moderation
- `POST /chat/moderation/message` - Moderate a message
- `POST /chat/moderation/report` - Report a message

## Environment Configuration

The Chat Service requires the following environment variables:

```
# Server config
NODE_ENV=development
PORT=3003

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_chat
DB_SYNC=false
DB_LOGGING=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Redis (for Socket.IO)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Service URLs
COMMUNITY_SERVICE_URL=http://community-service:3004
TELETHERAPY_SERVICE_URL=http://teletherapy-service:3002
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

The Chat Service is designed to be deployed as a Docker container:

```bash
# Build the Docker image
docker build -t mindlyfe/chat-service .

# Run the container
docker run -p 3003:3003 mindlyfe/chat-service
```
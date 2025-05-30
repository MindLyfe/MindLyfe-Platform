# MindLyfe Microservices Communication Guide

This document explains how the different microservices in the MindLyfe platform communicate with each other, with a focus on Docker setup, environment variables, and inter-service API calls.

## Architecture Overview

The MindLyfe platform consists of the following services:

1. **API Gateway** (Port 3000)
   - Entry point for client requests
   - Routes requests to appropriate microservices

2. **Auth Service** (Port 3001)
   - Handles authentication and authorization
   - Provides JWT tokens for user authentication
   - Maintains user accounts and roles

3. **Teletherapy Service** (Port 3002)
   - Manages therapy sessions and scheduling
   - Handles video/audio conferencing

4. **Chat Service** (Port 3003)
   - Manages chat functionality between users
   - Supports direct and group messaging

5. **Community Service** (Port 3004)
   - Handles the social aspects of the platform
   - Manages user relationships and content sharing

6. **Notification Service** (Port 3005)
   - Centralizes all notifications across the platform
   - Handles email, push, and in-app notifications

7. **AI Service** (Port 8000)
   - Provides core AI functionality
   - Handles model inference and management
   - Processes natural language requests
   - Integrates with OpenAI and other AI providers

8. **Journal Service** (Port 8001)
   - Manages journal entries and analysis
   - Provides user insights based on journaling
   - Communicates with AI Service for text analysis

9. **Recommender Service** (Port 8002)
   - Provides personalized recommendations
   - Manages activity and resource catalog
   - Uses AI Service for recommendation algorithms

10. **LyfeBot Service** (Port 8003)
    - Manages conversational AI assistant
    - Handles conversation history and context
    - Communicates with AI, Journal, and Recommender services

## Docker Environment Setup

All services are containerized using Docker and orchestrated with Docker Compose. Key aspects of the configuration:

- **Shared Network**: All services are on the `mindlyfe-network` Docker network
- **Container Names**: Container names match service names for easy DNS resolution
- **Database**: PostgreSQL with separate databases for each service
- **Cache**: Redis for shared caching and session storage

## Service-to-Service Communication

### Authentication Flow

1. **Client → API Gateway → Auth Service**:
   - Client sends login credentials
   - Auth Service validates and returns JWT token

2. **Client → API Gateway → Any Service**:
   - Client includes JWT in Authorization header
   - Services validate the token with Auth Service or locally

### Service-to-Service Authentication

For service-to-service calls, two methods are used:

1. **JWT Validation**:
   - Services validate user tokens with Auth Service
   - Example: `POST http://auth-service:3001/api/auth/validate-token`

2. **Service Tokens**:
   - For privileged service-to-service communication
   - Services can get a service token from Auth Service
   - Example: `POST http://auth-service:3001/api/auth/service-token`

### Key Communication Patterns

#### Auth Service → Notification Service

- **Purpose**: Send welcome emails, password reset emails
- **Method**: HTTP POST requests
- **Endpoint**: `POST http://notification-service:3005/api/notification`
- **Authentication**: Service token

#### Teletherapy Service → Chat Service

- **Purpose**: Create chat rooms for therapy sessions
- **Method**: HTTP POST requests
- **Endpoint**: `POST http://chat-service:3003/api/chat/rooms`
- **Authentication**: Service token

#### Chat Service → Teletherapy Service

- **Purpose**: Verify therapist-client relationship
- **Method**: HTTP GET requests
- **Endpoint**: `GET http://teletherapy-service:3002/api/teletherapy/relationship/:therapistId/:clientId`
- **Authentication**: Service token

#### Chat Service → Community Service

- **Purpose**: Verify user relationships
- **Method**: HTTP GET requests
- **Endpoint**: `GET http://community-service:3004/api/follow/follows/:userId/:targetId`
- **Authentication**: Service token

#### Any Service → Notification Service

- **Purpose**: Send notifications to users
- **Method**: HTTP POST requests
- **Endpoint**: `POST http://notification-service:3005/api/notification`
- **Authentication**: Service token

### AI Microservices Communication

#### Journal Service → AI Service

- **Purpose**: Analyze journal entries
- **Method**: HTTP POST requests
- **Endpoint**: `POST http://ai-service:8000/api/v1/journal/analyze`
- **Authentication**: Service token
- **Example Payload**:
  ```json
  {
    "content": "Today I felt much better than yesterday...",
    "user_id": "user_123",
    "entry_id": 456
  }
  ```

#### Recommender Service → AI Service

- **Purpose**: Generate personalized recommendations
- **Method**: HTTP POST requests
- **Endpoint**: `POST http://ai-service:8000/api/v1/recommender/generate`
- **Authentication**: Service token
- **Example Payload**:
  ```json
  {
    "user_id": "user_123",
    "preferences": {"categories": ["meditation", "exercise"]},
    "context": {"mood": "anxious", "time_of_day": "evening"}
  }
  ```

#### Recommender Service → Journal Service

- **Purpose**: Get user journal insights
- **Method**: HTTP GET requests
- **Endpoint**: `GET http://journal-service:8001/api/v1/insights/user/:userId/summary`
- **Authentication**: Service token

#### LyfeBot Service → AI Service

- **Purpose**: Generate conversational responses
- **Method**: HTTP POST requests
- **Endpoint**: `POST http://ai-service:8000/api/v1/lyfebot/generate`
- **Authentication**: Service token
- **Example Payload**:
  ```json
  {
    "message": "I've been feeling anxious lately",
    "conversation_id": "conv_789",
    "user_id": "user_123",
    "history": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}],
    "context": {}
  }
  ```

#### LyfeBot Service → Journal Service

- **Purpose**: Get user journal insights for context
- **Method**: HTTP GET requests
- **Endpoint**: `GET http://journal-service:8001/api/v1/insights/user/:userId/summary`
- **Authentication**: Service token

#### LyfeBot Service → Recommender Service

- **Purpose**: Get personalized recommendations to suggest
- **Method**: HTTP POST requests
- **Endpoint**: `POST http://recommender-service:8002/api/v1/recommendations`
- **Authentication**: Service token
- **Example Payload**:
  ```json
  {
    "count": 3,
    "category": "coping_strategies",
    "exclude_ids": [1, 2, 3]
  }
  ```

## Environment Variables

Each service container includes environment variables for connecting to other services:

```
# Core services
AUTH_SERVICE_URL=http://auth-service:3001
TELETHERAPY_SERVICE_URL=http://teletherapy-service:3002
CHAT_SERVICE_URL=http://chat-service:3003
COMMUNITY_SERVICE_URL=http://community-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# AI microservices
AI_SERVICE_URL=http://ai-service:8000
JOURNAL_SERVICE_URL=http://journal-service:8001
RECOMMENDER_SERVICE_URL=http://recommender-service:8002
LYFEBOT_SERVICE_URL=http://lyfebot-service:8003
```

Additionally, all services share these common environment variables:

```
JWT_SECRET=mindlyfe-auth-secret-key-dev
DB_HOST=postgres
REDIS_HOST=redis
```

## Data Flow Diagrams

### User Authentication Flow
```
Client → API Gateway → Auth Service → Database
   ↓           ↑
   ↓           ↑
Client ← API Gateway ← Auth Service (JWT token)
```

### Journal Entry Analysis Flow
```
Client → API Gateway → Journal Service → Database
                          ↓
                        AI Service
                          ↓
Client ← API Gateway ← Journal Service
```

### LyfeBot Conversation Flow
```
Client → API Gateway → LyfeBot Service → Database
                          ↓
                        AI Service
                          ↓
                      Journal Service
                          ↓
                    Recommender Service
                          ↓
Client ← API Gateway ← LyfeBot Service
```

## Starting the Services

Start all services with:

```bash
docker-compose up
```

Or start individual services:

```bash
docker-compose up auth-service notification-service
```

For the AI microservices:

```bash
docker-compose up ai-service journal-service recommender-service lyfebot-service
```

## Troubleshooting Communication Issues

1. **Network Connectivity**:
   - Ensure all services are on the same Docker network
   - Check container names match service URLs

2. **Authentication Issues**:
   - Verify JWT_SECRET is consistent across services
   - Check service token permissions

3. **Database Connectivity**:
   - Ensure database credentials are correct
   - Verify database names exist

4. **Service Availability**:
   - Check service health endpoints (`GET /health`)
   - Verify service dependencies are running

5. **AI Service Issues**:
   - Verify OpenAI API key is valid (for AI Service)
   - Check model availability and configurations

## API Documentation

Each service provides Swagger documentation at:

```
http://<service-host>:<port>/api/docs
```

For the AI microservices:
- AI Service: `http://localhost:8000/api/docs`
- Journal Service: `http://localhost:8001/api/docs`
- Recommender Service: `http://localhost:8002/api/docs`
- LyfeBot Service: `http://localhost:8003/api/docs`
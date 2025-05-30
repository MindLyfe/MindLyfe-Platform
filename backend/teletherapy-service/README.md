# MindLyfe Teletherapy Service

The Teletherapy Service manages all aspects of therapy sessions on the MindLyfe platform, enabling secure video, audio, and text-based therapy sessions between therapists and clients.

## Features

- Session scheduling and management
- Support for individual and group therapy
- Video, audio, and text-based sessions
- Session recordings and transcripts
- Therapy notes and documentation
- Breakout rooms for group sessions
- Calendar integration
- Follow-up chat room creation

## Architecture

The Teletherapy Service is built with:
- NestJS framework for TypeScript-based backend
- PostgreSQL for session and user data
- WebRTC for real-time peer-to-peer communication
- MediaSoup for SFU (Selective Forwarding Unit) capabilities
- Socket.IO for real-time signaling
- Custom recording service for session capture

## Service Dependencies

The Teletherapy Service interacts with:

1. **Auth Service**
   - For user authentication and authorization
   - For role-based permission checks
   - For validating therapist credentials

2. **Chat Service**
   - Creates follow-up chat rooms after group sessions
   - Shares participant information for chat room creation

## Business Rules

### Session Creation
- Only verified therapists can create therapy sessions
- Sessions are scheduled with fixed start and end times
- Participants must be valid platform users
- Session types include individual, group, workshop, support, couples, and family therapy

### Participant Management
- Therapists control participant access and roles
- Breakout rooms can be created for group sessions
- Maximum participant limits apply for different session types
- Participants can join sessions via a waiting room

### Session Completion
- Session notes and recordings are securely stored
- Follow-up chat rooms are automatically created for group sessions
- Session status transitions follow a defined workflow

## API Endpoints

### Sessions
- `POST /teletherapy/sessions` - Create a new therapy session
- `GET /teletherapy/sessions/:id` - Get a specific session
- `GET /teletherapy/sessions/upcoming` - Get upcoming sessions
- `PATCH /teletherapy/sessions/:id/status` - Update session status
- `PATCH /teletherapy/sessions/:id/notes` - Update session notes
- `POST /teletherapy/sessions/:id/cancel` - Cancel a session

### Participants
- `POST /teletherapy/sessions/:id/participants` - Add participants
- `DELETE /teletherapy/sessions/:id/participants` - Remove participants
- `PATCH /teletherapy/sessions/:id/participants/role` - Update participant role
- `POST /teletherapy/sessions/:id/breakout-rooms` - Manage breakout rooms

### Session Interaction
- `POST /teletherapy/sessions/:id/join` - Join a session
- `POST /teletherapy/sessions/:id/leave` - Leave a session
- `POST /teletherapy/:id/create-chat-room` - Create a chat room for a session

### Session Relationship
- `GET /teletherapy/sessions/relationship` - Check therapist-client relationship

## Environment Configuration

The Teletherapy Service requires the following environment variables:

```
# Server config
NODE_ENV=development
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_teletherapy
DB_SYNC=false
DB_LOGGING=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# WebRTC
ICE_SERVERS=[{"urls":"stun:stun.l.google.com:19302"},{"urls":"stun:stun1.l.google.com:19302"}]

# MediaSoup
MEDIASOUP_ANNOUNCED_IP=127.0.0.1
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100

# Service URLs
CHAT_SERVICE_URL=http://chat-service:3003
AUTH_SERVICE_URL=http://auth-service:3001
```

## Setup and Development

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- Redis for session management
- TURN/STUN servers for WebRTC

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

The Teletherapy Service is designed to be deployed as a Docker container:

```bash
# Build the Docker image
docker build -t mindlyfe/teletherapy-service .

# Run the container
docker run -p 3002:3002 mindlyfe/teletherapy-service
```
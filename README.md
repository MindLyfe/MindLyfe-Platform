# MindLyf - Mental Health Platform

MindLyf is a comprehensive mental health platform that provides therapy services, community support, and secure communication for users and therapists.

## Architecture Overview

The platform follows a microservices architecture with the following core services:

### 1. Auth Service
- Centralized authentication and authorization
- User management and role-based access control
- JWT token issuance and validation
- Service-to-service authentication

### 2. Teletherapy Service
- Schedule and manage therapy sessions
- Support for individual and group therapy
- Video, audio, and chat-based therapy sessions
- Session management for therapists and clients

### 3. Chat Service
- Private and group messaging
- End-to-end encryption option
- Support for file sharing and rich media
- Chat rooms for therapy follow-ups

### 4. Community Service
- Public and private community forums
- User following system
- Content moderation
- Support groups

### 5. Notification Service
- Centralized service for emails and notifications
- Email notifications via AWS SES
- In-app notifications for real-time updates
- Push notifications for mobile devices
- SMS notifications for critical alerts
- User preference management for notification settings

## Service Communication

The services communicate with each other as follows:

1. **Auth Service Integration**:
   - All services authenticate users through the Auth Service
   - Auth Client module in shared libraries ensures consistent authentication
   - Service-to-service communication uses service tokens for authentication

2. **Teletherapy ↔ Chat Service**:
   - Chat Service verifies with Teletherapy Service if a user has booked sessions with a therapist
   - Teletherapy Service automatically creates chat rooms when group sessions end
   - Both services preserve session context and participant information

3. **Community ↔ Chat Service**:
   - Chat Service verifies follow relationships with Community Service
   - Chat permissions are based on community relationships
   - Both services enforce consistent privacy rules

## Business Rules

### Chat Permissions
- Only therapists and admins can create group chats
- Users can only chat one-on-one with therapists after booking a session with them
- Users can chat with other users if they follow each other in the Community Service
- All chats between users and therapists maintain session context

### Therapy Sessions
- Only verified therapists can create therapy sessions
- Group sessions automatically create follow-up chat rooms
- Session notes and records are securely stored
- Therapists can manage breakout rooms and participant roles

## Development Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- Redis (for session management)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see `.env.example` files in each service)
4. Start services: `docker-compose up`

## Deployment

The application is designed to be deployed on AWS with:
- ECS Fargate for container orchestration
- RDS for database storage
- DynamoDB for session and message storage
- S3 for file storage
- Lambda for event processing

## Security Features

- Role-based access control
- End-to-end encryption for private messages
- Soft deletion for audit trails
- Rate limiting for API endpoints
- Content moderation capabilities 

## Architecture

MindLyf consists of the following microservices:

- **API Gateway**: Entry point that routes requests to appropriate services
- **Auth Service**: Handles user authentication, registration, and authorization
- **Notification Service**: Centralized service for emails and notifications
- **AI Service**: Handles AI-powered features including LyfBot and recommendations
- **Community Service**: Manages community features, follows, and posts
- **Chat Service**: Facilitates real-time and asynchronous messaging
- **Teletherapy Service**: Manages video sessions, scheduling, and therapist interactions

### Notification Service

The Notification Service is a centralized microservice that handles all types of notifications across the MindLyf platform. It provides:

- Email notifications via AWS SES
- In-app notifications for real-time updates
- Push notifications for mobile devices
- SMS notifications for critical alerts
- User preference management for notification settings

Other services integrate with the Notification Service to send user communications, ensuring consistent delivery and tracking of all platform messages.

## Getting Started 
# MindLyfe Backend Services

This directory contains the backend services for the MindLyfe Mental Health Platform.

## Architecture

The backend follows a microservices architecture with the following services:

| Service                            | Tech                         | Description                  |
| ---------------------------------- | ---------------------------- | ---------------------------- |
| **API Gateway**                   | NestJS                       | Central entry point for all client requests |
| **Auth Service**                   | NestJS + Cognito             | Authentication, user management with MFA, RBAC |
| **AI Personalization Service**     | FastAPI + OpenAI API         | LyfeBot, AI Journeys, personalization |
| **Journal Analysis Service**       | Python Lambda / ECS          | NLP + summaries of journal entries |
| **Resource Recommendation Engine** | Node.js / Python             | Recommender logic, content tagging |
| **Chat/WebSocket Gateway**         | NestJS + Redis               | Real-time communication |
| **Teletherapy Service**            | WebRTC signaling on ECS      | Video therapy sessions |
| **Reporting Service**              | NestJS + Athena / QuickSight | Admin and organization dashboards |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js v18 or higher
- Python 3.10 or higher
- Poetry (for Python dependency management)

### Environment Setup

1. Clone the repository
2. Create `.env` files for each service with the required configuration (see `.env.example` files)

### Running the Services Locally

```bash
# Start all services with Docker Compose
cd backend
docker-compose up

# Or start individual services:
npm run start:gateway
npm run start:auth
npm run start:ai
```

### Development Workflow

1. Each service is developed independently
2. Services communicate via defined APIs
3. Common code is shared through the `shared` package
4. API Gateway routes requests to appropriate services

## API Documentation

When running locally, API documentation is available at:

- API Gateway: http://localhost:3000/api/docs
- Auth Service: http://localhost:3001/api/docs
- AI Service: http://localhost:8000/api/docs

## Testing

```bash
# Run tests for all services
npm test

# Run tests for a specific service
cd auth-service
npm test
```

## Deployment

The services are designed to be deployed as containers to a Kubernetes cluster. Refer to the infrastructure documentation for details on the deployment process.

## Service Dependencies

- **Database**: PostgreSQL is used for persistent storage
- **Cache**: Redis is used for caching and pub/sub messaging
- **Cloud Services**: AWS Cognito, AWS Athena, etc.

## Contributing

Follow the established architecture patterns when contributing to the backend:
- Domain-driven design principles
- SOLID code principles
- Thorough test coverage
- Proper error handling
- Security best practices
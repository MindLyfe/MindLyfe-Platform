# MindLyfe AI Microservices Architecture

This document explains the AI microservices architecture for the MindLyfe platform.

## Architecture Overview

The MindLyfe platform uses a microservices architecture for its AI capabilities, with separate services handling different AI-related functionalities:

1. **AI Service** (Port 8000)
   - Core AI functionality and model management
   - Provides AI inference endpoints for other services
   - Natural language processing capabilities
   - Integration with OpenAI API and other providers
   - Model training and evaluation
   - Shared AI utilities (text processing, analysis, etc.)

2. **Journal Service** (Port 8001)
   - Journal entry management and storage
   - Requests AI analysis from AI Service
   - Sentiment analysis and theme extraction
   - User insights generation based on journal patterns
   - Provides journal data and insights to other services

3. **Recommender Service** (Port 8002)
   - Personalized activity and resource recommendations
   - Uses AI Service for recommendation algorithms
   - Accesses Journal Service for user insights
   - Activity classification and categorization
   - User preference modeling and feedback processing
   - A/B testing for recommendation algorithms

4. **LyfeBot Service** (Port 8003)
   - Conversational AI assistant interface
   - Manages conversation context and history
   - Requests response generation from AI Service
   - Accesses Journal Service for user insights
   - Gets personalized recommendations from Recommender Service
   - Crisis detection and appropriate responses

## Service Communication Patterns

### AI Service as Central Intelligence Provider

The AI Service acts as a central intelligence provider, with other services requesting specific AI capabilities:

1. **AI Service ⟵ Journal Service**
   - Journal Service sends text for sentiment analysis
   - Journal Service requests theme extraction
   - Journal Service requests insight generation

2. **AI Service ⟵ Recommender Service**
   - Recommender Service requests personalized recommendations
   - Recommender Service asks for content analysis
   - Recommender Service requests similarity scoring

3. **AI Service ⟵ LyfeBot Service
   - LyfeBot Service requests conversation responses
   - LyfeBot Service asks for crisis detection
   - LyfeBot Service requests message analysis

### Inter-service Data Sharing

Services share data with each other through authenticated API calls:

1. **Journal Service ⟵ LyfeBot Service**
   - LyfeBot Service requests user journal insights
   - LyfeBot Service gets recent journal themes
   - LyfeBot Service accesses mood trends

2. **Recommender Service ⟵ LyfeBot Service**
   - LyfeBot Service requests personalized activity suggestions
   - LyfeBot Service gets recommended coping strategies
   - LyfeBot Service accesses wellness plan information

3. **Journal Service ⟵ Recommender Service**
   - Recommender Service requests journal insights
   - Recommender Service gets mood trends
   - Recommender Service accesses user themes

## Authentication and Security

All service-to-service communication is secured:

1. **Service Token Authentication**
   - Services obtain tokens from Auth Service
   - Tokens are included in all inter-service requests
   - Permissions are scoped to service needs

2. **User Context Propagation**
   - User ID is passed between services
   - User permissions are verified for data access
   - No service can access data without proper authorization

## Data Flow Examples

### Journal Analysis Flow

1. User creates journal entry via client application
2. Client sends journal entry to Journal Service
3. Journal Service stores the entry in its database
4. Journal Service sends entry content to AI Service for analysis
5. AI Service analyzes content (sentiment, themes, etc.)
6. AI Service returns analysis results to Journal Service
7. Journal Service stores analysis with the journal entry
8. Journal Service triggers insight generation (if applicable)
9. Journal Service sends notification via Notification Service (if new insights)

### Recommendation Generation Flow

1. User requests recommendations via client application
2. Client sends request to Recommender Service
3. Recommender Service authenticates the user via Auth Service
4. Recommender Service requests journal insights from Journal Service
5. Journal Service returns relevant user insights
6. Recommender Service sends user data to AI Service for recommendation generation
7. AI Service generates personalized recommendations
8. AI Service returns recommendations to Recommender Service
9. Recommender Service formats and returns recommendations to client
10. Recommender Service logs the recommendations for feedback tracking

### LyfeBot Conversation Flow

1. User sends message to LyfeBot via client application
2. Client sends message to LyfeBot Service
3. LyfeBot Service authenticates the user via Auth Service
4. LyfeBot Service checks for crisis indicators (locally or via AI Service)
5. LyfeBot Service requests relevant journal insights from Journal Service
6. LyfeBot Service requests relevant recommendations from Recommender Service
7. LyfeBot Service sends message, context, and history to AI Service
8. AI Service generates appropriate response
9. AI Service returns response to LyfeBot Service
10. LyfeBot Service stores the conversation and returns response to client
11. LyfeBot Service initiates any follow-up actions (notifications, etc.)

## Database Structure

Each service has its own database to maintain service independence:

- **AI Service**: `mindlyfe_ai` 
  - Model metadata and configurations
  - Training data and evaluation metrics
  - Cached responses for performance
  - Usage statistics and monitoring data

- **Journal Service**: `mindlyfe_journal`
  - Journal entries and metadata
  - Entry analyses (sentiment, themes, etc.)
  - User insights and patterns
  - Journaling prompts and templates

- **Recommender Service**: `mindlyfe_recommender`
  - Activity and resource catalog
  - User preferences and feedback
  - Recommendation history
  - A/B test configurations and results
  - Wellness plans and programs

- **LyfeBot Service**: `mindlyfe_lyfebot`
  - Conversation history and metadata
  - User session context
  - Crisis detection logs
  - User feedback on conversations
  - Conversation templates and flows

## Environment Configuration

Each service requires specific environment variables for proper operation:

```
# Common variables for all AI microservices
AUTH_SERVICE_URL=http://auth-service:3001
JWT_SECRET=mindlyfe-auth-secret-key-dev

# AI Service specific
OPENAI_API_KEY=your-openai-api-key
MODEL_STORAGE_PATH=/app/models
DEFAULT_MODEL=gpt-4

# Journal Service specific
AI_SERVICE_URL=http://ai-service:8000
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# Recommender Service specific
AI_SERVICE_URL=http://ai-service:8000
JOURNAL_SERVICE_URL=http://journal-service:8001
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# LyfeBot Service specific
AI_SERVICE_URL=http://ai-service:8000
JOURNAL_SERVICE_URL=http://journal-service:8001
RECOMMENDER_SERVICE_URL=http://recommender-service:8002
NOTIFICATION_SERVICE_URL=http://notification-service:3005
```

## Monitoring and Observability

- Each service exposes a `/metrics` endpoint for Prometheus
- Health check endpoints are available at `/health`
- Detailed logging with consistent format across services
- Distributed tracing for request flows across services
- Performance monitoring for AI operations

## Security and Compliance

- All services implement proper authentication and authorization
- PII detection and redaction for AI inputs
- User consent management for data processing
- Audit logging for sensitive operations
- HIPAA and GDPR compliance controls
- Data minimization principles

## Starting the Services

All services are containerized and can be started together using Docker Compose:

```bash
docker-compose up
```

Or individually:

```bash
docker-compose up ai-service journal-service
```

## API Documentation

Each service provides Swagger documentation at:

- AI Service: `http://localhost:8000/api/docs`
- Journal Service: `http://localhost:8001/api/docs`
- Recommender Service: `http://localhost:8002/api/docs`
- LyfeBot Service: `http://localhost:8003/api/docs`

## Environment Variables

Key environment variables for each service:

```
# Common
AUTH_SERVICE_URL=http://auth-service:3001
JWT_SECRET=mindlyfe-auth-secret-key-dev
OPENAI_API_KEY=your-openai-api-key

# Service-specific
AI_SERVICE_URL=http://ai-service:8000
JOURNAL_SERVICE_URL=http://journal-service:8001
RECOMMENDER_SERVICE_URL=http://recommender-service:8002
LYFEBOT_SERVICE_URL=http://lyfebot-service:8003
```
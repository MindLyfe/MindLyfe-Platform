# MindLyfe AI Service

This service provides the core AI capabilities for the MindLyfe mental health platform and serves as the central intelligence provider for the AI microservices architecture.

## Features

- **Natural Language Processing**: Text analysis, sentiment detection, and theme extraction
- **Personalization Algorithms**: AI-powered recommendation engines and content personalization
- **Model Management**: Centralized management of AI models, including OpenAI integration
- **Inference APIs**: Standardized interfaces for AI capabilities used by other services
- **Training Pipelines**: Infrastructure for continuous model improvement
- **Safety & Compliance**: Built-in safeguards for responsible AI use in mental health

## Architecture

The AI Service is part of a microservices architecture with dedicated specialized services:

### AI Microservices Architecture

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

## Technology Stack

The AI Service is built with:

- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Primary database for structured data
- **Redis**: Cache and message broker
- **OpenAI API**: For AI model inference (with custom model fallback)
- **Transformers**: For custom model training and inference

## Getting Started

### Prerequisites

- Python 3.10+
- Docker and Docker Compose
- OpenAI API key (for production deployment)

### Local Development

1. Clone the repository
```bash
git clone https://github.com/mindlyfe/mindlyfe-backend.git
cd mindlyfe-backend/ai-service
```

2. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development environment
```bash
docker-compose up -d
```

4. Access the API documentation
```
http://localhost:8000/api/docs
```

### API Endpoints

The service provides the following main API categories:

- `/api/v1/lyfebot`: LyfeBot conversation endpoints (used by LyfeBot Service)
- `/api/v1/journal`: Journal analysis endpoints (used by Journal Service)
- `/api/v1/recommendations`: Recommendation generation endpoints (used by Recommender Service)
- `/api/v1/personalization`: User preference and personalization endpoints
- `/api/v1/admin`: Admin-only endpoints for model management and monitoring
- `/health`: Service health check

## Service Communication

### Services that depend on AI Service

- **Journal Service**: For text analysis, sentiment detection, and insights generation
- **Recommender Service**: For personalized recommendation algorithms
- **LyfeBot Service**: For conversation generation and contextual responses

### Environment Variables

Key environment variables:

```
# Service URLs
AUTH_SERVICE_URL=http://auth-service:3001
JOURNAL_SERVICE_URL=http://journal-service:8001
RECOMMENDER_SERVICE_URL=http://recommender-service:8002
LYFEBOT_SERVICE_URL=http://lyfebot-service:8003

# API Keys
OPENAI_API_KEY=your-openai-api-key

# Authentication
JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/mindlyfe_ai
```

## Deployment

The service is designed to be deployed on AWS using:

- ECS Fargate for containerized deployment
- RDS PostgreSQL for database
- ElastiCache Redis for caching
- S3 for model storage
- CloudWatch for logging and monitoring

## Monitoring & Observability

The service includes:

- Prometheus metrics for performance monitoring
- Grafana dashboards for visualization
- Comprehensive logging for troubleshooting
- Error tracking with Sentry

## Development Standards

- All code must pass linting and type checking
- Unit tests required for all new features
- All AI features must include safety guardrails
- HIPAA and GDPR compliance is mandatory

## License

This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction of the contents is strictly prohibited.
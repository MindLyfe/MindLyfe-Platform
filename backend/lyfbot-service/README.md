# MindLyfe LyfeBot Service

LyfeBot is an AI-powered conversational agent for providing mental health support on the MindLyfe platform.

## Features

- Conversational mental health support
- Context-aware responses using user data
- Crisis detection and handling
- Integration with Journal, Recommender, and other services
- Support for real-time streaming responses

## Architecture

LyfeBot Service is a FastAPI application that acts as an orchestration layer for AI features:

- Communicates with AI Service for generating responses
- Uses Auth Service for authentication
- Integrates with Journal Service for insights
- Utilizes Recommender Service for personalized recommendations
- Sends notifications through Notification Service

## Development

### Prerequisites

- Python 3.10+
- PostgreSQL
- Docker and Docker Compose

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mindlyfe_lyfebot
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://ai-service:8000
AUTH_SERVICE_URL=http://auth-service:3001
JOURNAL_SERVICE_URL=http://journal-service:8001
RECOMMENDER_SERVICE_URL=http://recommender-service:8002
NOTIFICATION_SERVICE_URL=http://notification-service:3005
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Running the Service

#### With Docker

```bash
docker-compose up -d lyfebot-service
```

#### Locally

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8003
```

## API Endpoints

### Health Check

- `GET /health` - Check service health

### Conversations

- `POST /api/v1/conversations` - Create a new conversation
- `GET /api/v1/conversations` - List user conversations
- `GET /api/v1/conversations/{id}` - Get conversation details
- `PUT /api/v1/conversations/{id}` - Update conversation
- `DELETE /api/v1/conversations/{id}` - Delete conversation

### Messages

- `POST /api/v1/messages` - Send a message and get a response
- `POST /api/v1/messages/stream` - Stream a response
- `GET /api/v1/messages/{id}` - Get message details
- `POST /api/v1/messages/feedback` - Submit feedback on a message

### Context

- `GET /api/v1/context` - Get current user context
- `POST /api/v1/context/reload` - Force reload of user context

### Feedback

- `POST /api/v1/feedback/conversation` - Submit conversation feedback
- `POST /api/v1/feedback/bot` - Submit general LyfeBot feedback
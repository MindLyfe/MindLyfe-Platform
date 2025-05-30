# MindLyfe Journal Service

The Journal Service is a key component of the MindLyfe mental health platform, providing AI-powered journaling capabilities for users to track their mental health journey and receive insights.

## Features

- **Journal Entry Management**: Create, retrieve, update, and delete journal entries
- **AI-Powered Analysis**: Sentiment analysis, theme extraction, and pattern recognition
- **Personalized Insights**: Data-driven insights about mood trends and behavioral patterns
- **Entry Classification**: Categorization of entries by emotion, theme, and sentiment
- **Journaling Prompts**: AI-generated prompts to guide user journaling
- **Privacy Controls**: User-controlled sharing and privacy settings

## Architecture

The Journal Service is built with:

- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Primary database for structured data
- **SQLAlchemy**: ORM for database interactions
- **Pydantic**: Data validation and settings management
- **OpenAI Integration**: Through the AI Service for analysis capabilities

## Service Communications

### Dependent Services

- **Auth Service**: For user authentication and authorization
- **AI Service**: For natural language processing and AI-powered analysis
- **Notification Service**: For sending insight notifications to users

### Services that depend on Journal Service

- **LyfeBot Service**: Uses journal insights to provide context-aware responses
- **Recommender Service**: Uses journal data to generate personalized recommendations

## API Endpoints

### Health Check

- `GET /health` - Check service health

### Journal Entries

- `POST /api/v1/entries` - Create a new journal entry
- `GET /api/v1/entries` - List user's journal entries (with filtering)
- `GET /api/v1/entries/{id}` - Get a specific journal entry
- `PUT /api/v1/entries/{id}` - Update a journal entry
- `DELETE /api/v1/entries/{id}` - Delete a journal entry

### Analysis & Insights

- `GET /api/v1/insights/user/{user_id}` - Get all insights for a user
- `GET /api/v1/insights/user/{user_id}/summary` - Get summarized insights for a user
- `GET /api/v1/insights/entry/{entry_id}` - Get analysis for a specific entry
- `POST /api/v1/insights/refresh` - Force refresh of user insights

### Journal Prompts

- `GET /api/v1/prompts` - Get journaling prompts
- `GET /api/v1/prompts/personalized` - Get personalized prompts

## Data Flow

1. **Journal Entry Creation**:
   - User submits a journal entry
   - Entry is stored in the database
   - Background task sends entry to AI Service for analysis
   - Analysis results are stored and linked to the entry

2. **Insight Generation**:
   - Scheduled task aggregates entry analyses
   - AI Service is called to generate insights from patterns
   - Insights are stored and linked to the user
   - Notification Service is called to notify user of new insights

3. **Data Access by Other Services**:
   - LyfeBot and Recommender Services request insights via API
   - Data is provided with appropriate privacy filtering
   - User consent is verified for data sharing

## Development

### Prerequisites

- Python 3.10+
- PostgreSQL
- Docker and Docker Compose

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mindlyfe_journal
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://ai-service:8000
AUTH_SERVICE_URL=http://auth-service:3001
NOTIFICATION_SERVICE_URL=http://notification-service:3005
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Running the Service

#### With Docker

```bash
docker-compose up -d journal-service
```

#### Locally

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Security & Privacy

- All journal entries are encrypted at rest
- Analysis is performed with user consent
- Data is only shared with other services when necessary
- Users can delete their data at any time
- Compliance with HIPAA and GDPR requirements
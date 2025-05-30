# MindLyfe Recommender Service

The Recommender Service provides personalized recommendations for activities, resources, and coping strategies to MindLyfe users based on their mental health needs, preferences, and history.

## Features

- **Personalized Recommendations**: Tailored suggestions based on user data
- **Multi-category Recommendations**: Activities, resources, exercises, and content
- **Context-aware Suggestions**: Recommendations based on mood, time of day, and recent journals
- **Feedback Integration**: Learning from user feedback to improve future recommendations
- **A/B Testing**: Support for testing different recommendation algorithms
- **Wellness Plans**: Customized wellness programs for users
- **Explainable Recommendations**: Transparent reasoning for recommendations

## Architecture

The Recommender Service is built with:

- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Primary database for structured data
- **SQLAlchemy**: ORM for database interactions
- **Pydantic**: Data validation and settings management
- **AI Integration**: Through the AI Service for personalization algorithms

## Service Communications

### Dependent Services

- **Auth Service**: For user authentication and authorization
- **AI Service**: For personalization algorithms and natural language processing
- **Journal Service**: For accessing user journal insights and patterns

### Services that depend on Recommender Service

- **LyfeBot Service**: Uses recommendations to suggest activities to users during conversations
- **Notification Service**: Sends notification about new recommendations to users

## API Endpoints

### Health Check

- `GET /health` - Check service health

### Recommendations

- `POST /api/v1/recommendations` - Get personalized recommendations
- `GET /api/v1/recommendations/history` - Get user's recommendation history
- `POST /api/v1/recommendations/feedback` - Submit feedback on recommendations

### Activities

- `GET /api/v1/activities` - Get all available activities (with filtering)
- `GET /api/v1/activities/{id}` - Get a specific activity
- `GET /api/v1/activities/categories` - Get activity categories

### Wellness Plans

- `GET /api/v1/plans` - Get user's wellness plans
- `POST /api/v1/plans` - Create a new wellness plan
- `GET /api/v1/plans/{id}` - Get a specific wellness plan
- `PUT /api/v1/plans/{id}` - Update a wellness plan

## Data Flow

1. **Recommendation Generation**:
   - User requests recommendations (directly or via LyfeBot)
   - Service retrieves user profile and preferences
   - Service gets journal insights from Journal Service
   - AI Service's algorithms generate personalized recommendations
   - Recommendations are returned and logged

2. **Feedback Processing**:
   - User provides feedback on recommendations
   - Feedback is stored and linked to the recommendation
   - Periodic task analyzes feedback to improve recommendation algorithms
   - User profile is updated based on feedback

3. **Wellness Plan Creation**:
   - User initiates wellness plan creation
   - Service retrieves user profile and journal insights
   - AI Service generates personalized wellness plan
   - Plan is stored and linked to the user
   - Notifications are scheduled for plan activities

## Development

### Prerequisites

- Python 3.10+
- PostgreSQL
- Docker and Docker Compose

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mindlyfe_recommender
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://ai-service:8000
AUTH_SERVICE_URL=http://auth-service:3001
JOURNAL_SERVICE_URL=http://journal-service:8001
NOTIFICATION_SERVICE_URL=http://notification-service:3005
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Running the Service

#### With Docker

```bash
docker-compose up -d recommender-service
```

#### Locally

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

## Recommendation Engine

The recommendation engine uses several algorithms:

1. **Collaborative Filtering**: Recommending activities liked by similar users
2. **Content-Based Filtering**: Recommending activities similar to previously enjoyed ones
3. **Context-Aware Recommendations**: Considering time, location, and current mood
4. **Hybrid Approaches**: Combining multiple techniques for better results

## A/B Testing

The service supports A/B testing of recommendation algorithms:

- Users are assigned to experiment groups
- Different algorithms are used for different groups
- Performance metrics are tracked and analyzed
- Successful algorithms are gradually rolled out to all users

## Security & Privacy

- Recommendations are generated with user consent
- Sensitive user data is handled securely
- Activity tracking is privacy-focused
- Users can opt out of personalized recommendations
- Compliance with HIPAA and GDPR requirements
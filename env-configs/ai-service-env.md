# AI Service Environment Configuration

## .env File
```env
# Server Configuration
ENVIRONMENT=development
PORT=8000

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mindlyfe_ai

# Redis Configuration (for caching and rate limiting)
REDIS_URL=redis://redis:6379/0

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# Service Communication
AUTH_SERVICE_URL=http://auth-service:3001

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_MODEL=gpt-4
OPENAI_API_TEMPERATURE=0.7
OPENAI_API_MAX_TOKENS=1000

# AI Features Configuration
ENABLE_CONTENT_MODERATION=true
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_JOURNALING_INSIGHTS=true
ENABLE_THERAPY_RECOMMENDATIONS=true

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
MAX_TOKENS_PER_DAY=100000

# CORS Configuration
CORS_ORIGINS=*

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

## .env.example File
```env
# Server Configuration
ENVIRONMENT=development
PORT=8000

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mindlyfe_ai

# Redis Configuration (for caching and rate limiting)
REDIS_URL=redis://redis:6379/0

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# Service Communication
AUTH_SERVICE_URL=http://auth-service:3001

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_MODEL=gpt-4
OPENAI_API_TEMPERATURE=0.7
OPENAI_API_MAX_TOKENS=1000

# AI Features Configuration
ENABLE_CONTENT_MODERATION=true
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_JOURNALING_INSIGHTS=true
ENABLE_THERAPY_RECOMMENDATIONS=true

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
MAX_TOKENS_PER_DAY=100000

# CORS Configuration
CORS_ORIGINS=*

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```
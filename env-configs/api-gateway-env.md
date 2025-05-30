# API Gateway Environment Configuration

## .env File
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# Service URLs
AUTH_SERVICE_URL=http://auth-service:3001
TELETHERAPY_SERVICE_URL=http://teletherapy-service:3002
CHAT_SERVICE_URL=http://chat-service:3003
COMMUNITY_SERVICE_URL=http://community-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005
AI_SERVICE_URL=http://ai-service:8000

# Redis Configuration (for caching and rate limiting)
REDIS_HOST=redis
REDIS_PORT=6379

# CORS Configuration
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=30
API_RATE_LIMIT=100 # requests per minute
API_RATE_LIMIT_WINDOW=60000 # 1 minute in milliseconds

# API Documentation
SWAGGER_TITLE=MindLyfe API
SWAGGER_DESCRIPTION=Mental health platform API
SWAGGER_VERSION=1.0
SWAGGER_PATH=/api/docs

# Security
HELMET_ENABLED=true
TRUST_PROXY=true
```

## .env.example File
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# Service URLs
AUTH_SERVICE_URL=http://auth-service:3001
TELETHERAPY_SERVICE_URL=http://teletherapy-service:3002
CHAT_SERVICE_URL=http://chat-service:3003
COMMUNITY_SERVICE_URL=http://community-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005
AI_SERVICE_URL=http://ai-service:8000

# Redis Configuration (for caching and rate limiting)
REDIS_HOST=redis
REDIS_PORT=6379

# CORS Configuration
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=30
API_RATE_LIMIT=100 # requests per minute
API_RATE_LIMIT_WINDOW=60000 # 1 minute in milliseconds

# API Documentation
SWAGGER_TITLE=MindLyfe API
SWAGGER_DESCRIPTION=Mental health platform API
SWAGGER_VERSION=1.0
SWAGGER_PATH=/api/docs

# Security
HELMET_ENABLED=true
TRUST_PROXY=true
```
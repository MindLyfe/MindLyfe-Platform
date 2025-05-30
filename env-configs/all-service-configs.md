# MindLyfe Services Configuration

This document contains configuration templates for all MindLyfe microservices. These configurations ensure proper inter-service communication with the auth service as the central authentication provider.

## Auth Service

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_auth
DB_SYNCHRONIZE=true
DB_LOGGING=true
DB_SSL=false

# JWT Configuration
JWT_SECRET=mindlyfe-auth-secret-key-dev
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_SERVICE_SECRET=mindlyfe-service-secret-key-dev

# Redis Configuration (for session/cache)
REDIS_HOST=redis
REDIS_PORT=6379

# AWS Configuration (if using AWS services)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# Email Configuration
EMAIL_FROM=support@mindlyfe.com
EMAIL_REPLY_TO=noreply@mindlyfe.com

# Frontend URL (for email links, CORS, etc.)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
AUTH_THROTTLE_TTL=60
AUTH_THROTTLE_LIMIT=5

# MFA Configuration
MFA_ISSUER=MindLyfe
MFA_WINDOW=1

# CORS Configuration
CORS_ORIGIN=*

# Service URLs
NOTIFICATION_SERVICE_URL=http://notification-service:3005
```

## Notification Service

```env
# Server Configuration
NODE_ENV=development
PORT=3005

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_notification
DB_SYNC=true
DB_LOGGING=true
DB_SSL=false

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# AWS Configuration for SES Email Service
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_SES_SOURCE_EMAIL=noreply@mindlyfe.com

# Service Communication
AUTH_SERVICE_URL=http://auth-service:3001

# CORS Configuration
CORS_ORIGIN=*

# Redis Configuration (if needed for caching)
REDIS_HOST=redis
REDIS_PORT=6379

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Chat Service

```env
# Server Configuration
NODE_ENV=development
PORT=3003

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_chat
DB_SYNC=true
DB_LOGGING=true
DB_SSL=false

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# Redis Configuration (for real-time messaging)
REDIS_HOST=redis
REDIS_PORT=6379

# Service Communication
AUTH_SERVICE_URL=http://auth-service:3001
TELETHERAPY_SERVICE_URL=http://teletherapy-service:3002
COMMUNITY_SERVICE_URL=http://community-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# WebSocket Configuration
WS_PORT=3103

# CORS Configuration
CORS_ORIGIN=*

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# File Storage (if supporting file attachments)
FILE_STORAGE_TYPE=local # or s3
FILE_STORAGE_PATH=./uploads
MAX_FILE_SIZE=5242880 # 5MB

# AWS Configuration (if using S3 for file storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=mindlyfe-chat-files
```

## Community Service

```env
# Server Configuration
NODE_ENV=development
PORT=3004

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_community
DB_SYNC=true
DB_LOGGING=true
DB_SSL=false

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# Redis Configuration (for caching)
REDIS_HOST=redis
REDIS_PORT=6379

# Service Communication
AUTH_SERVICE_URL=http://auth-service:3001
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# CORS Configuration
CORS_ORIGIN=*

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Content Moderation
ENABLE_CONTENT_MODERATION=false
MODERATION_SERVICE_URL=

# File Storage (for user uploads, community images)
FILE_STORAGE_TYPE=local # or s3
FILE_STORAGE_PATH=./uploads
MAX_FILE_SIZE=5242880 # 5MB

# AWS Configuration (if using S3 for file storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=mindlyfe-community-files
```

## Teletherapy Service

```env
# Server Configuration
NODE_ENV=development
PORT=3002

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mindlyfe_teletherapy
DB_SYNC=true
DB_LOGGING=true
DB_SSL=false

# JWT Configuration (must match auth service)
JWT_SECRET=mindlyfe-auth-secret-key-dev

# Redis Configuration (for caching and real-time)
REDIS_HOST=redis
REDIS_PORT=6379

# Service Communication
AUTH_SERVICE_URL=http://auth-service:3001
CHAT_SERVICE_URL=http://chat-service:3003
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# CORS Configuration
CORS_ORIGIN=*

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Video/Audio Provider (Twilio, Agora, etc.)
VIDEO_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_API_KEY=your-twilio-api-key
TWILIO_API_SECRET=your-twilio-api-secret

# Payment Processing (if applicable)
PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
CURRENCY=USD

# Session Configuration
DEFAULT_SESSION_DURATION=60 # minutes
BUFFER_TIME_BEFORE_SESSION=10 # minutes
BUFFER_TIME_AFTER_SESSION=5 # minutes
```

## API Gateway

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

## AI Service

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
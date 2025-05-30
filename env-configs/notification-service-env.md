# Notification Service Environment Configuration

## .env File
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

## .env.example File
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
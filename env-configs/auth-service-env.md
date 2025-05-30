# Auth Service Environment Configuration

## .env File
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

## .env.example File
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
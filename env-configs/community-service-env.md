# Community Service Environment Configuration

## .env File
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

## .env.example File
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
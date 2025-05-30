# Teletherapy Service Environment Configuration

## .env File
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

## .env.example File
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
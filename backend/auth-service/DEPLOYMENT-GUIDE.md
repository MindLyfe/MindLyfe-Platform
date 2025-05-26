# MindLyf Auth Service - Deployment Guide

## Quick Start

### Option 1: Local Development (Recommended for Testing)

1. **Install Dependencies:**
   ```bash
   cd backend/auth-service
   npm install
   ```

2. **Set Environment Variables:**
   ```bash
   export NODE_ENV=development
   export PORT=3001
   export DB_TYPE=sqlite
   export DB_NAME=./mindlyf_auth.sqlite
   export DB_SYNCHRONIZE=true
   export DB_LOGGING=true
   export JWT_SECRET=your-super-secret-jwt-key-change-in-production
   export JWT_EXPIRES_IN=24h
   export JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   export JWT_REFRESH_EXPIRES_IN=7d
   ```

3. **Start the Service:**
   ```bash
   npm run build
   npm run start:dev
   ```

4. **Test the Service:**
   ```bash
   # In a new terminal
   node test-basic.js
   ```

### Option 2: Docker with PostgreSQL

1. **Start with Docker Compose:**
   ```bash
   ./run-tests.sh start
   ```

2. **Run Tests:**
   ```bash
   ./run-tests.sh test
   ```

### Option 3: Docker with SQLite (Simplified)

1. **Start with SQLite:**
   ```bash
   docker-compose -f docker-compose.local.yml up --build
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/health/ping` - Health check

### Subscriptions
- `GET /api/subscriptions/plans` - Available plans
- `GET /api/subscriptions/status` - User subscription status
- `POST /api/subscriptions/create` - Create monthly subscription
- `POST /api/subscriptions/credits/purchase` - Purchase session credits
- `POST /api/subscriptions/payment/{id}/confirm` - Confirm payment
- `POST /api/subscriptions/session/{id}/use` - Use session

### Organizations
- `POST /api/organizations/create` - Create organization
- `POST /api/organizations/{id}/subscription` - Create org subscription
- `POST /api/organizations/{id}/users/add` - Add user to organization
- `GET /api/organizations/{id}` - Organization details

## Testing

### Comprehensive Test Suite
```bash
# Run all tests
node test-subscription-system.js

# Run basic auth tests only
node test-basic.js
```

### Manual Testing with cURL

1. **Health Check:**
   ```bash
   curl http://localhost:3001/health/ping
   ```

2. **Register User:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#",
       "firstName": "Test",
       "lastName": "User",
       "phoneNumber": "+256700000001"
     }'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#"
     }'
   ```

## Swagger Documentation

Once the service is running, visit:
- http://localhost:3001/api/docs

## Troubleshooting

### Common Issues

1. **Port Already in Use:**
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database Connection Issues:**
   - For SQLite: Ensure write permissions in the directory
   - For PostgreSQL: Check Docker containers are running

3. **Build Errors:**
   ```bash
   npm run build
   # Check for TypeScript errors
   ```

4. **Missing Dependencies:**
   ```bash
   npm install
   npm install axios uuid  # For test scripts
   ```

## Production Deployment

### Environment Variables for Production

```bash
# Database
export DB_TYPE=postgres
export DB_HOST=your-postgres-host
export DB_PORT=5432
export DB_USERNAME=your-username
export DB_PASSWORD=your-password
export DB_NAME=mindlyf_auth
export DB_SYNCHRONIZE=false
export DB_LOGGING=false
export DB_SSL=true

# Security
export JWT_SECRET=your-production-jwt-secret
export JWT_REFRESH_SECRET=your-production-refresh-secret

# Redis (for sessions)
export REDIS_HOST=your-redis-host
export REDIS_PORT=6379
export REDIS_PASSWORD=your-redis-password

# Payment Provider
export PAYMENT_PROVIDER_API_KEY=your-payment-api-key
export PAYMENT_WEBHOOK_SECRET=your-webhook-secret
```

### AWS Deployment

1. **ECS Fargate:**
   - Use the provided Dockerfile
   - Set environment variables in task definition
   - Configure load balancer for port 3001

2. **RDS PostgreSQL:**
   - Create RDS instance
   - Update DB_* environment variables

3. **ElastiCache Redis:**
   - Create Redis cluster
   - Update REDIS_* environment variables

## Monitoring

### Health Checks
- `/health/ping` - Basic health check
- `/health/detailed` - Detailed system status

### Logging
- Application logs via NestJS logger
- Database query logs (when DB_LOGGING=true)
- Request/response logs via middleware

## Security Considerations

1. **JWT Secrets:** Use strong, unique secrets in production
2. **Database:** Enable SSL and use strong passwords
3. **Rate Limiting:** Configured for auth endpoints
4. **CORS:** Configure appropriate origins
5. **Input Validation:** All DTOs have validation decorators

## Next Steps

1. **Payment Integration:** Implement real payment provider (Stripe, PayPal, etc.)
2. **Email Service:** Configure AWS SES or similar for email notifications
3. **Monitoring:** Add APM tools (New Relic, DataDog, etc.)
4. **CI/CD:** Set up automated deployment pipeline
5. **Load Testing:** Test with expected user load 
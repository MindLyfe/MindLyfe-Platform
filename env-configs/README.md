# MindLyfe Microservices Environment Configuration

This document provides an overview of the environment configurations for the MindLyfe microservices architecture. Each service has its own `.env` and `.env.example` files to ensure proper operation and communication between services.

## Key Principles

1. **Consistent JWT Secret**: All services share the same JWT secret (`JWT_SECRET`) to validate tokens issued by the auth service.

2. **Service Discovery**: Services communicate with each other using consistent Docker DNS names and ports (e.g., `http://auth-service:3001`).

3. **Centralized Authentication**: The auth service is the source of truth for user authentication and authorization.

4. **Shared Infrastructure**: All services connect to the same Redis and PostgreSQL instances but use separate databases.

5. **Standardized Environment Variables**: Variable naming follows consistent patterns across services.

## Inter-Service Communication

### Authentication Flow

1. Clients authenticate through the API Gateway
2. API Gateway forwards auth requests to Auth Service
3. Auth Service validates credentials and issues JWT tokens
4. JWT tokens are used for subsequent API calls to any service
5. Each service validates tokens either locally or by calling Auth Service

### Service-to-Service Authentication

When services need to communicate directly with each other:

1. Services can validate user tokens directly using the shared JWT secret
2. For privileged operations, services obtain service tokens from the Auth Service
3. Service tokens have specific permissions and can be validated by any service

## Environment Variables Overview

### Common Variables Across All Services

- `NODE_ENV`: Runtime environment (development/production)
- `PORT`: Service port number
- `JWT_SECRET`: Shared secret for JWT validation
- `DB_*`: Database connection parameters
- `REDIS_*`: Redis connection parameters
- `CORS_*`: CORS configuration
- `*_SERVICE_URL`: URLs for inter-service communication

### Auth Service

The Auth Service is the central authentication provider and requires these key variables:

- `JWT_SECRET`: Used to sign and verify tokens
- `JWT_EXPIRES_IN`: Token expiration time
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration
- `JWT_SERVICE_SECRET`: Secret for service-to-service tokens

### Other Services

All other services include an `AUTH_SERVICE_URL` variable to communicate with the Auth Service for:

- Token validation
- User information retrieval
- Service token issuance

## How to Use These Configuration Files

1. Copy the appropriate `.env` content from the markdown files in this directory
2. Create a `.env` file in the root of each service directory
3. Paste the content and adjust values as needed
4. For production, ensure all sensitive information is properly secured

## Production Considerations

For production deployments:

1. Use strong, unique values for all secrets and keys
2. Consider using a secrets management service (AWS Secrets Manager, HashiCorp Vault)
3. Disable synchronize mode for databases (`DB_SYNCHRONIZE=false`)
4. Configure proper CORS settings
5. Set appropriate rate limits
6. Use real AWS credentials for SES, S3, etc.
7. Enable HTTPS for all service-to-service communication
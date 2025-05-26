# MindLyf Environment Configurations
This directory contains environment configuration templates for all MindLyf microservices.
The all-service-configs.md file contains the recommended environment variables for each service.
Key principles for proper inter-service communication:
1. All services must share the same JWT_SECRET value for token validation
2. All services must have consistent service URLs (e.g., AUTH_SERVICE_URL=http://auth-service:3001)
3. All services must authenticate with the Auth Service for user and service-to-service authentication
4. The Notification Service is used by all other services for sending notifications
5. All services connect to the same Redis and PostgreSQL instances with appropriate service-specific database names

## Service Configuration Files
To configure each service, create .env files in the respective service directories:
- auth-service/.env
- notification-service/.env
- chat-service/.env
- community-service/.env
- teletherapy-service/.env

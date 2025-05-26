# Service-to-Service Authentication

This document describes the service-to-service authentication mechanism used in the Mindlyf platform.

## Overview

The service-to-service authentication system provides a secure way for different microservices to communicate with each other. It uses service tokens and the Auth Service as a central authority for authentication and authorization.

## Components

### 1. Auth Client Library

The `AuthClientModule` provides a shared library for all services to communicate with the Auth Service. It handles:
- Token validation
- User validation
- Token revocation
- Service token validation

### 2. Service Tokens

Each service has a unique service token that it uses to authenticate with other services. These tokens are:
- Stored securely in environment variables
- Validated by the Auth Service
- Used for all inter-service communication

### 3. Auth Service Endpoints

The Auth Service provides several endpoints for service-to-service authentication:

- `POST /auth/validate-token`: Validate a JWT token
- `POST /auth/validate-service-token`: Validate a service token
- `POST /auth/revoke-token`: Revoke a JWT token
- `GET /auth/users/:userId`: Get user information (service-to-service)

## Configuration

### Environment Variables

Each service needs the following environment variables:

```env
# Service identification
SERVICE_NAME=your-service-name

# Auth service configuration
SERVICES_AUTH_URL=http://auth-service:3000
SERVICES_AUTH_SERVICETOKEN=your-service-token

# Service tokens for other services
CHAT_SERVICE_TOKEN=chat-service-token
TELETHERAPY_SERVICE_TOKEN=teletherapy-service-token
API_GATEWAY_TOKEN=api-gateway-token
```

### Module Setup

To use the auth client in your service:

```typescript
import { AuthClientModule } from '@mindlyf/shared/auth-client';
import { serviceTokensConfig } from '@mindlyf/shared/config/service-tokens.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [serviceTokensConfig],
    }),
    AuthClientModule,
  ],
})
export class AppModule {}
```

## Usage

### 1. Validating User Tokens

```typescript
@Injectable()
export class YourService {
  constructor(private authClientService: AuthClientService) {}

  async validateUserToken(token: string) {
    try {
      const user = await this.authClientService.validateToken(token);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### 2. Validating Service Tokens

```typescript
@Injectable()
export class YourService {
  constructor(private authClientService: AuthClientService) {}

  async validateServiceCommunication(serviceName: string, token: string) {
    const isValid = await this.authClientService.validateServiceToken(serviceName, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid service token');
    }
  }
}
```

### 3. Using Service Token Guard

```typescript
@Controller('your-endpoint')
export class YourController {
  @UseGuards(ServiceTokenGuard)
  @Post()
  async yourEndpoint() {
    // Only accessible by authenticated services
  }
}
```

## Security Considerations

1. **Token Storage**
   - Service tokens should be stored securely
   - Never commit tokens to version control
   - Use environment variables or secure secret management

2. **Token Rotation**
   - Regularly rotate service tokens
   - Implement token expiration
   - Monitor for suspicious activity

3. **Error Handling**
   - Handle authentication failures gracefully
   - Log authentication attempts
   - Implement rate limiting

4. **Network Security**
   - Use HTTPS for all service communication
   - Implement network policies
   - Monitor network traffic

## Best Practices

1. Always use the Auth Client for authentication
2. Implement proper error handling
3. Log authentication events
4. Use environment-specific tokens
5. Regularly audit service access
6. Monitor authentication failures
7. Implement circuit breakers for auth service calls

## Troubleshooting

Common issues and solutions:

1. **Invalid Service Token**
   - Verify environment variables
   - Check token expiration
   - Ensure service name matches

2. **Connection Issues**
   - Verify Auth Service is running
   - Check network connectivity
   - Validate service URLs

3. **Permission Issues**
   - Verify service roles
   - Check user permissions
   - Validate token scope

## Support

For issues or questions:
1. Check the logs
2. Review the Auth Service status
3. Contact the platform team
4. Submit an issue in the repository 
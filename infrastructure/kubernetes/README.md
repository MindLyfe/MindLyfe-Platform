# MindLyfe Kubernetes Configuration

This directory contains Kubernetes manifests for deploying the MindLyfe microservices architecture.

## Structure

- `base/`: Contains the base Kubernetes resources that are common across all environments
  - `services/`: Deployment and Service definitions for each microservice
  - `configmaps/`: ConfigMaps for non-sensitive configuration
  - `secrets/`: Templates for Secret resources (actual secrets should be managed securely)

- `overlays/`: Environment-specific configurations that patch the base resources
  - `development/`: Development environment configuration
  - `staging/`: Staging environment configuration
  - `production/`: Production environment configuration

## Deployment

We use Kustomize to manage environment-specific configurations. The CI/CD pipeline automatically determines the target environment based on the Git branch and applies the appropriate overlay.

### Manual Deployment

To manually deploy to a specific environment:

```bash
# Build and preview the manifests
kustomize build overlays/development | less

# Apply to the cluster
kustomize build overlays/development | kubectl apply -f -
```

### Secrets Management

This repository contains only templates for secrets. Actual secrets should be managed securely using:

1. AWS Secrets Manager
2. Kubernetes External Secrets Operator 
3. Sealed Secrets
4. HashiCorp Vault

The production deployment pipeline retrieves secrets from AWS Secrets Manager and injects them into the Kubernetes cluster.

## Services

The MindLyfe platform consists of the following microservices:

1. `api-gateway`: API Gateway for routing requests to appropriate services
2. `auth-service`: Authentication and user management using Cognito
3. `ai-service`: AI-powered personalization and assistance
4. `journal-service`: Journal analysis and insights
5. `recommender-service`: Resource recommendation engine
6. `chat-service`: Real-time chat and messaging
7. `reporting-service`: Analytics and reporting
8. `teletherapy-service`: Video teletherapy sessions

## Health Checks

All services include health check endpoints at `/health` that are used by Kubernetes for readiness and liveness probes.
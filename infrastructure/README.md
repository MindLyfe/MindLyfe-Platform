# MindLyfe Infrastructure

This directory contains the infrastructure-as-code for the MindLyfe mental health platform.

## Architecture Overview

MindLyfe uses a modern cloud-native architecture deployed on AWS with the following components:

- **AWS EKS**: Kubernetes cluster for container orchestration
- **AWS RDS**: PostgreSQL database for persistent storage
- **AWS ElastiCache**: Redis for caching and pub/sub messaging
- **AWS Cognito**: User authentication and management
- **AWS S3**: Object storage for media files and archives
- **AWS CloudFront**: CDN for frontend assets
- **Terraform**: Infrastructure-as-code for AWS resources
- **Kubernetes**: Container orchestration for microservices
- **Prometheus/Grafana**: Monitoring and observability
- **ELK Stack**: Centralized logging

## Directory Structure

```
infrastructure/
├── terraform/           # Terraform IaC for AWS resources
│   ├── modules/         # Reusable Terraform modules
│   ├── environments/    # Environment-specific configurations
│   ├── main.tf          # Main Terraform configuration
│   └── variables.tf     # Variables definitions
├── kubernetes/          # Kubernetes manifests
│   ├── base/            # Base Kubernetes resources
│   ├── overlays/        # Environment-specific overlays
│   ├── monitoring/      # Prometheus and Grafana setup
│   └── logging/         # ELK stack for logging
├── scripts/             # Utility scripts
└── docs/                # Additional documentation
```

## Getting Started

### Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform 1.0+
- kubectl
- Docker

### Deploying Infrastructure

1. Initialize and apply Terraform configurations:

```bash
# Initialize Terraform
cd infrastructure/terraform
terraform init -backend-config=environments/dev/backend.tfvars

# Plan changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply changes
terraform apply -var-file=environments/dev/terraform.tfvars
```

Alternatively, use the provided script:

```bash
./infrastructure/scripts/terraform-apply.sh dev
```

### Deploying Kubernetes Resources

After the AWS infrastructure is provisioned, deploy the Kubernetes resources:

```bash
# Configure kubectl
aws eks update-kubeconfig --region <region> --name mindlyfe-dev

# Deploy base resources
cd infrastructure/kubernetes
kustomize build overlays/development | kubectl apply -f -

# Deploy monitoring stack
kustomize build monitoring | kubectl apply -f -

# Deploy logging stack
kustomize build logging | kubectl apply -f -
```

## CI/CD Pipeline

The project includes GitHub Actions workflows for CI/CD:

- **CI/CD Pipeline**: Builds and deploys microservices to EKS
- **Terraform CI/CD**: Validates and applies Terraform changes

## Environment Configuration

MindLyfe supports multiple environments:

- **Development**: For development and testing
- **Staging**: For pre-production testing
- **Production**: For the live system

Each environment has its own configuration in `terraform/environments/` and `kubernetes/overlays/`.

## Monitoring and Observability

- **Prometheus**: Collects metrics from services
- **Grafana**: Visualizes metrics and provides dashboards
- **Elasticsearch**: Stores logs from all services
- **Kibana**: Visualizes and searches logs
- **Fluentd/Filebeat**: Collects logs from Kubernetes pods

## Security

MindLyfe's infrastructure implements several security best practices:

- Network isolation using VPC and subnets
- Encryption at rest for all data stores
- Encryption in transit for all communications
- IAM roles and policies following least privilege principle
- Kubernetes RBAC for access control
- AWS Cognito for secure user authentication

## Maintenance

### Scaling

The infrastructure can scale in several ways:

- Horizontal Pod Autoscaling for Kubernetes workloads
- Node autoscaling for EKS clusters
- Read replicas for RDS
- ElastiCache scaling for Redis

### Backup and Disaster Recovery

- RDS automated backups
- S3 versioning and cross-region replication
- Kubernetes manifests backed up in Git

For a detailed disaster recovery plan, see [Disaster Recovery Plan](../# Disaster Recovery Plan).

## Troubleshooting

For common issues and solutions, see [Troubleshooting Guide](docs/troubleshooting.md).

## Contributing

When contributing to the infrastructure code:

1. Use Terraform modules for reusable components
2. Follow the existing naming conventions
3. Use Kustomize for Kubernetes resource customization
4. Document all significant changes
5. Test changes in the development environment before applying to production
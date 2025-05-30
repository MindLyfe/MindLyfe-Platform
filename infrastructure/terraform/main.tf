terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.10"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.5"
    }
  }

  backend "s3" {
    # This will be configured in each environment
    # Example: terraform init -backend-config=environments/dev/backend.tfvars
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "MindLyfe"
      ManagedBy   = "Terraform"
    }
  }
}

# Will be configured after EKS cluster is created
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.this.token
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    token                  = data.aws_eks_cluster_auth.this.token
  }
}

data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}

# VPC and Networking
module "networking" {
  source = "./modules/networking"

  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  private_subnets     = var.private_subnets
  public_subnets      = var.public_subnets
  database_subnets    = var.database_subnets
  elasticache_subnets = var.elasticache_subnets
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"

  environment                 = var.environment
  cluster_name                = "mindlyfe-${var.environment}"
  cluster_version             = var.eks_cluster_version
  vpc_id                      = module.networking.vpc_id
  subnet_ids                  = module.networking.private_subnet_ids
  eks_managed_node_groups     = var.eks_managed_node_groups
  cluster_security_group_name = "mindlyfe-${var.environment}-cluster-sg"
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"

  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  subnet_ids          = module.networking.database_subnet_ids
  postgres_password   = var.postgres_password
  postgres_username   = var.postgres_username
  postgres_port       = var.postgres_port
  postgres_db_name    = var.postgres_db_name
  instance_class      = var.rds_instance_class
  allocated_storage   = var.rds_allocated_storage
  security_group_ids  = [module.eks.node_security_group_id]
}

# ElastiCache Redis
module "elasticache" {
  source = "./modules/elasticache"

  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  subnet_ids         = module.networking.elasticache_subnet_ids
  redis_port         = var.redis_port
  redis_node_type    = var.redis_node_type
  redis_num_nodes    = var.redis_num_nodes
  security_group_ids = [module.eks.node_security_group_id]
}

# Cognito User Pool
module "cognito" {
  source = "./modules/cognito"

  environment       = var.environment
  user_pool_name    = "mindlyfe-${var.environment}"
  client_name       = "mindlyfe-client-${var.environment}"
  callback_urls     = var.cognito_callback_urls
  logout_urls       = var.cognito_logout_urls
  identity_providers = var.cognito_identity_providers
}

# S3 Storage
module "s3" {
  source = "./modules/s3"

  environment = var.environment
  media_bucket_name = "mindlyfe-media-${var.environment}"
  logs_bucket_name  = "mindlyfe-logs-${var.environment}"
  archives_bucket_name = "mindlyfe-archives-${var.environment}"
}

# Output important values
output "cognito_user_pool_id" {
  value = module.cognito.user_pool_id
}

output "cognito_client_id" {
  value = module.cognito.client_id
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  value = module.elasticache.redis_endpoint
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "media_bucket_name" {
  value = module.s3.media_bucket_name
}

output "kubeconfig_command" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
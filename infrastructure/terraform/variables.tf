variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

# VPC and Networking
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "database_subnets" {
  description = "List of database subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
}

variable "elasticache_subnets" {
  description = "List of ElastiCache subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.231.0/24", "10.0.232.0/24", "10.0.233.0/24"]
}

# EKS Cluster
variable "eks_cluster_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.27"
}

variable "eks_managed_node_groups" {
  description = "Map of EKS managed node group definitions"
  type        = map(any)
  default     = {
    general = {
      name           = "general"
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 5
      desired_size   = 2
      disk_size      = 50
    },
    cpu_optimized = {
      name           = "cpu-optimized"
      instance_types = ["c5.large"]
      min_size       = 1
      max_size       = 5
      desired_size   = 1
      disk_size      = 50
      labels = {
        workload = "cpu"
      }
    }
  }
}

# RDS PostgreSQL
variable "postgres_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "postgres"
}

variable "postgres_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "postgres_port" {
  description = "PostgreSQL port"
  type        = number
  default     = 5432
}

variable "postgres_db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "mindlyfe"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

# ElastiCache Redis
variable "redis_port" {
  description = "Redis port"
  type        = number
  default     = 6379
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "redis_num_nodes" {
  description = "Number of Redis nodes"
  type        = number
  default     = 2
}

# Cognito
variable "cognito_callback_urls" {
  description = "List of allowed callback URLs for the identity providers"
  type        = list(string)
  default     = ["https://app.mindlyfe.com/callback", "http://localhost:3000/callback"]
}

variable "cognito_logout_urls" {
  description = "List of allowed logout URLs for the identity providers"
  type        = list(string)
  default     = ["https://app.mindlyfe.com", "http://localhost:3000"]
}

variable "cognito_identity_providers" {
  description = "List of identity providers for Cognito"
  type        = list(string)
  default     = ["COGNITO"]
}
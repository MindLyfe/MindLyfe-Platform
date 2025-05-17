aws_region    = "us-east-1"
environment   = "dev"

# VPC and Networking
vpc_cidr            = "10.0.0.0/16"
availability_zones  = ["us-east-1a", "us-east-1b", "us-east-1c"]
private_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnets      = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
database_subnets    = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
elasticache_subnets = ["10.0.231.0/24", "10.0.232.0/24", "10.0.233.0/24"]

# EKS Cluster
eks_cluster_version = "1.27"
eks_managed_node_groups = {
  general = {
    name           = "general"
    instance_types = ["t3.medium"]
    min_size       = 2
    max_size       = 5
    desired_size   = 2
    disk_size      = 50
  }
}

# RDS PostgreSQL - Using placeholders for sensitive values
postgres_username      = "postgres"
postgres_password      = "REPLACE_WITH_SECURE_PASSWORD" # Will be replaced by secrets management
postgres_port          = 5432
postgres_db_name       = "mindlyf"
rds_instance_class     = "db.t3.medium"
rds_allocated_storage  = 20

# ElastiCache Redis
redis_port       = 6379
redis_node_type  = "cache.t3.medium"
redis_num_nodes  = 2

# Cognito
cognito_callback_urls = [
  "https://dev.mindlyf.com/callback",
  "http://localhost:3000/callback"
]
cognito_logout_urls = [
  "https://dev.mindlyf.com",
  "http://localhost:3000"
]
cognito_identity_providers = ["COGNITO"] 
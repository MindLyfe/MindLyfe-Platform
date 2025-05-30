# MindLyfe Data Lake Infrastructure
# Terraform configuration for S3 Data Lake, IAM policies, and encryption

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "mindlyfe"
}

# KMS Key for encryption
resource "aws_kms_key" "data_lake_key" {
  description             = "KMS key for MindLyfe Data Lake encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-data-lake-key"
    Environment = var.environment
    Purpose     = "data-lake-encryption"
  }
}

resource "aws_kms_alias" "data_lake_key_alias" {
  name          = "alias/${var.project_name}-data-lake-${var.environment}"
  target_key_id = aws_kms_key.data_lake_key.key_id
}

# S3 Bucket for Data Lake
resource "aws_s3_bucket" "data_lake" {
  bucket = "${var.project_name}-data-lake-${var.environment}"

  tags = {
    Name        = "${var.project_name}-data-lake"
    Environment = var.environment
    Purpose     = "data-lake"
  }
}

# S3 Bucket versioning
resource "aws_s3_bucket_versioning" "data_lake_versioning" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "data_lake_encryption" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.data_lake_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# S3 Bucket public access block
resource "aws_s3_bucket_public_access_block" "data_lake_pab" {
  bucket = aws_s3_bucket.data_lake.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket lifecycle configuration
resource "aws_s3_bucket_lifecycle_configuration" "data_lake_lifecycle" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    id     = "raw_data_lifecycle"
    status = "Enabled"

    filter {
      prefix = "raw/"
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
  }

  rule {
    id     = "processed_data_lifecycle"
    status = "Enabled"

    filter {
      prefix = "processed/"
    }

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }

  rule {
    id     = "analytics_data_lifecycle"
    status = "Enabled"

    filter {
      prefix = "analytics/"
    }

    transition {
      days          = 180
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 730
      storage_class = "GLACIER"
    }
  }
}

# IAM Role for Data Lake Services
resource "aws_iam_role" "data_lake_service_role" {
  name = "${var.project_name}-data-lake-service-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "ecs-tasks.amazonaws.com",
            "lambda.amazonaws.com"
          ]
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-data-lake-service-role"
    Environment = var.environment
  }
}

# IAM Policy for Data Lake Access
resource "aws_iam_policy" "data_lake_policy" {
  name        = "${var.project_name}-data-lake-policy-${var.environment}"
  description = "Policy for MindLyfe Data Lake access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.data_lake.arn,
          "${aws_s3_bucket.data_lake.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.data_lake_key.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "data_lake_policy_attachment" {
  role       = aws_iam_role.data_lake_service_role.name
  policy_arn = aws_iam_policy.data_lake_policy.arn
}

# IAM Role for Microservices
resource "aws_iam_role" "microservice_data_role" {
  name = "${var.project_name}-microservice-data-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-microservice-data-role"
    Environment = var.environment
  }
}

# IAM Policy for Microservices (limited write access)
resource "aws_iam_policy" "microservice_data_policy" {
  name        = "${var.project_name}-microservice-data-policy-${var.environment}"
  description = "Policy for microservices to write to Data Lake"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = [
          "${aws_s3_bucket.data_lake.arn}/raw/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Encrypt",
          "kms:GenerateDataKey*"
        ]
        Resource = aws_kms_key.data_lake_key.arn
      }
    ]
  })
}

# Attach policy to microservice role
resource "aws_iam_role_policy_attachment" "microservice_data_policy_attachment" {
  role       = aws_iam_role.microservice_data_role.name
  policy_arn = aws_iam_policy.microservice_data_policy.arn
}

# Outputs
output "data_lake_bucket_name" {
  description = "Name of the Data Lake S3 bucket"
  value       = aws_s3_bucket.data_lake.bucket
}

output "data_lake_bucket_arn" {
  description = "ARN of the Data Lake S3 bucket"
  value       = aws_s3_bucket.data_lake.arn
}

output "kms_key_id" {
  description = "ID of the KMS key for encryption"
  value       = aws_kms_key.data_lake_key.key_id
}

output "kms_key_arn" {
  description = "ARN of the KMS key for encryption"
  value       = aws_kms_key.data_lake_key.arn
}

output "data_lake_service_role_arn" {
  description = "ARN of the Data Lake service role"
  value       = aws_iam_role.data_lake_service_role.arn
}

output "microservice_data_role_arn" {
  description = "ARN of the microservice data role"
  value       = aws_iam_role.microservice_data_role.arn
}
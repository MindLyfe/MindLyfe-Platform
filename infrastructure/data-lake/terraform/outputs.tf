# Outputs for MindLyf Data Lake Infrastructure

output "data_lake_bucket_name" {
  description = "Name of the S3 data lake bucket"
  value       = aws_s3_bucket.data_lake.bucket
}

output "data_lake_bucket_arn" {
  description = "ARN of the S3 data lake bucket"
  value       = aws_s3_bucket.data_lake.arn
}

output "data_lake_bucket_domain_name" {
  description = "Domain name of the S3 data lake bucket"
  value       = aws_s3_bucket.data_lake.bucket_domain_name
}

output "kms_key_id" {
  description = "ID of the KMS key for data lake encryption"
  value       = aws_kms_key.data_lake.key_id
}

output "kms_key_arn" {
  description = "ARN of the KMS key for data lake encryption"
  value       = aws_kms_key.data_lake.arn
}

output "data_lake_role_arn" {
  description = "ARN of the IAM role for data lake access"
  value       = aws_iam_role.data_lake_role.arn
}

output "service_role_arn" {
  description = "ARN of the IAM role for microservices"
  value       = aws_iam_role.service_role.arn
}

output "pipeline_role_arn" {
  description = "ARN of the IAM role for data pipeline"
  value       = aws_iam_role.pipeline_role.arn
}

output "athena_workgroup_name" {
  description = "Name of the Athena workgroup for analytics"
  value       = aws_athena_workgroup.data_lake.name
}

output "athena_database_name" {
  description = "Name of the Athena database"
  value       = aws_athena_database.data_lake.name
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.data_lake.name
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for notifications"
  value       = aws_sns_topic.data_lake_notifications.arn
}

# Environment-specific outputs
output "environment_config" {
  description = "Environment configuration for applications"
  value = {
    DATA_LAKE_BUCKET_NAME = aws_s3_bucket.data_lake.bucket
    DATA_LAKE_KMS_KEY_ID  = aws_kms_key.data_lake.key_id
    AWS_REGION            = var.aws_region
    ENVIRONMENT           = var.environment
  }
  sensitive = false
}

# Service configuration for microservices
output "service_config" {
  description = "Configuration for microservices to use data lake"
  value = {
    bucket_name           = aws_s3_bucket.data_lake.bucket
    kms_key_id           = aws_kms_key.data_lake.key_id
    service_role_arn     = aws_iam_role.service_role.arn
    region               = var.aws_region
    log_group_name       = aws_cloudwatch_log_group.data_lake.name
    sns_topic_arn        = aws_sns_topic.data_lake_notifications.arn
  }
  sensitive = false
}

# Pipeline configuration for data processing
output "pipeline_config" {
  description = "Configuration for data pipeline components"
  value = {
    bucket_name           = aws_s3_bucket.data_lake.bucket
    kms_key_id           = aws_kms_key.data_lake.key_id
    pipeline_role_arn    = aws_iam_role.pipeline_role.arn
    athena_workgroup     = aws_athena_workgroup.data_lake.name
    athena_database      = aws_athena_database.data_lake.name
    region               = var.aws_region
    log_group_name       = aws_cloudwatch_log_group.data_lake.name
  }
  sensitive = false
}

# Security and compliance outputs
output "security_config" {
  description = "Security and compliance configuration"
  value = {
    encryption_enabled    = true
    kms_key_id           = aws_kms_key.data_lake.key_id
    bucket_versioning    = aws_s3_bucket_versioning.data_lake.versioning_configuration[0].status
    public_access_blocked = true
    ssl_requests_only    = true
    lifecycle_enabled    = true
  }
  sensitive = false
}

# Cost optimization outputs
output "cost_optimization" {
  description = "Cost optimization settings"
  value = {
    lifecycle_rules_enabled     = true
    intelligent_tiering_enabled = true
    glacier_transition_days     = var.glacier_transition_days
    deep_archive_transition_days = var.deep_archive_transition_days
    expiration_days            = var.data_retention_days
  }
  sensitive = false
}

# Monitoring and alerting outputs
output "monitoring_config" {
  description = "Monitoring and alerting configuration"
  value = {
    cloudwatch_log_group = aws_cloudwatch_log_group.data_lake.name
    sns_topic_arn       = aws_sns_topic.data_lake_notifications.arn
    metrics_enabled     = true
    logging_enabled     = true
  }
  sensitive = false
}

# Network and access outputs
output "access_config" {
  description = "Access configuration for applications"
  value = {
    vpc_endpoint_enabled = var.enable_vpc_endpoint
    cors_enabled        = true
    public_read_blocked = true
    public_write_blocked = true
  }
  sensitive = false
} 
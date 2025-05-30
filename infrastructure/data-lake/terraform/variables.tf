# Variables for MindLyfe Data Lake Infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "mindlyfe"
}

variable "data_retention_days" {
  description = "Number of days to retain data in the data lake"
  type        = number
  default     = 2555  # 7 years for compliance
}

variable "enable_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = true
}

variable "enable_mfa_delete" {
  description = "Enable MFA delete for S3 bucket"
  type        = bool
  default     = false
}

variable "kms_key_rotation" {
  description = "Enable automatic KMS key rotation"
  type        = bool
  default     = true
}

variable "lifecycle_transitions" {
  description = "S3 lifecycle transition configuration"
  type = object({
    standard_ia_days   = number
    glacier_days       = number
    deep_archive_days  = number
  })
  default = {
    standard_ia_days  = 30
    glacier_days      = 90
    deep_archive_days = 365
  }
}

variable "allowed_services" {
  description = "List of services allowed to write to the data lake"
  type        = list(string)
  default = [
    "auth-service",
    "notification-service", 
    "payment-service",
    "community-service",
    "gamification-service",
    "chat-service",
    "ai-service",
    "journal-service",
    "lyfbot-service",
    "recommendation-service",
    "reporting-service",
    "resources-service",
    "teletherapy-service"
  ]
}

variable "compliance_tags" {
  description = "Compliance and governance tags"
  type        = map(string)
  default = {
    DataClassification = "Confidential"
    ComplianceFramework = "HIPAA,GDPR,PDPO"
    DataRetention = "7years"
    PIIData = "true"
    EncryptionRequired = "true"
  }
}

variable "monitoring_config" {
  description = "Monitoring and alerting configuration"
  type = object({
    enable_cloudtrail     = bool
    enable_access_logging = bool
    enable_metrics        = bool
    alert_on_access       = bool
  })
  default = {
    enable_cloudtrail     = true
    enable_access_logging = true
    enable_metrics        = true
    alert_on_access       = true
  }
}

variable "backup_config" {
  description = "Backup configuration for the data lake"
  type = object({
    enable_cross_region_replication = bool
    backup_region                   = string
    backup_retention_days           = number
  })
  default = {
    enable_cross_region_replication = true
    backup_region                   = "us-west-2"
    backup_retention_days           = 2555  # 7 years
  }
}
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "media_bucket_name" {
  description = "Name of the S3 bucket for media files"
  type        = string
}

variable "logs_bucket_name" {
  description = "Name of the S3 bucket for logs"
  type        = string
}

variable "archives_bucket_name" {
  description = "Name of the S3 bucket for archives"
  type        = string
} 
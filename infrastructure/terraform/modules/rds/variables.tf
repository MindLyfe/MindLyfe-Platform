variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where the RDS instance will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the RDS instance"
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "Name of the database subnet group"
  type        = string
  default     = null
}

variable "postgres_username" {
  description = "PostgreSQL master username"
  type        = string
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
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
}

variable "allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
}

variable "security_group_ids" {
  description = "List of security group IDs that can access the RDS instance"
  type        = list(string)
} 
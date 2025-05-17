variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where the ElastiCache instance will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ElastiCache Redis instance"
  type        = list(string)
}

variable "subnet_group_name" {
  description = "Name of the ElastiCache subnet group, if null a new one will be created"
  type        = string
  default     = null
}

variable "redis_port" {
  description = "Port for Redis"
  type        = number
  default     = 6379
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
}

variable "redis_num_nodes" {
  description = "Number of Redis nodes"
  type        = number
  default     = 1
}

variable "security_group_ids" {
  description = "List of security group IDs that can access the Redis instance"
  type        = list(string)
} 
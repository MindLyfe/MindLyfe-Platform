output "redis_endpoint" {
  description = "The endpoint of the ElastiCache Redis instance"
  value       = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "redis_port" {
  description = "The port of the ElastiCache Redis instance"
  value       = var.redis_port
}

output "redis_security_group_id" {
  description = "The ID of the Redis security group"
  value       = aws_security_group.redis.id
}

output "redis_arn" {
  description = "The ARN of the ElastiCache Redis instance"
  value       = aws_elasticache_replication_group.this.arn
}

output "redis_cache_nodes" {
  description = "The number of Redis cache nodes in the cluster"
  value       = var.redis_num_nodes
} 
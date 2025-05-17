resource "aws_security_group" "redis" {
  name        = "mindlyf-${var.environment}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "mindlyf-${var.environment}-redis-sg"
    Environment = var.environment
  }
}

resource "aws_security_group_rule" "redis_ingress" {
  count                    = length(var.security_group_ids)
  type                     = "ingress"
  from_port                = var.redis_port
  to_port                  = var.redis_port
  protocol                 = "tcp"
  source_security_group_id = var.security_group_ids[count.index]
  security_group_id        = aws_security_group.redis.id
  description              = "Allow Redis access from ${var.security_group_ids[count.index]}"
}

resource "aws_security_group_rule" "redis_egress" {
  security_group_id = aws_security_group.redis.id
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all outbound traffic"
}

resource "aws_elasticache_subnet_group" "this" {
  count       = var.subnet_group_name == null ? 1 : 0
  name        = "mindlyf-${var.environment}-redis-subnet"
  description = "ElastiCache subnet group for MindLyf ${var.environment}"
  subnet_ids  = var.subnet_ids
}

resource "aws_elasticache_parameter_group" "this" {
  name   = "mindlyf-${var.environment}-redis-params"
  family = "redis6.x"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id          = "mindlyf-${var.environment}-redis"
  description                   = "MindLyf Redis cluster for ${var.environment} environment"
  node_type                     = var.redis_node_type
  num_cache_clusters            = var.redis_num_nodes
  port                          = var.redis_port
  parameter_group_name          = aws_elasticache_parameter_group.this.name
  subnet_group_name             = var.subnet_group_name != null ? var.subnet_group_name : aws_elasticache_subnet_group.this[0].name
  security_group_ids            = [aws_security_group.redis.id]
  automatic_failover_enabled    = var.redis_num_nodes > 1 ? true : false
  engine_version                = "6.x"
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  multi_az_enabled              = var.redis_num_nodes > 1 ? true : false
  auto_minor_version_upgrade    = true
  snapshot_retention_limit      = var.environment == "production" ? 7 : 1
  snapshot_window               = "03:00-05:00"
  maintenance_window            = "sun:05:00-sun:07:00"

  tags = {
    Name        = "mindlyf-${var.environment}-redis"
    Environment = var.environment
  }
} 
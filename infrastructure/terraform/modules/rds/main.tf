resource "aws_security_group" "this" {
  name        = "mindlyf-${var.environment}-postgres-sg"
  description = "Security group for PostgreSQL RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "mindlyf-${var.environment}-postgres-sg"
    Environment = var.environment
  }
}

resource "aws_security_group_rule" "ingress" {
  count                    = length(var.security_group_ids)
  type                     = "ingress"
  from_port                = var.postgres_port
  to_port                  = var.postgres_port
  protocol                 = "tcp"
  source_security_group_id = var.security_group_ids[count.index]
  security_group_id        = aws_security_group.this.id
  description              = "Allow PostgreSQL access from ${var.security_group_ids[count.index]}"
}

resource "aws_security_group_rule" "egress" {
  security_group_id = aws_security_group.this.id
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all outbound traffic"
}

resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "mindlyf-${var.environment}-rds-key"
    Environment = var.environment
  }
}

resource "aws_db_parameter_group" "this" {
  name        = "mindlyf-${var.environment}-pg-params"
  family      = "postgres13"
  description = "Parameter group for MindLyf PostgreSQL ${var.environment}"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = {
    Name        = "mindlyf-${var.environment}-pg-params"
    Environment = var.environment
  }
}

resource "aws_db_instance" "this" {
  identifier              = "mindlyf-${var.environment}-postgres"
  engine                  = "postgres"
  engine_version          = "13.7"
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_storage
  storage_type            = "gp2"
  storage_encrypted       = true
  kms_key_id              = aws_kms_key.rds.arn
  db_name                 = var.postgres_db_name
  username                = var.postgres_username
  password                = var.postgres_password
  port                    = var.postgres_port
  multi_az                = var.environment == "production" ? true : false
  db_subnet_group_name    = var.db_subnet_group_name
  vpc_security_group_ids  = [aws_security_group.this.id]
  parameter_group_name    = aws_db_parameter_group.this.name
  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:30-sun:05:30"
  skip_final_snapshot     = var.environment == "production" ? false : true
  final_snapshot_identifier = var.environment == "production" ? "mindlyf-${var.environment}-final-snapshot" : null
  deletion_protection     = var.environment == "production" ? true : false
  auto_minor_version_upgrade = true
  publicly_accessible    = false
  copy_tags_to_snapshot  = true

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name        = "mindlyf-${var.environment}-postgres"
    Environment = var.environment
  }
} 
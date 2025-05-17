output "db_instance_id" {
  description = "The RDS instance ID"
  value       = aws_db_instance.this.id
}

output "db_instance_address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.this.address
}

output "db_instance_endpoint" {
  description = "The connection endpoint of the RDS instance"
  value       = aws_db_instance.this.endpoint
}

output "db_instance_name" {
  description = "The database name"
  value       = aws_db_instance.this.db_name
}

output "db_instance_username" {
  description = "The master username for the database"
  value       = aws_db_instance.this.username
  sensitive   = true
}

output "db_instance_port" {
  description = "The database port"
  value       = aws_db_instance.this.port
}

output "db_subnet_group_name" {
  description = "The database subnet group name"
  value       = aws_db_instance.this.db_subnet_group_name
}

output "db_security_group_id" {
  description = "The security group ID of the RDS instance"
  value       = aws_security_group.this.id
} 
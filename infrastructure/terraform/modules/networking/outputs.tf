output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.this.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "List of database subnet IDs"
  value       = aws_subnet.database[*].id
}

output "elasticache_subnet_ids" {
  description = "List of ElastiCache subnet IDs"
  value       = aws_subnet.elasticache[*].id
}

output "db_subnet_group_name" {
  description = "Name of the database subnet group"
  value       = aws_db_subnet_group.database.name
}

output "elasticache_subnet_group_name" {
  description = "Name of the ElastiCache subnet group"
  value       = aws_elasticache_subnet_group.elasticache.name
}

output "nat_gateway_id" {
  description = "ID of the NAT Gateway"
  value       = length(var.public_subnets) > 0 ? aws_nat_gateway.this[0].id : null
}

output "public_route_table_id" {
  description = "ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_id" {
  description = "ID of the private route table"
  value       = aws_route_table.private.id
} 
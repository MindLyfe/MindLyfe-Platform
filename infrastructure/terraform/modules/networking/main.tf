resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "mindlyf-${var.environment}-vpc"
  }
}

# Public subnets
resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.availability_zones[count.index % length(var.availability_zones)]
  map_public_ip_on_launch = true

  tags = {
    Name                                           = "mindlyf-${var.environment}-public-subnet-${count.index + 1}"
    "kubernetes.io/role/elb"                       = "1"
    "kubernetes.io/cluster/mindlyf-${var.environment}" = "shared"
  }
}

# Private subnets
resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.availability_zones[count.index % length(var.availability_zones)]

  tags = {
    Name                                           = "mindlyf-${var.environment}-private-subnet-${count.index + 1}"
    "kubernetes.io/role/internal-elb"              = "1"
    "kubernetes.io/cluster/mindlyf-${var.environment}" = "shared"
  }
}

# Database subnets
resource "aws_subnet" "database" {
  count             = length(var.database_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.database_subnets[count.index]
  availability_zone = var.availability_zones[count.index % length(var.availability_zones)]

  tags = {
    Name = "mindlyf-${var.environment}-database-subnet-${count.index + 1}"
  }
}

# ElastiCache subnets
resource "aws_subnet" "elasticache" {
  count             = length(var.elasticache_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.elasticache_subnets[count.index]
  availability_zone = var.availability_zones[count.index % length(var.availability_zones)]

  tags = {
    Name = "mindlyf-${var.environment}-elasticache-subnet-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "mindlyf-${var.environment}-igw"
  }
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  count = length(var.public_subnets) > 0 ? 1 : 0
  vpc   = true

  tags = {
    Name = "mindlyf-${var.environment}-nat-eip"
  }
}

# NAT Gateway
resource "aws_nat_gateway" "this" {
  count         = length(var.public_subnets) > 0 ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "mindlyf-${var.environment}-nat"
  }

  depends_on = [aws_internet_gateway.this]
}

# Route tables for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "mindlyf-${var.environment}-public-rt"
  }
}

# Route tables for private subnets
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = length(var.public_subnets) > 0 ? aws_nat_gateway.this[0].id : null
  }

  tags = {
    Name = "mindlyf-${var.environment}-private-rt"
  }
}

# Route table associations for public subnets
resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Route table associations for private subnets
resource "aws_route_table_association" "private" {
  count          = length(var.private_subnets)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Database subnet group
resource "aws_db_subnet_group" "database" {
  name        = "mindlyf-${var.environment}-db-subnet-group"
  description = "Database subnet group for MindLyf ${var.environment} environment"
  subnet_ids  = aws_subnet.database[*].id

  tags = {
    Name = "mindlyf-${var.environment}-db-subnet-group"
  }
}

# ElastiCache subnet group
resource "aws_elasticache_subnet_group" "elasticache" {
  name        = "mindlyf-${var.environment}-ec-subnet-group"
  description = "ElastiCache subnet group for MindLyf ${var.environment} environment"
  subnet_ids  = aws_subnet.elasticache[*].id
}

# VPC endpoints for S3
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id, aws_route_table.public.id]

  tags = {
    Name = "mindlyf-${var.environment}-s3-endpoint"
  }
} 
resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.cluster_AmazonEKSVPCResourceController,
    aws_cloudwatch_log_group.this
  ]

  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 30
}

resource "aws_kms_key" "eks" {
  description             = "EKS Cluster ${var.cluster_name} Encryption Config KMS Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "${var.cluster_name}-key"
    Environment = var.environment
  }
}

resource "aws_security_group" "cluster" {
  name        = var.cluster_security_group_name
  description = "EKS cluster security group"
  vpc_id      = var.vpc_id

  tags = {
    Name        = var.cluster_security_group_name
    Environment = var.environment
  }
}

resource "aws_security_group_rule" "cluster_egress" {
  security_group_id = aws_security_group.cluster.id
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all outbound traffic"
}

resource "aws_security_group" "node" {
  name        = "${var.cluster_name}-node-sg"
  description = "Security group for all nodes in the cluster"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name                                           = "${var.cluster_name}-node-sg"
    Environment                                    = var.environment
    "kubernetes.io/cluster/${var.cluster_name}"    = "owned"
  }
}

resource "aws_security_group_rule" "nodes_internal" {
  description              = "Allow nodes to communicate with each other"
  security_group_id        = aws_security_group.node.id
  source_security_group_id = aws_security_group.node.id
  from_port                = 0
  to_port                  = 65535
  protocol                 = "-1"
  type                     = "ingress"
}

resource "aws_security_group_rule" "nodes_cluster_inbound" {
  description              = "Allow worker nodes to communicate with the cluster API Server"
  security_group_id        = aws_security_group.cluster.id
  source_security_group_id = aws_security_group.node.id
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  type                     = "ingress"
}

resource "aws_security_group_rule" "cluster_nodes_inbound" {
  description              = "Allow cluster control plane to communicate with worker nodes"
  security_group_id        = aws_security_group.node.id
  source_security_group_id = aws_security_group.cluster.id
  from_port                = 1025
  to_port                  = 65535
  protocol                 = "tcp"
  type                     = "ingress"
}

resource "aws_iam_role" "cluster" {
  name = "${var.cluster_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSVPCResourceController" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role" "node" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node.name
}

resource "aws_eks_node_group" "this" {
  for_each = var.eks_managed_node_groups

  cluster_name    = aws_eks_cluster.this.name
  node_group_name = each.value.name
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = var.subnet_ids

  ami_type       = lookup(each.value, "ami_type", "AL2_x86_64")
  instance_types = each.value.instance_types
  capacity_type  = lookup(each.value, "capacity_type", "ON_DEMAND")
  disk_size      = lookup(each.value, "disk_size", 50)

  scaling_config {
    desired_size = each.value.desired_size
    max_size     = each.value.max_size
    min_size     = each.value.min_size
  }

  update_config {
    max_unavailable = lookup(each.value, "max_unavailable", 1)
  }

  labels = lookup(each.value, "labels", {})

  tags = {
    Name        = "${var.cluster_name}-${each.value.name}"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.node_AmazonEC2ContainerRegistryReadOnly,
  ]
} 
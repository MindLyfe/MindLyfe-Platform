output "cluster_id" {
  description = "The ID of the EKS cluster"
  value       = aws_eks_cluster.this.id
}

output "cluster_arn" {
  description = "The ARN of the EKS cluster"
  value       = aws_eks_cluster.this.arn
}

output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  description = "The endpoint for the EKS cluster API server"
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.this.certificate_authority[0].data
}

output "node_security_group_id" {
  description = "Security group ID attached to the EKS worker nodes"
  value       = aws_security_group.node.id
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_security_group.cluster.id
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC Provider if IRSA is enabled"
  value       = try(aws_iam_openid_connect_provider.oidc_provider[0].arn, "")
}

output "node_groups" {
  description = "Map of EKS managed node groups created"
  value       = aws_eks_node_group.this
}

output "node_iam_role_name" {
  description = "IAM role name attached to EKS worker nodes"
  value       = aws_iam_role.node.name
}

output "node_iam_role_arn" {
  description = "IAM role ARN attached to EKS worker nodes"
  value       = aws_iam_role.node.arn
} 
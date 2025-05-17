output "user_pool_id" {
  description = "The ID of the user pool"
  value       = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  description = "The ARN of the user pool"
  value       = aws_cognito_user_pool.this.arn
}

output "client_id" {
  description = "The ID of the user pool client"
  value       = aws_cognito_user_pool_client.this.id
}

output "client_secret" {
  description = "The client secret of the user pool client"
  value       = aws_cognito_user_pool_client.this.client_secret
  sensitive   = true
}

output "domain" {
  description = "The domain name of the user pool"
  value       = aws_cognito_user_pool_domain.this.domain
} 
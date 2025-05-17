variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
}

variable "client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
}

variable "callback_urls" {
  description = "List of allowed callback URLs for the identity providers"
  type        = list(string)
  default     = ["https://example.com/callback"]
}

variable "logout_urls" {
  description = "List of allowed logout URLs for the identity providers"
  type        = list(string)
  default     = ["https://example.com/logout"]
}

variable "identity_providers" {
  description = "List of identity providers for Cognito"
  type        = list(string)
  default     = ["COGNITO"]
} 
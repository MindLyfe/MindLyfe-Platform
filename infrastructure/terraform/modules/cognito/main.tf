resource "aws_cognito_user_pool" "this" {
  name = var.user_pool_name

  username_attributes      = ["email"]
  auto_verify_attributes   = ["email"]
  mfa_configuration        = "OPTIONAL"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true
  }
  
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your MindLyf verification code"
    email_message        = "Your verification code is {####}"
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  tags = {
    Name        = var.user_pool_name
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name                         = var.client_name
  user_pool_id                 = aws_cognito_user_pool.this.id
  generate_secret              = true
  refresh_token_validity       = 30
  access_token_validity        = 1
  id_token_validity            = 1
  allowed_oauth_flows          = ["code", "implicit"]
  allowed_oauth_scopes         = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  callback_urls                = var.callback_urls
  logout_urls                  = var.logout_urls
  supported_identity_providers = var.identity_providers
  explicit_auth_flows          = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_USER_PASSWORD_AUTH"]

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "this" {
  domain       = replace(lower(var.user_pool_name), " ", "-")
  user_pool_id = aws_cognito_user_pool.this.id
} 
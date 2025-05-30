bucket         = "mindlyfe-terraform-state-prod"
key            = "terraform.tfstate"
region         = "us-east-1"
encrypt        = true
dynamodb_table = "mindlyfe-terraform-locks-prod"
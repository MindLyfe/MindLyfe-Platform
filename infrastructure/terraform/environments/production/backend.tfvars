bucket         = "mindlyf-terraform-state-prod"
key            = "terraform.tfstate"
region         = "us-east-1"
encrypt        = true
dynamodb_table = "mindlyf-terraform-locks-prod" 
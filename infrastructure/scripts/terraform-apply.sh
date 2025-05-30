#!/bin/bash
set -e

# This script applies Terraform configurations for the MindLyfe infrastructure

# Usage: terraform-apply.sh <environment> [plan|apply|destroy]

ENVIRONMENT=$1
ACTION=${2:-apply}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="${SCRIPT_DIR}/../terraform"
BACKEND_VARS="${TERRAFORM_DIR}/environments/${ENVIRONMENT}/backend.tfvars"
TF_VARS="${TERRAFORM_DIR}/environments/${ENVIRONMENT}/terraform.tfvars"

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: terraform-apply.sh <environment> [plan|apply|destroy]"
  echo "Example: terraform-apply.sh dev plan"
  exit 1
fi

if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
  echo "Invalid action: $ACTION. Must be one of: plan, apply, destroy"
  exit 1
fi

if [ ! -f "$BACKEND_VARS" ]; then
  echo "Error: Backend variables file not found at $BACKEND_VARS"
  exit 1
fi

if [ ! -f "$TF_VARS" ]; then
  echo "Error: Terraform variables file not found at $TF_VARS"
  exit 1
fi

echo "=== Initializing Terraform ==="
cd "$TERRAFORM_DIR"
terraform init -backend-config="$BACKEND_VARS"

if [ "$ACTION" == "plan" ]; then
  echo "=== Planning Terraform changes for $ENVIRONMENT environment ==="
  terraform plan -var-file="$TF_VARS" -out="${ENVIRONMENT}.tfplan"
elif [ "$ACTION" == "apply" ]; then
  echo "=== Applying Terraform changes for $ENVIRONMENT environment ==="
  terraform apply -var-file="$TF_VARS" -auto-approve
elif [ "$ACTION" == "destroy" ]; then
  echo "=== Destroying Terraform infrastructure for $ENVIRONMENT environment ==="
  echo "This action will DESTROY all resources in the $ENVIRONMENT environment!"
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    terraform destroy -var-file="$TF_VARS" -auto-approve
  else
    echo "Destroy operation canceled."
    exit 0
  fi
fi

echo "=== Terraform $ACTION operation completed ==="
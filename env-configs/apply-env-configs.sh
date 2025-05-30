#!/bin/bash

# Define color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}   MindLyfe Environment Configuration Helper       ${NC}"
echo -e "${GREEN}==================================================${NC}"

# Base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_DIR="${BASE_DIR}/env-configs"

# Function to extract .env content from markdown files
extract_env_from_md() {
    local md_file="$1"
    local output_file="$2"
    
    # Extract content between the first ```env and ``` markers
    awk '/```env/{flag=1;next}/```/{flag=0}flag' "$md_file" > "$output_file"
    
    if [ ! -s "$output_file" ]; then
        echo -e "${RED}Failed to extract .env content from $md_file${NC}"
        return 1
    fi
    
    return 0
}

# Function to extract .env.example content from markdown files
extract_env_example_from_md() {
    local md_file="$1"
    local output_file="$2"
    
    # Extract content between the second ```env and ``` markers
    awk 'BEGIN{count=0}/```env/{count++;if(count==2)flag=1;next}/```/{if(flag)exit;flag=0}flag' "$md_file" > "$output_file"
    
    if [ ! -s "$output_file" ]; then
        echo -e "${RED}Failed to extract .env.example content from $md_file${NC}"
        return 1
    fi
    
    return 0
}

# Process each service
process_service() {
    local service_name="$1"
    local service_dir="${BASE_DIR}/${service_name}"
    local md_file="${ENV_DIR}/${service_name}-env.md"
    
    echo -e "${YELLOW}Processing ${service_name}...${NC}"
    
    if [ ! -d "$service_dir" ]; then
        echo -e "${RED}Service directory not found: $service_dir${NC}"
        return 1
    fi
    
    if [ ! -f "$md_file" ]; then
        echo -e "${RED}Configuration file not found: $md_file${NC}"
        return 1
    fi
    
    # Extract and save .env file
    if extract_env_from_md "$md_file" "${service_dir}/.env"; then
        echo -e "${GREEN}Created .env file for $service_name${NC}"
    fi
    
    # Extract and save .env.example file
    if extract_env_example_from_md "$md_file" "${service_dir}/.env.example"; then
        echo -e "${GREEN}Created .env.example file for $service_name${NC}"
    fi
    
    return 0
}

# Process all services
services=("auth-service" "notification-service" "chat-service" "community-service" "teletherapy-service" "api-gateway" "ai-service")

for service in "${services[@]}"; do
    process_service "$service"
    echo ""
done

echo -e "${GREEN}Environment configuration complete!${NC}"
echo -e "${YELLOW}Note: Review the generated files and adjust values as needed before starting services.${NC}"
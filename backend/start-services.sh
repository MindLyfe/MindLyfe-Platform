#!/bin/bash

# Define color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   MindLyf Microservices Starter Script   ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Function to display usage information
function show_usage {
  echo -e "${YELLOW}Usage:${NC}"
  echo "  $0 [options]"
  echo ""
  echo -e "${YELLOW}Options:${NC}"
  echo "  all                Start all services"
  echo "  auth               Start auth-service"
  echo "  notification       Start notification-service"
  echo "  chat               Start chat-service"
  echo "  community          Start community-service"
  echo "  teletherapy        Start teletherapy-service"
  echo "  ai                 Start ai-service"
  echo "  gateway            Start api-gateway"
  echo "  core               Start core services (auth, notification, postgres, redis)"
  echo "  infrastructure     Start infrastructure services (postgres, redis)"
  echo "  help               Show this help message"
  echo ""
  echo -e "${YELLOW}Examples:${NC}"
  echo "  $0 all                     # Start all services"
  echo "  $0 auth notification       # Start auth and notification services"
  echo "  $0 core                    # Start core services (auth, notification, postgres, redis)"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${YELLOW}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# No arguments provided
if [ $# -eq 0 ]; then
  show_usage
  exit 1
fi

# Parse arguments
SERVICES=""
for arg in "$@"; do
  case $arg in
    all)
      echo -e "${GREEN}Starting all services...${NC}"
      docker-compose up -d
      exit 0
      ;;
    auth)
      SERVICES="$SERVICES auth-service"
      ;;
    notification)
      SERVICES="$SERVICES notification-service"
      ;;
    chat)
      SERVICES="$SERVICES chat-service"
      ;;
    community)
      SERVICES="$SERVICES community-service"
      ;;
    teletherapy)
      SERVICES="$SERVICES teletherapy-service"
      ;;
    ai)
      SERVICES="$SERVICES ai-service"
      ;;
    gateway)
      SERVICES="$SERVICES api-gateway"
      ;;
    core)
      echo -e "${GREEN}Starting core services...${NC}"
      docker-compose up -d auth-service notification-service postgres redis
      exit 0
      ;;
    infrastructure)
      echo -e "${GREEN}Starting infrastructure services...${NC}"
      docker-compose up -d postgres redis
      exit 0
      ;;
    help)
      show_usage
      exit 0
      ;;
    *)
      echo -e "${YELLOW}Unknown option: $arg${NC}"
      show_usage
      exit 1
      ;;
  esac
done

# Start selected services
if [ -n "$SERVICES" ]; then
  echo -e "${GREEN}Starting services: $SERVICES${NC}"
  docker-compose up -d postgres redis $SERVICES
  echo -e "${GREEN}Services started. Use 'docker-compose logs -f' to view logs.${NC}"
else
  echo -e "${YELLOW}No services specified.${NC}"
  show_usage
  exit 1
fi 
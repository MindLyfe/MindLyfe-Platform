#!/bin/bash

# MindLyf Platform - Start All Services Script
echo "🚀 Starting MindLyf Platform Services..."

# Set environment
export NODE_ENV=development

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose could not be found. Please install docker-compose."
    exit 1
fi

echo "📋 Services to be started:"
echo "  - PostgreSQL (Database)"
echo "  - Redis (Cache & Sessions)"
echo "  - API Gateway (Port 3000)"
echo "  - Auth Service (Port 3001)"
echo "  - Teletherapy Service (Port 3002)"
echo "  - Chat Service (Port 3003)"
echo "  - Community Service (Port 3004)"
echo "  - Notification Service (Port 3005)"
echo "  - AI Service (Port 8000)"
echo "  - Journal Service (Port 8001)"
echo "  - Recommender Service (Port 8002)"
echo "  - LyfBot Service (Port 8003)"
echo ""

# Stop any existing containers
echo "🛑 Stopping any existing services..."
docker-compose down

# Remove orphaned containers
echo "🧹 Cleaning up orphaned containers..."
docker-compose down --remove-orphans

# Pull latest images if needed
echo "📥 Pulling latest images..."
docker-compose pull postgres redis

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

services=(
    "postgres:5432"
    "redis:6379"
    "api-gateway:3000"
    "auth-service:3001"
    "teletherapy-service:3002"
    "chat-service:3003"
    "community-service:3004"
    "notification-service:3005"
    "ai-service:8000"
    "journal-service:8001"
    "recommender-service:8002"
    "lyfbot-service:8003"
)

for service in "${services[@]}"; do
    service_name=${service%:*}
    port=${service#*:}
    
    if docker-compose ps | grep -q "$service_name.*Up"; then
        echo "  ✅ $service_name is running"
    else
        echo "  ❌ $service_name is not running"
    fi
done

echo ""
echo "🎉 MindLyf Platform Services Started!"
echo ""
echo "📚 Available endpoints:"
echo "  - API Gateway: http://localhost:3000"
echo "  - API Documentation: http://localhost:3000/api/docs"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "🔍 To view logs for all services:"
echo "  docker-compose logs -f"
echo ""
echo "🔍 To view logs for a specific service:"
echo "  docker-compose logs -f <service-name>"
echo ""
echo "🛑 To stop all services:"
echo "  docker-compose down"
echo ""
echo "📊 To view service status:"
echo "  docker-compose ps"
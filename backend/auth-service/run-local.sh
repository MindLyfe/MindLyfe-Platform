#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_color() {
    printf "${1}${2}${NC}\n"
}

print_header() {
    echo
    print_color $CYAN "=============================================="
    print_color $CYAN "$1"
    print_color $CYAN "=============================================="
    echo
}

print_step() {
    print_color $BLUE "🔄 $1"
}

print_success() {
    print_color $GREEN "✅ $1"
}

print_error() {
    print_color $RED "❌ $1"
}

# Set environment variables for local development
setup_env() {
    export NODE_ENV=development
    export PORT=3001
    export DATABASE_TYPE=sqlite
    export DATABASE_DATABASE=./mindlyf_auth.sqlite
    export DATABASE_SYNCHRONIZE=true
    export DATABASE_LOGGING=true
    export JWT_SECRET=your-super-secret-jwt-key-change-in-production
    export JWT_EXPIRES_IN=24h
    export JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
    export JWT_REFRESH_EXPIRES_IN=7d
    export SERVICE_NAME=auth-service
    export SERVICE_VERSION=1.0.0
    export THROTTLE_TTL=60
    export THROTTLE_LIMIT=100
    export PAYMENT_PROVIDER_API_KEY=test-api-key
    export PAYMENT_WEBHOOK_SECRET=test-webhook-secret
    export ENABLE_ORGANIZATION_PLANS=true
    export ENABLE_CREDIT_SYSTEM=true
    export ENABLE_AUTO_RENEWAL=true
    export BCRYPT_ROUNDS=10
}

# Check Node.js and npm
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "Node.js and npm are available"
}

# Install dependencies
install_deps() {
    print_step "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Build the application
build_app() {
    print_step "Building application..."
    if npm run build; then
        print_success "Application built successfully"
    else
        print_error "Failed to build application"
        exit 1
    fi
}

# Start the service
start_service() {
    print_step "Starting auth service..."
    print_color $CYAN "Service will be available at: http://localhost:3001"
    print_color $CYAN "Swagger docs: http://localhost:3001/api/docs"
    print_color $CYAN "Health check: http://localhost:3001/health/ping"
    echo
    
    # Start in development mode with watch
    npm run start:dev
}

# Run tests
run_tests() {
    print_step "Waiting for service to be ready..."
    
    # Wait for service to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3001/health/ping > /dev/null 2>&1; then
            print_success "Service is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Service did not start within expected time"
            return 1
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo
    print_step "Running test suite..."
    
    if node test-subscription-system.js; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed"
        return 1
    fi
}

# Main execution
case "${1:-start}" in
    "start")
        print_header "Starting MindLyf Auth Service Locally"
        setup_env
        check_node
        install_deps
        build_app
        start_service
        ;;
    "test")
        print_header "Running Tests"
        setup_env
        run_tests
        ;;
    "build")
        print_header "Building Application"
        check_node
        install_deps
        build_app
        print_success "Build completed"
        ;;
    "docker")
        print_header "Starting with Docker (SQLite)"
        print_step "Using simplified Docker setup with SQLite..."
        
        if docker-compose -f docker-compose.local.yml up --build; then
            print_success "Docker service started"
        else
            print_error "Failed to start Docker service"
            exit 1
        fi
        ;;
    "docker-test")
        print_header "Docker + Tests"
        print_step "Starting service with Docker..."
        
        # Start in background
        docker-compose -f docker-compose.local.yml up -d --build
        
        # Wait and test
        sleep 10
        run_tests
        
        # Stop service
        docker-compose -f docker-compose.local.yml down
        ;;
    "help"|"-h"|"--help")
        print_header "MindLyf Auth Service Local Runner"
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  start         Start service locally (default)"
        echo "  test          Run tests (requires service to be running)"
        echo "  build         Build the application"
        echo "  docker        Start with Docker (SQLite)"
        echo "  docker-test   Start with Docker and run tests"
        echo "  help          Show this help"
        echo
        echo "Examples:"
        echo "  $0 start       # Start locally"
        echo "  $0 docker      # Start with Docker"
        echo "  $0 test        # Run tests"
        ;;
    *)
        print_error "Unknown command: $1"
        print_color $YELLOW "Use '$0 help' for available commands"
        exit 1
        ;;
esac 
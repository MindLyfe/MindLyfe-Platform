#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
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

print_warning() {
    print_color $YELLOW "⚠️  $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to wait for service to be healthy
wait_for_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    print_step "Waiting for $service_name to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service_name | grep -q "healthy"; then
            print_success "$service_name is healthy"
            return 0
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to become healthy within $((max_attempts * 2)) seconds"
    return 1
}

# Function to check if auth service is responding
check_auth_service() {
    local max_attempts=30
    local attempt=1
    
    print_step "Checking if auth service is responding..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3001/health/ping > /dev/null 2>&1; then
            print_success "Auth service is responding"
            return 0
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Auth service is not responding after $((max_attempts * 2)) seconds"
    return 1
}

# Function to install Node.js dependencies for testing
install_test_dependencies() {
    print_step "Installing test dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js to run tests."
        return 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm to run tests."
        return 1
    fi
    
    # Check if axios and uuid are available, install if not
    if ! node -e "require('axios')" 2>/dev/null; then
        print_step "Installing axios..."
        npm install axios
    fi
    
    if ! node -e "require('uuid')" 2>/dev/null; then
        print_step "Installing uuid..."
        npm install uuid
    fi
    
    print_success "Test dependencies are ready"
}

# Function to run the test suite
run_tests() {
    print_step "Running comprehensive test suite..."
    
    if node test-subscription-system.js; then
        print_success "All tests completed successfully!"
        return 0
    else
        print_error "Some tests failed. Check the output above for details."
        return 1
    fi
}

# Function to show service logs
show_logs() {
    print_header "Service Logs"
    print_step "Showing logs for all services..."
    docker-compose logs --tail=50
}

# Function to show service status
show_status() {
    print_header "Service Status"
    docker-compose ps
    echo
    
    print_step "Checking individual service health..."
    
    # Check PostgreSQL
    if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL is not ready"
    fi
    
    # Check Redis
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is ready"
    else
        print_error "Redis is not ready"
    fi
    
    # Check Auth Service
    if curl -s http://localhost:3001/health/ping > /dev/null 2>&1; then
        print_success "Auth Service is ready"
        
        # Get service info
        echo
        print_step "Auth Service Information:"
        curl -s http://localhost:3001/health/ping | jq . 2>/dev/null || curl -s http://localhost:3001/health/ping
    else
        print_error "Auth Service is not ready"
    fi
}

# Function to open Swagger documentation
open_swagger() {
    print_step "Opening Swagger documentation..."
    
    if command -v open &> /dev/null; then
        open http://localhost:3001/api/docs
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3001/api/docs
    else
        print_color $CYAN "Please open http://localhost:3001/api/docs in your browser"
    fi
}

# Function to clean up
cleanup() {
    print_header "Cleaning Up"
    print_step "Stopping and removing containers..."
    docker-compose down -v
    print_success "Cleanup completed"
}

# Function to start the system
start_system() {
    print_header "Starting MindLyf Auth Service with Subscription System"
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Stop any existing containers
    print_step "Stopping any existing containers..."
    docker-compose down > /dev/null 2>&1
    
    # Build and start services
    print_step "Building and starting services..."
    if docker-compose up -d --build; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
    
    # Wait for services to be healthy
    wait_for_service postgres
    wait_for_service redis
    
    # Check auth service
    check_auth_service
    
    print_success "System is ready!"
    echo
    print_color $CYAN "🌐 Swagger Documentation: http://localhost:3001/api/docs"
    print_color $CYAN "🏥 Health Check: http://localhost:3001/health/ping"
    print_color $CYAN "📊 Service Status: docker-compose ps"
}

# Main script logic
case "${1:-start}" in
    "start")
        start_system
        ;;
    "test")
        print_header "Running Tests"
        install_test_dependencies
        run_tests
        ;;
    "full")
        start_system
        echo
        print_header "Running Tests"
        install_test_dependencies
        run_tests
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "swagger")
        open_swagger
        ;;
    "stop")
        print_header "Stopping Services"
        docker-compose down
        print_success "Services stopped"
        ;;
    "clean")
        cleanup
        ;;
    "restart")
        print_header "Restarting Services"
        docker-compose restart
        check_auth_service
        print_success "Services restarted"
        ;;
    "help"|"-h"|"--help")
        print_header "MindLyf Auth Service Test Runner"
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  start     Start the system (default)"
        echo "  test      Run tests only (requires system to be running)"
        echo "  full      Start system and run tests"
        echo "  status    Show service status"
        echo "  logs      Show service logs"
        echo "  swagger   Open Swagger documentation"
        echo "  stop      Stop all services"
        echo "  clean     Stop services and remove volumes"
        echo "  restart   Restart all services"
        echo "  help      Show this help message"
        echo
        echo "Examples:"
        echo "  $0 start          # Start the system"
        echo "  $0 full           # Start system and run tests"
        echo "  $0 test           # Run tests (system must be running)"
        echo "  $0 status         # Check service status"
        ;;
    *)
        print_error "Unknown command: $1"
        print_color $YELLOW "Use '$0 help' to see available commands"
        exit 1
        ;;
esac 
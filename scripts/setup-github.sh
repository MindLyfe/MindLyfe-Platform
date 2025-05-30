#!/bin/bash

# MindLyfe GitHub Setup Script
# This script sets up the repository for GitHub pushing

set -e  # Exit on any error

echo "🚀 Setting up MindLyfe Platform for GitHub..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d ".github" ]; then
    print_error "This script must be run from the MindLyfe project root directory"
    exit 1
fi

print_status "Checking Git configuration..."

# Check if Git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
else
    print_success "Git repository already initialized"
fi

# Set up Git configuration if not already set
if [ -z "$(git config user.name)" ]; then
    read -p "Enter your Git username: " git_username
    git config user.name "$git_username"
    print_success "Git username set to: $git_username"
else
    print_success "Git username already configured: $(git config user.name)"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your Git email: " git_email
    git config user.email "$git_email"
    print_success "Git email set to: $git_email"
else
    print_success "Git email already configured: $(git config user.email)"
fi

# Set up recommended Git settings for the project
print_status "Configuring Git settings for MindLyfe..."

git config core.autocrlf input  # Handle line endings
git config core.editor "code --wait"  # Use VS Code as default editor
git config init.defaultBranch main  # Use 'main' as default branch
git config pull.rebase false  # Use merge for pulls
git config core.ignorecase false  # Case-sensitive file names

print_success "Git configuration completed"

# Check if there are any files to commit
print_status "Checking repository status..."

if [ -n "$(git status --porcelain)" ]; then
    print_status "Found uncommitted changes. Staging files..."
    
    # Add all files to staging
    git add .
    
    # Create initial commit
    print_status "Creating initial commit..."
    git commit -m "feat: initial MindLyfe platform setup

- Add comprehensive documentation (README, FEATURES, SYSTEM_OVERVIEW)
- Add GitHub workflow configuration for CI/CD
- Add issue and PR templates for project management
- Add comprehensive .gitignore for security
- Add contributing guidelines and code standards
- Add legal documentation with GDPR/HIPAA compliance
- Set up microservices architecture foundation
- Configure development environment setup

This initial commit establishes the foundation for the MindLyfe
mental health platform with proper documentation, compliance,
and development workflows.

Contact: +256703607207
Updated: June 1, 2025"
    
    print_success "Initial commit created successfully"
else
    print_success "Repository is clean - no changes to commit"
fi

# Check current branch and rename if needed
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
    if git show-ref --verify --quiet refs/heads/master; then
        print_status "Renaming 'master' branch to 'main'..."
        git branch -m master main
        print_success "Branch renamed to 'main'"
    elif [ -n "$current_branch" ]; then
        print_status "Renaming '$current_branch' branch to 'main'..."
        git branch -m "$current_branch" main
        print_success "Branch renamed to 'main'"
    fi
elif [ "$current_branch" = "master" ]; then
    print_status "Renaming 'master' branch to 'main'..."
    git branch -m master main
    print_success "Branch renamed to 'main'"
else
    print_success "Already on 'main' branch"
fi

# Create develop branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/develop; then
    print_status "Creating 'develop' branch..."
    git checkout -b develop
    git checkout main
    print_success "Created 'develop' branch"
else
    print_success "'develop' branch already exists"
fi

# Set up GitHub remotes (will prompt user for repository URL)
print_status "Checking remote configuration..."

if [ -z "$(git remote)" ]; then
    echo ""
    print_warning "No Git remotes configured."
    echo "To push to GitHub, you'll need to add a remote repository."
    echo ""
    echo "1. Create a new repository on GitHub (https://github.com/new)"
    echo "2. Copy the repository URL"
    echo "3. Run one of these commands:"
    echo ""
    echo "   For HTTPS:"
    echo "   git remote add origin https://github.com/yourusername/mindlyfe-platform.git"
    echo ""
    echo "   For SSH (recommended):"
    echo "   git remote add origin git@github.com:yourusername/mindlyfe-platform.git"
    echo ""
    
    read -p "Do you want to add a remote now? (y/n): " add_remote
    if [ "$add_remote" = "y" ] || [ "$add_remote" = "Y" ]; then
        read -p "Enter your GitHub repository URL: " repo_url
        git remote add origin "$repo_url"
        print_success "Remote 'origin' added: $repo_url"
    fi
else
    existing_remote=$(git remote -v | head -n 1)
    print_success "Remote already configured: $existing_remote"
fi

# Check GitHub CLI availability
if command -v gh &> /dev/null; then
    print_success "GitHub CLI is available"
    
    # Check if user is authenticated
    if gh auth status &> /dev/null; then
        print_success "GitHub CLI is authenticated"
        
        read -p "Do you want to create a new GitHub repository? (y/n): " create_repo
        if [ "$create_repo" = "y" ] || [ "$create_repo" = "Y" ]; then
            read -p "Enter repository name (default: mindlyfe-platform): " repo_name
            repo_name=${repo_name:-mindlyfe-platform}
            
            read -p "Make repository private? (y/n): " is_private
            private_flag=""
            if [ "$is_private" = "y" ] || [ "$is_private" = "Y" ]; then
                private_flag="--private"
            fi
            
            print_status "Creating GitHub repository..."
            gh repo create "$repo_name" $private_flag --description "MindLyfe - Comprehensive Mental Health Platform" --source . --push
            print_success "GitHub repository created and code pushed!"
        fi
    else
        print_warning "GitHub CLI is not authenticated. Run 'gh auth login' to authenticate."
    fi
else
    print_warning "GitHub CLI is not installed. Install it from https://cli.github.com/ for easier repository management."
fi

# Display final instructions
echo ""
print_success "🎉 MindLyfe Platform is ready for GitHub!"
echo ""
echo "📝 Next Steps:"
echo "1. If you haven't added a remote, create a GitHub repository and add it"
echo "2. Push your code: git push -u origin main"
echo "3. Set up branch protection rules on GitHub"
echo "4. Configure repository secrets for CI/CD"
echo "5. Review and customize GitHub Actions workflows"
echo ""
echo "🔧 Repository Features Configured:"
echo "✅ Comprehensive .gitignore for security"
echo "✅ GitHub Actions CI/CD pipeline"
echo "✅ Issue and PR templates"
echo "✅ Contributing guidelines"
echo "✅ Security and compliance documentation"
echo "✅ Development environment setup"
echo ""
echo "📞 Contact: +256703607207"
echo "📅 Updated: June 1, 2025"
echo ""
print_success "Happy coding! 🚀" 
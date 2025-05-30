# MindLyfe Platform Scripts

This directory contains utility scripts for setting up and managing the MindLyfe platform development environment.

## 📋 Available Scripts

### 🚀 `setup-github.sh`
**Purpose**: Configures the repository for GitHub integration and pushes

**Features**:
- Initializes Git repository (if not already done)
- Configures Git user settings
- Sets up recommended Git configuration for the project
- Creates initial commit with all platform files
- Sets up main/develop branch structure
- Configures GitHub remotes
- Optionally creates GitHub repository using GitHub CLI

**Usage**:
```bash
# Make sure you're in the project root
cd /path/to/mindlyfe-platform

# Run the setup script
./scripts/setup-github.sh
```

**Prerequisites**:
- Git installed
- GitHub account
- GitHub CLI (optional, for automatic repository creation)
- SSH keys configured for GitHub (recommended)

**What it does**:
1. ✅ Verifies Git repository initialization
2. ✅ Configures Git user name and email
3. ✅ Sets project-specific Git settings
4. ✅ Stages all files and creates initial commit
5. ✅ Sets up main/develop branch structure
6. ✅ Configures GitHub remote (interactive)
7. ✅ Optionally creates GitHub repository

## 🔧 Manual Setup Alternative

If you prefer to set up manually:

### 1. Initialize Git (if needed)
```bash
git init
```

### 2. Configure Git
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
git config core.autocrlf input
git config init.defaultBranch main
```

### 3. Stage and Commit Files
```bash
git add .
git commit -m "feat: initial MindLyfe platform setup"
```

### 4. Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `mindlyfe-platform`)
3. **Important**: Do NOT initialize with README, .gitignore, or license

### 5. Add Remote and Push
```bash
# For SSH (recommended)
git remote add origin git@github.com:yourusername/mindlyfe-platform.git

# For HTTPS
git remote add origin https://github.com/yourusername/mindlyfe-platform.git

# Push to GitHub
git push -u origin main
```

### 6. Set Up Development Branch
```bash
git checkout -b develop
git push -u origin develop
git checkout main
```

## 🔒 Repository Security Setup

After pushing to GitHub, configure these security settings:

### Branch Protection Rules
1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### Repository Secrets
Configure these secrets for CI/CD:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `SLACK_WEBHOOK`

### Security Features
1. Enable security advisories
2. Enable dependency graph
3. Enable Dependabot alerts
4. Enable Dependabot security updates

## 📱 GitHub Actions Workflows

The repository includes these workflows:

- **CI/CD Pipeline** (`.github/workflows/ci.yml`):
  - Security scanning
  - Frontend tests
  - Backend tests
  - AI services tests
  - End-to-end tests
  - Documentation checks
  - Automated deployment to staging/production

## 📝 Templates

The repository includes these GitHub templates:

- **Issue Templates**:
  - Bug Report (`.github/issue_templates/bug_report.md`)
  - Feature Request (`.github/issue_templates/feature_request.md`)

- **Pull Request Template**:
  - Comprehensive PR template (`.github/pull_request_template.md`)

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

## 📞 Support

- **Technical Issues**: tech@mindlyfe.org
- **Repository Setup**: devops@mindlyfe.org
- **General Questions**: info@mindlyfe.org
- **Phone**: +256703607207

---

**Last Updated**: June 1, 2025  
**Maintained by**: MindLyfe Development Team 
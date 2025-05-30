# Contributing to MindLyfe Platform

Welcome to MindLyfe! We appreciate your interest in contributing to our mental health platform. This guide will help you get started with contributing to the codebase.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Security Considerations](#security-considerations)
- [Documentation](#documentation)
- [Review Process](#review-process)

## 🤝 Code of Conduct

### Our Pledge
We are committed to making participation in the MindLyfe project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members
- Prioritizing user safety and privacy
- Maintaining confidentiality of sensitive health information

### Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@mindlyfe.org.

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **Docker** and Docker Compose
- **Git** with SSH keys configured
- **PostgreSQL** 15+ (for local development)
- **Redis** 7+ (for local development)

### Repository Structure
```
mindlyfe/
├── frontend/                 # React/TypeScript frontend
├── backend/                  # NestJS backend services
├── ai-services/             # Python AI microservices
├── mobile/                  # React Native mobile apps
├── docs/                    # Documentation
├── infrastructure/          # Docker, K8s, Terraform
├── scripts/                 # Development scripts
└── tests/                   # End-to-end tests
```

## ⚙️ Development Setup

### 1. Clone the Repository
```bash
git clone git@github.com:mindlyfe/platform.git
cd mindlyfe-platform
```

### 2. Environment Setup
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env.local

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd ai-services && pip install -r requirements-dev.txt && cd ..
```

### 3. Database Setup
```bash
# Start databases with Docker
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run migrations
cd backend
npm run migration:run
npm run seed:dev
```

### 4. Start Development Services
```bash
# Terminal 1: Backend services
cd backend
npm run start:dev

# Terminal 2: Frontend application
cd frontend
npm run dev

# Terminal 3: AI services
cd ai-services
uvicorn main:app --reload --port 8080
```

### 5. Verify Setup
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Services: http://localhost:8080
- API Documentation: http://localhost:3001/api/docs

## 🔄 Contribution Workflow

### 1. Create an Issue
- Use our [issue templates](.github/issue_templates/)
- Clearly describe the problem or feature request
- Include relevant labels and assignees

### 2. Fork and Branch
```bash
# Fork the repository on GitHub
# Clone your fork
git clone git@github.com:yourusername/mindlyfe-platform.git
cd mindlyfe-platform

# Add upstream remote
git remote add upstream git@github.com:mindlyfe/platform.git

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Follow our [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure compliance with security requirements

### 4. Commit Your Changes
```bash
# Stage your changes
git add .

# Commit with conventional commit format
git commit -m "feat(auth): add multi-factor authentication support

- Implement TOTP-based MFA
- Add backup codes functionality
- Update user settings UI
- Add comprehensive test coverage

Closes #123"
```

### Commit Message Format
We follow [Conventional Commits](https://conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements
- `perf`: Performance improvements

**Scopes:**
- `auth`: Authentication/authorization
- `api`: Backend API changes
- `ui`: Frontend UI changes
- `ai`: AI/ML services
- `mobile`: Mobile applications
- `docs`: Documentation
- `infra`: Infrastructure changes

### 5. Push and Create Pull Request
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Use our PR template and fill out all sections
```

## 📝 Coding Standards

### TypeScript/JavaScript (Frontend & Backend)
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **functional programming** patterns where appropriate
- Prefer **const** over **let**, avoid **var**
- Use **async/await** over Promises chains

```typescript
// Good
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await userService.getUser(userId);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user data', { userId, error });
    throw new ApiError('User not found', 404);
  }
};

// Bad
function fetchUserData(userId) {
  return userService.getUser(userId)
    .then(response => response.data)
    .catch(error => {
      console.log(error);
      throw error;
    });
}
```

### Python (AI Services)
- Follow **PEP 8** style guide
- Use **type hints** for all functions
- Use **Black** for code formatting
- Use **isort** for import sorting
- Document functions with **docstrings**

```python
# Good
async def analyze_sentiment(text: str) -> SentimentResult:
    """
    Analyze sentiment of the given text.
    
    Args:
        text: The text to analyze
        
    Returns:
        SentimentResult containing score and confidence
        
    Raises:
        ValueError: If text is empty or None
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    result = await sentiment_analyzer.analyze(text)
    return SentimentResult(
        score=result.score,
        confidence=result.confidence,
        timestamp=datetime.utcnow()
    )
```

### React Components
- Use **functional components** with hooks
- Implement **proper TypeScript interfaces**
- Follow **accessibility guidelines** (WCAG 2.1 AA)
- Use **semantic HTML** elements
- Implement **error boundaries**

```tsx
// Good
interface UserProfileProps {
  user: User;
  onUpdate: (user: Partial<User>) => Promise<void>;
  isLoading?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdate,
  isLoading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSubmit = useCallback(async (data: Partial<User>) => {
    try {
      await onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  }, [onUpdate]);

  return (
    <section
      className="user-profile"
      role="main"
      aria-label="User Profile"
    >
      {/* Component content */}
    </section>
  );
};
```

### Database Queries
- Use **TypeORM** query builder for complex queries
- Implement **proper indexing** for performance
- Use **transactions** for data consistency
- Implement **soft deletes** for audit trails

```typescript
// Good
async findActiveUsersWithRecentActivity(days: number): Promise<User[]> {
  return this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.sessions', 'session')
    .where('user.isActive = :isActive', { isActive: true })
    .andWhere('session.lastActivity > :date', {
      date: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    })
    .orderBy('session.lastActivity', 'DESC')
    .getMany();
}
```

## 🧪 Testing Guidelines

### Test Structure
```
src/
├── components/
│   ├── UserProfile/
│   │   ├── UserProfile.tsx
│   │   ├── UserProfile.test.tsx
│   │   └── UserProfile.stories.tsx
│   └── ...
├── services/
│   ├── authService.ts
│   └── authService.test.ts
└── utils/
    ├── validation.ts
    └── validation.test.ts
```

### Testing Requirements
- **Unit tests**: Minimum 80% code coverage
- **Integration tests**: API endpoints and database interactions
- **E2E tests**: Critical user journeys
- **Accessibility tests**: WCAG compliance
- **Performance tests**: Load and stress testing

### Frontend Testing
```typescript
// UserProfile.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('should render user information correctly', () => {
    render(<UserProfile user={mockUser} onUpdate={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should handle profile updates', async () => {
    const mockOnUpdate = jest.fn().mockResolvedValue(undefined);
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Jane Doe' }
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ name: 'Jane Doe' });
    });
  });
});
```

### Backend Testing
```typescript
// auth.controller.spec.ts
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const result = { accessToken: 'token123', user: { id: '1' } };
      
      jest.spyOn(authService, 'login').mockResolvedValue(result);
      
      expect(await controller.login(loginDto)).toBe(result);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
```

### Running Tests
```bash
# Frontend tests
cd frontend
npm run test                 # Run tests
npm run test:coverage        # Run with coverage
npm run test:watch          # Watch mode

# Backend tests
cd backend
npm run test                # Unit tests
npm run test:integration    # Integration tests
npm run test:e2e           # End-to-end tests

# AI services tests
cd ai-services
pytest                     # Run all tests
pytest --cov=.            # Run with coverage
```

## 🔒 Security Considerations

### General Security Rules
- **Never commit secrets** or sensitive data
- **Validate all inputs** on both client and server
- **Use parameterized queries** to prevent SQL injection
- **Implement proper authentication** and authorization
- **Encrypt sensitive data** at rest and in transit
- **Follow OWASP guidelines** for web security

### Healthcare Data (HIPAA Compliance)
- **Encrypt PHI** using AES-256 encryption
- **Implement audit logging** for all PHI access
- **Use role-based access control** for clinical data
- **Ensure data minimization** - collect only necessary data
- **Implement automatic session timeout** for clinical users

### Code Security Practices
```typescript
// Good - Secure password handling
import bcrypt from 'bcrypt';

class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Good - Input validation
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
  
  @IsString()
  @MaxLength(100)
  name: string;
}
```

### Security Testing
```bash
# Run security audits
npm audit
npm audit fix

# Run SAST tools
npm run security:scan

# Check for vulnerabilities
npx audit-ci --config audit-ci.json
```

## 📚 Documentation

### Code Documentation
- **JSDoc comments** for public APIs
- **README files** for each service/component
- **Inline comments** for complex logic
- **Type definitions** with descriptive interfaces

### API Documentation
- **OpenAPI/Swagger** specifications
- **Request/response examples**
- **Authentication requirements**
- **Rate limiting information**
- **Error code documentation**

### User Documentation
- **Feature documentation** in `docs/features/`
- **API guides** in `docs/api/`
- **Deployment guides** in `docs/deployment/`
- **Troubleshooting guides** in `docs/troubleshooting/`

## 🔍 Review Process

### Pull Request Requirements
- [ ] All CI/CD checks pass
- [ ] Code review by at least 2 team members
- [ ] Security review for security-related changes
- [ ] Clinical review for healthcare features
- [ ] Documentation updated
- [ ] Tests added/updated with adequate coverage

### Review Timeline
- **Initial review**: Within 2 business days
- **Follow-up reviews**: Within 1 business day
- **Final approval**: Within 1 business day after all feedback addressed

### Reviewer Responsibilities
- **Code quality**: Check for adherence to standards
- **Security**: Verify security best practices
- **Performance**: Identify potential performance issues
- **Accessibility**: Ensure WCAG compliance
- **Clinical safety**: Verify healthcare-specific requirements

## 🚀 Release Process

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature branches
- **hotfix/***: Critical production fixes
- **release/***: Release preparation branches

### Deployment Environments
- **Development**: Automatic deployment from `develop`
- **Staging**: Manual deployment for testing
- **Production**: Manual deployment from `main`

## 🆘 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Slack**: Real-time team communication (team members)
- **Email**: conduct@mindlyfe.org for code of conduct issues

### Documentation Resources
- [System Overview](./SYSTEM_OVERVIEW.md)
- [Features Documentation](./FEATURES.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Security Implementation](./SECURITY_HARDENING_IMPLEMENTATION.md)

## 📜 License

By contributing to MindLyfe, you agree that your contributions will be licensed under the same terms as the project. Please see [LICENSE](./LICENSE) for details.

---

Thank you for contributing to MindLyfe! Your help makes a difference in building better mental health technology. 🧠💙 
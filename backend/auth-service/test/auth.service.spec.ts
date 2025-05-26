import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from '../src/entities/user.entity';
import { EmailService } from '../src/shared/services/email.service';
import { SessionService } from '../src/auth/session/session.service';
import { EventService } from '../src/shared/events/event.service';
import { Repository } from 'typeorm';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { VerifyEmailDto } from '../src/auth/dto/verify-email.dto';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';

// Mock implementation of repository
const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

// Mock services
const mockJwtService = () => ({
  sign: jest.fn(() => 'test-token'),
  verify: jest.fn(() => ({ sub: 'user-id' })),
});

const mockConfigService = () => ({
  get: jest.fn((key) => {
    const config = {
      'jwt.secret': 'test-secret',
      'jwt.expiresIn': '1h',
      'jwt.refreshExpiresIn': '7d',
      'mfa.issuer': 'MindLyf',
      'mfa.window': 1,
    };
    return config[key];
  }),
});

const mockEmailService = () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
});

const mockSessionService = () => ({
  createSession: jest.fn(() => ({ id: 'session-id' })),
  findSessionByToken: jest.fn(),
  revokeSession: jest.fn(),
  revokeAllUserSessions: jest.fn(),
});

const mockEventService = () => ({
  emit: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;
  let sessionService: jest.Mocked<SessionService>;
  let eventService: jest.Mocked<EventService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useFactory: mockJwtService },
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        { provide: EmailService, useFactory: mockEmailService },
        { provide: SessionService, useFactory: mockSessionService },
        { provide: EventService, useFactory: mockEventService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);
    sessionService = module.get(SessionService);
    eventService = module.get(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      // Set up mocks
      userRepository.findOne.mockResolvedValue(null);
      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
      };
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      emailService.sendVerificationEmail.mockResolvedValue(true);

      // Call the method
      const result = await service.register(registerDto);

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: registerDto.email } })
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password: registerDto.password,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          status: UserStatus.PENDING,
        })
      );
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(eventService.emit).toHaveBeenCalledTimes(2); // USER_CREATED and EMAIL_VERIFICATION_SENT
      expect(result).toEqual({
        message: expect.any(String),
        userId: mockUser.id,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      // Set up mocks
      userRepository.findOne.mockResolvedValue({ id: 'existing-user-id', email: registerDto.email });

      // Assertion
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyEmail', () => {
    const verifyEmailDto: VerifyEmailDto = {
      token: 'verification-token',
    };

    it('should verify email successfully', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        verificationToken: verifyEmailDto.token,
        save: jest.fn(),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, emailVerified: true });

      // Call the method
      const result = await service.verifyEmail(verifyEmailDto);

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { verificationToken: verifyEmailDto.token } })
      );
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationToken: null,
          emailVerified: true,
          status: UserStatus.ACTIVE,
        })
      );
      expect(eventService.emit).toHaveBeenCalled();
      expect(result).toEqual({
        message: expect.any(String),
      });
    });

    it('should throw NotFoundException if token is invalid', async () => {
      // Set up mocks
      userRepository.findOne.mockResolvedValue(null);

      // Assertion
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        emailVerified: true,
        status: UserStatus.ACTIVE,
        twoFactorEnabled: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      sessionService.createSession.mockResolvedValue({ id: 'session-id' });

      // Call the method
      const result = await service.login(loginDto);

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: loginDto.email } })
      );
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(sessionService.createSession).toHaveBeenCalled();
      expect(eventService.emit).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          sessionId: expect.any(String),
        })
      );
    });

    it('should require MFA if enabled', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
        emailVerified: true,
        status: UserStatus.ACTIVE,
        twoFactorEnabled: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      // Call the method
      const result = await service.login(loginDto);

      // Assertions
      expect(result).toEqual(
        expect.objectContaining({
          requiresMfa: true,
          tempToken: expect.any(String),
        })
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id, mfa: 'required' }),
        expect.any(Object)
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      // Set up mocks
      userRepository.findOne.mockResolvedValue(null);

      // Assertion
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(eventService.emit).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      // Assertion
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(eventService.emit).toHaveBeenCalled();
    });
  });

  // Add more test cases for other methods...
}); 
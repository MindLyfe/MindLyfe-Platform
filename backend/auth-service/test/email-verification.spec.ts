import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from '../src/entities/user.entity';
import { EmailService } from '../src/shared/services/email.service';
import { SessionService } from '../src/auth/session/session.service';
import { EventService } from '../src/shared/events/event.service';
import { VerifyEmailDto } from '../src/auth/dto/verify-email.dto';
import { NotFoundException } from '@nestjs/common';

// Mock implementations
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'test-token'),
  verify: jest.fn(() => ({ sub: 'user-id' })),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

const mockEmailService = () => ({
  sendVerificationEmail: jest.fn(),
});

const mockSessionService = () => ({
  createSession: jest.fn(),
  findSessionByToken: jest.fn(),
  revokeSession: jest.fn(),
  revokeAllUserSessions: jest.fn(),
});

const mockEventService = () => ({
  emit: jest.fn(),
});

describe('Email Verification Flow', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<any>;
  let emailService: jest.Mocked<EmailService>;
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

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    emailService = module.get(EmailService);
    eventService = module.get(EventService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('verifyEmail', () => {
    const verifyEmailDto: VerifyEmailDto = {
      token: 'verification-token',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      verificationToken: 'verification-token',
      status: UserStatus.PENDING,
      emailVerified: false,
    };

    const mockMetadata = {
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    };

    it('should verify email successfully', async () => {
      // Setup mocks
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        verificationToken: null,
        emailVerified: true,
        status: UserStatus.ACTIVE,
      });

      // Call service method
      const result = await authService.verifyEmail(verifyEmailDto, mockMetadata);

      // Verify results
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { verificationToken: verifyEmailDto.token },
      });
      
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUser,
          verificationToken: null,
          emailVerified: true,
          status: UserStatus.ACTIVE,
        })
      );
      
      expect(eventService.emit).toHaveBeenCalledWith(
        expect.any(String), // EVENT_TYPE
        expect.objectContaining({ userId: mockUser.id }),
        expect.objectContaining({ 
          userId: mockUser.id,
          metadata: mockMetadata
        })
      );
      
      expect(result).toEqual({
        message: expect.stringContaining('verification successful'),
      });
    });

    it('should throw NotFoundException if token is invalid', async () => {
      // Setup mocks
      userRepository.findOne.mockResolvedValue(null);

      // Call service method and verify it throws
      await expect(authService.verifyEmail(verifyEmailDto, mockMetadata))
        .rejects.toThrow(NotFoundException);
    });

    it('should emit an event when email verification completes', async () => {
      // Setup mocks
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        verificationToken: null,
        emailVerified: true,
        status: UserStatus.ACTIVE,
      });

      // Call service method
      await authService.verifyEmail(verifyEmailDto, mockMetadata);

      // Verify event was emitted
      expect(eventService.emit).toHaveBeenCalledWith(
        expect.stringMatching(/email.*verification.*completed/i),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { MfaService } from '../src/auth/mfa/mfa.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from '../src/entities/user.entity';
import { SessionService } from '../src/auth/session/session.service';
import { EventService } from '../src/shared/events/event.service';
import { Repository } from 'typeorm';
import { UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

// Mock external modules
jest.mock('speakeasy');
jest.mock('qrcode');

// Mock implementations
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'test-token'),
});

const mockConfigService = () => ({
  get: jest.fn((key) => {
    const config = {
      'jwt.expiresIn': '1h',
      'jwt.refreshExpiresIn': '7d',
      'mfa.issuer': 'MindLyf',
      'mfa.window': 1,
    };
    return config[key];
  }),
});

const mockSessionService = () => ({
  createSession: jest.fn(() => ({ id: 'session-id' })),
  revokeAllUserSessions: jest.fn(),
});

const mockEventService = () => ({
  emit: jest.fn(),
});

describe('MfaService', () => {
  let service: MfaService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionService: jest.Mocked<SessionService>;
  let eventService: jest.Mocked<EventService>;

  beforeEach(async () => {
    // Mock implementations before each test
    (speakeasy.generateSecret as jest.Mock).mockReturnValue({
      base32: 'test-secret',
      otpauth_url: 'otpauth://totp/MindLyf:test@example.com?secret=test-secret&issuer=MindLyf',
    });
    
    (speakeasy.totp.verify as jest.Mock) = jest.fn(() => true);
    (QRCode.toDataURL as jest.Mock) = jest.fn(() => 'data:image/png;base64,qrcode-data');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        { provide: JwtService, useFactory: mockJwtService },
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        { provide: SessionService, useFactory: mockSessionService },
        { provide: EventService, useFactory: mockEventService },
      ],
    }).compile();

    service = module.get<MfaService>(MfaService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    sessionService = module.get(SessionService);
    eventService = module.get(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMfaSecret', () => {
    it('should generate MFA secret successfully', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, twoFactorSecret: 'test-secret' });

      // Call the method
      const result = await service.generateMfaSecret('user-id');

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-id' } })
      );
      expect(speakeasy.generateSecret).toHaveBeenCalledWith({
        name: 'MindLyf:test@example.com',
        issuer: 'MindLyf',
      });
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUser,
          twoFactorSecret: 'test-secret',
        })
      );
      expect(eventService.emit).toHaveBeenCalled();
      expect(result).toEqual({
        secret: 'test-secret',
        qrCode: 'data:image/png;base64,qrcode-data',
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Set up mocks
      userRepository.findOne.mockResolvedValue(null);

      // Assertion
      await expect(service.generateMfaSecret('user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyAndEnableMfa', () => {
    it('should verify and enable MFA successfully', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        twoFactorSecret: 'test-secret',
        twoFactorEnabled: false,
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, twoFactorEnabled: true });
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      // Call the method
      const result = await service.verifyAndEnableMfa('user-id', '123456');

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-id' } })
      );
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'test-secret',
        encoding: 'base32',
        token: '123456',
        window: 1,
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUser,
          twoFactorEnabled: true,
        })
      );
      expect(sessionService.revokeAllUserSessions).toHaveBeenCalledWith('user-id', 'MFA enabled');
      expect(eventService.emit).toHaveBeenCalled();
      expect(result).toEqual({
        message: expect.stringContaining('enabled'),
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Set up mocks
      userRepository.findOne.mockResolvedValue(null);

      // Assertion
      await expect(service.verifyAndEnableMfa('user-id', '123456')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if MFA secret not generated', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        twoFactorSecret: null,
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      // Assertion
      await expect(service.verifyAndEnableMfa('user-id', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        twoFactorSecret: 'test-secret',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      // Assertion
      await expect(service.verifyAndEnableMfa('user-id', '123456')).rejects.toThrow(UnauthorizedException);
      expect(eventService.emit).toHaveBeenCalled();
    });
  });

  describe('verifyMfaToken', () => {
    it('should verify MFA token successfully and complete login', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        twoFactorEnabled: true,
        twoFactorSecret: 'test-secret',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, lastLogin: new Date() });
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
      sessionService.createSession.mockResolvedValue({ id: 'session-id' });

      // Call the method
      const result = await service.verifyMfaToken('user-id', '123456');

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-id' } })
      );
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'test-secret',
        encoding: 'base32',
        token: '123456',
        window: 1,
      });
      expect(jwtService.sign).toHaveBeenCalled();
      expect(sessionService.createSession).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(eventService.emit).toHaveBeenCalledTimes(2); // MFA_VERIFICATION_SUCCESS and AUTH_LOGIN_SUCCESS
      expect(result).toEqual(
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          accessToken: 'test-token',
          refreshToken: 'test-token',
          sessionId: 'session-id',
        })
      );
    });

    it('should throw BadRequestException if MFA is not enabled', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        twoFactorEnabled: false,
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      // Assertion
      await expect(service.verifyMfaToken('user-id', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      // Set up mocks
      const mockUser = {
        id: 'user-id',
        twoFactorEnabled: true,
        twoFactorSecret: 'test-secret',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      // Assertion
      await expect(service.verifyMfaToken('user-id', '123456')).rejects.toThrow(UnauthorizedException);
      expect(eventService.emit).toHaveBeenCalled();
    });
  });

  // Add more test cases for other methods...
}); 
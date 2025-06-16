import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthClientService } from './auth-client.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthClientService', () => {
  let service: AuthClientService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'services.auth.url': 'http://auth-service:3000',
        'services.auth.serviceToken': 'test-service-token',
        'SERVICE_NAME': 'test-service',
      };
      return config[key];
    }),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthClientService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthClientService>(AuthClientService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
    };

    it('should validate token successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { user: mockUser },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.validateToken('valid-token');
      expect(result).toEqual(mockUser);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://auth-service:3000/auth/validate-token',
        { token: 'valid-token' },
        {
          headers: {
            'Authorization': 'Bearer test-service-token',
            'X-Service-Name': 'test-service',
          },
        },
      );
    });

    it('should throw UnauthorizedException on validation failure', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Invalid token')));

      await expect(service.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
    };

    it('should validate user successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { user: mockUser },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.validateUser('123');
      expect(result).toEqual(mockUser);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'http://auth-service:3000/auth/users/123',
        {
          headers: {
            'Authorization': 'Bearer test-service-token',
            'X-Service-Name': 'test-service',
          },
        },
      );
    });

    it('should throw UnauthorizedException on validation failure', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('User not found')));

      await expect(service.validateUser('invalid-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeToken', () => {
    it('should revoke token successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'Token revoked successfully' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await expect(service.revokeToken('token-to-revoke')).resolves.not.toThrow();
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://auth-service:3000/auth/revoke-token',
        { token: 'token-to-revoke' },
        {
          headers: {
            'Authorization': 'Bearer test-service-token',
            'X-Service-Name': 'test-service',
          },
        },
      );
    });

    it('should throw UnauthorizedException on revocation failure', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Failed to revoke token')));

      await expect(service.revokeToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateServiceToken', () => {
    it('should validate service token successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { valid: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.validateServiceToken('test-service', 'valid-token');
      expect(result).toBe(true);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://auth-service:3000/auth/validate-service-token',
        { serviceName: 'test-service', token: 'valid-token' },
        {
          headers: {
            'Authorization': 'Bearer test-service-token',
            'X-Service-Name': 'test-service',
          },
        },
      );
    });

    it('should return false on validation failure', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Invalid service token')));

      const result = await service.validateServiceToken('test-service', 'invalid-token');
      expect(result).toBe(false);
    });
  });
}); 
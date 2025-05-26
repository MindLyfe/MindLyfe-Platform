import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../src/auth/roles/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ROLES_KEY } from '../src/auth/roles/roles.decorator';
import { UserRole } from '../src/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    // Create a mock for the Reflector
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: jest.Mocked<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      // Setup mock request and context
      mockRequest = {
        user: {
          id: 'user-id',
          role: UserRole.USER,
        },
      };

      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as jest.Mocked<ExecutionContext>;
    });

    it('should allow access when no roles are required', () => {
      // Setup reflector to return no roles
      reflector.getAllAndOverride.mockReturnValue([]);

      // Call the guard
      const result = guard.canActivate(mockContext);

      // Check that access is allowed
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should allow access when user has required role', () => {
      // Setup reflector to return the roles that include the user's role
      reflector.getAllAndOverride.mockReturnValue([UserRole.USER, UserRole.ADMIN]);

      // Call the guard
      const result = guard.canActivate(mockContext);

      // Check that access is allowed
      expect(result).toBe(true);
    });

    it('should deny access when user role is not in required roles', () => {
      // Setup user with THERAPIST role
      mockRequest.user.role = UserRole.THERAPIST;

      // Setup reflector to return roles that don't include the user's role
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      // Call the guard
      const result = guard.canActivate(mockContext);

      // Check that access is denied
      expect(result).toBe(false);
    });

    it('should deny access when user object is missing', () => {
      // Setup request without user
      mockRequest.user = undefined;

      // Setup reflector to return some roles
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      // Call the guard
      const result = guard.canActivate(mockContext);

      // Check that access is denied
      expect(result).toBe(false);
    });

    it('should deny access when user has no role property', () => {
      // Setup user without role
      mockRequest.user = { id: 'user-id' };

      // Setup reflector to return some roles
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      // Call the guard
      const result = guard.canActivate(mockContext);

      // Check that access is denied
      expect(result).toBe(false);
    });

    it('should handle null or undefined returned from reflector', () => {
      // Setup reflector to return null
      reflector.getAllAndOverride.mockReturnValue(null);

      // Call the guard
      const result = guard.canActivate(mockContext);

      // Check that access is allowed (as per the guard's implementation)
      expect(result).toBe(true);
    });
  });
}); 
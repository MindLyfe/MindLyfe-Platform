/**
 * Utility module for creating mock services for testing
 */

import { EventType } from '../../src/shared/events/event.service';

/**
 * Creates a mock for the EmailService
 */
export const createMockEmailService = () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
});

/**
 * Creates a mock for the EventService
 */
export const createMockEventService = () => ({
  emit: jest.fn().mockReturnValue(true),
});

/**
 * Creates a mock for the SessionService
 */
export const createMockSessionService = () => ({
  createSession: jest.fn().mockResolvedValue({ id: 'session-id' }),
  findSessionByToken: jest.fn(),
  revokeSession: jest.fn().mockResolvedValue(undefined),
  revokeAllUserSessions: jest.fn().mockResolvedValue(2),
  cleanupExpiredSessions: jest.fn().mockResolvedValue(0),
  getUserActiveSessions: jest.fn().mockResolvedValue([]),
});

/**
 * Creates a mock for the JwtService
 */
export const createMockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id' }),
});

/**
 * Creates a mock for the ConfigService
 */
export const createMockConfigService = () => ({
  get: jest.fn((key) => {
    const config = {
      'jwt.secret': 'test-secret',
      'jwt.expiresIn': '1h',
      'jwt.refreshExpiresIn': '7d',
      'mfa.issuer': 'MindLyf',
      'mfa.window': 1,
      'throttle.ttl': 60,
      'throttle.limit': 10,
      'environment': 'test',
    };
    return config[key];
  }),
});

/**
 * Creates a mock SpeakeasyService for TOTP verification
 */
export const createMockSpeakeasy = () => ({
  generateSecret: jest.fn().mockReturnValue({
    base32: 'test-secret',
    otpauth_url: 'otpauth://totp/MindLyf:test@example.com?secret=test-secret&issuer=MindLyf',
  }),
  totp: {
    verify: jest.fn().mockReturnValue(true),
    generate: jest.fn().mockReturnValue('123456'),
  },
});

/**
 * Verifies that the correct event was emitted
 */
export const verifyEventEmitted = (
  eventService: jest.Mocked<any>,
  eventType: EventType,
  userId?: string
) => {
  expect(eventService.emit).toHaveBeenCalledWith(
    eventType,
    expect.any(Object),
    expect.objectContaining({
      ...(userId && { userId }),
    })
  );
}; 
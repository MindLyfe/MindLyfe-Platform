import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum EventType {
  // User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Auth events
  AUTH_LOGIN_SUCCESS = 'auth.login.success',
  AUTH_LOGIN_FAILED = 'auth.login.failed',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_PASSWORD_CHANGED = 'auth.password.changed',
  AUTH_PASSWORD_RESET_REQUESTED = 'auth.password.reset.requested',
  AUTH_PASSWORD_RESET_COMPLETED = 'auth.password.reset.completed',
  
  // MFA events
  MFA_ENABLED = 'mfa.enabled',
  MFA_DISABLED = 'mfa.disabled',
  MFA_VERIFICATION_SUCCESS = 'mfa.verification.success',
  MFA_VERIFICATION_FAILED = 'mfa.verification.failed',
  
  // Role events
  ROLE_CHANGED = 'role.changed',
  
  // Token events
  TOKEN_REFRESHED = 'token.refreshed',
  TOKEN_REVOKED = 'token.revoked',
  
  // Email events
  EMAIL_VERIFICATION_SENT = 'email.verification.sent',
  EMAIL_VERIFICATION_COMPLETED = 'email.verification.completed',
  EMAIL_PASSWORD_RESET_SENT = 'email.password.reset.sent',
}

export interface EventMetadata {
  userId?: string;
  requestId?: string;
  timestamp?: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
  };
  [key: string]: any;
}

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDev = configService.get('environment') === 'development';
  }

  emit(eventType: EventType, payload: any, metadata: EventMetadata = {}) {
    // Add timestamp if not provided
    if (!metadata.timestamp) {
      metadata.timestamp = new Date().toISOString();
    }

    const event = {
      type: eventType,
      payload,
      metadata,
    };

    if (this.isDev) {
      this.logger.debug(`[EVENT EMITTED] ${eventType}`, { event });
      return;
    }

    // In production, this would publish to SNS, EventBridge, or another event bus
    this.logger.log(`Event emitted: ${eventType}`);
    
    // Here we would have actual event publishing logic:
    // this.snsClient.publish(...)
    // or
    // this.eventBridgeClient.putEvents(...)
  }
} 
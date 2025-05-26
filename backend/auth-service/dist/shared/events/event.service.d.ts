import { ConfigService } from '@nestjs/config';
export declare enum EventType {
    USER_CREATED = "user.created",
    USER_UPDATED = "user.updated",
    USER_DELETED = "user.deleted",
    AUTH_LOGIN_SUCCESS = "auth.login.success",
    AUTH_LOGIN_FAILED = "auth.login.failed",
    AUTH_LOGOUT = "auth.logout",
    AUTH_PASSWORD_CHANGED = "auth.password.changed",
    AUTH_PASSWORD_RESET_REQUESTED = "auth.password.reset.requested",
    AUTH_PASSWORD_RESET_COMPLETED = "auth.password.reset.completed",
    MFA_ENABLED = "mfa.enabled",
    MFA_DISABLED = "mfa.disabled",
    MFA_VERIFICATION_SUCCESS = "mfa.verification.success",
    MFA_VERIFICATION_FAILED = "mfa.verification.failed",
    ROLE_CHANGED = "role.changed",
    TOKEN_REFRESHED = "token.refreshed",
    TOKEN_REVOKED = "token.revoked",
    EMAIL_VERIFICATION_SENT = "email.verification.sent",
    EMAIL_VERIFICATION_COMPLETED = "email.verification.completed",
    EMAIL_PASSWORD_RESET_SENT = "email.password.reset.sent"
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
export declare class EventService {
    private readonly configService;
    private readonly logger;
    private readonly isDev;
    constructor(configService: ConfigService);
    emit(eventType: EventType, payload: any, metadata?: EventMetadata): void;
}

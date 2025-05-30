import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  payload?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details?: any;
  sessionId?: string;
  requestId?: string;
}

export enum SecurityEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGIN_BRUTE_FORCE = 'login_brute_force',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  
  // Authorization Events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_DENIED = 'permission_denied',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  
  // Input Validation Events
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  NOSQL_INJECTION_ATTEMPT = 'nosql_injection_attempt',
  PATH_TRAVERSAL_ATTEMPT = 'path_traversal_attempt',
  MALICIOUS_FILE_UPLOAD = 'malicious_file_upload',
  
  // Rate Limiting Events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  DDoS_ATTEMPT = 'ddos_attempt',
  
  // Data Access Events
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  BULK_DATA_ACCESS = 'bulk_data_access',
  
  // Payment Security Events
  PAYMENT_FRAUD_ATTEMPT = 'payment_fraud_attempt',
  SUSPICIOUS_PAYMENT = 'suspicious_payment',
  PAYMENT_FAILURE = 'payment_failure',
  
  // System Events
  SERVICE_COMPROMISE = 'service_compromise',
  CONFIGURATION_CHANGE = 'configuration_change',
  SECURITY_SCAN_DETECTED = 'security_scan_detected',
  
  // General Security Events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_VIOLATION = 'security_violation',
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger(SecurityLoggerService.name);
  private readonly alertThresholds = new Map<SecurityEventType, number>();
  private readonly eventCounts = new Map<string, number>();
  private readonly lastAlerts = new Map<string, Date>();

  constructor(private readonly configService: ConfigService) {
    this.initializeAlertThresholds();
  }

  /**
   * Initialize alert thresholds for different event types
   */
  private initializeAlertThresholds(): void {
    this.alertThresholds.set(SecurityEventType.LOGIN_FAILURE, 5);
    this.alertThresholds.set(SecurityEventType.UNAUTHORIZED_ACCESS, 3);
    this.alertThresholds.set(SecurityEventType.XSS_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.SQL_INJECTION_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.RATE_LIMIT_EXCEEDED, 10);
    this.alertThresholds.set(SecurityEventType.PAYMENT_FRAUD_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.SUSPICIOUS_ACTIVITY, 3);
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: event.type!,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      endpoint: event.endpoint,
      method: event.method,
      payload: this.sanitizePayload(event.payload),
      severity: event.severity || 'medium',
      timestamp: new Date(),
      details: event.details,
      sessionId: event.sessionId,
      requestId: event.requestId,
    };

    // Log the event
    this.logEvent(securityEvent);

    // Check if alert should be triggered
    await this.checkAlertThreshold(securityEvent);

    // Store in database for analysis (if configured)
    await this.storeSecurityEvent(securityEvent);
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    type: SecurityEventType.LOGIN_SUCCESS | SecurityEventType.LOGIN_FAILURE | SecurityEventType.LOGOUT,
    userId: string,
    ip: string,
    userAgent?: string,
    details?: any
  ): Promise<void> {
    await this.logSecurityEvent({
      type,
      userId,
      ip,
      userAgent,
      severity: type === SecurityEventType.LOGIN_FAILURE ? 'medium' : 'low',
      details,
    });
  }

  /**
   * Log authorization events
   */
  async logAuthorizationEvent(
    type: SecurityEventType.UNAUTHORIZED_ACCESS | SecurityEventType.PERMISSION_DENIED,
    userId: string,
    endpoint: string,
    ip: string,
    details?: any
  ): Promise<void> {
    await this.logSecurityEvent({
      type,
      userId,
      endpoint,
      ip,
      severity: 'high',
      details,
    });
  }

  /**
   * Log input validation events
   */
  async logInputValidationEvent(
    type: SecurityEventType.XSS_ATTEMPT | SecurityEventType.SQL_INJECTION_ATTEMPT | SecurityEventType.NOSQL_INJECTION_ATTEMPT,
    ip: string,
    endpoint: string,
    payload: any,
    userId?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type,
      userId,
      ip,
      endpoint,
      payload,
      severity: 'critical',
    });
  }

  /**
   * Log rate limiting events
   */
  async logRateLimitEvent(
    ip: string,
    endpoint: string,
    userId?: string,
    details?: any
  ): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      userId,
      ip,
      endpoint,
      severity: 'medium',
      details,
    });
  }

  /**
   * Log payment security events
   */
  async logPaymentSecurityEvent(
    type: SecurityEventType.PAYMENT_FRAUD_ATTEMPT | SecurityEventType.SUSPICIOUS_PAYMENT,
    userId: string,
    ip: string,
    details: any
  ): Promise<void> {
    await this.logSecurityEvent({
      type,
      userId,
      ip,
      severity: 'critical',
      details,
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    description: string,
    userId: string,
    ip: string,
    endpoint?: string,
    details?: any
  ): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      userId,
      ip,
      endpoint,
      severity: 'high',
      details: { description, ...details },
    });
  }

  /**
   * Log the event with appropriate formatting
   */
  private logEvent(event: SecurityEvent): void {
    const logMessage = this.formatLogMessage(event);
    
    switch (event.severity) {
      case 'critical':
        this.logger.error(`🚨 CRITICAL SECURITY EVENT: ${logMessage}`);
        break;
      case 'high':
        this.logger.error(`⚠️ HIGH SECURITY EVENT: ${logMessage}`);
        break;
      case 'medium':
        this.logger.warn(`⚡ MEDIUM SECURITY EVENT: ${logMessage}`);
        break;
      case 'low':
        this.logger.log(`ℹ️ LOW SECURITY EVENT: ${logMessage}`);
        break;
    }
  }

  /**
   * Format log message for security events
   */
  private formatLogMessage(event: SecurityEvent): string {
    const parts = [
      `Type: ${event.type}`,
      event.userId ? `User: ${event.userId}` : null,
      event.ip ? `IP: ${event.ip}` : null,
      event.endpoint ? `Endpoint: ${event.endpoint}` : null,
      event.method ? `Method: ${event.method}` : null,
    ].filter(Boolean);

    return parts.join(' | ');
  }

  /**
   * Check if alert threshold is exceeded
   */
  private async checkAlertThreshold(event: SecurityEvent): Promise<void> {
    const threshold = this.alertThresholds.get(event.type);
    if (!threshold) return;

    const key = `${event.type}-${event.ip || event.userId || 'unknown'}`;
    const currentCount = (this.eventCounts.get(key) || 0) + 1;
    this.eventCounts.set(key, currentCount);

    // Reset count after 1 hour
    setTimeout(() => {
      this.eventCounts.delete(key);
    }, 60 * 60 * 1000);

    if (currentCount >= threshold) {
      await this.triggerSecurityAlert(event, currentCount);
    }
  }

  /**
   * Trigger security alert
   */
  private async triggerSecurityAlert(event: SecurityEvent, count: number): Promise<void> {
    const alertKey = `${event.type}-${event.ip || event.userId}`;
    const lastAlert = this.lastAlerts.get(alertKey);
    
    // Don't spam alerts - minimum 15 minutes between same type of alerts
    if (lastAlert && Date.now() - lastAlert.getTime() < 15 * 60 * 1000) {
      return;
    }

    this.lastAlerts.set(alertKey, new Date());

    const alertMessage = `🚨 SECURITY ALERT: ${event.type} threshold exceeded (${count} events) for ${event.ip || event.userId}`;
    
    this.logger.error(alertMessage);

    // Send alert to monitoring system (implement based on your monitoring setup)
    await this.sendAlert({
      type: 'security_threshold_exceeded',
      message: alertMessage,
      event,
      count,
      severity: event.severity,
    });
  }

  /**
   * Send alert to external monitoring system
   */
  private async sendAlert(alert: any): Promise<void> {
    try {
      // Implement your alerting mechanism here
      // Examples: Slack, PagerDuty, AWS SNS, email, etc.
      
      if (this.configService.get('monitoring.webhook')) {
        // Send to webhook
        const fetch = (await import('node-fetch')).default;
        await fetch(this.configService.get('monitoring.webhook'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
      }

      // Log to CloudWatch if in AWS environment
      if (this.configService.get('aws.region')) {
        await this.sendToCloudWatch(alert);
      }

    } catch (error) {
      this.logger.error('Failed to send security alert:', error);
    }
  }

  /**
   * Send alert to AWS CloudWatch
   */
  private async sendToCloudWatch(alert: any): Promise<void> {
    try {
      const { CloudWatchLogsClient, PutLogEventsCommand } = await import('@aws-sdk/client-cloudwatch-logs');
      
      const client = new CloudWatchLogsClient({
        region: this.configService.get('aws.region'),
      });

      const command = new PutLogEventsCommand({
        logGroupName: '/mindlyf/security-alerts',
        logStreamName: `security-alerts-${new Date().toISOString().split('T')[0]}`,
        logEvents: [{
          timestamp: Date.now(),
          message: JSON.stringify(alert),
        }],
      });

      await client.send(command);
    } catch (error) {
      this.logger.error('Failed to send alert to CloudWatch:', error);
    }
  }

  /**
   * Store security event in database for analysis
   */
  private async storeSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Implement database storage based on your setup
      // This could be a separate security events table
      
      // For now, we'll just log to a structured format that can be parsed
      const structuredLog = {
        timestamp: event.timestamp.toISOString(),
        level: 'SECURITY',
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        ip: event.ip,
        endpoint: event.endpoint,
        userAgent: event.userAgent,
        details: event.details,
      };

      // This can be picked up by log aggregation systems like ELK stack
      console.log('SECURITY_EVENT:', JSON.stringify(structuredLog));

    } catch (error) {
      this.logger.error('Failed to store security event:', error);
    }
  }

  /**
   * Sanitize payload to remove sensitive information
   */
  private sanitizePayload(payload: any): any {
    if (!payload) return payload;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    if (typeof payload === 'object') {
      const sanitized = { ...payload };
      
      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }

    return payload;
  }

  /**
   * Get security event statistics
   */
  async getSecurityStats(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<any> {
    // This would typically query your database
    // For now, return current in-memory stats
    
    return {
      timeRange,
      totalEvents: this.eventCounts.size,
      activeAlerts: this.lastAlerts.size,
      eventsByType: Object.fromEntries(this.eventCounts),
      timestamp: new Date(),
    };
  }

  /**
   * Health check for security logger
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const stats = await this.getSecurityStats('1h');
      
      return {
        status: 'healthy',
        details: {
          eventsTracked: stats.totalEvents,
          activeAlerts: stats.activeAlerts,
          alertThresholds: Object.fromEntries(this.alertThresholds),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message },
      };
    }
  }
} 
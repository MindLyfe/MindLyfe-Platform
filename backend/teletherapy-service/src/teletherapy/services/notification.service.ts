import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface TeletherapyNotificationPayload {
  type: string;
  recipientId: string;
  channels: string[];
  variables: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export enum TeletherapyNotificationType {
  // Session booking notifications
  SESSION_BOOKING_CONFIRMED = 'session_booking_confirmed',
  SESSION_BOOKING_FAILED = 'session_booking_failed',
  NEW_SESSION_REQUEST = 'new_session_request',
  
  // Session reminders
  SESSION_REMINDER_24H = 'session_reminder_24h',
  SESSION_REMINDER_1H = 'session_reminder_1h',
  SESSION_STARTING_SOON = 'session_starting_soon',
  
  // Session lifecycle
  SESSION_CANCELLED = 'session_cancelled',
  SESSION_RESCHEDULED = 'session_rescheduled',
  SESSION_COMPLETED = 'session_completed',
  SESSION_NO_SHOW = 'session_no_show',
  
  // Payment notifications
  SESSION_PAYMENT_FAILED = 'session_payment_failed',
  SESSION_PAYMENT_CONFIRMED = 'session_payment_confirmed',
  
  // Video session notifications
  WAITING_ROOM_JOIN = 'waiting_room_join',
  WAITING_ROOM_ADMITTED = 'waiting_room_admitted',
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',
  BREAKOUT_ROOM_CREATED = 'breakout_room_created',
  
  // Recording and feedback
  RECORDING_AVAILABLE = 'recording_available',
  RECORDING_FAILED = 'recording_failed',
  FEEDBACK_REQUEST = 'feedback_request',
  
  // Therapist availability
  THERAPIST_AVAILABILITY_UPDATED = 'therapist_availability_updated',
  EMERGENCY_SESSION_REQUEST = 'emergency_session_request',
  
  // Technical notifications
  VIDEO_QUALITY_ISSUE = 'video_quality_issue',
  SESSION_TECHNICAL_ISSUE = 'session_technical_issue',
  
  // Calendar integration
  CALENDAR_EVENT_CREATED = 'calendar_event_created',
  CALENDAR_SYNC_FAILED = 'calendar_sync_failed'
}

@Injectable()
export class TeletherapyNotificationService {
  private readonly logger = new Logger(TeletherapyNotificationService.name);
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>(
      'NOTIFICATION_SERVICE_URL',
      'http://notification-service:3005'
    );
  }

  /**
   * Send notification to notification service
   */
  async sendNotification(notification: TeletherapyNotificationPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notification`,
          {
            ...notification,
            timestamp: new Date(),
            serviceSource: 'teletherapy-service'
          },
          {
            headers: {
              'X-Service-Name': 'teletherapy-service',
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        )
      );

      this.logger.log(`Teletherapy notification sent: ${notification.type} to user ${notification.recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to send teletherapy notification: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical for core functionality
    }
  }

  /**
   * Schedule notification for future delivery
   */
  async scheduleNotification(notification: TeletherapyNotificationPayload): Promise<void> {
    await this.sendNotification({
      ...notification,
      scheduledFor: notification.scheduledFor
    });
  }

  /**
   * Send session booking confirmation
   */
  async notifySessionBookingConfirmed(
    clientId: string,
    therapistId: string,
    sessionId: string,
    sessionDate: Date,
    therapistName: string,
    sessionType: string,
    sessionDuration: number
  ): Promise<void> {
    // Notify client
    await this.sendNotification({
      type: TeletherapyNotificationType.SESSION_BOOKING_CONFIRMED,
      recipientId: clientId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        sessionId,
        sessionDate,
        therapistName,
        sessionType,
        sessionDuration,
        bookedAt: new Date()
      },
      priority: 'high'
    });

    // Notify therapist
    await this.sendNotification({
      type: TeletherapyNotificationType.NEW_SESSION_REQUEST,
      recipientId: therapistId,
      channels: ['email', 'in_app'],
      variables: {
        sessionId,
        sessionDate,
        sessionType,
        sessionDuration,
        bookedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Send session booking failure notification
   */
  async notifySessionBookingFailed(
    clientId: string,
    reason: string,
    attemptedDate: Date,
    therapistName?: string
  ): Promise<void> {
    await this.sendNotification({
      type: TeletherapyNotificationType.SESSION_BOOKING_FAILED,
      recipientId: clientId,
      channels: ['email', 'in_app'],
      variables: {
        reason,
        attemptedDate,
        therapistName: therapistName || 'Unknown',
        failedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Schedule multi-stage session reminders
   */
  async scheduleSessionReminders(
    sessionId: string,
    clientId: string,
    therapistId: string,
    sessionDate: Date,
    therapistName: string,
    sessionType: string,
    joinLink?: string
  ): Promise<void> {
    const sessionDateTime = new Date(sessionDate);

    // 24 hours before
    const reminder24h = new Date(sessionDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > new Date()) {
      await this.scheduleNotification({
        type: TeletherapyNotificationType.SESSION_REMINDER_24H,
        recipientId: clientId,
        scheduledFor: reminder24h,
        channels: ['email'],
        variables: {
          sessionId,
          sessionDate: sessionDateTime,
          therapistName,
          sessionType,
          reminderType: '24 hours',
          timeUntilSession: '24 hours'
        },
        priority: 'normal'
      });
    }

    // 1 hour before
    const reminder1h = new Date(sessionDateTime.getTime() - 60 * 60 * 1000);
    if (reminder1h > new Date()) {
      await this.scheduleNotification({
        type: TeletherapyNotificationType.SESSION_REMINDER_1H,
        recipientId: clientId,
        scheduledFor: reminder1h,
        channels: ['email', 'sms', 'push'],
        variables: {
          sessionId,
          sessionDate: sessionDateTime,
          therapistName,
          sessionType,
          reminderType: '1 hour',
          timeUntilSession: '1 hour'
        },
        priority: 'high'
      });
    }

    // 15 minutes before
    const reminder15min = new Date(sessionDateTime.getTime() - 15 * 60 * 1000);
    if (reminder15min > new Date()) {
      await this.scheduleNotification({
        type: TeletherapyNotificationType.SESSION_STARTING_SOON,
        recipientId: clientId,
        scheduledFor: reminder15min,
        channels: ['push', 'in_app'],
        variables: {
          sessionId,
          sessionDate: sessionDateTime,
          therapistName,
          sessionType,
          joinLink: joinLink || '',
          timeUntilSession: '15 minutes'
        },
        priority: 'high'
      });
    }

    // Also send reminders to therapist
    if (reminder1h > new Date()) {
      await this.scheduleNotification({
        type: TeletherapyNotificationType.SESSION_REMINDER_1H,
        recipientId: therapistId,
        scheduledFor: reminder1h,
        channels: ['email', 'in_app'],
        variables: {
          sessionId,
          sessionDate: sessionDateTime,
          sessionType,
          reminderType: '1 hour therapist',
          timeUntilSession: '1 hour'
        },
        priority: 'high'
      });
    }
  }

  /**
   * Send payment failure notification
   */
  async notifyPaymentFailed(
    userId: string,
    sessionId: string,
    amount: number,
    currency: string,
    reason: string,
    sessionDate?: Date
  ): Promise<void> {
    await this.sendNotification({
      type: TeletherapyNotificationType.SESSION_PAYMENT_FAILED,
      recipientId: userId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        sessionId,
        amount,
        currency,
        reason,
        sessionDate: sessionDate || new Date(),
        failedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Send session cancellation notification
   */
  async notifySessionCancelled(
    sessionId: string,
    clientId: string,
    therapistId: string,
    sessionDate: Date,
    reason: string,
    cancelledBy: string
  ): Promise<void> {
    const participants = [clientId, therapistId];
    
    for (const participantId of participants) {
      await this.sendNotification({
        type: TeletherapyNotificationType.SESSION_CANCELLED,
        recipientId: participantId,
        channels: ['email', 'in_app', 'push'],
        variables: {
          sessionId,
          sessionDate,
          reason,
          cancelledBy,
          cancelledAt: new Date()
        },
        priority: 'high'
      });
    }
  }

  /**
   * Send session completion notification
   */
  async notifySessionCompleted(
    sessionId: string,
    clientId: string,
    therapistId: string,
    sessionDuration: number,
    sessionType: string
  ): Promise<void> {
    // Notify client
    await this.sendNotification({
      type: TeletherapyNotificationType.SESSION_COMPLETED,
      recipientId: clientId,
      channels: ['in_app'],
      variables: {
        sessionId,
        sessionDuration,
        sessionType,
        completedAt: new Date()
      },
      priority: 'normal'
    });

    // Request feedback from client
    await this.sendNotification({
      type: TeletherapyNotificationType.FEEDBACK_REQUEST,
      recipientId: clientId,
      channels: ['email', 'in_app'],
      variables: {
        sessionId,
        sessionType,
        completedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Send emergency session request notification
   */
  async notifyEmergencySessionRequest(
    therapistIds: string[],
    clientId: string,
    requestedTime: Date,
    urgencyLevel: string,
    notes?: string
  ): Promise<void> {
    for (const therapistId of therapistIds) {
      await this.sendNotification({
        type: TeletherapyNotificationType.EMERGENCY_SESSION_REQUEST,
        recipientId: therapistId,
        channels: ['email', 'sms', 'push'],
        variables: {
          clientId,
          requestedTime,
          urgencyLevel,
          notes: notes || '',
          requestedAt: new Date()
        },
        priority: 'high'
      });
    }
  }

  /**
   * Send recording available notification
   */
  async notifyRecordingAvailable(
    sessionId: string,
    participantIds: string[],
    recordingUrl: string,
    sessionDate: Date
  ): Promise<void> {
    for (const participantId of participantIds) {
      await this.sendNotification({
        type: TeletherapyNotificationType.RECORDING_AVAILABLE,
        recipientId: participantId,
        channels: ['email', 'in_app'],
        variables: {
          sessionId,
          recordingUrl,
          sessionDate,
          availableAt: new Date()
        },
        priority: 'normal'
      });
    }
  }

  /**
   * Send video quality issue notification
   */
  async notifyVideoQualityIssue(
    sessionId: string,
    participantIds: string[],
    issueType: string,
    severity: 'low' | 'medium' | 'high'
  ): Promise<void> {
    for (const participantId of participantIds) {
      await this.sendNotification({
        type: TeletherapyNotificationType.VIDEO_QUALITY_ISSUE,
        recipientId: participantId,
        channels: ['in_app'],
        variables: {
          sessionId,
          issueType,
          severity,
          reportedAt: new Date()
        },
        priority: severity === 'high' ? 'high' : 'normal'
      });
    }
  }

  /**
   * Send participant waiting room notification
   */
  async notifyWaitingRoomJoin(
    therapistId: string,
    participantName: string,
    sessionId: string
  ): Promise<void> {
    await this.sendNotification({
      type: TeletherapyNotificationType.WAITING_ROOM_JOIN,
      recipientId: therapistId,
      channels: ['in_app', 'push'],
      variables: {
        participantName,
        sessionId,
        joinedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Send participant admitted notification
   */
  async notifyWaitingRoomAdmitted(
    participantId: string,
    sessionId: string,
    admittedBy: string
  ): Promise<void> {
    await this.sendNotification({
      type: TeletherapyNotificationType.WAITING_ROOM_ADMITTED,
      recipientId: participantId,
      channels: ['in_app', 'push'],
      variables: {
        sessionId,
        admittedBy,
        admittedAt: new Date()
      },
      priority: 'high'
    });
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationType } from './entities/notification.entity';
import { ChannelType } from './entities/notification-channel.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

export interface SupportShiftNotificationData {
  userId: string;
  shiftId: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface SupportRequestNotificationData {
  userId: string;
  requestId: string;
  requestType: string;
  priority: string;
  subject: string;
  description: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  requestedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface SupportTeamWelcomeData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

@Injectable()
export class SupportNotificationService {
  private readonly logger = new Logger(SupportNotificationService.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send SMS reminder 30 minutes before shift start
   */
  async sendShiftSmsReminder(data: SupportShiftNotificationData): Promise<void> {
    try {
      const notification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT_SHIFT,
        title: 'Shift Reminder',
        message: `Hi ${data.firstName}, your ${data.shiftType.toLowerCase()} shift starts in 30 minutes at ${new Date(data.startTime).toLocaleTimeString()}.`,
        metadata: {
          shiftId: data.shiftId,
          shiftType: data.shiftType,
          startTime: data.startTime,
          endTime: data.endTime,
          phoneNumber: data.phoneNumber,
          reminderType: 'sms_30min'
        },
        channels: [ChannelType.SMS]
      };

      await this.notificationService.createNotification(notification);
      this.logger.log(`SMS shift reminder sent to user ${data.userId} for shift ${data.shiftId}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS shift reminder: ${error.message}`, error.stack);
    }
  }

  /**
   * Send email reminder 10 minutes before shift start
   */
  async sendShiftEmailReminder(data: SupportShiftNotificationData): Promise<void> {
    try {
      const notification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT_SHIFT,
        title: 'Shift Starting Soon',
        message: `Dear ${data.firstName} ${data.lastName},\n\nYour ${data.shiftType.toLowerCase()} shift is starting in 10 minutes.\n\nShift Details:\n- Start Time: ${new Date(data.startTime).toLocaleString()}\n- End Time: ${new Date(data.endTime).toLocaleString()}\n\nPlease ensure you're ready to check in on time.\n\nBest regards,\nMindlyf Support Team`,
        metadata: {
          shiftId: data.shiftId,
          shiftType: data.shiftType,
          startTime: data.startTime,
          endTime: data.endTime,
          reminderType: 'email_10min'
        },
        channels: [ChannelType.EMAIL]
      };

      await this.notificationService.createNotification(notification);
      this.logger.log(`Email shift reminder sent to user ${data.userId} for shift ${data.shiftId}`);
    } catch (error) {
      this.logger.error(`Failed to send email shift reminder: ${error.message}`, error.stack);
    }
  }

  /**
   * Send support request assignment notification
   */
  async sendSupportRequestAssigned(data: SupportRequestNotificationData): Promise<void> {
    try {
      // SMS notification for immediate alert
      const smsNotification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT_REQUEST,
        title: 'New Support Request Assigned',
        message: `New ${data.priority.toLowerCase()} priority ${data.requestType.replace('_', ' ').toLowerCase()} request assigned: "${data.subject}". Check your dashboard for details.`,
        metadata: {
          requestId: data.requestId,
          requestType: data.requestType,
          priority: data.priority,
          subject: data.subject,
          phoneNumber: data.phoneNumber,
          notificationType: 'assignment'
        },
        channels: [ChannelType.SMS]
      };

      // Email notification with detailed information
      const emailNotification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT_REQUEST,
        title: 'Support Request Assignment',
        message: `Dear ${data.firstName} ${data.lastName},\n\nA new support request has been assigned to you:\n\nRequest Details:\n- ID: ${data.requestId}\n- Type: ${data.requestType.replace('_', ' ')}\n- Priority: ${data.priority}\n- Subject: ${data.subject}\n- Description: ${data.description}\n\nRequested by: ${data.requestedBy?.firstName} ${data.requestedBy?.lastName} (${data.requestedBy?.email})\n\nPlease log into your dashboard to view the full details and respond to this request.\n\nBest regards,\nMindlyf Support System`,
        metadata: {
          requestId: data.requestId,
          requestType: data.requestType,
          priority: data.priority,
          subject: data.subject,
          description: data.description,
          requestedBy: data.requestedBy,
          notificationType: 'assignment'
        },
        channels: [ChannelType.EMAIL]
      };

      await Promise.all([
        this.notificationService.createNotification(smsNotification),
        this.notificationService.createNotification(emailNotification)
      ]);

      this.logger.log(`Support request assignment notifications sent to user ${data.userId} for request ${data.requestId}`);
    } catch (error) {
      this.logger.error(`Failed to send support request assignment notifications: ${error.message}`, error.stack);
    }
  }

  /**
   * Send urgent support alert
   */
  async sendUrgentSupportAlert(data: SupportRequestNotificationData): Promise<void> {
    try {
      const notification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT_REQUEST,
        title: 'URGENT: Critical Support Request',
        message: `URGENT: Critical ${data.requestType.replace('_', ' ').toLowerCase()} request requires immediate attention: "${data.subject}". Please respond immediately.`,
        metadata: {
          requestId: data.requestId,
          requestType: data.requestType,
          priority: data.priority,
          subject: data.subject,
          phoneNumber: data.phoneNumber,
          notificationType: 'urgent_alert'
        },
        channels: [ChannelType.SMS, ChannelType.EMAIL, ChannelType.PUSH]
      };

      await this.notificationService.createNotification(notification);
      this.logger.log(`Urgent support alert sent to user ${data.userId} for request ${data.requestId}`);
    } catch (error) {
      this.logger.error(`Failed to send urgent support alert: ${error.message}`, error.stack);
    }
  }

  /**
   * Send shift change notification
   */
  async sendShiftChangeNotification(data: SupportShiftNotificationData & { changeType: string; reason?: string }): Promise<void> {
    try {
      const notification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT_SHIFT,
        title: 'Shift Schedule Change',
        message: `Your ${data.shiftType.toLowerCase()} shift on ${new Date(data.startTime).toLocaleDateString()} has been ${data.changeType}. ${data.reason ? `Reason: ${data.reason}` : ''} Please check your schedule for updates.`,
        metadata: {
          shiftId: data.shiftId,
          shiftType: data.shiftType,
          startTime: data.startTime,
          endTime: data.endTime,
          changeType: data.changeType,
          reason: data.reason,
          phoneNumber: data.phoneNumber,
          notificationType: 'shift_change'
        },
        channels: [ChannelType.SMS, ChannelType.EMAIL]
      };

      await this.notificationService.createNotification(notification);
      this.logger.log(`Shift change notification sent to user ${data.userId} for shift ${data.shiftId}`);
    } catch (error) {
      this.logger.error(`Failed to send shift change notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Send support team welcome email
   */
  async sendSupportTeamWelcomeEmail(data: SupportTeamWelcomeData): Promise<void> {
    try {
      const notification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT,
        title: 'Welcome to the Mindlyf Support Team',
        message: `Dear ${data.firstName} ${data.lastName},\n\nWelcome to the Mindlyf Support Team! We're excited to have you join our dedicated team of support professionals.\n\nAs a support team member, you'll be responsible for:\n- Handling customer support requests\n- Managing your assigned shifts\n- Providing excellent customer service\n- Escalating issues when necessary\n\nYour account has been set up with SUPPORT_TEAM privileges. You can now:\n- Access the support dashboard\n- Check in/out of shifts\n- View and respond to assigned support requests\n- Update your notification preferences\n\nPlease log into your account and familiarize yourself with the support system. If you have any questions, don't hesitate to reach out to your supervisor.\n\nWelcome aboard!\n\nBest regards,\nMindlyf Support Management`,
        metadata: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          notificationType: 'welcome'
        },
        channels: [ChannelType.EMAIL]
      };

      await this.notificationService.createNotification(notification);
      this.logger.log(`Support team welcome email sent to user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to send support team welcome email: ${error.message}`, error.stack);
    }
  }

  /**
   * Send support escalation notification
   */
  async sendSupportEscalationEmail(data: SupportRequestNotificationData & { escalatedBy: string; escalationReason: string }): Promise<void> {
    try {
      const notification: CreateNotificationDto = {
        userId: data.userId,
        recipientEmail: data.email,
        type: NotificationType.SUPPORT_REQUEST,
        title: 'Support Request Escalated',
        message: `Dear ${data.firstName} ${data.lastName},\n\nA support request has been escalated to you:\n\nRequest Details:\n- ID: ${data.requestId}\n- Type: ${data.requestType.replace('_', ' ')}\n- Priority: ${data.priority}\n- Subject: ${data.subject}\n- Description: ${data.description}\n\nEscalated by: ${data.escalatedBy}\nEscalation Reason: ${data.escalationReason}\n\nRequested by: ${data.requestedBy?.firstName} ${data.requestedBy?.lastName} (${data.requestedBy?.email})\n\nThis request requires immediate attention. Please review and take appropriate action.\n\nBest regards,\nMindlyf Support System`,
        metadata: {
          requestId: data.requestId,
          requestType: data.requestType,
          priority: data.priority,
          subject: data.subject,
          description: data.description,
          escalatedBy: data.escalatedBy,
          escalationReason: data.escalationReason,
          requestedBy: data.requestedBy,
          notificationType: 'escalation'
        },
        channels: [ChannelType.EMAIL]
      };

      await this.notificationService.createNotification(notification);
      this.logger.log(`Support escalation notification sent to user ${data.userId} for request ${data.requestId}`);
    } catch (error) {
      this.logger.error(`Failed to send support escalation notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Send bulk notifications to multiple support team members
   */
  async sendBulkSupportNotification(
    userIds: string[],
    title: string,
    message: string,
    channels: ChannelType[] = [ChannelType.EMAIL],
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: NotificationType.SUPPORT,
        title,
        message,
        metadata: {
          ...metadata,
          notificationType: 'bulk',
          sentAt: new Date().toISOString()
        },
        channels
      }));

      await Promise.all(
        notifications.map(notification => 
          this.notificationService.createNotification(notification)
        )
      );

      this.logger.log(`Bulk support notification sent to ${userIds.length} users`);
    } catch (error) {
      this.logger.error(`Failed to send bulk support notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Send test notification for testing purposes
   */
  async sendTestNotification(userId: string, email: string, phoneNumber?: string): Promise<void> {
    try {
      const notification: CreateNotificationDto = {
        userId,
        recipientEmail: email,
        type: NotificationType.SUPPORT,
        title: 'Test Notification',
        message: 'This is a test notification to verify your notification settings are working correctly.',
        metadata: {
          phoneNumber,
          notificationType: 'test',
          testTimestamp: new Date().toISOString()
        },
        channels: phoneNumber ? [ChannelType.SMS, ChannelType.EMAIL] : [ChannelType.EMAIL]
      };

      await this.notificationService.createNotification(notification);
      this.logger.log(`Test notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send test notification: ${error.message}`, error.stack);
    }
  }
}
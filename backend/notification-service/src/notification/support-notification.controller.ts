import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SupportNotificationService, SupportShiftNotificationData, SupportRequestNotificationData, SupportTeamWelcomeData } from './support-notification.service';
import { ChannelType } from './entities/notification-channel.entity';

export class SendShiftReminderDto {
  userId: string;
  shiftId: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  reminderType: 'sms' | 'email';
}

export class SendSupportRequestNotificationDto {
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

export class SendShiftChangeNotificationDto {
  userId: string;
  shiftId: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  changeType: string;
  reason?: string;
}

export class SendSupportTeamWelcomeDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export class SendSupportEscalationDto {
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
  escalatedBy: string;
  escalationReason: string;
  requestedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class SendBulkNotificationDto {
  userIds: string[];
  title: string;
  message: string;
  channels?: ChannelType[];
  metadata?: Record<string, any>;
}

export class SendTestNotificationDto {
  userId: string;
  email: string;
  phoneNumber?: string;
}

@ApiTags('Support Notifications')
@Controller('notifications/support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportNotificationController {
  private readonly logger = new Logger(SupportNotificationController.name);

  constructor(
    private readonly supportNotificationService: SupportNotificationService,
  ) {}

  @Post('shift/reminder')
  @ApiOperation({ summary: 'Send shift reminder notification' })
  @ApiResponse({ status: 200, description: 'Shift reminder sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_TEAM')
  async sendShiftReminder(@Body() dto: SendShiftReminderDto): Promise<{ success: boolean; message: string }> {
    try {
      if (dto.reminderType === 'sms') {
        await this.supportNotificationService.sendShiftSmsReminder(dto);
      } else {
        await this.supportNotificationService.sendShiftEmailReminder(dto);
      }

      this.logger.log(`Shift ${dto.reminderType} reminder sent for shift ${dto.shiftId}`);
      return {
        success: true,
        message: `Shift ${dto.reminderType} reminder sent successfully`
      };
    } catch (error) {
      this.logger.error(`Failed to send shift reminder: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send shift reminder: ${error.message}`
      };
    }
  }

  @Post('request/assigned')
  @ApiOperation({ summary: 'Send support request assignment notification' })
  @ApiResponse({ status: 200, description: 'Support request assignment notification sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_TEAM')
  async sendSupportRequestAssigned(@Body() dto: SendSupportRequestNotificationDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.supportNotificationService.sendSupportRequestAssigned(dto);
      
      this.logger.log(`Support request assignment notification sent for request ${dto.requestId}`);
      return {
        success: true,
        message: 'Support request assignment notification sent successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to send support request assignment notification: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send support request assignment notification: ${error.message}`
      };
    }
  }

  @Post('request/urgent')
  @ApiOperation({ summary: 'Send urgent support alert' })
  @ApiResponse({ status: 200, description: 'Urgent support alert sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_TEAM')
  async sendUrgentSupportAlert(@Body() dto: SendSupportRequestNotificationDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.supportNotificationService.sendUrgentSupportAlert(dto);
      
      this.logger.log(`Urgent support alert sent for request ${dto.requestId}`);
      return {
        success: true,
        message: 'Urgent support alert sent successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to send urgent support alert: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send urgent support alert: ${error.message}`
      };
    }
  }

  @Post('shift/change')
  @ApiOperation({ summary: 'Send shift change notification' })
  @ApiResponse({ status: 200, description: 'Shift change notification sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async sendShiftChangeNotification(@Body() dto: SendShiftChangeNotificationDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.supportNotificationService.sendShiftChangeNotification(dto);
      
      this.logger.log(`Shift change notification sent for shift ${dto.shiftId}`);
      return {
        success: true,
        message: 'Shift change notification sent successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to send shift change notification: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send shift change notification: ${error.message}`
      };
    }
  }

  @Post('team/welcome')
  @ApiOperation({ summary: 'Send support team welcome email' })
  @ApiResponse({ status: 200, description: 'Support team welcome email sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async sendSupportTeamWelcomeEmail(@Body() dto: SendSupportTeamWelcomeDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.supportNotificationService.sendSupportTeamWelcomeEmail(dto);
      
      this.logger.log(`Support team welcome email sent to user ${dto.userId}`);
      return {
        success: true,
        message: 'Support team welcome email sent successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to send support team welcome email: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send support team welcome email: ${error.message}`
      };
    }
  }

  @Post('request/escalation')
  @ApiOperation({ summary: 'Send support escalation notification' })
  @ApiResponse({ status: 200, description: 'Support escalation notification sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_TEAM')
  async sendSupportEscalationEmail(@Body() dto: SendSupportEscalationDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.supportNotificationService.sendSupportEscalationEmail(dto);
      
      this.logger.log(`Support escalation notification sent for request ${dto.requestId}`);
      return {
        success: true,
        message: 'Support escalation notification sent successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to send support escalation notification: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send support escalation notification: ${error.message}`
      };
    }
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk notification to support team members' })
  @ApiResponse({ status: 200, description: 'Bulk notification sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async sendBulkSupportNotification(@Body() dto: SendBulkNotificationDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.supportNotificationService.sendBulkSupportNotification(
        dto.userIds,
        dto.title,
        dto.message,
        dto.channels,
        dto.metadata
      );
      
      this.logger.log(`Bulk notification sent to ${dto.userIds.length} support team members`);
      return {
        success: true,
        message: `Bulk notification sent to ${dto.userIds.length} support team members`
      };
    } catch (error) {
      this.logger.error(`Failed to send bulk notification: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send bulk notification: ${error.message}`
      };
    }
  }

  @Post('test')
  @ApiOperation({ summary: 'Send test notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_TEAM')
  async sendTestNotification(@Body() dto: SendTestNotificationDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.supportNotificationService.sendTestNotification(
        dto.userId,
        dto.email,
        dto.phoneNumber
      );
      
      this.logger.log(`Test notification sent to user ${dto.userId}`);
      return {
        success: true,
        message: 'Test notification sent successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to send test notification: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to send test notification: ${error.message}`
      };
    }
  }
}
export declare enum NotificationChannel {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare enum NotificationType {
    SESSION_REMINDER = "session_reminder",
    SESSION_CANCELLED = "session_cancelled",
    SESSION_RESCHEDULED = "session_rescheduled",
    PAYMENT_RECEIVED = "payment_received",
    PAYMENT_FAILED = "payment_failed",
    RECORDING_AVAILABLE = "recording_available",
    FEEDBACK_REQUEST = "feedback_request",
    PARTICIPANT_JOINED = "participant_joined",
    PARTICIPANT_LEFT = "participant_left",
    BREAKOUT_ROOM_INVITATION = "breakout_room_invitation",
    RESOURCE_SHARED = "resource_shared",
    CUSTOM = "custom"
}
export declare class ReminderSettingsDto {
    enabled: boolean;
    reminderMinutes: number;
    sendFollowUp?: boolean;
    followUpMinutes?: number;
    maxReminders: number;
}
export declare class ChannelPreferenceDto {
    channel: NotificationChannel;
    enabled: boolean;
    settings?: Record<string, any>;
}
export declare class CustomRuleDto {
    name: string;
    type: NotificationType;
    channels: NotificationChannel[];
    enabled: boolean;
    conditions?: Record<string, any>;
}
export declare class QuietHoursDto {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    enabled: boolean;
}
export declare class NotificationTemplateDto {
    name: string;
    type: NotificationType;
    subject: string;
    body: string;
    channels: NotificationChannel[];
    variables: string[];
    isActive?: boolean;
    metadata?: Record<string, any>;
}
export declare class NotificationSettingsDto {
    reminders: ReminderSettingsDto;
    channelPreferences: ChannelPreferenceDto[];
    customRules?: CustomRuleDto[];
    quietHours?: QuietHoursDto;
}
export declare class SendNotificationDto {
    recipientEmail: string;
    type: NotificationType;
    channels: NotificationChannel[];
    variables?: Record<string, any>;
    customContent?: string;
    priority?: 'high' | 'normal' | 'low';
    scheduledFor?: Date;
}
export declare class NotificationHistoryDto {
    startDate: Date;
    endDate: Date;
    type?: NotificationType;
    channel?: NotificationChannel;
    recipientEmail?: string;
}

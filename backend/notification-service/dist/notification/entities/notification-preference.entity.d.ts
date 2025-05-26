import { NotificationType } from './notification.entity';
export interface TimeWindow {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
export interface ChannelPreference {
    enabled: boolean;
    timeWindows?: TimeWindow[];
    contentTypes?: NotificationType[];
    frequency?: 'immediate' | 'daily' | 'weekly';
    consentGiven?: boolean;
    consentTimestamp?: Date;
}
export declare class NotificationPreferenceEntity {
    id: string;
    userId: string;
    channels: {
        email?: ChannelPreference;
        sms?: ChannelPreference;
        push?: ChannelPreference;
        in_app?: ChannelPreference;
    };
    typePreferences: {
        [key in NotificationType]?: {
            enabled: boolean;
            preferredChannels?: string[];
        };
    };
    frequency: {
        daily: number;
        weekly: number;
        byType?: {
            [key in NotificationType]?: {
                daily: number;
                weekly: number;
            };
        };
    };
    doNotDisturb: {
        enabled: boolean;
        startTime: string;
        endTime: string;
        timezone: string;
    };
    gamification: {
        streaks: boolean;
        achievements: boolean;
        challenges: boolean;
        milestones: boolean;
        frequency: 'immediate' | 'daily' | 'weekly';
    };
    isOnline: boolean;
    lastActivity: Date;
    receiveTransactional: boolean;
    receiveMarketing: boolean;
    createdAt: Date;
    updatedAt: Date;
}

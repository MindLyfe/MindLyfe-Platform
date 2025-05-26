import { User } from '../../auth/entities/user.entity';
export declare enum SessionStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show",
    WAITING_ROOM = "waiting_room"
}
export declare enum SessionType {
    VIDEO = "video",
    AUDIO = "audio",
    CHAT = "chat",
    GROUP_VIDEO = "group_video",
    GROUP_AUDIO = "group_audio",
    GROUP_CHAT = "group_chat"
}
export declare enum SessionCategory {
    INDIVIDUAL = "individual",
    GROUP = "group",
    WORKSHOP = "workshop",
    SUPPORT_GROUP = "support_group",
    COUPLES = "couples",
    FAMILY = "family"
}
export declare enum SessionFocus {
    ANXIETY = "anxiety",
    DEPRESSION = "depression",
    TRAUMA = "trauma",
    RELATIONSHIPS = "relationships",
    STRESS = "stress",
    ADDICTION = "addiction",
    GRIEF = "grief",
    MINDFULNESS = "mindfulness",
    OTHER = "other"
}
export declare enum SessionTemplateType {
    INDIVIDUAL_THERAPY = "individual_therapy",
    GROUP_THERAPY = "group_therapy",
    WORKSHOP = "workshop",
    SUPPORT_GROUP = "support_group",
    COUPLES_THERAPY = "couples_therapy",
    FAMILY_THERAPY = "family_therapy"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
export declare class TherapySession {
    id: string;
    therapistId: string;
    clientId: string;
    participantIds: string[];
    startTime: Date;
    endTime: Date;
    status: SessionStatus;
    type: SessionType;
    category: SessionCategory;
    focus: SessionFocus[];
    title: string;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    notes: {
        therapistNotes?: string;
        clientNotes?: string;
        sharedNotes?: string;
        groupNotes?: string;
        individualNotes?: Record<string, string>;
    };
    metadata: {
        roomId?: string;
        recordingUrl?: string;
        attachments?: string[];
        tags?: string[];
        meetingLink?: string;
        waitingRoomEnabled?: boolean;
        chatEnabled?: boolean;
        recordingEnabled?: boolean;
        breakoutRooms?: {
            id: string;
            name: string;
            participants: string[];
        }[];
        resources?: {
            title: string;
            type: 'document' | 'link' | 'video';
            url: string;
            description?: string;
        }[];
        feedback?: {
            userId: string;
            rating: number;
            comment?: string;
            timestamp: Date;
        }[];
    };
    isRecurring: boolean;
    recurringSchedule: {
        frequency: 'weekly' | 'biweekly' | 'monthly';
        daysOfWeek?: number[];
        dayOfMonth?: number;
        endDate?: Date;
        maxOccurrences?: number;
        skipDates?: Date[];
    };
    isPrivate: boolean;
    invitedEmails: string[];
    pricing: {
        amount: number;
        currency: string;
        perParticipant?: boolean;
        discountCode?: string;
        earlyBirdPrice?: number;
        earlyBirdEndDate?: Date;
    };
    requirements: {
        minAge?: number;
        maxAge?: number;
        prerequisites?: string[];
        requiredDocuments?: string[];
        consentRequired?: boolean;
    };
    recording: {
        url?: string;
        startTime?: Date;
        endTime?: Date;
        duration?: number;
        format?: string;
        size?: number;
        status?: 'processing' | 'completed' | 'failed';
        thumbnailUrl?: string;
        chapters?: {
            title: string;
            startTime: number;
            endTime: number;
            description?: string;
        }[];
        accessControl?: {
            allowedUsers: string[];
            password?: string;
            expiresAt?: Date;
        };
    };
    chat: {
        enabled: boolean;
        messages: {
            id: string;
            userId: string;
            content: string;
            timestamp: Date;
            type: 'text' | 'system' | 'private';
            recipientId?: string;
            attachments?: string[];
            status: 'sent' | 'delivered' | 'read';
            metadata?: Record<string, any>;
        }[];
        settings: {
            allowPrivateChat: boolean;
            allowFileSharing: boolean;
            moderationEnabled: boolean;
            autoArchive: boolean;
            archiveAfterDays: number;
        };
    };
    resources: {
        files: {
            id: string;
            name: string;
            type: string;
            url: string;
            size: number;
            uploadedBy: string;
            uploadedAt: Date;
            category: string;
            tags: string[];
            accessControl: {
                allowedUsers: string[];
                password?: string;
                expiresAt?: Date;
            };
            metadata: {
                description?: string;
                thumbnailUrl?: string;
                duration?: number;
                pages?: number;
            };
        }[];
        links: {
            id: string;
            title: string;
            url: string;
            description?: string;
            category: string;
            tags: string[];
            addedBy: string;
            addedAt: Date;
        }[];
    };
    analytics: {
        attendance: {
            totalInvited: number;
            totalAttended: number;
            averageDuration: number;
            lateJoins: number;
            earlyLeaves: number;
        };
        engagement: {
            chatMessages: number;
            reactions: number;
            resourceDownloads: number;
            participationScore: number;
        };
        feedback: {
            averageRating: number;
            totalRatings: number;
            sentimentScore: number;
            commonTopics: string[];
        };
        technical: {
            averageConnectionQuality: number;
            disconnections: number;
            deviceTypes: Record<string, number>;
            browserTypes: Record<string, number>;
        };
    };
    payment: {
        status: PaymentStatus;
        amount: number;
        currency: string;
        paymentMethod?: string;
        transactionId?: string;
        invoiceId?: string;
        paidAt?: Date;
        refundedAt?: Date;
        refundAmount?: number;
        paymentDetails?: {
            provider: string;
            last4?: string;
            expiryDate?: string;
            billingAddress?: Record<string, any>;
        };
        discounts?: {
            code: string;
            amount: number;
            type: 'percentage' | 'fixed';
        }[];
    };
    notifications: {
        sent: {
            type: string;
            recipient: string;
            sentAt: Date;
            status: 'sent' | 'delivered' | 'failed';
            channel: 'email' | 'sms' | 'push';
            content: string;
            metadata?: Record<string, any>;
        }[];
        settings: {
            reminderBeforeSession: boolean;
            reminderMinutes: number;
            sendRecordingLink: boolean;
            sendFeedbackRequest: boolean;
            customNotifications: {
                type: string;
                enabled: boolean;
                template: string;
                channels: string[];
            }[];
        };
    };
    calendar: {
        eventId?: string;
        provider: 'google' | 'outlook' | 'ical';
        syncStatus: 'synced' | 'pending' | 'failed';
        lastSyncedAt?: Date;
        timezone: string;
        availability: {
            startTime: string;
            endTime: string;
            daysOfWeek: number[];
            exceptions: {
                date: Date;
                available: boolean;
                reason?: string;
            }[];
        };
        reminders: {
            type: string;
            minutes: number;
            enabled: boolean;
        }[];
    };
    template: {
        type: SessionTemplateType;
        name: string;
        description?: string;
        defaultDuration: number;
        defaultSettings: {
            maxParticipants?: number;
            category: SessionCategory;
            type: SessionType;
            focus: SessionFocus[];
            pricing?: {
                amount: number;
                currency: string;
                perParticipant: boolean;
            };
            requirements?: {
                minAge?: number;
                maxAge?: number;
                prerequisites?: string[];
            };
        };
        customFields?: Record<string, any>;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        isPublic: boolean;
        tags: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    therapist: User;
    client: User;
    participants: User[];
}

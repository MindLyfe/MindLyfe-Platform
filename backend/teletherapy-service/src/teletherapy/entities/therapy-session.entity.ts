import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// User entity is managed by auth-service

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  WAITING_ROOM = 'waiting_room'
}

export enum SessionType {
  VIDEO = 'video',
  AUDIO = 'audio',
  CHAT = 'chat',
  GROUP_VIDEO = 'group_video',
  GROUP_AUDIO = 'group_audio',
  GROUP_CHAT = 'group_chat'
}

export enum SessionCategory {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
  WORKSHOP = 'workshop',
  SUPPORT_GROUP = 'support_group',
  COUPLES = 'couples',
  FAMILY = 'family'
}

export enum SessionFocus {
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  TRAUMA = 'trauma',
  RELATIONSHIPS = 'relationships',
  STRESS = 'stress',
  ADDICTION = 'addiction',
  GRIEF = 'grief',
  MINDFULNESS = 'mindfulness',
  OTHER = 'other'
}

export enum SessionTemplateType {
  INDIVIDUAL_THERAPY = 'individual_therapy',
  GROUP_THERAPY = 'group_therapy',
  WORKSHOP = 'workshop',
  SUPPORT_GROUP = 'support_group',
  COUPLES_THERAPY = 'couples_therapy',
  FAMILY_THERAPY = 'family_therapy'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

@Entity('therapy_sessions')
export class TherapySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  therapistId: string;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @Column({ type: 'uuid', array: true, default: [] })
  participantIds: string[];

  @Column({ type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ type: 'timestamp with time zone' })
  endTime: Date;

  @Column({ type: 'int', nullable: true, comment: 'Duration of the session in minutes' })
  duration: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED
  })
  status: SessionStatus;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.VIDEO
  })
  type: SessionType;

  @Column({
    type: 'enum',
    enum: SessionCategory,
    default: SessionCategory.INDIVIDUAL
  })
  category: SessionCategory;

  @Column({
    type: 'enum',
    array: true,
    enum: SessionFocus,
    default: []
  })
  focus: SessionFocus[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ type: 'jsonb', nullable: true })
  notes: {
    therapistNotes?: string;
    clientNotes?: string;
    sharedNotes?: string;
    groupNotes?: string;
    individualNotes?: Record<string, string>;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    roomId?: string;
    recordingUrl?: string;
    attachments?: string[];
    tags?: string[];
    meetingLink?: string;
    waitingRoomEnabled?: boolean;
    chatEnabled?: boolean;
    recordingEnabled?: boolean;
    chatRoomId?: string; // Added chatRoomId
    chatRoomCreatedAt?: Date; // Added chatRoomCreatedAt
    cancellationReason?: string; // Added cancellationReason
    calendar?: {
      eventId?: string;
      provider?: string;
      syncStatus?: string;
      lastSyncedAt?: Date;
    };
    video?: {
      token?: string;
      routerRtpCapabilities?: any;
      sessionCreated?: boolean;
      routerId?: string;
      options?: any;
      status?: string;
    };
    breakoutRooms?: {
      id: string;
      name: string;
      participants: string[];
    }[];
    breakoutRoomDuration?: number; // Added breakoutRoomDuration
    participantRoles?: Record<string, string>; // Added participantRoles
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

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'jsonb', nullable: true })
  recurringSchedule: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
    maxOccurrences?: number;
    skipDates?: Date[];
  };

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'varchar', array: true, default: [] })
  invitedEmails: string[];

  @Column({ type: 'jsonb', nullable: true })
  pricing: {
    amount: number;
    currency: string;
    perParticipant?: boolean;
    discountCode?: string;
    earlyBirdPrice?: number;
    earlyBirdEndDate?: Date;
  };

  @Column({ type: 'uuid', nullable: true })
  paymentId: string;

  @Column({ type: 'uuid', nullable: true })
  subscriptionId: string;

  @Column({ type: 'boolean', default: false })
  paidFromSubscription: boolean;

  @Column({ type: 'boolean', default: false })
  paidFromCredit: boolean;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    minAge?: number;
    maxAge?: number;
    prerequisites?: string[];
    requiredDocuments?: string[];
    consentRequired?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // User relations replaced with IDs from auth service
  // therapistId, clientId and participantIds are already defined as columns above
}
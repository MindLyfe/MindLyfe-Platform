import { BaseEntity } from '../../common/entities/base.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
export declare enum UserRole {
    USER = "user",
    THERAPIST = "therapist",
    MODERATOR = "moderator",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    BANNED = "banned",
    INACTIVE = "inactive"
}
export declare class User extends BaseEntity {
    authId: string;
    displayName: string;
    pseudonym: string;
    role: UserRole;
    status: UserStatus;
    isVerifiedTherapist: boolean;
    bio: string;
    specialties: string[];
    certifications: string[];
    postCount: number;
    commentCount: number;
    reportCount: number;
    lastActiveAt: Date;
    privacySettings: {
        isAnonymousByDefault: boolean;
        showActivityStatus: boolean;
        showPostHistory: boolean;
        showCommentHistory: boolean;
        showReactionHistory: boolean;
        allowDirectMessages: boolean;
        allowMentions: boolean;
        allowTags: boolean;
        notifyOnMention: boolean;
        notifyOnReply: boolean;
        notifyOnReaction: boolean;
        notifyOnReport: boolean;
    };
    moderationSettings: {
        autoModerateContent: boolean;
        notifyOnReport: boolean;
        notifyOnReview: boolean;
        notifyOnAction: boolean;
    };
    therapistProfile: {
        licenseNumber: string;
        licenseState: string;
        licenseExpiry: Date;
        yearsOfExperience: number;
        education: string[];
        languages: string[];
        acceptedInsurance: string[];
        sessionTypes: string[];
        hourlyRate: number;
        availability: Record<string, any>;
    };
    posts: Post[];
    comments: Comment[];
    reactions: Reaction[];
    metadata: {
        lastLoginIp?: string;
        lastLoginDevice?: string;
        lastLoginLocation?: string;
        accountCreatedFrom?: string;
        preferences?: Record<string, any>;
        verificationRequest?: {
            status?: string;
            requestedAt?: Date;
            verifiedAt?: Date;
            verifiedBy?: string;
            additionalNotes?: string;
            notes?: string;
            reason?: string;
        };
    };
}

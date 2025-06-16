import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
export declare enum PostVisibility {
    PUBLIC = "public",
    ANONYMOUS = "anonymous",
    THERAPISTS_ONLY = "therapists_only",
    PRIVATE = "private"
}
export declare enum PostStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    REPORTED = "reported",
    UNDER_REVIEW = "under_review",
    REMOVED = "removed"
}
export declare class Post extends BaseEntity {
    authorId: string;
    author: User;
    title: string;
    content: string;
    visibility: PostVisibility;
    status: PostStatus;
    isAnonymous: boolean;
    pseudonym: string;
    tags: string[];
    category: string;
    viewCount: number;
    reportCount: number;
    lastModeratedAt: Date;
    lastModeratedBy: string;
    expiresAt: Date;
    comments: Comment[];
    reactions: Reaction[];
    moderationNotes: {
        reportedBy: string[];
        reviewNotes: string[];
        actionTaken: string;
        actionTakenBy: string;
        actionTakenAt: Date;
    };
    privacySettings: {
        allowComments: boolean;
        allowReactions: boolean;
        allowSharing: boolean;
        notifyOnComment: boolean;
        notifyOnReaction: boolean;
        notifyOnReport: boolean;
    };
}

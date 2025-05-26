import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
export declare enum CommentStatus {
    ACTIVE = "active",
    REPORTED = "reported",
    UNDER_REVIEW = "under_review",
    REMOVED = "removed"
}
export declare class Comment extends BaseEntity {
    authorId: string;
    author: User;
    postId: string;
    post: Post;
    parentId: string;
    parent: Comment;
    replies: Comment[];
    content: string;
    status: CommentStatus;
    isAnonymous: boolean;
    pseudonym: string;
    reportCount: number;
    lastModeratedAt: Date;
    lastModeratedBy: string;
    expiresAt: Date;
    reactions: Reaction[];
    moderationNotes: {
        reportedBy: string[];
        reviewNotes: string[];
        actionTaken: string;
        actionTakenBy: string;
        actionTakenAt: Date;
    };
    privacySettings: {
        allowReplies: boolean;
        allowReactions: boolean;
        notifyOnReply: boolean;
        notifyOnReaction: boolean;
        notifyOnReport: boolean;
    };
}

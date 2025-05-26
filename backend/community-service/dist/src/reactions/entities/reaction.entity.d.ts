import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
export declare enum ReactionType {
    LIKE = "like",
    SUPPORT = "support",
    HELPFUL = "helpful",
    INSIGHTFUL = "insightful",
    REPORT = "report"
}
export declare class Reaction extends BaseEntity {
    userId: string;
    user: User;
    postId: string;
    post: Post;
    commentId: string;
    comment: Comment;
    type: ReactionType;
    isAnonymous: boolean;
    pseudonym: string;
    reportReason: string;
    metadata: {
        deviceInfo?: string;
        location?: string;
        context?: string;
    };
}

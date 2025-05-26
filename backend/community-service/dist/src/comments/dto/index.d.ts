import { CommentStatus } from '../entities/comment.entity';
export declare class CreateCommentDto {
    postId: string;
    parentId?: string;
    content: string;
    isAnonymous?: boolean;
}
export declare class UpdateCommentDto {
    content?: string;
    isAnonymous?: boolean;
}
export declare class ReportCommentDto {
    reason: string;
}
export declare class ModerateCommentDto {
    status: CommentStatus;
    notes?: string;
}

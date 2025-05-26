import { ReactionType } from '../entities/reaction.entity';
export declare class AddReactionDto {
    postId?: string;
    commentId?: string;
    type: ReactionType;
    isAnonymous?: boolean;
}
export declare class RemoveReactionDto {
    postId?: string;
    commentId?: string;
    type: ReactionType;
}

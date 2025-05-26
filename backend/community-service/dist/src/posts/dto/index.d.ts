import { PostVisibility, PostStatus } from '../entities/post.entity';
export declare class CreatePostDto {
    title: string;
    content: string;
    visibility?: PostVisibility;
    isAnonymous?: boolean;
    tags?: string[];
}
export declare class UpdatePostDto {
    title?: string;
    content?: string;
    visibility?: PostVisibility;
    isAnonymous?: boolean;
    tags?: string[];
}
export declare class ReportPostDto {
    reason: string;
}
export declare class ModeratePostDto {
    status: PostStatus;
    notes?: string;
}

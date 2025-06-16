import { PostVisibility } from '../entities/post.entity';
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
export declare enum ModerationAction {
    APPROVE = "approve",
    REJECT = "reject",
    REMOVE = "remove",
    WARN = "warn",
    SUSPEND = "suspend",
    BAN = "ban",
    HIDE = "hide",
    FLAG = "flag"
}
export declare class ModeratePostDto {
    action: ModerationAction;
    notes?: string;
}

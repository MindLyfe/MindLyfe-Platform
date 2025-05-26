import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, ReportCommentDto, ModerateCommentDto } from './dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(dto: CreateCommentDto, req: any): Promise<import("./entities/comment.entity").Comment & import("./entities/comment.entity").Comment[]>;
    list(query: any, req: any): Promise<import("./entities/comment.entity").Comment[]>;
    get(id: string, req: any): Promise<import("./entities/comment.entity").Comment>;
    update(id: string, dto: UpdateCommentDto, req: any): Promise<import("./entities/comment.entity").Comment>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    report(id: string, dto: ReportCommentDto, req: any): Promise<{
        success: boolean;
    }>;
    moderate(id: string, dto: ModerateCommentDto, req: any): Promise<import("./entities/comment.entity").Comment>;
}

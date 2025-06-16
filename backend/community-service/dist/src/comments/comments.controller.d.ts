import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, ReportCommentDto, ModerateCommentDto } from './dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(dto: CreateCommentDto, req: any): Promise<any>;
    list(query: any, req: any): Promise<any>;
    get(id: string, req: any): Promise<any>;
    getThread(id: string, req: any): Promise<any>;
    update(id: string, dto: UpdateCommentDto, req: any): Promise<any>;
    delete(id: string, req: any): Promise<void>;
    report(id: string, dto: ReportCommentDto, req: any): Promise<void>;
    moderate(id: string, dto: ModerateCommentDto, req: any): Promise<any>;
}

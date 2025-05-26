import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, ReportPostDto, ModeratePostDto } from './dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(dto: CreatePostDto, req: any): Promise<void>;
    list(query: any, req: any): Promise<void>;
    get(id: string, req: any): Promise<void>;
    update(id: string, dto: UpdatePostDto, req: any): Promise<void>;
    delete(id: string, req: any): Promise<void>;
    report(id: string, dto: ReportPostDto, req: any): Promise<void>;
    moderate(id: string, dto: ModeratePostDto, req: any): Promise<void>;
}

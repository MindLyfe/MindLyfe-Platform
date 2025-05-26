import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto, ReportCommentDto, ModerateCommentDto } from './dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';
import { CommunityGateway } from '../community.gateway';
export declare class CommentsService {
    private readonly commentRepo;
    private readonly authClient;
    private readonly gateway;
    constructor(commentRepo: Repository<Comment>, authClient: AuthClientService, gateway: CommunityGateway);
    create(dto: CreateCommentDto, user: any): Promise<Comment & Comment[]>;
    list(query: any, user: any): Promise<Comment[]>;
    get(id: string, user: any): Promise<Comment>;
    update(id: string, dto: UpdateCommentDto, user: any): Promise<Comment>;
    delete(id: string, user: any): Promise<{
        success: boolean;
    }>;
    report(id: string, dto: ReportCommentDto, user: any): Promise<{
        success: boolean;
    }>;
    moderate(id: string, dto: ModerateCommentDto, user: any): Promise<Comment>;
}

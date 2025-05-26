import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto, UpdatePostDto, ReportPostDto, ModeratePostDto } from './dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';
import { CommunityGateway } from '../community.gateway';
export declare class PostsService {
    private readonly postRepo;
    private readonly authClient;
    private readonly gateway;
    constructor(postRepo: Repository<Post>, authClient: AuthClientService, gateway: CommunityGateway);
    create(dto: CreatePostDto, user: any): Promise<void>;
    list(query: any, user: any): Promise<void>;
    get(id: string, user: any): Promise<void>;
    update(id: string, dto: UpdatePostDto, user: any): Promise<void>;
    delete(id: string, user: any): Promise<void>;
    report(id: string, dto: ReportPostDto, user: any): Promise<void>;
    moderate(id: string, dto: ModeratePostDto, user: any): Promise<void>;
}

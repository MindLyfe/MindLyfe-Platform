import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto, ReportCommentDto, ModerateCommentDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { PrivacyService } from '../common/services/privacy.service';
import { ModerationService } from '../common/services/moderation.service';
import { CommunityGateway } from '../community.gateway';
export declare class CommentsService {
    private readonly commentRepo;
    private readonly postRepo;
    private readonly userRepo;
    private readonly anonymityService;
    private readonly privacyService;
    private readonly moderationService;
    private readonly gateway;
    private readonly logger;
    constructor(commentRepo: Repository<Comment>, postRepo: Repository<Post>, userRepo: Repository<User>, anonymityService: AnonymityService, privacyService: PrivacyService, moderationService: ModerationService, gateway: CommunityGateway);
    create(dto: CreateCommentDto, user: any): Promise<any>;
    list(query: any, user: any): Promise<any>;
    get(id: string, user: any): Promise<any>;
    update(id: string, dto: UpdateCommentDto, user: any): Promise<any>;
    delete(id: string, user: any): Promise<void>;
    report(id: string, dto: ReportCommentDto, user: any): Promise<void>;
    moderate(id: string, dto: ModerateCommentDto, user: any): Promise<any>;
    getThread(id: string, user: any): Promise<any>;
}

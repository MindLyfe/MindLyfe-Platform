import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto, UpdatePostDto, ReportPostDto, ModeratePostDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { PrivacyService } from '../common/services/privacy.service';
import { ModerationService } from '../common/services/moderation.service';
import { CommunityGateway } from '../community.gateway';
import { CommunityNotificationService } from '../common/services/notification.service';
export declare class PostsService {
    private readonly postRepo;
    private readonly userRepo;
    private readonly anonymityService;
    private readonly privacyService;
    private readonly moderationService;
    private readonly gateway;
    private readonly notificationService;
    private readonly logger;
    constructor(postRepo: Repository<Post>, userRepo: Repository<User>, anonymityService: AnonymityService, privacyService: PrivacyService, moderationService: ModerationService, gateway: CommunityGateway, notificationService: CommunityNotificationService);
    create(dto: CreatePostDto, user: any): Promise<any>;
    list(query: any, user: any): Promise<any>;
    get(id: string, user: any): Promise<any>;
    update(id: string, dto: UpdatePostDto, user: any): Promise<any>;
    delete(id: string, user: any): Promise<void>;
    report(postId: string, dto: ReportPostDto, user: any): Promise<void>;
    moderate(postId: string, dto: ModeratePostDto, user: any): Promise<any>;
    private canUserViewPost;
    private getFollowersForNotification;
}

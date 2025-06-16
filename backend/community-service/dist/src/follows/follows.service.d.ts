import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { CreateFollowDto, UpdateFollowDto, FollowListQueryDto, ChatEligibilityDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { UserMappingService } from '../common/services/user-mapping.service';
import { CommunityGateway } from '../community.gateway';
export declare class FollowsService {
    private readonly followRepo;
    private readonly userRepo;
    private readonly anonymityService;
    private readonly userMappingService;
    private readonly gateway;
    private readonly logger;
    constructor(followRepo: Repository<Follow>, userRepo: Repository<User>, anonymityService: AnonymityService, userMappingService: UserMappingService, gateway: CommunityGateway);
    follow(dto: CreateFollowDto, followerUser: any): Promise<any>;
    unfollow(followingAnonymousId: string, followerUser: any): Promise<void>;
    listFollows(query: FollowListQueryDto, user: any): Promise<any>;
    getFollowStats(user: any): Promise<any>;
    checkChatEligibility(dto: ChatEligibilityDto, user: any): Promise<any>;
    getChatEligibleUsers(user: any): Promise<any>;
    updateFollowSettings(followId: string, dto: UpdateFollowDto, user: any): Promise<any>;
}

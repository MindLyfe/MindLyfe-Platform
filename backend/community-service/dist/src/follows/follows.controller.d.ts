import { FollowsService } from './follows.service';
import { CreateFollowDto, UpdateFollowDto, FollowListQueryDto, ChatEligibilityDto } from './dto';
export declare class FollowsController {
    private readonly followsService;
    constructor(followsService: FollowsService);
    follow(dto: CreateFollowDto, req: any): Promise<any>;
    unfollow(userId: string, req: any): Promise<void>;
    listFollows(query: FollowListQueryDto, req: any): Promise<any>;
    getFollowStats(req: any): Promise<any>;
    checkChatEligibility(dto: ChatEligibilityDto, req: any): Promise<any>;
    getChatEligibleUsers(req: any): Promise<any>;
    updateFollowSettings(followId: string, dto: UpdateFollowDto, req: any): Promise<any>;
}

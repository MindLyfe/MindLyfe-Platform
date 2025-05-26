import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { Follow } from './entities/follow.entity';
export declare class FollowsController {
    private readonly followsService;
    constructor(followsService: FollowsService);
    createFollow(createFollowDto: CreateFollowDto, user: any): Promise<Follow>;
    removeFollow(id: string, user: any): Promise<{
        success: boolean;
    }>;
    getFollowers(user: any): Promise<Follow[]>;
    getFollowing(user: any): Promise<Follow[]>;
    blockFollow(id: string, user: any): Promise<{
        success: boolean;
    }>;
    checkFollows(followerId: string, followedId: string, checkBothDirections: boolean): Promise<{
        follows: boolean;
    }>;
}

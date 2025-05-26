import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { CreateFollowDto } from './dto/create-follow.dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';
export declare class FollowsService {
    private readonly followRepository;
    private readonly authClient;
    constructor(followRepository: Repository<Follow>, authClient: AuthClientService);
    createFollow(createFollowDto: CreateFollowDto, currentUserId: string): Promise<Follow>;
    removeFollow(followedId: string, currentUserId: string): Promise<void>;
    getFollowers(userId: string): Promise<Follow[]>;
    getFollowing(userId: string): Promise<Follow[]>;
    blockFollow(followerId: string, currentUserId: string): Promise<void>;
    checkFollows(followerId: string, followedId: string, checkBothDirections?: boolean): Promise<{
        follows: boolean;
    }>;
}

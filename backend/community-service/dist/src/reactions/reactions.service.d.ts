import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { AddReactionDto, RemoveReactionDto } from './dto';
import { AnonymityService } from '../common/services/anonymity.service';
import { CommunityGateway } from '../community.gateway';
export declare class ReactionsService {
    private readonly reactionRepo;
    private readonly postRepo;
    private readonly commentRepo;
    private readonly userRepo;
    private readonly anonymityService;
    private readonly gateway;
    private readonly logger;
    constructor(reactionRepo: Repository<Reaction>, postRepo: Repository<Post>, commentRepo: Repository<Comment>, userRepo: Repository<User>, anonymityService: AnonymityService, gateway: CommunityGateway);
    add(dto: AddReactionDto, user: any): Promise<any>;
    remove(dto: RemoveReactionDto, user: any): Promise<void>;
    list(query: any, user: any): Promise<any>;
    getStatistics(query: any): Promise<any>;
    getUserReactions(user: any, query: any): Promise<any>;
}

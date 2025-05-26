import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { AddReactionDto, RemoveReactionDto } from './dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';
import { CommunityGateway } from '../community.gateway';
export declare class ReactionsService {
    private readonly reactionRepo;
    private readonly authClient;
    private readonly gateway;
    constructor(reactionRepo: Repository<Reaction>, authClient: AuthClientService, gateway: CommunityGateway);
    add(dto: AddReactionDto, user: any): Promise<Reaction>;
    remove(dto: RemoveReactionDto, user: any): Promise<{
        success: boolean;
    }>;
    list(query: any, user: any): Promise<{
        counts: {};
        userReactions: {};
        items?: undefined;
        total?: undefined;
        page?: undefined;
        pageSize?: undefined;
        pageCount?: undefined;
    } | {
        items: Reaction[];
        total: number;
        page: number;
        pageSize: number;
        pageCount: number;
        counts?: undefined;
        userReactions?: undefined;
    }>;
}

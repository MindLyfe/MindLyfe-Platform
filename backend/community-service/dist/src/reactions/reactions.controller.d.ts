import { ReactionsService } from './reactions.service';
import { AddReactionDto, RemoveReactionDto } from './dto';
export declare class ReactionsController {
    private readonly reactionsService;
    constructor(reactionsService: ReactionsService);
    add(dto: AddReactionDto, req: any): Promise<import("./entities/reaction.entity").Reaction>;
    remove(dto: RemoveReactionDto, req: any): Promise<{
        success: boolean;
    }>;
    list(query: any, req: any): Promise<{
        counts: {};
        userReactions: {};
        items?: undefined;
        total?: undefined;
        page?: undefined;
        pageSize?: undefined;
        pageCount?: undefined;
    } | {
        items: import("./entities/reaction.entity").Reaction[];
        total: number;
        page: number;
        pageSize: number;
        pageCount: number;
        counts?: undefined;
        userReactions?: undefined;
    }>;
}

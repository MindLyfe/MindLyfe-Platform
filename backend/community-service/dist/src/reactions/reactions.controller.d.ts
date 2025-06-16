import { ReactionsService } from './reactions.service';
import { AddReactionDto, RemoveReactionDto } from './dto';
export declare class ReactionsController {
    private readonly reactionsService;
    constructor(reactionsService: ReactionsService);
    add(dto: AddReactionDto, req: any): Promise<any>;
    remove(dto: RemoveReactionDto, req: any): Promise<void>;
    list(query: any, req: any): Promise<any>;
    getStatistics(query: any): Promise<any>;
    getUserReactions(req: any, query: any): Promise<any>;
}

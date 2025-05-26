import { CommunityGateway } from '../community.gateway';
import { ReportContentDto, ReviewContentDto } from './dto';
export declare class ModerationService {
    private readonly gateway;
    constructor(gateway: CommunityGateway);
    report(dto: ReportContentDto, user: any): Promise<{
        success: boolean;
    }>;
    review(id: string, dto: ReviewContentDto, user: any): Promise<{
        success: boolean;
    }>;
}

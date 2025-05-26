import { ModerationService } from './moderation.service';
import { ReportContentDto, ReviewContentDto } from './dto';
export declare class ModerationController {
    private readonly moderationService;
    constructor(moderationService: ModerationService);
    report(dto: ReportContentDto, req: any): Promise<{
        success: boolean;
    }>;
    review(id: string, dto: ReviewContentDto, req: any): Promise<{
        success: boolean;
    }>;
}

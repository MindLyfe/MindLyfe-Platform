import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommunityGateway } from '../community.gateway';
import { ReportContentDto, ReviewContentDto, ModerationAction, ModerationContentType } from './dto';

@Injectable()
export class ModerationService {
  constructor(private readonly gateway: CommunityGateway) {}

  async report(dto: ReportContentDto, user: any) {
    // Optionally: store report in a moderation table
    this.gateway.emitEvent('contentReported', {
      contentId: dto.contentId,
      contentType: dto.contentType,
      reason: dto.reason,
      reporterId: user.id,
    });
    return { success: true };
  }

  async review(id: string, dto: ReviewContentDto, user: any) {
    if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
      throw new ForbiddenException('Only moderators or admins can review content');
    }
    // Optionally: update moderation status in a moderation table
    this.gateway.emitEvent('contentReviewed', {
      contentId: id,
      action: dto.action,
      notes: dto.notes,
      reviewerId: user.id,
    });
    return { success: true };
  }
} 
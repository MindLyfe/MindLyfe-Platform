import { Controller, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ModerationService } from './moderation.service';
import { ReportContentDto, ReviewContentDto } from './dto';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Moderation')
@ApiBearerAuth()
@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('report')
  @ApiOperation({ summary: 'Report a post or comment' })
  async report(@Body() dto: ReportContentDto, @Request() req) {
    return this.moderationService.report(dto, req.user);
  }

  @Patch('review/:id')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Review and take action on reported content' })
  async review(@Param('id') id: string, @Body() dto: ReviewContentDto, @Request() req) {
    return this.moderationService.review(id, dto, req.user);
  }
} 
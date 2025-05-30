import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, ReportCommentDto, ModerateCommentDto } from './dto';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a comment (anonymous by default)' })
  async create(@Body() dto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List comments with anonymization' })
  async list(@Query() query, @Request() req) {
    return this.commentsService.list(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID (anonymized)' })
  async get(@Param('id') id: string, @Request() req) {
    return this.commentsService.get(id, req.user);
  }

  @Get(':id/thread')
  @ApiOperation({ summary: 'Get comment thread (all replies)' })
  async getThread(@Param('id') id: string, @Request() req) {
    return this.commentsService.getThread(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment (author/moderator only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCommentDto, @Request() req) {
    return this.commentsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment (author/moderator only)' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.commentsService.delete(id, req.user);
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Report a comment for moderation' })
  async report(@Param('id') id: string, @Body() dto: ReportCommentDto, @Request() req) {
    return this.commentsService.report(id, dto, req.user);
  }

  @Patch(':id/moderate')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Moderate a comment (moderators only)' })
  async moderate(@Param('id') id: string, @Body() dto: ModerateCommentDto, @Request() req) {
    return this.commentsService.moderate(id, dto, req.user);
  }
} 
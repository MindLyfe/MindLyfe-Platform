import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, ReportPostDto, ModeratePostDto } from './dto';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a post (anonymous or not)' })
  async create(@Body() dto: CreatePostDto, @Request() req) {
    return this.postsService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List posts (with privacy/role filtering)' })
  async list(@Query() query, @Request() req) {
    return this.postsService.list(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  async get(@Param('id') id: string, @Request() req) {
    return this.postsService.get(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Request() req) {
    return this.postsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.postsService.delete(id, req.user);
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Report a post' })
  async report(@Param('id') id: string, @Body() dto: ReportPostDto, @Request() req) {
    return this.postsService.report(id, dto, req.user);
  }

  @Patch(':id/moderate')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Moderate a post (approve/remove/warn)' })
  async moderate(@Param('id') id: string, @Body() dto: ModeratePostDto, @Request() req) {
    return this.postsService.moderate(id, dto, req.user);
  }
} 
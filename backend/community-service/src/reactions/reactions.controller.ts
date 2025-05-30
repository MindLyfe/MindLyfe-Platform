import { Controller, Post, Delete, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReactionsService } from './reactions.service';
import { AddReactionDto, RemoveReactionDto } from './dto';

@ApiTags('Reactions')
@ApiBearerAuth()
@Controller('reactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a reaction (anonymous by default)' })
  async add(@Body() dto: AddReactionDto, @Request() req) {
    return this.reactionsService.add(dto, req.user);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a reaction' })
  async remove(@Body() dto: RemoveReactionDto, @Request() req) {
    return this.reactionsService.remove(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List reactions with anonymization' })
  async list(@Query() query, @Request() req) {
    return this.reactionsService.list(query, req.user);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get reaction statistics for content' })
  async getStatistics(@Query() query) {
    return this.reactionsService.getStatistics(query);
  }

  @Get('my-reactions')
  @ApiOperation({ summary: 'Get current user\'s reactions' })
  async getUserReactions(@Request() req, @Query() query) {
    return this.reactionsService.getUserReactions(req.user, query);
  }
} 
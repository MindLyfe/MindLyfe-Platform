import { Controller, Post, Get, Delete, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FollowsService } from './follows.service';
import { CreateFollowDto, UpdateFollowDto, FollowListQueryDto, ChatEligibilityDto } from './dto';

@ApiTags('Follows')
@ApiBearerAuth()
@Controller('follows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Follow a user (anonymous community context)',
    description: 'Follow another user. When both users follow each other, mutual follow is established and chat access is granted.'
  })
  @ApiResponse({ status: 201, description: 'Successfully followed user' })
  @ApiResponse({ status: 400, description: 'Bad request (already following, self-follow, etc.)' })
  async follow(@Body() dto: CreateFollowDto, @Request() req) {
    return this.followsService.follow(dto, req.user);
  }

  @Delete(':userId')
  @ApiOperation({ 
    summary: 'Unfollow a user',
    description: 'Remove follow relationship. If this was a mutual follow, chat access will be revoked.'
  })
  @ApiResponse({ status: 200, description: 'Successfully unfollowed user' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  async unfollow(@Param('userId') userId: string, @Request() req) {
    return this.followsService.unfollow(userId, req.user);
  }

  @Get()
  @ApiOperation({ 
    summary: 'List follow relationships',
    description: 'Get list of followers, following, or mutual follows with anonymized user information.'
  })
  @ApiResponse({ status: 200, description: 'List of follow relationships' })
  async listFollows(@Query() query: FollowListQueryDto, @Request() req) {
    return this.followsService.listFollows(query, req.user);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get follow statistics',
    description: 'Get counts of followers, following, mutual follows, and chat-eligible users.'
  })
  @ApiResponse({ status: 200, description: 'Follow statistics' })
  async getFollowStats(@Request() req) {
    return this.followsService.getFollowStats(req.user);
  }

  @Post('check-chat-eligibility')
  @ApiOperation({ 
    summary: 'Check if you can chat with a specific user',
    description: 'Verify if mutual follow relationship exists and chat access is granted.'
  })
  @ApiResponse({ status: 200, description: 'Chat eligibility status' })
  async checkChatEligibility(@Body() dto: ChatEligibilityDto, @Request() req) {
    return this.followsService.checkChatEligibility(dto, req.user);
  }

  @Get('chat-partners')
  @ApiOperation({ 
    summary: 'Get all chat-eligible users',
    description: 'List all users you have mutual follows with and can chat with. This provides the bridge to chat service.'
  })
  @ApiResponse({ status: 200, description: 'List of chat partners' })
  async getChatEligibleUsers(@Request() req) {
    return this.followsService.getChatEligibleUsers(req.user);
  }

  @Patch(':followId/settings')
  @ApiOperation({ 
    summary: 'Update follow privacy settings',
    description: 'Update privacy settings for a follow relationship (notifications, chat permissions, etc.).'
  })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  async updateFollowSettings(
    @Param('followId') followId: string,
    @Body() dto: UpdateFollowDto,
    @Request() req
  ) {
    return this.followsService.updateFollowSettings(followId, dto, req.user);
  }
} 
import { Controller, Post, Get, Delete, Body, Param, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { Follow } from './entities/follow.entity';

@ApiTags('follows')
@Controller('follows')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User successfully followed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles('user', 'therapist', 'admin')
  async createFollow(
    @Body() createFollowDto: CreateFollowDto,
    @CurrentUser() user: any,
  ): Promise<Follow> {
    return this.followsService.createFollow(createFollowDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'User successfully unfollowed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  @Roles('user', 'therapist', 'admin')
  async removeFollow(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    await this.followsService.removeFollow(id, user.id);
    return { success: true };
  }

  @Get('followers')
  @ApiOperation({ summary: 'Get users following the current user' })
  @ApiResponse({ status: 200, description: 'List of followers returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles('user', 'therapist', 'admin')
  async getFollowers(@CurrentUser() user: any): Promise<Follow[]> {
    return this.followsService.getFollowers(user.id);
  }

  @Get('following')
  @ApiOperation({ summary: 'Get users that the current user follows' })
  @ApiResponse({ status: 200, description: 'List of followed users returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles('user', 'therapist', 'admin')
  async getFollowing(@CurrentUser() user: any): Promise<Follow[]> {
    return this.followsService.getFollowing(user.id);
  }

  @Post('block/:id')
  @ApiOperation({ summary: 'Block a user from following' })
  @ApiResponse({ status: 200, description: 'User successfully blocked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles('user', 'therapist', 'admin')
  async blockFollow(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    await this.followsService.blockFollow(id, user.id);
    return { success: true };
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a follow relationship exists' })
  @ApiResponse({ status: 200, description: 'Follow check result returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({ name: 'followerId', required: true, description: 'ID of the potential follower' })
  @ApiQuery({ name: 'followedId', required: true, description: 'ID of the potentially followed user' })
  @ApiQuery({ name: 'checkBothDirections', required: false, type: Boolean, description: 'Whether to check both directions' })
  @Roles('user', 'therapist', 'admin')
  async checkFollows(
    @Query('followerId') followerId: string,
    @Query('followedId') followedId: string,
    @Query('checkBothDirections') checkBothDirections: boolean,
  ): Promise<{ follows: boolean }> {
    return this.followsService.checkFollows(
      followerId,
      followedId,
      checkBothDirections === true,
    );
  }
} 
import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GamificationService } from '../services/gamification.service';

@ApiTags('gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // Points Management
  @Get('points')
  @ApiOperation({ summary: 'Get user points', description: 'Get current user points and history' })
  @ApiResponse({ status: 200, description: 'User points retrieved successfully' })
  async getUserPoints(@Req() req: any) {
    return this.gamificationService.getUserPoints(req.user.userId);
  }

  @Post('points/award')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Award points', description: 'Admin only - Award points to user' })
  @ApiResponse({ status: 201, description: 'Points awarded successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async awardPoints(@Body() awardPointsDto: any) {
    return this.gamificationService.awardPoints(awardPointsDto);
  }

  @Get('points/leaderboard')
  @ApiOperation({ summary: 'Get points leaderboard', description: 'Get points leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of top users to return' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (week, month, all)' })
  async getPointsLeaderboard(
    @Query('limit') limit?: number,
    @Query('period') period?: string,
  ) {
    return this.gamificationService.getPointsLeaderboard({
      limit: limit ? Number(limit) : undefined,
      period,
    });
  }

  // Badges Management
  @Get('badges')
  @ApiOperation({ summary: 'Get user badges', description: 'Get current user badges' })
  @ApiResponse({ status: 200, description: 'User badges retrieved successfully' })
  async getUserBadges(@Req() req: any) {
    return this.gamificationService.getUserBadges(req.user.userId);
  }

  @Get('badges/available')
  @ApiOperation({ summary: 'Get available badges', description: 'Get all available badges in the system' })
  @ApiResponse({ status: 200, description: 'Available badges retrieved successfully' })
  async getAvailableBadges() {
    return this.gamificationService.getAvailableBadges();
  }

  @Post('badges/award')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Award badge', description: 'Admin only - Award badge to user' })
  @ApiResponse({ status: 201, description: 'Badge awarded successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async awardBadge(@Body() awardBadgeDto: any) {
    return this.gamificationService.awardBadge(awardBadgeDto);
  }

  @Post('badges')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create badge', description: 'Admin only - Create new badge' })
  @ApiResponse({ status: 201, description: 'Badge created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createBadge(@Body() createBadgeDto: any) {
    return this.gamificationService.createBadge(createBadgeDto);
  }

  @Patch('badges/:badgeId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'badgeId', description: 'Badge ID' })
  @ApiOperation({ summary: 'Update badge', description: 'Admin only - Update badge details' })
  @ApiResponse({ status: 200, description: 'Badge updated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async updateBadge(@Param('badgeId') badgeId: string, @Body() updateBadgeDto: any) {
    return this.gamificationService.updateBadge(badgeId, updateBadgeDto);
  }

  // Achievements Management
  @Get('achievements')
  @ApiOperation({ summary: 'Get user achievements', description: 'Get current user achievements' })
  @ApiResponse({ status: 200, description: 'User achievements retrieved successfully' })
  async getUserAchievements(@Req() req: any) {
    return this.gamificationService.getUserAchievements(req.user.userId);
  }

  @Get('achievements/available')
  @ApiOperation({ summary: 'Get available achievements', description: 'Get all available achievements in the system' })
  @ApiResponse({ status: 200, description: 'Available achievements retrieved successfully' })
  async getAvailableAchievements() {
    return this.gamificationService.getAvailableAchievements();
  }

  @Post('achievements')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create achievement', description: 'Admin only - Create new achievement' })
  @ApiResponse({ status: 201, description: 'Achievement created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createAchievement(@Body() createAchievementDto: any) {
    return this.gamificationService.createAchievement(createAchievementDto);
  }

  // Streaks Management
  @Get('streaks')
  @ApiOperation({ summary: 'Get user streaks', description: 'Get current user activity streaks' })
  @ApiResponse({ status: 200, description: 'User streaks retrieved successfully' })
  async getUserStreaks(@Req() req: any) {
    return this.gamificationService.getUserStreaks(req.user.userId);
  }

  @Post('streaks/update')
  @ApiOperation({ summary: 'Update streak', description: 'Update user activity streak' })
  @ApiResponse({ status: 200, description: 'Streak updated successfully' })
  async updateStreak(@Body() updateStreakDto: any, @Req() req: any) {
    return this.gamificationService.updateStreak(req.user.userId, updateStreakDto);
  }

  // Levels Management
  @Get('levels')
  @ApiOperation({ summary: 'Get user level', description: 'Get current user level and progress' })
  @ApiResponse({ status: 200, description: 'User level retrieved successfully' })
  async getUserLevel(@Req() req: any) {
    return this.gamificationService.getUserLevel(req.user.userId);
  }

  @Get('levels/system')
  @ApiOperation({ summary: 'Get level system', description: 'Get level system configuration' })
  @ApiResponse({ status: 200, description: 'Level system retrieved successfully' })
  async getLevelSystem() {
    return this.gamificationService.getLevelSystem();
  }

  // Challenges Management
  @Get('challenges')
  @ApiOperation({ summary: 'Get user challenges', description: 'Get challenges for current user' })
  @ApiResponse({ status: 200, description: 'User challenges retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by challenge status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by challenge type' })
  async getUserChallenges(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.gamificationService.getUserChallenges(req.user.userId, {
      status,
      type,
    });
  }

  @Post('challenges/:challengeId/join')
  @ApiParam({ name: 'challengeId', description: 'Challenge ID' })
  @ApiOperation({ summary: 'Join challenge', description: 'Join a challenge' })
  @ApiResponse({ status: 200, description: 'Successfully joined challenge' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async joinChallenge(@Param('challengeId') challengeId: string, @Req() req: any) {
    return this.gamificationService.joinChallenge(challengeId, req.user.userId);
  }

  @Post('challenges/:challengeId/complete')
  @ApiParam({ name: 'challengeId', description: 'Challenge ID' })
  @ApiOperation({ summary: 'Complete challenge', description: 'Mark challenge as completed' })
  @ApiResponse({ status: 200, description: 'Challenge completed successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async completeChallenge(@Param('challengeId') challengeId: string, @Body() completionDto: any, @Req() req: any) {
    return this.gamificationService.completeChallenge(challengeId, req.user.userId, completionDto);
  }

  @Post('challenges')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create challenge', description: 'Admin only - Create new challenge' })
  @ApiResponse({ status: 201, description: 'Challenge created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createChallenge(@Body() createChallengeDto: any) {
    return this.gamificationService.createChallenge(createChallengeDto);
  }

  // Rewards Management
  @Get('rewards')
  @ApiOperation({ summary: 'Get user rewards', description: 'Get rewards earned by current user' })
  @ApiResponse({ status: 200, description: 'User rewards retrieved successfully' })
  async getUserRewards(@Req() req: any) {
    return this.gamificationService.getUserRewards(req.user.userId);
  }

  @Post('rewards/:rewardId/claim')
  @ApiParam({ name: 'rewardId', description: 'Reward ID' })
  @ApiOperation({ summary: 'Claim reward', description: 'Claim an earned reward' })
  @ApiResponse({ status: 200, description: 'Reward claimed successfully' })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async claimReward(@Param('rewardId') rewardId: string, @Req() req: any) {
    return this.gamificationService.claimReward(rewardId, req.user.userId);
  }

  // Statistics
  @Get('stats')
  @ApiOperation({ summary: 'Get gamification statistics', description: 'Get gamification statistics for current user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getGamificationStats(@Req() req: any) {
    return this.gamificationService.getGamificationStats(req.user.userId);
  }

  @Get('stats/global')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get global gamification statistics', description: 'Admin only - Get global gamification statistics' })
  @ApiResponse({ status: 200, description: 'Global statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getGlobalGamificationStats() {
    return this.gamificationService.getGlobalGamificationStats();
  }
} 
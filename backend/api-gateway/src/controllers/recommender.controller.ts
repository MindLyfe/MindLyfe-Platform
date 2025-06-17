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
import { RecommenderService } from '../services/recommender.service';

@ApiTags('recommender')
@Controller('recommender')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RecommenderController {
  constructor(private readonly recommenderService: RecommenderService) {}

  // ==================== RECOMMENDATIONS ENDPOINTS ====================

  @Post('recommendations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get personalized recommendations', description: 'Get personalized recommendations based on user profile and preferences' })
  @ApiResponse({ status: 201, description: 'Recommendations generated successfully' })
  async getRecommendations(@Body() requestDto: any, @Req() req: any) {
    return this.recommenderService.getRecommendations(req.user.userId, requestDto);
  }

  @Post('recommendations/analyze')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Analyze content and recommend', description: 'Analyze user-provided text and generate relevant recommendations' })
  @ApiResponse({ status: 201, description: 'Content analyzed and recommendations generated' })
  async analyzeAndRecommend(@Body() analysisDto: any, @Req() req: any) {
    return this.recommenderService.analyzeAndRecommend(req.user.userId, analysisDto);
  }

  @Get('recommendations/:id')
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  @ApiOperation({ summary: 'Get specific recommendation', description: 'Get details of a specific recommendation' })
  @ApiResponse({ status: 200, description: 'Recommendation details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Recommendation not found' })
  async getRecommendation(@Param('id') id: string, @Req() req: any) {
    return this.recommenderService.getRecommendation(id, req.user.userId);
  }

  @Post('recommendations/create')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create custom recommendation', description: 'Admin only - Create a custom recommendation' })
  @ApiResponse({ status: 201, description: 'Custom recommendation created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createRecommendation(@Body() createDto: any, @Req() req: any) {
    return this.recommenderService.createRecommendation(createDto, req.user.userId);
  }

  @Get('recommendations/history')
  @ApiOperation({ summary: 'Get recommendation history', description: 'Get user recommendation history' })
  @ApiResponse({ status: 200, description: 'Recommendation history retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  async getRecommendationHistory(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ) {
    return this.recommenderService.getRecommendationHistory(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category,
    });
  }

  @Post('recommendations/feedback')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Provide recommendation feedback', description: 'Submit feedback on recommendations' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  async provideFeedback(@Body() feedbackDto: any, @Req() req: any) {
    return this.recommenderService.provideFeedback(req.user.userId, feedbackDto);
  }

  // ==================== CATEGORIES ENDPOINTS ====================

  @Get('categories')
  @ApiOperation({ summary: 'Get recommendation categories', description: 'Get available recommendation categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    return this.recommenderService.getCategories();
  }

  @Get('categories/:category')
  @ApiParam({ name: 'category', description: 'Category name' })
  @ApiOperation({ summary: 'Get category details', description: 'Get details and items for a specific category' })
  @ApiResponse({ status: 200, description: 'Category details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryDetails(@Param('category') category: string) {
    return this.recommenderService.getCategoryDetails(category);
  }

  @Get('categories/:category/recommendations')
  @ApiParam({ name: 'category', description: 'Category name' })
  @ApiOperation({ summary: 'Get recommendations by category', description: 'Get personalized recommendations for a specific category' })
  @ApiResponse({ status: 200, description: 'Category recommendations retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recommendations' })
  @ApiQuery({ name: 'difficulty', required: false, description: 'Difficulty level filter' })
  @ApiQuery({ name: 'timeCommitment', required: false, description: 'Time commitment filter' })
  async getCategoryRecommendations(
    @Param('category') category: string,
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('difficulty') difficulty?: string,
    @Query('timeCommitment') timeCommitment?: string,
  ) {
    return this.recommenderService.getCategoryRecommendations(req.user.userId, category, {
      limit: limit ? Number(limit) : undefined,
      difficulty,
      timeCommitment,
    });
  }

  // ==================== ACTIVITIES ENDPOINTS ====================

  @Get('activities')
  @ApiOperation({ summary: 'Get available activities', description: 'Get all available activities with filtering options' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'difficulty', required: false, description: 'Filter by difficulty level' })
  @ApiQuery({ name: 'timeCommitment', required: false, description: 'Filter by time commitment' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getActivities(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('timeCommitment') timeCommitment?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.recommenderService.getActivities({
      category,
      difficulty,
      timeCommitment,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('activities/:id')
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiOperation({ summary: 'Get activity details', description: 'Get detailed information about a specific activity' })
  @ApiResponse({ status: 200, description: 'Activity details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async getActivity(@Param('id') id: string, @Req() req: any) {
    return this.recommenderService.getActivity(id, req.user.userId);
  }

  @Post('activities/:id/track')
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track activity engagement', description: 'Track user engagement with an activity' })
  @ApiResponse({ status: 201, description: 'Activity engagement tracked successfully' })
  async trackActivityEngagement(@Param('id') id: string, @Body() trackingDto: any, @Req() req: any) {
    return this.recommenderService.trackActivityEngagement(id, req.user.userId, trackingDto);
  }

  // ==================== SCHEDULE ENDPOINTS ====================

  @Get('schedule')
  @ApiOperation({ summary: 'Get recommendation schedule', description: 'Get user recommendation schedule' })
  @ApiResponse({ status: 200, description: 'Recommendation schedule retrieved successfully' })
  @ApiQuery({ name: 'date', required: false, description: 'Specific date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Timeframe (today, week, month)' })
  async getRecommendationSchedule(
    @Req() req: any,
    @Query('date') date?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.recommenderService.getRecommendationSchedule(req.user.userId, { date, timeframe });
  }

  @Post('schedule')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule recommendations', description: 'Schedule recommendations for specific times' })
  @ApiResponse({ status: 201, description: 'Recommendations scheduled successfully' })
  async scheduleRecommendations(@Body() scheduleDto: any, @Req() req: any) {
    return this.recommenderService.scheduleRecommendations(req.user.userId, scheduleDto);
  }

  @Patch('schedule/:id')
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiOperation({ summary: 'Update scheduled recommendation', description: 'Update a scheduled recommendation' })
  @ApiResponse({ status: 200, description: 'Scheduled recommendation updated successfully' })
  @ApiResponse({ status: 404, description: 'Scheduled recommendation not found' })
  async updateScheduledRecommendation(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.recommenderService.updateScheduledRecommendation(id, req.user.userId, updateDto);
  }

  @Delete('schedule/:id')
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete scheduled recommendation', description: 'Delete a scheduled recommendation' })
  @ApiResponse({ status: 204, description: 'Scheduled recommendation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Scheduled recommendation not found' })
  async deleteScheduledRecommendation(@Param('id') id: string, @Req() req: any) {
    return this.recommenderService.deleteScheduledRecommendation(id, req.user.userId);
  }

  // ==================== WELLNESS PLANS ENDPOINTS ====================

  @Get('plans')
  @ApiOperation({ summary: 'Get wellness plans', description: 'Get user wellness plans' })
  @ApiResponse({ status: 200, description: 'Wellness plans retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by plan status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by plan type' })
  async getWellnessPlans(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.recommenderService.getWellnessPlans(req.user.userId, { status, type });
  }

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create wellness plan', description: 'Create a new wellness plan' })
  @ApiResponse({ status: 201, description: 'Wellness plan created successfully' })
  async createWellnessPlan(@Body() planDto: any, @Req() req: any) {
    return this.recommenderService.createWellnessPlan(req.user.userId, planDto);
  }

  @Get('plans/:id')
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiOperation({ summary: 'Get wellness plan details', description: 'Get detailed information about a wellness plan' })
  @ApiResponse({ status: 200, description: 'Wellness plan details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wellness plan not found' })
  async getWellnessPlan(@Param('id') id: string, @Req() req: any) {
    return this.recommenderService.getWellnessPlan(id, req.user.userId);
  }

  @Patch('plans/:id')
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiOperation({ summary: 'Update wellness plan', description: 'Update a wellness plan' })
  @ApiResponse({ status: 200, description: 'Wellness plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Wellness plan not found' })
  async updateWellnessPlan(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.recommenderService.updateWellnessPlan(id, req.user.userId, updateDto);
  }

  @Delete('plans/:id')
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete wellness plan', description: 'Delete a wellness plan' })
  @ApiResponse({ status: 204, description: 'Wellness plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Wellness plan not found' })
  async deleteWellnessPlan(@Param('id') id: string, @Req() req: any) {
    return this.recommenderService.deleteWellnessPlan(id, req.user.userId);
  }

  @Post('plans/:id/activate')
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Activate wellness plan', description: 'Activate a wellness plan' })
  @ApiResponse({ status: 201, description: 'Wellness plan activated successfully' })
  @ApiResponse({ status: 404, description: 'Wellness plan not found' })
  async activateWellnessPlan(@Param('id') id: string, @Req() req: any) {
    return this.recommenderService.activateWellnessPlan(id, req.user.userId);
  }

  // ==================== PREFERENCES ENDPOINTS ====================

  @Get('preferences')
  @ApiOperation({ summary: 'Get recommendation preferences', description: 'Get user recommendation preferences' })
  @ApiResponse({ status: 200, description: 'Recommendation preferences retrieved successfully' })
  async getRecommendationPreferences(@Req() req: any) {
    return this.recommenderService.getRecommendationPreferences(req.user.userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update recommendation preferences', description: 'Update user recommendation preferences' })
  @ApiResponse({ status: 200, description: 'Recommendation preferences updated successfully' })
  async updateRecommendationPreferences(@Body() preferencesDto: any, @Req() req: any) {
    return this.recommenderService.updateRecommendationPreferences(req.user.userId, preferencesDto);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/analytics')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get recommendation analytics', description: 'Admin only - Get recommendation service analytics' })
  @ApiResponse({ status: 200, description: 'Recommendation analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  async getRecommendationAnalytics(@Query('timeframe') timeframe?: string) {
    return this.recommenderService.getRecommendationAnalytics({ timeframe });
  }

  @Get('admin/categories/manage')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Manage recommendation categories', description: 'Admin only - Get category management data' })
  @ApiResponse({ status: 200, description: 'Category management data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async manageCategoriesAdmin() {
    return this.recommenderService.manageCategoriesAdmin();
  }

  @Post('admin/activities/bulk-import')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk import activities', description: 'Admin only - Bulk import activities' })
  @ApiResponse({ status: 201, description: 'Activities imported successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async bulkImportActivities(@Body() importDto: any) {
    return this.recommenderService.bulkImportActivities(importDto);
  }

  // ==================== HEALTH CHECK ENDPOINTS ====================

  @Get('health')
  @ApiOperation({ summary: 'Recommender service health check', description: 'Check recommender service health and availability' })
  @ApiResponse({ status: 200, description: 'Recommender service is healthy' })
  async getHealth() {
    return this.recommenderService.getHealth();
  }
} 
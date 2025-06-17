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
import { AiService } from '../services/ai.service';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ==================== PERSONALIZATION ENDPOINTS ====================

  @Get('personalization/profile')
  @ApiOperation({ summary: 'Get AI personalization profile', description: 'Get user AI personalization profile and preferences' })
  @ApiResponse({ status: 200, description: 'Personalization profile retrieved successfully' })
  async getPersonalizationProfile(@Req() req: any) {
    return this.aiService.getPersonalizationProfile(req.user.userId);
  }

  @Post('personalization/profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create personalization profile', description: 'Create or update AI personalization profile' })
  @ApiResponse({ status: 201, description: 'Personalization profile created successfully' })
  async createPersonalizationProfile(@Body() profileDto: any, @Req() req: any) {
    return this.aiService.createPersonalizationProfile(req.user.userId, profileDto);
  }

  @Patch('personalization/profile')
  @ApiOperation({ summary: 'Update personalization profile', description: 'Update AI personalization profile settings' })
  @ApiResponse({ status: 200, description: 'Personalization profile updated successfully' })
  async updatePersonalizationProfile(@Body() updateDto: any, @Req() req: any) {
    return this.aiService.updatePersonalizationProfile(req.user.userId, updateDto);
  }

  @Post('personalization/feedback')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Provide AI feedback', description: 'Provide feedback on AI recommendations or interactions' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  async provideFeedback(@Body() feedbackDto: any, @Req() req: any) {
    return this.aiService.provideFeedback(req.user.userId, feedbackDto);
  }

  // ==================== LYFBOT ENDPOINTS ====================

  @Post('lyfbot/conversation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start LyfBot conversation', description: 'Start a new conversation with LyfBot' })
  @ApiResponse({ status: 201, description: 'Conversation started successfully' })
  async startConversation(@Body() conversationDto: any, @Req() req: any) {
    return this.aiService.startLyfBotConversation(req.user.userId, conversationDto);
  }

  @Get('lyfbot/conversations')
  @ApiOperation({ summary: 'Get LyfBot conversations', description: 'Get user conversation history with LyfBot' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getConversations(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getLyfBotConversations(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('lyfbot/conversations/:conversationId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiOperation({ summary: 'Get conversation details', description: 'Get specific conversation details with messages' })
  @ApiResponse({ status: 200, description: 'Conversation details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.aiService.getLyfBotConversation(conversationId, req.user.userId);
  }

  @Post('lyfbot/conversations/:conversationId/messages')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message to LyfBot', description: 'Send a message to LyfBot in a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async sendMessage(@Param('conversationId') conversationId: string, @Body() messageDto: any, @Req() req: any) {
    return this.aiService.sendLyfBotMessage(conversationId, req.user.userId, messageDto);
  }

  @Delete('lyfbot/conversations/:conversationId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete conversation', description: 'Delete a LyfBot conversation' })
  @ApiResponse({ status: 204, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.aiService.deleteLyfBotConversation(conversationId, req.user.userId);
  }

  // ==================== RECOMMENDATIONS ENDPOINTS ====================

  @Get('recommendations/content')
  @ApiOperation({ summary: 'Get AI content recommendations', description: 'Get personalized content recommendations' })
  @ApiResponse({ status: 200, description: 'Content recommendations retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, description: 'Content type filter' })
  @ApiQuery({ name: 'category', required: false, description: 'Category filter' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recommendations' })
  async getContentRecommendations(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getContentRecommendations(req.user.userId, {
      type,
      category,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('recommendations/activities')
  @ApiOperation({ summary: 'Get AI activity recommendations', description: 'Get personalized activity recommendations' })
  @ApiResponse({ status: 200, description: 'Activity recommendations retrieved successfully' })
  @ApiQuery({ name: 'mood', required: false, description: 'Current mood filter' })
  @ApiQuery({ name: 'timeOfDay', required: false, description: 'Time of day filter' })
  @ApiQuery({ name: 'duration', required: false, description: 'Activity duration filter' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recommendations' })
  async getActivityRecommendations(
    @Req() req: any,
    @Query('mood') mood?: string,
    @Query('timeOfDay') timeOfDay?: string,
    @Query('duration') duration?: string,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getActivityRecommendations(req.user.userId, {
      mood,
      timeOfDay,
      duration,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('recommendations/therapists')
  @ApiOperation({ summary: 'Get AI therapist recommendations', description: 'Get AI-powered therapist recommendations' })
  @ApiResponse({ status: 200, description: 'Therapist recommendations retrieved successfully' })
  @ApiQuery({ name: 'specialization', required: false, description: 'Therapist specialization filter' })
  @ApiQuery({ name: 'location', required: false, description: 'Location preference' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recommendations' })
  async getTherapistRecommendations(
    @Req() req: any,
    @Query('specialization') specialization?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getTherapistRecommendations(req.user.userId, {
      specialization,
      location,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('recommendations/feedback')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Provide recommendation feedback', description: 'Provide feedback on AI recommendations' })
  @ApiResponse({ status: 201, description: 'Recommendation feedback submitted successfully' })
  async provideRecommendationFeedback(@Body() feedbackDto: any, @Req() req: any) {
    return this.aiService.provideRecommendationFeedback(req.user.userId, feedbackDto);
  }

  // ==================== JOURNAL AI ENDPOINTS ====================

  @Post('journal/analyze')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Analyze journal entry', description: 'Get AI analysis of journal entry' })
  @ApiResponse({ status: 201, description: 'Journal analysis completed successfully' })
  async analyzeJournalEntry(@Body() analysisDto: any, @Req() req: any) {
    return this.aiService.analyzeJournalEntry(req.user.userId, analysisDto);
  }

  @Get('journal/insights')
  @ApiOperation({ summary: 'Get journal insights', description: 'Get AI-powered insights from journal entries' })
  @ApiResponse({ status: 200, description: 'Journal insights retrieved successfully' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Time range for insights (week, month, year)' })
  @ApiQuery({ name: 'type', required: false, description: 'Insight type filter' })
  async getJournalInsights(
    @Req() req: any,
    @Query('timeframe') timeframe?: string,
    @Query('type') type?: string,
  ) {
    return this.aiService.getJournalInsights(req.user.userId, { timeframe, type });
  }

  @Get('journal/mood-patterns')
  @ApiOperation({ summary: 'Get mood patterns analysis', description: 'Get AI analysis of mood patterns from journal entries' })
  @ApiResponse({ status: 200, description: 'Mood patterns analysis retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (last7days, last30days, last3months)' })
  async getMoodPatterns(
    @Req() req: any,
    @Query('period') period?: string,
  ) {
    return this.aiService.getMoodPatterns(req.user.userId, { period });
  }

  @Post('journal/suggestions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get journal entry suggestions', description: 'Get AI suggestions for journal prompts' })
  @ApiResponse({ status: 201, description: 'Journal suggestions generated successfully' })
  async getJournalSuggestions(@Body() requestDto: any, @Req() req: any) {
    return this.aiService.getJournalSuggestions(req.user.userId, requestDto);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/analytics')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get AI analytics', description: 'Admin only - Get AI service analytics and usage statistics' })
  @ApiResponse({ status: 200, description: 'AI analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  async getAiAnalytics(@Query('timeframe') timeframe?: string) {
    return this.aiService.getAiAnalytics({ timeframe });
  }

  @Get('admin/model-status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get AI model status', description: 'Admin only - Get status of AI models and services' })
  @ApiResponse({ status: 200, description: 'AI model status retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getModelStatus() {
    return this.aiService.getModelStatus();
  }

  @Post('admin/retrain-models')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger model retraining', description: 'Admin only - Trigger retraining of AI models' })
  @ApiResponse({ status: 202, description: 'Model retraining initiated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async triggerModelRetraining(@Body() retrainDto: any) {
    return this.aiService.triggerModelRetraining(retrainDto);
  }

  @Get('admin/user-interactions/:userId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOperation({ summary: 'Get user AI interactions', description: 'Admin only - Get user AI interaction history' })
  @ApiResponse({ status: 200, description: 'User AI interactions retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserAiInteractions(@Param('userId') userId: string) {
    return this.aiService.getUserAiInteractions(userId);
  }

  // ==================== HEALTH CHECK ENDPOINTS ====================

  @Get('health')
  @ApiOperation({ summary: 'AI service health check', description: 'Check AI service health and model availability' })
  @ApiResponse({ status: 200, description: 'AI service is healthy' })
  async getHealth() {
    return this.aiService.getHealth();
  }

  @Get('health/models')
  @ApiOperation({ summary: 'AI models health check', description: 'Check individual AI model health status' })
  @ApiResponse({ status: 200, description: 'AI models status retrieved successfully' })
  async getModelsHealth() {
    return this.aiService.getModelsHealth();
  }
} 
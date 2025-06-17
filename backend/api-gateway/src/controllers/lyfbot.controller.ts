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
import { LyfbotService } from '../services/lyfbot.service';

@ApiTags('lyfbot')
@Controller('lyfbot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LyfbotController {
  constructor(private readonly lyfbotService: LyfbotService) {}

  // ==================== CONVERSATION ENDPOINTS ====================

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start new conversation', description: 'Start a new conversation with LyfBot' })
  @ApiResponse({ status: 201, description: 'Conversation started successfully' })
  async startConversation(@Body() conversationDto: any, @Req() req: any) {
    return this.lyfbotService.startConversation(req.user.userId, conversationDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations', description: 'Get list of user conversations with LyfBot' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Conversation status filter' })
  async getUserConversations(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.lyfbotService.getUserConversations(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Get('conversations/:conversationId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiOperation({ summary: 'Get conversation details', description: 'Get details and messages of a specific conversation' })
  @ApiResponse({ status: 200, description: 'Conversation details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.lyfbotService.getConversation(conversationId, req.user.userId);
  }

  @Delete('conversations/:conversationId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete conversation', description: 'Delete a conversation and all its messages' })
  @ApiResponse({ status: 204, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.lyfbotService.deleteConversation(conversationId, req.user.userId);
  }

  @Post('conversations/:conversationId/archive')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Archive conversation', description: 'Archive a conversation' })
  @ApiResponse({ status: 201, description: 'Conversation archived successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async archiveConversation(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.lyfbotService.archiveConversation(conversationId, req.user.userId);
  }

  @Post('conversations/:conversationId/unarchive')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Unarchive conversation', description: 'Unarchive a conversation' })
  @ApiResponse({ status: 201, description: 'Conversation unarchived successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async unarchiveConversation(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.lyfbotService.unarchiveConversation(conversationId, req.user.userId);
  }

  // ==================== MESSAGING ENDPOINTS ====================

  @Post('conversations/:conversationId/messages')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message to LyfBot', description: 'Send a message to LyfBot and get response' })
  @ApiResponse({ status: 201, description: 'Message sent and response received successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() messageDto: any,
    @Req() req: any,
  ) {
    return this.lyfbotService.sendMessage(conversationId, req.user.userId, messageDto);
  }

  @Get('conversations/:conversationId/messages')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiOperation({ summary: 'Get conversation messages', description: 'Get messages from a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'before', required: false, description: 'Get messages before this timestamp' })
  @ApiQuery({ name: 'after', required: false, description: 'Get messages after this timestamp' })
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
    @Query('after') after?: string,
  ) {
    return this.lyfbotService.getConversationMessages(conversationId, req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      before,
      after,
    });
  }

  @Patch('conversations/:conversationId/messages/:messageId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiOperation({ summary: 'Update message', description: 'Update a message (edit user message)' })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  @ApiResponse({ status: 404, description: 'Conversation or message not found' })
  async updateMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Body() updateDto: any,
    @Req() req: any,
  ) {
    return this.lyfbotService.updateMessage(conversationId, messageId, req.user.userId, updateDto);
  }

  @Delete('conversations/:conversationId/messages/:messageId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete message', description: 'Delete a message from conversation' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation or message not found' })
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Req() req: any,
  ) {
    return this.lyfbotService.deleteMessage(conversationId, messageId, req.user.userId);
  }

  // ==================== FEEDBACK AND RATING ENDPOINTS ====================

  @Post('conversations/:conversationId/feedback')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Provide conversation feedback', description: 'Provide feedback on LyfBot conversation' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async provideConversationFeedback(
    @Param('conversationId') conversationId: string,
    @Body() feedbackDto: any,
    @Req() req: any,
  ) {
    return this.lyfbotService.provideConversationFeedback(conversationId, req.user.userId, feedbackDto);
  }

  @Post('conversations/:conversationId/messages/:messageId/feedback')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Provide message feedback', description: 'Provide feedback on specific LyfBot message' })
  @ApiResponse({ status: 201, description: 'Message feedback submitted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation or message not found' })
  async provideMessageFeedback(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Body() feedbackDto: any,
    @Req() req: any,
  ) {
    return this.lyfbotService.provideMessageFeedback(conversationId, messageId, req.user.userId, feedbackDto);
  }

  @Post('conversations/:conversationId/messages/:messageId/rate')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Rate LyfBot message', description: 'Rate the quality of a LyfBot message' })
  @ApiResponse({ status: 201, description: 'Message rated successfully' })
  @ApiResponse({ status: 404, description: 'Conversation or message not found' })
  async rateMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Body() ratingDto: any,
    @Req() req: any,
  ) {
    return this.lyfbotService.rateMessage(conversationId, messageId, req.user.userId, ratingDto);
  }

  // ==================== QUICK CHAT ENDPOINTS ====================

  @Post('quick-chat')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Quick chat with LyfBot', description: 'Send a quick message without starting a full conversation' })
  @ApiResponse({ status: 201, description: 'Quick chat response received successfully' })
  async quickChat(@Body() messageDto: any, @Req() req: any) {
    return this.lyfbotService.quickChat(req.user.userId, messageDto);
  }

  @Post('emergency-chat')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Emergency chat with LyfBot', description: 'Emergency/crisis chat with LyfBot for immediate support' })
  @ApiResponse({ status: 201, description: 'Emergency chat response received successfully' })
  async emergencyChat(@Body() messageDto: any, @Req() req: any) {
    return this.lyfbotService.emergencyChat(req.user.userId, messageDto);
  }

  // ==================== CONVERSATION SETTINGS ENDPOINTS ====================

  @Get('conversations/:conversationId/settings')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiOperation({ summary: 'Get conversation settings', description: 'Get settings for a specific conversation' })
  @ApiResponse({ status: 200, description: 'Conversation settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversationSettings(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.lyfbotService.getConversationSettings(conversationId, req.user.userId);
  }

  @Patch('conversations/:conversationId/settings')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiOperation({ summary: 'Update conversation settings', description: 'Update settings for a specific conversation' })
  @ApiResponse({ status: 200, description: 'Conversation settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async updateConversationSettings(
    @Param('conversationId') conversationId: string,
    @Body() settingsDto: any,
    @Req() req: any,
  ) {
    return this.lyfbotService.updateConversationSettings(conversationId, req.user.userId, settingsDto);
  }

  // ==================== LYFBOT PREFERENCES ENDPOINTS ====================

  @Get('preferences')
  @ApiOperation({ summary: 'Get LyfBot preferences', description: 'Get user preferences for LyfBot interactions' })
  @ApiResponse({ status: 200, description: 'LyfBot preferences retrieved successfully' })
  async getLyfBotPreferences(@Req() req: any) {
    return this.lyfbotService.getLyfBotPreferences(req.user.userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update LyfBot preferences', description: 'Update user preferences for LyfBot interactions' })
  @ApiResponse({ status: 200, description: 'LyfBot preferences updated successfully' })
  async updateLyfBotPreferences(@Body() preferencesDto: any, @Req() req: any) {
    return this.lyfbotService.updateLyfBotPreferences(req.user.userId, preferencesDto);
  }

  // ==================== CONVERSATION EXPORT ENDPOINTS ====================

  @Post('conversations/:conversationId/export')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Export conversation', description: 'Export conversation in various formats' })
  @ApiResponse({ status: 201, description: 'Conversation export started successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async exportConversation(
    @Param('conversationId') conversationId: string,
    @Body() exportDto: any,
    @Req() req: any,
  ) {
    return this.lyfbotService.exportConversation(conversationId, req.user.userId, exportDto);
  }

  @Get('conversations/:conversationId/export/:exportId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiParam({ name: 'exportId', description: 'Export request ID' })
  @ApiOperation({ summary: 'Download exported conversation', description: 'Download exported conversation file' })
  @ApiResponse({ status: 200, description: 'Conversation export downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Conversation or export not found' })
  async downloadConversationExport(
    @Param('conversationId') conversationId: string,
    @Param('exportId') exportId: string,
    @Req() req: any,
  ) {
    return this.lyfbotService.downloadConversationExport(conversationId, exportId, req.user.userId);
  }

  // ==================== CONVERSATION INSIGHTS ENDPOINTS ====================

  @Get('conversations/:conversationId/insights')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiOperation({ summary: 'Get conversation insights', description: 'Get AI-generated insights about the conversation' })
  @ApiResponse({ status: 200, description: 'Conversation insights retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversationInsights(@Param('conversationId') conversationId: string, @Req() req: any) {
    return this.lyfbotService.getConversationInsights(conversationId, req.user.userId);
  }

  @Get('insights/summary')
  @ApiOperation({ summary: 'Get conversation summary insights', description: 'Get summary insights across all conversations' })
  @ApiResponse({ status: 200, description: 'Summary insights retrieved successfully' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Timeframe for insights (week, month, year)' })
  async getConversationSummaryInsights(
    @Req() req: any,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.lyfbotService.getConversationSummaryInsights(req.user.userId, { timeframe });
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/conversations')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all conversations', description: 'Admin only - Get list of all LyfBot conversations' })
  @ApiResponse({ status: 200, description: 'All conversations retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Conversation status filter' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  async getAllConversations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.lyfbotService.getAllConversations({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      userId,
    });
  }

  @Get('admin/analytics')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get LyfBot analytics', description: 'Admin only - Get LyfBot usage and performance analytics' })
  @ApiResponse({ status: 200, description: 'LyfBot analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  async getLyfBotAnalytics(@Query('timeframe') timeframe?: string) {
    return this.lyfbotService.getLyfBotAnalytics({ timeframe });
  }

  @Get('admin/feedback')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all feedback', description: 'Admin only - Get all LyfBot feedback and ratings' })
  @ApiResponse({ status: 200, description: 'All feedback retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating' })
  async getAllFeedback(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('rating') rating?: string,
  ) {
    return this.lyfbotService.getAllFeedback({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      rating,
    });
  }

  @Post('admin/model/retrain')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger model retraining', description: 'Admin only - Trigger LyfBot model retraining' })
  @ApiResponse({ status: 201, description: 'Model retraining triggered successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async triggerModelRetraining(@Body() retrainDto: any) {
    return this.lyfbotService.triggerModelRetraining(retrainDto);
  }

  // ==================== HEALTH CHECK ENDPOINTS ====================

  @Get('health')
  @ApiOperation({ summary: 'LyfBot service health check', description: 'Check LyfBot service health and availability' })
  @ApiResponse({ status: 200, description: 'LyfBot service is healthy' })
  async getHealth() {
    return this.lyfbotService.getHealth();
  }

  @Get('health/model')
  @ApiOperation({ summary: 'LyfBot model health check', description: 'Check LyfBot AI model health and performance' })
  @ApiResponse({ status: 200, description: 'LyfBot model is healthy' })
  async getModelHealth() {
    return this.lyfbotService.getModelHealth();
  }
} 
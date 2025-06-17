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
import { JournalService } from '../services/journal.service';

@ApiTags('journal')
@Controller('journal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  // Journal Entries Management
  @Post('entries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create journal entry', description: 'Create a new journal entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  async createEntry(@Body() createEntryDto: any, @Req() req: any) {
    return this.journalService.createEntry(createEntryDto, req.user.userId);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get journal entries', description: 'Get journal entries for current user' })
  @ApiResponse({ status: 200, description: 'Journal entries retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'mood', required: false, description: 'Filter by mood' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  async getEntries(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('mood') mood?: string,
    @Query('tags') tags?: string,
  ) {
    return this.journalService.getEntries(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      startDate,
      endDate,
      mood,
      tags: tags ? tags.split(',') : undefined,
    });
  }

  @Get('entries/:entryId')
  @ApiParam({ name: 'entryId', description: 'Journal entry ID' })
  @ApiOperation({ summary: 'Get journal entry', description: 'Get specific journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async getEntry(@Param('entryId') entryId: string, @Req() req: any) {
    return this.journalService.getEntry(entryId, req.user.userId);
  }

  @Patch('entries/:entryId')
  @ApiParam({ name: 'entryId', description: 'Journal entry ID' })
  @ApiOperation({ summary: 'Update journal entry', description: 'Update specific journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry updated successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async updateEntry(@Param('entryId') entryId: string, @Body() updateEntryDto: any, @Req() req: any) {
    return this.journalService.updateEntry(entryId, updateEntryDto, req.user.userId);
  }

  @Delete('entries/:entryId')
  @ApiParam({ name: 'entryId', description: 'Journal entry ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete journal entry', description: 'Delete specific journal entry' })
  @ApiResponse({ status: 204, description: 'Journal entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async deleteEntry(@Param('entryId') entryId: string, @Req() req: any) {
    return this.journalService.deleteEntry(entryId, req.user.userId);
  }

  // Mood Tracking
  @Post('mood')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log mood', description: 'Log mood for current date' })
  @ApiResponse({ status: 201, description: 'Mood logged successfully' })
  async logMood(@Body() moodDto: any, @Req() req: any) {
    return this.journalService.logMood(moodDto, req.user.userId);
  }

  @Get('mood')
  @ApiOperation({ summary: 'Get mood history', description: 'Get mood tracking history' })
  @ApiResponse({ status: 200, description: 'Mood history retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'period', required: false, description: 'Period type (day, week, month)' })
  async getMoodHistory(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: string,
  ) {
    return this.journalService.getMoodHistory(req.user.userId, {
      startDate,
      endDate,
      period,
    });
  }

  @Get('mood/analytics')
  @ApiOperation({ summary: 'Get mood analytics', description: 'Get mood analytics and patterns' })
  @ApiResponse({ status: 200, description: 'Mood analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (week, month, year)' })
  async getMoodAnalytics(
    @Req() req: any,
    @Query('period') period?: string,
  ) {
    return this.journalService.getMoodAnalytics(req.user.userId, { period });
  }

  // Tags Management
  @Get('tags')
  @ApiOperation({ summary: 'Get user tags', description: 'Get all tags used by current user' })
  @ApiResponse({ status: 200, description: 'User tags retrieved successfully' })
  async getUserTags(@Req() req: any) {
    return this.journalService.getUserTags(req.user.userId);
  }

  @Post('tags')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tag', description: 'Create a new custom tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  async createTag(@Body() tagDto: any, @Req() req: any) {
    return this.journalService.createTag(tagDto, req.user.userId);
  }

  @Delete('tags/:tagId')
  @ApiParam({ name: 'tagId', description: 'Tag ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tag', description: 'Delete custom tag' })
  @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async deleteTag(@Param('tagId') tagId: string, @Req() req: any) {
    return this.journalService.deleteTag(tagId, req.user.userId);
  }

  // Templates Management
  @Get('templates')
  @ApiOperation({ summary: 'Get journal templates', description: 'Get available journal templates' })
  @ApiResponse({ status: 200, description: 'Journal templates retrieved successfully' })
  async getTemplates(@Req() req: any) {
    return this.journalService.getTemplates(req.user.userId);
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create journal template', description: 'Create a custom journal template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Body() templateDto: any, @Req() req: any) {
    return this.journalService.createTemplate(templateDto, req.user.userId);
  }

  @Get('templates/:templateId')
  @ApiParam({ name: 'templateId', description: 'Template ID' })
  @ApiOperation({ summary: 'Get journal template', description: 'Get specific journal template' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(@Param('templateId') templateId: string, @Req() req: any) {
    return this.journalService.getTemplate(templateId, req.user.userId);
  }

  @Patch('templates/:templateId')
  @ApiParam({ name: 'templateId', description: 'Template ID' })
  @ApiOperation({ summary: 'Update journal template', description: 'Update custom journal template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(@Param('templateId') templateId: string, @Body() updateTemplateDto: any, @Req() req: any) {
    return this.journalService.updateTemplate(templateId, updateTemplateDto, req.user.userId);
  }

  @Delete('templates/:templateId')
  @ApiParam({ name: 'templateId', description: 'Template ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete journal template', description: 'Delete custom journal template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(@Param('templateId') templateId: string, @Req() req: any) {
    return this.journalService.deleteTemplate(templateId, req.user.userId);
  }

  // Goals Management
  @Get('goals')
  @ApiOperation({ summary: 'Get journal goals', description: 'Get user journal goals' })
  @ApiResponse({ status: 200, description: 'Journal goals retrieved successfully' })
  async getGoals(@Req() req: any) {
    return this.journalService.getGoals(req.user.userId);
  }

  @Post('goals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create journal goal', description: 'Create a new journal goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async createGoal(@Body() goalDto: any, @Req() req: any) {
    return this.journalService.createGoal(goalDto, req.user.userId);
  }

  @Patch('goals/:goalId')
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiOperation({ summary: 'Update journal goal', description: 'Update journal goal progress' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async updateGoal(@Param('goalId') goalId: string, @Body() updateGoalDto: any, @Req() req: any) {
    return this.journalService.updateGoal(goalId, updateGoalDto, req.user.userId);
  }

  // Insights and Analytics
  @Get('insights')
  @ApiOperation({ summary: 'Get journal insights', description: 'Get AI-powered journal insights' })
  @ApiResponse({ status: 200, description: 'Journal insights retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (week, month, year)' })
  async getInsights(
    @Req() req: any,
    @Query('period') period?: string,
  ) {
    return this.journalService.getInsights(req.user.userId, { period });
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get journal analytics summary', description: 'Get summary of journal activity' })
  @ApiResponse({ status: 200, description: 'Analytics summary retrieved successfully' })
  async getAnalyticsSummary(@Req() req: any) {
    return this.journalService.getAnalyticsSummary(req.user.userId);
  }

  // Export/Import
  @Get('export')
  @ApiOperation({ summary: 'Export journal data', description: 'Export journal data in specified format' })
  @ApiResponse({ status: 200, description: 'Journal data exported successfully' })
  @ApiQuery({ name: 'format', required: false, description: 'Export format (json, pdf, csv)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for export' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for export' })
  async exportJournal(
    @Req() req: any,
    @Query('format') format?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.journalService.exportJournal(req.user.userId, {
      format: format || 'json',
      startDate,
      endDate,
    });
  }

  // Admin endpoints
  @Get('admin/statistics')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get journal statistics', description: 'Admin only - Get global journal statistics' })
  @ApiResponse({ status: 200, description: 'Journal statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getJournalStatistics() {
    return this.journalService.getJournalStatistics();
  }
} 
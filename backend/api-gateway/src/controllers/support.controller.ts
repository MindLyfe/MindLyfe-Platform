import { 
  Controller, 
  Get, 
  Post, 
  Put, 
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
import { SupportService } from '../services/support.service';

@ApiTags('support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Support Team Management
  @Post('team/register')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Register a new support team member', description: 'Admin only - Register new support team member' })
  @ApiResponse({ status: 201, description: 'Support team member registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async registerSupportTeamMember(@Body() registerDto: any, @Req() req: any) {
    return this.supportService.registerSupportTeamMember(registerDto, req.user);
  }

  @Get('team')
  @ApiOperation({ summary: 'Get all support team members', description: 'Get list of all support team members' })
  @ApiResponse({ status: 200, description: 'Support team members retrieved successfully' })
  async getSupportTeamMembers() {
    return this.supportService.getSupportTeamMembers();
  }

  @Get('team/:id')
  @ApiParam({ name: 'id', description: 'Support team member ID' })
  @ApiOperation({ summary: 'Get support team member by ID', description: 'Get specific support team member details' })
  @ApiResponse({ status: 200, description: 'Support team member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Support team member not found' })
  async getSupportTeamMemberById(@Param('id') id: string) {
    return this.supportService.getSupportTeamMemberById(id);
  }

  @Put('team/:id/status')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'id', description: 'Support team member ID' })
  @ApiOperation({ summary: 'Update support team member status', description: 'Admin only - Activate/deactivate support team member' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Support team member not found' })
  async updateSupportTeamMemberStatus(@Param('id') id: string, @Body() body: { isActive: boolean }, @Req() req: any) {
    return this.supportService.updateSupportTeamMemberStatus(id, body.isActive, req.user);
  }

  // Shift Management
  @Post('shifts')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new shift', description: 'Admin only - Create new support shift' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid shift data' })
  async createShift(@Body() createShiftDto: any, @Req() req: any) {
    return this.supportService.createShift(createShiftDto, req.user);
  }

  @Get('shifts')
  @ApiOperation({ summary: 'Get shifts with optional filtering', description: 'Get all shifts with optional date/user filtering' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter shifts from this date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter shifts until this date' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter shifts for specific user' })
  @ApiResponse({ status: 200, description: 'Shifts retrieved successfully' })
  async getShifts(@Query() queryDto: any) {
    return this.supportService.getShifts(queryDto);
  }

  @Get('shifts/my')
  @ApiOperation({ summary: 'Get current user\'s shifts', description: 'Get shifts assigned to the current user' })
  @ApiResponse({ status: 200, description: 'User shifts retrieved successfully' })
  async getMyShifts(@Req() req: any, @Query() queryDto: any) {
    return this.supportService.getUserShifts(req.user.userId, queryDto);
  }

  @Get('shifts/:id')
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiOperation({ summary: 'Get shift by ID', description: 'Get specific shift details' })
  @ApiResponse({ status: 200, description: 'Shift retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async getShiftById(@Param('id') id: string) {
    return this.supportService.getShiftById(id);
  }

  @Put('shifts/:id')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiOperation({ summary: 'Update shift', description: 'Admin only - Update shift details' })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async updateShift(@Param('id') id: string, @Body() updateShiftDto: any, @Req() req: any) {
    return this.supportService.updateShift(id, updateShiftDto, req.user);
  }

  @Delete('shifts/:id')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiOperation({ summary: 'Delete shift', description: 'Admin only - Delete shift' })
  @ApiResponse({ status: 200, description: 'Shift deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async deleteShift(@Param('id') id: string, @Req() req: any) {
    return this.supportService.deleteShift(id, req.user);
  }

  @Post('shifts/:id/start')
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiOperation({ summary: 'Start a shift (check-in)', description: 'Start/check-in to assigned shift' })
  @ApiResponse({ status: 200, description: 'Shift started successfully' })
  @ApiResponse({ status: 400, description: 'Cannot start shift' })
  async startShift(@Param('id') id: string, @Req() req: any) {
    return this.supportService.startShift(id, req.user);
  }

  @Post('shifts/:id/end')
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiOperation({ summary: 'End a shift (check-out)', description: 'End/check-out from current shift' })
  @ApiResponse({ status: 200, description: 'Shift ended successfully' })
  @ApiResponse({ status: 400, description: 'Cannot end shift' })
  async endShift(@Param('id') id: string, @Req() req: any) {
    return this.supportService.endShift(id, req.user);
  }

  // Support Requests (Tickets)
  @Post('requests')
  @ApiOperation({ summary: 'Create a support request', description: 'Create new support ticket/request' })
  @ApiResponse({ status: 201, description: 'Support request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createSupportRequest(@Body() createRequestDto: any, @Req() req: any) {
    return this.supportService.createSupportRequest(createRequestDto, req.user);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get support requests', description: 'Get all support requests (filtered by role)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Support requests retrieved successfully' })
  async getSupportRequests(@Query() queryDto: any) {
    return this.supportService.getSupportRequests(queryDto);
  }

  @Get('requests/my')
  @ApiOperation({ summary: 'Get my support requests', description: 'Get support requests created by current user' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'User support requests retrieved successfully' })
  async getMySupportRequests(@Req() req: any, @Query() queryDto: any) {
    return this.supportService.getMySupportRequests(req.user.userId, queryDto);
  }

  @Get('requests/assigned')
  @ApiOperation({ summary: 'Get assigned support requests', description: 'Get support requests assigned to current user' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Assigned support requests retrieved successfully' })
  async getAssignedSupportRequests(@Req() req: any, @Query() queryDto: any) {
    return this.supportService.getAssignedSupportRequests(req.user.userId, queryDto);
  }

  @Get('requests/:id')
  @ApiParam({ name: 'id', description: 'Support request ID' })
  @ApiOperation({ summary: 'Get support request by ID', description: 'Get specific support request details' })
  @ApiResponse({ status: 200, description: 'Support request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async getSupportRequestById(@Param('id') id: string, @Req() req: any) {
    return this.supportService.getSupportRequestById(id, req.user);
  }

  @Put('requests/:id')
  @ApiParam({ name: 'id', description: 'Support request ID' })
  @ApiOperation({ summary: 'Update support request', description: 'Update support request details' })
  @ApiResponse({ status: 200, description: 'Support request updated successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async updateSupportRequest(@Param('id') id: string, @Body() updateRequestDto: any, @Req() req: any) {
    return this.supportService.updateSupportRequest(id, updateRequestDto, req.user);
  }

  @Post('requests/:id/assign')
  @ApiParam({ name: 'id', description: 'Support request ID' })
  @ApiOperation({ summary: 'Assign support request', description: 'Assign support request to support team member' })
  @ApiResponse({ status: 200, description: 'Support request assigned successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async assignSupportRequest(@Param('id') id: string, @Body() assignDto: any, @Req() req: any) {
    return this.supportService.assignSupportRequest(id, assignDto, req.user);
  }

  @Post('requests/:id/take')
  @ApiParam({ name: 'id', description: 'Support request ID' })
  @ApiOperation({ summary: 'Take support request', description: 'Take/claim support request for current user' })
  @ApiResponse({ status: 200, description: 'Support request taken successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async takeSupportRequest(@Param('id') id: string, @Req() req: any) {
    return this.supportService.takeSupportRequest(id, req.user);
  }

  @Post('requests/:id/escalate')
  @ApiParam({ name: 'id', description: 'Support request ID' })
  @ApiOperation({ summary: 'Escalate support request', description: 'Escalate support request to higher priority/level' })
  @ApiResponse({ status: 200, description: 'Support request escalated successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async escalateSupportRequest(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: any) {
    return this.supportService.escalateSupportRequest(id, body.reason, req.user);
  }

  // Dashboards
  @Get('dashboard')
  @ApiOperation({ summary: 'Get support dashboard', description: 'Get support metrics and overview' })
  @ApiResponse({ status: 200, description: 'Support dashboard retrieved successfully' })
  async getSupportDashboard(@Req() req: any) {
    return this.supportService.getSupportDashboard(req.user);
  }

  @Get('dashboard/personal')
  @ApiOperation({ summary: 'Get personal support dashboard', description: 'Get personal support metrics for current user' })
  @ApiResponse({ status: 200, description: 'Personal dashboard retrieved successfully' })
  async getPersonalDashboard(@Req() req: any) {
    return this.supportService.getPersonalDashboard(req.user);
  }

  // Settings and Preferences
  @Put('notifications/preferences')
  @ApiOperation({ summary: 'Update notification preferences', description: 'Update support notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  async updateNotificationPreferences(@Body() preferencesDto: any, @Req() req: any) {
    return this.supportService.updateNotificationPreferences(preferencesDto, req.user);
  }

  @Get('routing/status')
  @ApiOperation({ summary: 'Get routing status', description: 'Get auto-routing system status' })
  @ApiResponse({ status: 200, description: 'Routing status retrieved successfully' })
  async getRoutingStatus() {
    return this.supportService.getRoutingStatus();
  }

  @Post('routing/toggle')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Toggle auto-routing', description: 'Admin only - Enable/disable auto-routing system' })
  @ApiResponse({ status: 200, description: 'Auto-routing toggled successfully' })
  async toggleAutoRouting(@Body() body: { enabled: boolean }, @Req() req: any) {
    return this.supportService.toggleAutoRouting(body.enabled, req.user);
  }

  // Shift Templates
  @Post('shift-templates')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create shift template', description: 'Admin only - Create reusable shift template' })
  @ApiResponse({ status: 201, description: 'Shift template created successfully' })
  async createShiftTemplate(@Body() templateData: any, @Req() req: any) {
    return this.supportService.createShiftTemplate(templateData, req.user);
  }

  @Post('shift-templates/generate')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Generate shifts from template', description: 'Admin only - Generate multiple shifts from template' })
  @ApiResponse({ status: 200, description: 'Shifts generated successfully' })
  async generateShiftsFromTemplate(@Body() generateData: any, @Req() req: any) {
    return this.supportService.generateShiftsFromTemplate(generateData, req.user);
  }
} 
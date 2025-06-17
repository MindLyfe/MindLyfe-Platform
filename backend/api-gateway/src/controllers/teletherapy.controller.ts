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
import { TeletherapyService } from '../services/teletherapy.service';

@ApiTags('teletherapy')
@Controller('teletherapy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TeletherapyController {
  constructor(private readonly teletherapyService: TeletherapyService) {}

  @Get('health')
  @ApiOperation({ summary: 'Teletherapy service health check', description: 'Get teletherapy service status and features' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return this.teletherapyService.healthCheck();
  }

  // Session Management
  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new therapy session', description: 'Create new therapy session (therapist/admin only)' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session data or scheduling conflict' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createSession(@Body() createSessionDto: any, @Req() req: any) {
    return this.teletherapyService.createSession(createSessionDto, req.user);
  }

  @Get('sessions/upcoming')
  @ApiOperation({ summary: 'Get upcoming therapy sessions', description: 'Get upcoming sessions for authenticated user' })
  @ApiResponse({ status: 200, description: 'Upcoming sessions retrieved successfully' })
  async getUpcomingSessions(@Req() req: any) {
    return this.teletherapyService.getUpcomingSessions(req.user);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get therapy sessions by date range', description: 'Get sessions within specified date range' })
  @ApiQuery({ name: 'startDate', required: true, type: 'string', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: 'string', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getSessionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    return this.teletherapyService.getSessionsByDateRange(startDate, endDate, req.user);
  }

  @Get('sessions/group')
  @ApiOperation({ summary: 'Get available group sessions', description: 'Get available group therapy sessions' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'focus', required: false, description: 'Filter by focus areas' })
  @ApiResponse({ status: 200, description: 'Group sessions retrieved successfully' })
  async getGroupSessions(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('focus') focus?: string[],
  ) {
    return this.teletherapyService.getGroupSessions(req.user, category, focus);
  }

  @Get('sessions/individual')
  @ApiOperation({ summary: 'Get available individual sessions', description: 'Get available individual therapy sessions' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Individual sessions retrieved successfully' })
  async getIndividualSessions(
    @Req() req: any,
    @Query('category') category?: string,
  ) {
    return this.teletherapyService.getIndividualSessions(req.user, category);
  }

  @Get('sessions/:id')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Get therapy session by ID', description: 'Get specific therapy session details' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getSession(@Param('id') id: string, @Req() req: any) {
    return this.teletherapyService.getSessionById(id, req.user);
  }

  @Patch('sessions/:id/status')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Update session status', description: 'Update therapy session status (start/end/cancel)' })
  @ApiResponse({ status: 200, description: 'Session status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateSessionStatus(@Param('id') id: string, @Body() updateStatusDto: any, @Req() req: any) {
    return this.teletherapyService.updateSessionStatus(id, updateStatusDto, req.user);
  }

  @Patch('sessions/:id/notes')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Update session notes', description: 'Update therapy session notes' })
  @ApiResponse({ status: 200, description: 'Session notes updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateSessionNotes(@Param('id') id: string, @Body() updateNotesDto: any, @Req() req: any) {
    return this.teletherapyService.updateSessionNotes(id, updateNotesDto, req.user);
  }

  @Post('sessions/:id/cancel')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Cancel therapy session', description: 'Cancel a scheduled therapy session' })
  @ApiResponse({ status: 200, description: 'Session cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel session that has already started' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async cancelSession(@Param('id') id: string, @Body() cancelSessionDto: any, @Req() req: any) {
    return this.teletherapyService.cancelSession(id, cancelSessionDto, req.user);
  }

  @Post('sessions/:id/join')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Join therapy session', description: 'Join a therapy session (video/audio call)' })
  @ApiResponse({ status: 200, description: 'Successfully joined session' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to join session' })
  async joinSession(@Param('id') id: string, @Req() req: any) {
    return this.teletherapyService.joinSession(id, req.user);
  }

  @Post('sessions/:id/leave')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Leave therapy session', description: 'Leave a therapy session' })
  @ApiResponse({ status: 200, description: 'Successfully left session' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async leaveSession(@Param('id') id: string, @Req() req: any) {
    return this.teletherapyService.leaveSession(id, req.user);
  }

  // Participant Management
  @Post('sessions/:id/participants')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Add participants to session', description: 'Add participants to therapy session (therapist/admin only)' })
  @ApiResponse({ status: 200, description: 'Participants added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid participant data or session limit reached' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async addParticipants(@Param('id') id: string, @Body() addParticipantsDto: any, @Req() req: any) {
    return this.teletherapyService.addParticipants(id, addParticipantsDto, req.user);
  }

  @Delete('sessions/:id/participants')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Remove participants from session', description: 'Remove participants from therapy session (therapist/admin only)' })
  @ApiResponse({ status: 200, description: 'Participants removed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async removeParticipants(@Param('id') id: string, @Body() removeParticipantsDto: any, @Req() req: any) {
    return this.teletherapyService.removeParticipants(id, removeParticipantsDto, req.user);
  }

  @Patch('sessions/:id/participants/role')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Update participant role', description: 'Update participant role in session (therapist/admin only)' })
  @ApiResponse({ status: 200, description: 'Participant role updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Session or participant not found' })
  async updateParticipantRole(@Param('id') id: string, @Body() updateRoleDto: any, @Req() req: any) {
    return this.teletherapyService.updateParticipantRole(id, updateRoleDto, req.user);
  }

  @Post('sessions/:id/breakout-rooms')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Manage breakout rooms', description: 'Create/manage breakout rooms in session (therapist/admin only)' })
  @ApiResponse({ status: 200, description: 'Breakout rooms managed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async manageBreakoutRooms(@Param('id') id: string, @Body() breakoutRoomsDto: any, @Req() req: any) {
    return this.teletherapyService.manageBreakoutRooms(id, breakoutRoomsDto, req.user);
  }

  // Chat Integration
  @Post('sessions/:id/chat-room')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({ summary: 'Create chat room for session', description: 'Create associated chat room for therapy session' })
  @ApiResponse({ status: 200, description: 'Chat room created successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createChatRoomForSession(@Param('id') id: string, @Req() req: any) {
    return this.teletherapyService.createChatRoomForSession(id, req.user);
  }

  // Relationship Validation
  @Get('relationship/check')
  @ApiOperation({ summary: 'Check therapist-client relationship', description: 'Verify if therapist and client have an established relationship' })
  @ApiQuery({ name: 'therapistId', required: true, description: 'Therapist user ID' })
  @ApiQuery({ name: 'clientId', required: true, description: 'Client user ID' })
  @ApiResponse({ status: 200, description: 'Relationship status checked successfully' })
  async checkTherapistClientRelationship(
    @Query('therapistId') therapistId: string,
    @Query('clientId') clientId: string,
    @Req() req: any,
  ) {
    return this.teletherapyService.checkTherapistClientRelationship(therapistId, clientId, req.user);
  }
} 
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  ParseUUIDPipe,
  ParseIntPipe,
  Delete,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TeletherapyService } from './teletherapy.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { TherapySession, SessionStatus } from './entities/therapy-session.entity';
import { UpdateSessionNotesDto } from './dto/update-session-notes.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { CancelSessionDto } from './dto/cancel-session.dto';
import { AddParticipantsDto, RemoveParticipantsDto, UpdateParticipantRoleDto, ManageBreakoutRoomsDto } from './dto/manage-participants.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/user.interface';

@ApiTags('teletherapy')
@Controller('teletherapy')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeletherapyController {
  constructor(private readonly teletherapyService: TeletherapyService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'teletherapy-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      mediasoup: 'initialized'
    };
  }

  @Post('sessions')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Create a new therapy session' })
  @ApiResponse({
    status: 201,
    description: 'The session has been successfully created.',
    type: TherapySession,
  })
  @ApiResponse({ status: 400, description: 'Invalid session data or scheduling conflict.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.createSession(createSessionDto, req.user);
  }

  @Get('sessions/:id')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Get a specific therapy session by ID' })
  @ApiResponse({
    status: 200,
    description: 'The session has been successfully retrieved.',
    type: TherapySession,
  })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  async getSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.getSessionById(id, req.user);
  }

  @Get('sessions/upcoming')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Get upcoming therapy sessions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming sessions.',
    type: [TherapySession],
  })
  async getUpcomingSessions(@Request() req): Promise<TherapySession[]> {
    return this.teletherapyService.getUpcomingSessions(req.user);
  }

  @Get('sessions')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Get therapy sessions within a date range' })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  @ApiResponse({
    status: 200,
    description: 'List of sessions within the specified date range.',
    type: [TherapySession],
  })
  async getSessionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ): Promise<TherapySession[]> {
    return this.teletherapyService.getSessionsByDateRange(new Date(startDate), new Date(endDate), req.user);
  }

  @Patch('sessions/:id/status')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Update the status of a therapy session' })
  @ApiResponse({
    status: 200,
    description: 'The session status has been successfully updated.',
    type: TherapySession,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  async updateSessionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateSessionStatusDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.updateSessionStatus(id, updateStatusDto.status, req.user);
  }

  @Patch('sessions/:id/notes')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Update session notes' })
  @ApiResponse({
    status: 200,
    description: 'The session notes have been successfully updated.',
    type: TherapySession,
  })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  async updateSessionNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotesDto: UpdateSessionNotesDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.updateSessionNotes(id, updateNotesDto, req.user);
  }

  @Post('sessions/:id/cancel')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Cancel a therapy session' })
  @ApiResponse({
    status: 200,
    description: 'The session has been successfully cancelled.',
    type: TherapySession,
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel a session that has already started.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  async cancelSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelSessionDto: CancelSessionDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.cancelSession(id, req.user, cancelSessionDto.reason);
  }

  @Post('sessions/:id/participants')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Add participants to a therapy session' })
  @ApiResponse({
    status: 200,
    description: 'Participants have been successfully added to the session.',
    type: TherapySession,
  })
  @ApiResponse({ status: 400, description: 'Invalid participant data or session limit reached.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async addParticipants(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addParticipantsDto: AddParticipantsDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.addParticipants(id, addParticipantsDto, req.user);
  }

  @Delete('sessions/:id/participants')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Remove participants from a therapy session' })
  @ApiResponse({
    status: 200,
    description: 'Participants have been successfully removed from the session.',
    type: TherapySession,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async removeParticipants(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() removeParticipantsDto: RemoveParticipantsDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.removeParticipants(id, removeParticipantsDto, req.user);
  }

  @Patch('sessions/:id/participants/role')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Update a participant\'s role in the session' })
  @ApiResponse({
    status: 200,
    description: 'Participant role has been successfully updated.',
    type: TherapySession,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async updateParticipantRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateParticipantRoleDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.updateParticipantRole(id, updateRoleDto, req.user);
  }

  @Post('sessions/:id/breakout-rooms')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Manage breakout rooms for a group session' })
  @ApiResponse({
    status: 200,
    description: 'Breakout rooms have been successfully configured.',
    type: TherapySession,
  })
  @ApiResponse({ status: 400, description: 'Invalid session type for breakout rooms.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async manageBreakoutRooms(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() breakoutRoomsDto: ManageBreakoutRoomsDto,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.manageBreakoutRooms(id, breakoutRoomsDto, req.user);
  }

  @Post('sessions/:id/join')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Join a therapy session' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the session.',
    type: TherapySession,
  })
  @ApiResponse({ status: 400, description: 'Session is not available for joining or limit reached.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async joinSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.joinSession(id, req.user);
  }

  @Post('sessions/:id/leave')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Leave a therapy session' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left the session.',
    type: TherapySession,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async leaveSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<TherapySession> {
    return this.teletherapyService.leaveSession(id, req.user);
  }

  @Get('sessions/group')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Get group therapy sessions' })
  @ApiQuery({ name: 'category', required: false, enum: ['group', 'workshop', 'support_group'] })
  @ApiQuery({ name: 'focus', required: false, isArray: true })
  @ApiResponse({
    status: 200,
    description: 'List of group therapy sessions.',
    type: [TherapySession],
  })
  async getGroupSessions(
    @Request() req,
    @Query('category') category?: string,
    @Query('focus') focus?: string[],
  ): Promise<TherapySession[]> {
    // TODO: Implement filtering by category and focus
    return this.teletherapyService.getUpcomingSessions(req.user);
  }

  @Get('sessions/individual')
  @Roles('client', 'therapist', 'admin')
  @ApiOperation({ summary: 'Get individual therapy sessions' })
  @ApiQuery({ name: 'category', required: false, enum: ['individual', 'couples', 'family'] })
  @ApiResponse({
    status: 200,
    description: 'List of individual therapy sessions.',
    type: [TherapySession],
  })
  async getIndividualSessions(
    @Request() req,
    @Query('category') category?: string,
  ): Promise<TherapySession[]> {
    // TODO: Implement filtering by category
    return this.teletherapyService.getUpcomingSessions(req.user);
  }

  @Post(':id/create-chat-room')
  @ApiOperation({ summary: 'Create a chat room for a therapy session' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a therapist or admin' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async createChatRoomForSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const session = await this.teletherapyService.getSessionById(id, user);
      
      // Only therapist or admin can create chat rooms
      if (user.id !== session.therapistId && user.role !== 'admin') {
        throw new HttpException('Only the session therapist or admin can create chat rooms', HttpStatus.FORBIDDEN);
      }
      
      await this.teletherapyService.createChatRoomForSession(id, user);
      
      return { 
        success: true, 
        message: 'Chat room created successfully for the therapy session' 
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Failed to create chat room', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('sessions/relationship')
  @ApiOperation({ summary: 'Check if a therapist and client have a session relationship' })
  @ApiQuery({ name: 'therapistId', required: true, description: 'The therapist ID' })
  @ApiQuery({ name: 'clientId', required: true, description: 'The client ID' })
  @ApiResponse({ status: 200, description: 'Relationship check result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles('client', 'therapist', 'admin')
  async checkTherapistClientRelationship(
    @Query('therapistId') therapistId: string,
    @Query('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<{ hasRelationship: boolean }> {
    // Only allow admins, the therapist themselves, or the client themselves to check
    if (
      user.id !== therapistId && 
      user.id !== clientId && 
      user.role !== 'admin'
    ) {
      throw new ForbiddenException('You don\'t have permission to check this relationship');
    }
    
    return {
      hasRelationship: await this.teletherapyService.checkTherapistClientRelationship(
        therapistId,
        clientId
      )
    };
  }
} 
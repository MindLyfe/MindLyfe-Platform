import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { VideoService } from '../services/video.service';
import { MediaSessionType, MediaSessionStatus } from '../entities/media-session.entity';
import { MediaSessionRepository } from '../repositories/media-session.repository';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsNumber, Min, Max, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// Enhanced DTOs with validation
class CodecOptionsDto {
  @ApiProperty({ enum: ['VP8', 'VP9', 'H264'], required: false })
  @IsEnum(['VP8', 'VP9', 'H264'])
  @IsOptional()
  video?: string;

  @ApiProperty({ enum: ['opus'], required: false })
  @IsEnum(['opus'])
  @IsOptional()
  audio?: string;
}

class MediaSessionOptionsDto {
  @ApiProperty({ description: 'Enable session recording', required: false })
  @IsBoolean()
  @IsOptional()
  recording?: boolean;

  @ApiProperty({ description: 'Enable chat functionality', required: false })
  @IsBoolean()
  @IsOptional()
  chat?: boolean;

  @ApiProperty({ description: 'Enable screen sharing', required: false })
  @IsBoolean()
  @IsOptional()
  screenSharing?: boolean;

  @ApiProperty({ description: 'Maximum number of participants', required: false, minimum: 2, maximum: 50 })
  @IsNumber()
  @Min(2)
  @Max(50)
  @IsOptional()
  maxParticipants?: number;

  @ApiProperty({ description: 'Enable waiting room', required: false })
  @IsBoolean()
  @IsOptional()
  waitingRoom?: boolean;

  @ApiProperty({ description: 'Enable breakout rooms', required: false })
  @IsBoolean()
  @IsOptional()
  breakoutRooms?: boolean;

  @ApiProperty({ description: 'Video/audio codec settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodecOptionsDto)
  codec?: CodecOptionsDto;
}

class CreateMediaSessionDto {
  @ApiProperty({
    enum: MediaSessionType,
    description: 'Type of media session (teletherapy or chat)',
    example: 'TELETHERAPY',
  })
  @IsEnum(MediaSessionType)
  type: MediaSessionType;

  @ApiProperty({
    description: 'ID of the context (therapy session or chat room)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  contextId: string;

  @ApiProperty({
    description: 'Options for the media session',
    type: MediaSessionOptionsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaSessionOptionsDto)
  options?: MediaSessionOptionsDto;
}

class JoinMediaSessionDto {
  @ApiProperty({
    description: 'Role of the participant (host or participant)',
    enum: ['host', 'participant'],
    example: 'participant',
  })
  @IsEnum(['host', 'participant'])
  role: 'host' | 'participant';
}

class CreateBreakoutRoomDto {
  @ApiProperty({
    description: 'Name of the breakout room',
    example: 'Group Discussion 1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID of the host user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  hostId: string;
}

class AdmitFromWaitingRoomDto {
  @ApiProperty({
    description: 'ID of the participant to admit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  participantId: string;
}

@ApiTags('Media Sessions')
@Controller('media-sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(
    private readonly videoService: VideoService,
    private readonly mediaSessionRepository: MediaSessionRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new media session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Media session created successfully',
  })
  async createSession(
    @Request() req,
    @Body() createSessionDto: CreateMediaSessionDto,
  ) {
    const session = await this.videoService.createSession({
      type: createSessionDto.type,
      contextId: createSessionDto.contextId,
      startedBy: req.user.id,
      ...createSessionDto.options,
    });

    return {
      status: 'success',
      data: session,
    };
  }

  @Post(':sessionId/join')
  @ApiOperation({ summary: 'Join an existing media session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully joined the media session',
  })
  async joinSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() joinSessionDto: JoinMediaSessionDto,
  ) {
    const result = await this.videoService.joinSession(
      sessionId,
      req.user.id,
      joinSessionDto.role,
    );

    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':sessionId/leave')
  @ApiOperation({ summary: 'Leave a media session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully left the media session',
  })
  async leaveSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    await this.videoService.leaveSession(sessionId, req.user.id);

    return {
      status: 'success',
      message: 'Successfully left the session',
    };
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get media session details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media session details retrieved successfully',
  })
  async getSession(
    @Param('sessionId') sessionId: string,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    return {
      status: 'success',
      data: session,
    };
  }

  @Get('context/:type/:contextId')
  @ApiOperation({ summary: 'Get active media session for a context' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active media session retrieved successfully',
  })
  async getActiveSessionByContext(
    @Param('type') type: MediaSessionType,
    @Param('contextId') contextId: string,
  ) {
    const session = await this.mediaSessionRepository.findActiveByContext(type, contextId);
    if (!session) {
      throw new NotFoundException('No active media session found for this context');
    }

    return {
      status: 'success',
      data: session,
    };
  }

  @Get('user/active')
  @ApiOperation({ summary: 'Get user\'s active media sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active media sessions retrieved successfully',
  })
  async getUserActiveSessions(
    @Request() req,
  ) {
    const sessions = await this.mediaSessionRepository.findByParticipant(req.user.id);

    return {
      status: 'success',
      data: sessions,
    };
  }

  @Post(':sessionId/recording/start')
  @ApiOperation({ summary: 'Start recording a media session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recording started successfully',
  })
  async startRecording(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    await this.videoService.startRecording(sessionId);

    return {
      status: 'success',
      message: 'Recording started successfully',
    };
  }

  @Post(':sessionId/recording/stop')
  @ApiOperation({ summary: 'Stop recording a media session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recording stopped successfully',
  })
  async stopRecording(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    await this.videoService.stopRecording(sessionId);

    return {
      status: 'success',
      message: 'Recording stopped successfully',
    };
  }

  @Get(':sessionId/participants')
  @ApiOperation({ summary: 'Get session participants' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session participants retrieved successfully',
  })
  async getSessionParticipants(
    @Param('sessionId') sessionId: string,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    return {
      status: 'success',
      data: session.participants,
    };
  }

  @Post(':sessionId/chat')
  @ApiOperation({ summary: 'Send a chat message in the session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat message sent successfully',
  })
  async sendChatMessage(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() message: { content: string; type?: 'text' | 'file'; metadata?: any },
  ) {
    const chatMessage = await this.videoService.sendChatMessage(sessionId, {
      sessionId,
      senderId: req.user.id,
      senderName: req.user.firstName + ' ' + req.user.lastName,
      content: message.content,
      type: message.type || 'text',
      metadata: message.metadata,
    });

    return {
      status: 'success',
      data: chatMessage,
    };
  }

  @Get(':sessionId/chat')
  @ApiOperation({ summary: 'Get session chat history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat history retrieved successfully',
  })
  async getChatHistory(
    @Param('sessionId') sessionId: string,
    @Query() query: {
      startTime?: string;
      endTime?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const messages = await this.videoService.getChatHistory(sessionId, {
      startTime: query.startTime ? new Date(query.startTime) : undefined,
      endTime: query.endTime ? new Date(query.endTime) : undefined,
      limit: query.limit,
      offset: query.offset,
    });

    return {
      status: 'success',
      data: messages,
    };
  }

  // Add new endpoints for breakout rooms
  @Post(':sessionId/breakout-rooms')
  @ApiOperation({ 
    summary: 'Create breakout rooms',
    description: 'Create multiple breakout rooms for a media session. Only the host can create breakout rooms.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Breakout rooms created successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only the host can create breakout rooms',
  })
  async createBreakoutRooms(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() rooms: CreateBreakoutRoomDto[],
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    if (session.startedBy !== req.user.id) {
      throw new ForbiddenException('Only the host can create breakout rooms');
    }

    const breakoutRooms = await this.videoService.createBreakoutRooms(sessionId, rooms);

    return {
      status: 'success',
      data: breakoutRooms,
    };
  }

  @Post(':sessionId/breakout-rooms/:roomId/join')
  @ApiOperation({
    summary: 'Join a breakout room',
    description: 'Join a specific breakout room in the media session.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully joined the breakout room',
  })
  async joinBreakoutRoom(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Param('roomId') roomId: string,
  ) {
    const result = await this.videoService.joinBreakoutRoom(sessionId, roomId, req.user.id);

    return {
      status: 'success',
      data: result,
    };
  }

  @Post(':sessionId/breakout-rooms/end')
  @ApiOperation({
    summary: 'End all breakout rooms',
    description: 'End all breakout rooms and return participants to the main session. Only the host can end breakout rooms.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Breakout rooms ended successfully',
  })
  async endBreakoutRooms(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    if (session.startedBy !== req.user.id) {
      throw new ForbiddenException('Only the host can end breakout rooms');
    }

    await this.videoService.endBreakoutRooms(sessionId);

    return {
      status: 'success',
      message: 'Breakout rooms ended successfully',
    };
  }

  // Add new endpoints for waiting room management
  @Get(':sessionId/waiting-room')
  @ApiOperation({
    summary: 'Get waiting room participants',
    description: 'Get list of participants in the waiting room. Only the host can view the waiting room.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Waiting room participants retrieved successfully',
  })
  async getWaitingRoomParticipants(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    if (session.startedBy !== req.user.id) {
      throw new ForbiddenException('Only the host can view the waiting room');
    }

    const participants = await this.videoService.getWaitingRoomParticipants(sessionId);

    return {
      status: 'success',
      data: participants,
    };
  }

  @Post(':sessionId/waiting-room/admit')
  @ApiOperation({
    summary: 'Admit participant from waiting room',
    description: 'Admit a participant from the waiting room to the main session. Only the host can admit participants.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Participant admitted successfully',
  })
  async admitFromWaitingRoom(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() admitDto: AdmitFromWaitingRoomDto,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    if (session.startedBy !== req.user.id) {
      throw new ForbiddenException('Only the host can admit participants');
    }

    const result = await this.videoService.admitFromWaitingRoom(
      sessionId,
      admitDto.participantId,
      req.user.id,
    );

    return {
      status: 'success',
      data: result,
    };
  }

  @Post(':sessionId/waiting-room/reject')
  @ApiOperation({
    summary: 'Reject participant from waiting room',
    description: 'Reject a participant from the waiting room. Only the host can reject participants.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Participant rejected successfully',
  })
  async rejectFromWaitingRoom(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() rejectDto: AdmitFromWaitingRoomDto,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    if (session.startedBy !== req.user.id) {
      throw new ForbiddenException('Only the host can reject participants');
    }

    await this.videoService.rejectFromWaitingRoom(sessionId, rejectDto.participantId);

    return {
      status: 'success',
      message: 'Participant rejected successfully',
    };
  }

  // Add endpoint for session settings
  @Patch(':sessionId/settings')
  @ApiOperation({
    summary: 'Update session settings',
    description: 'Update media session settings. Only the host can update settings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session settings updated successfully',
  })
  async updateSessionSettings(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() settings: Partial<MediaSessionOptionsDto>,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    if (session.startedBy !== req.user.id) {
      throw new ForbiddenException('Only the host can update session settings');
    }

    await this.videoService.updateSessionSettings(sessionId, settings);

    return {
      status: 'success',
      message: 'Session settings updated successfully',
    };
  }

  // Add endpoint for session statistics
  @Get(':sessionId/stats')
  @ApiOperation({
    summary: 'Get session statistics',
    description: 'Get detailed statistics about the media session.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session statistics retrieved successfully',
  })
  async getSessionStats(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    const session = await this.mediaSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Media session not found');
    }

    // Check if user is authorized to view stats
    if (!session.participants.includes(req.user.id)) {
      throw new ForbiddenException('Not authorized to view session statistics');
    }

    const stats = await this.videoService.getSessionStats(sessionId);

    return {
      status: 'success',
      data: stats,
    };
  }
} 
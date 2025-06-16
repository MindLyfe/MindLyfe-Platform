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
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VideoService, VideoSessionOptions } from '../services/video.service';

@ApiTags('Video')
@Controller('video')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
  ) {}

  @Post('sessions/:sessionId/initialize')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Initialize video session' })
  @ApiResponse({
    status: 201,
    description: 'Video session initialized successfully',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        roomName: { type: 'string' },
        meetingLink: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session or options' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async initializeSession(
    @Param('sessionId') sessionId: string,
    @Body() options: VideoSessionOptions,
  ) {
    return this.videoService.initializeSession(sessionId, options);
  }

  @Post('sessions/:sessionId/join')
  @Roles('therapist', 'admin', 'client')
  @ApiOperation({ summary: 'Join video session' })
  @ApiResponse({
    status: 200,
    description: 'Joined session successfully',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        roomName: { type: 'string' },
        isInWaitingRoom: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session or role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async joinSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Query('role') role: 'host' | 'participant' = 'participant',
  ) {
    return this.videoService.joinSession(sessionId, req.user.id, role);
  }

  @Post('sessions/:sessionId/leave')
  @Roles('therapist', 'admin', 'client')
  @ApiOperation({ summary: 'Leave video session' })
  @ApiResponse({ status: 200, description: 'Left session successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async leaveSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    await this.videoService.leaveSession(sessionId, req.user.id);
  }

  @Post('sessions/:sessionId/waiting-room/admit')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Admit participant from waiting room' })
  @ApiResponse({
    status: 200,
    description: 'Participant admitted successfully',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        roomName: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session or participant' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async admitFromWaitingRoom(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body('participantId') participantId: string,
  ) {
    return this.videoService.admitFromWaitingRoom(
      sessionId,
      participantId,
      req.user.id,
    );
  }

  @Post('sessions/:sessionId/breakout-rooms')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Create breakout rooms' })
  @ApiResponse({
    status: 201,
    description: 'Breakout rooms created successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          participants: { type: 'array', items: { type: 'string' } },
          hostId: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session or room configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createBreakoutRooms(
    @Param('sessionId') sessionId: string,
    @Body('rooms') rooms: { name: string; hostId: string }[],
  ) {
    return this.videoService.createBreakoutRooms(sessionId, rooms);
  }

  @Post('sessions/:sessionId/breakout-rooms/:roomId/join')
  @Roles('therapist', 'admin', 'client')
  @ApiOperation({ summary: 'Join breakout room' })
  @ApiResponse({
    status: 200,
    description: 'Joined breakout room successfully',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        roomName: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session or room' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async joinBreakoutRoom(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Param('roomId') roomId: string,
  ) {
    return this.videoService.joinBreakoutRoom(sessionId, roomId, req.user.id);
  }

  @Post('sessions/:sessionId/breakout-rooms/end')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'End all breakout rooms' })
  @ApiResponse({ status: 200, description: 'Breakout rooms ended successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async endBreakoutRooms(@Param('sessionId') sessionId: string) {
    await this.videoService.endBreakoutRooms(sessionId);
  }

  @Post('sessions/:sessionId/chat')
  @Roles('therapist', 'admin', 'client')
  @ApiOperation({ summary: 'Send chat message' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        sessionId: { type: 'string' },
        senderId: { type: 'string' },
        senderName: { type: 'string' },
        content: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        type: { type: 'string', enum: ['text', 'file', 'system'] },
        metadata: {
          type: 'object',
          properties: {
            fileUrl: { type: 'string' },
            fileName: { type: 'string' },
            fileSize: { type: 'number' },
            fileType: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session or message' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendChatMessage(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() message: {
      content: string;
      type: 'text' | 'file' | 'system';
      metadata?: {
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        fileType?: string;
      };
    },
  ) {
    return this.videoService.sendChatMessage(sessionId, {
      sessionId,
      senderId: req.user.id,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      ...message,
    });
  }

  @Get('sessions/:sessionId/chat')
  @Roles('therapist', 'admin', 'client')
  @ApiOperation({ summary: 'Get chat history' })
  @ApiResponse({
    status: 200,
    description: 'Chat history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          senderId: { type: 'string' },
          senderName: { type: 'string' },
          content: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          type: { type: 'string', enum: ['text', 'file', 'system'] },
          metadata: {
            type: 'object',
            properties: {
              fileUrl: { type: 'string' },
              fileName: { type: 'string' },
              fileSize: { type: 'number' },
              fileType: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session or parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getChatHistory(
    @Param('sessionId') sessionId: string,
    @Query('startTime') startTimeStr?: string,
    @Query('endTime') endTimeStr?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const options: any = {};
    if (startTimeStr) {
      options.startTime = new Date(startTimeStr);
      if (isNaN(options.startTime.getTime())) {
        throw new BadRequestException('Invalid start time format');
      }
    }
    if (endTimeStr) {
      options.endTime = new Date(endTimeStr);
      if (isNaN(options.endTime.getTime())) {
        throw new BadRequestException('Invalid end time format');
      }
    }
    if (limitStr) {
      options.limit = parseInt(limitStr, 10);
      if (isNaN(options.limit)) {
        throw new BadRequestException('Invalid limit value');
      }
    }
    if (offsetStr) {
      options.offset = parseInt(offsetStr, 10);
      if (isNaN(options.offset)) {
        throw new BadRequestException('Invalid offset value');
      }
    }

    return this.videoService.getChatHistory(sessionId, options);
  }

  @Post('sessions/:sessionId/recording/start')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Start session recording' })
  @ApiResponse({ status: 200, description: 'Recording started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session or recording settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async startRecording(@Param('sessionId') sessionId: string) {
    await this.videoService.startRecording(sessionId);
  }

  @Post('sessions/:sessionId/recording/stop')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Stop session recording' })
  @ApiResponse({ status: 200, description: 'Recording stopped successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session or no active recording' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async stopRecording(@Param('sessionId') sessionId: string) {
    await this.videoService.stopRecording(sessionId);
  }

  @Get('sessions/:sessionId/participants')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Get session participants' })
  @ApiResponse({
    status: 200,
    description: 'Participants retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sid: { type: 'string' },
          identity: { type: 'string' },
          status: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          duration: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getParticipants(@Param('sessionId') sessionId: string) {
    const sessionData = await this.videoService['activeSessions'].get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    return this.videoService.getRoomParticipants(sessionId);
  }

  @Post('sessions/:sessionId/participants/:participantSid/disconnect')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Disconnect participant from session' })
  @ApiResponse({ status: 200, description: 'Participant disconnected successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session or participant' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async disconnectParticipant(
    @Param('sessionId') sessionId: string,
    @Param('participantSid') participantSid: string,
  ) {
    const sessionData = await this.videoService['activeSessions'].get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session is not active');
    }

    await this.videoService.disconnectParticipant(sessionId, participantSid);
  }

  @Post('sessions/:sessionId/end')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'End video session' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async endSession(@Param('sessionId') sessionId: string) {
    await this.videoService.endSession(sessionId);
  }
} 
import {
  Controller,
  Get,
  Post,
  Put,
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
import { CalendarService } from '../services/calendar.service';
import {
  CalendarAvailabilityDto,
  CalendarExceptionDto,
  CalendarSyncDto,
  CalendarEventDto,
  CalendarSyncStatusDto,
} from '../dto/calendar.dto';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Put('availability')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Set therapist availability' })
  @ApiResponse({
    status: 200,
    description: 'Availability settings updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid availability settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async setAvailability(
    @Request() req,
    @Body() availability: CalendarAvailabilityDto,
  ): Promise<void> {
    await this.calendarService.setAvailability(req.user.id, availability);
  }

  @Post('exceptions')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Add availability exception' })
  @ApiResponse({
    status: 201,
    description: 'Exception added successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid exception data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addException(
    @Request() req,
    @Body() exception: CalendarExceptionDto,
  ): Promise<void> {
    await this.calendarService.addException(req.user.id, exception);
  }

  @Post('sync')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Sync calendar with external provider' })
  @ApiResponse({
    status: 200,
    description: 'Calendar sync status',
    type: CalendarSyncStatusDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid sync settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async syncCalendar(
    @Request() req,
    @Body() syncSettings: CalendarSyncDto,
  ): Promise<CalendarSyncStatusDto> {
    return this.calendarService.syncCalendar(req.user.id, syncSettings);
  }

  @Post('sessions/:sessionId/event')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Create calendar event for session' })
  @ApiResponse({
    status: 201,
    description: 'Calendar event created successfully',
    type: CalendarEventDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid session or calendar settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async createCalendarEvent(
    @Param('sessionId') sessionId: string,
  ): Promise<CalendarEventDto> {
    return this.calendarService.createCalendarEvent(sessionId);
  }

  @Get('availability/check')
  @Roles('therapist', 'admin', 'client')
  @ApiOperation({ summary: 'Check availability for a time slot' })
  @ApiResponse({
    status: 200,
    description: 'Availability check result',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        conflicts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              eventId: { type: 'string' },
              sessionId: { type: 'string' },
              startTime: { type: 'string', format: 'date-time' },
              endTime: { type: 'string', format: 'date-time' },
              type: { type: 'string', enum: ['overlap', 'adjacent', 'buffer'] },
              resolution: { type: 'string', enum: ['pending', 'reschedule', 'cancel', 'ignore'] },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid time parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async checkAvailability(
    @Request() req,
    @Query('startTime') startTimeStr: string,
    @Query('endTime') endTimeStr: string,
    @Query('excludeSessionId') excludeSessionId?: string,
  ) {
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    return this.calendarService.checkAvailability(
      req.user.id,
      startTime,
      endTime,
      excludeSessionId,
    );
  }

  @Get('sync/status')
  @Roles('therapist', 'admin')
  @ApiOperation({ summary: 'Get calendar sync status' })
  @ApiResponse({
    status: 200,
    description: 'Current sync status',
    type: CalendarSyncStatusDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSyncStatus(@Request() req): Promise<CalendarSyncStatusDto> {
    const user = req.user;
    if (!user.metadata?.calendarSyncStatus) {
      return {
        lastSyncedAt: null,
        status: 'failed',
        eventsSynced: 0,
        conflictsDetected: 0,
        error: 'No sync status available',
        nextSyncAt: null,
      };
    }
    return user.metadata.calendarSyncStatus;
  }
} 
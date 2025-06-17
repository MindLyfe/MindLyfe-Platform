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
  HttpStatus,
  HttpException,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { SupportService } from './support.service';

import {
  RegisterSupportTeamDto,
  CreateShiftDto,
  UpdateShiftDto,
  ShiftQueryDto,
  CreateSupportRequestDto,
  UpdateSupportRequestDto,
  AssignSupportRequestDto,
  SupportRequestQueryDto,
  NotificationPreferencesDto,
  SupportTeamMemberResponseDto,
  ShiftResponseDto,
  SupportRequestResponseDto,
  SupportDashboardDto,
} from './support.dto';

@ApiTags('support')
@Controller('support')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) {}

  // Support Team Management
  @Post('team/register')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register a new support team member' })
  @ApiResponse({ status: 201, description: 'Support team member registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async registerSupportTeamMember(
    @Body(ValidationPipe) registerDto: RegisterSupportTeamDto,
    @Request() req: any,
  ): Promise<SupportTeamMemberResponseDto> {
    try {
      return await this.supportService.registerSupportTeamMember(registerDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to register support team member',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('team')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get all support team members' })
  @ApiResponse({ status: 200, description: 'Support team members retrieved successfully' })
  async getSupportTeamMembers(): Promise<SupportTeamMemberResponseDto[]> {
    return await this.supportService.getSupportTeamMembers();
  }

  @Get('team/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get support team member by ID' })
  @ApiResponse({ status: 200, description: 'Support team member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Support team member not found' })
  async getSupportTeamMemberById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SupportTeamMemberResponseDto> {
    const member = await this.supportService.getSupportTeamMemberById(id);
    if (!member) {
      throw new HttpException('Support team member not found', HttpStatus.NOT_FOUND);
    }
    return member;
  }

  @Put('team/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update support team member status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Support team member not found' })
  async updateSupportTeamMemberStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { isActive: boolean },
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.supportService.updateSupportTeamMemberStatus(id, body.isActive, req.user.id);
    return { message: 'Support team member status updated successfully' };
  }

  // Shift Management
  @Post('shifts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid shift data' })
  async createShift(
    @Body(ValidationPipe) createShiftDto: CreateShiftDto,
    @Request() req: any,
  ): Promise<ShiftResponseDto> {
    try {
      return await this.supportService.createShift(createShiftDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create shift',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('shifts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get shifts with optional filtering' })
  @ApiResponse({ status: 200, description: 'Shifts retrieved successfully' })
  async getShifts(
    @Query(ValidationPipe) queryDto: ShiftQueryDto,
  ): Promise<ShiftResponseDto[]> {
    return await this.supportService.getShifts(queryDto);
  }

  @Get('shifts/my')
  @Roles(UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get current user\'s shifts' })
  @ApiResponse({ status: 200, description: 'User shifts retrieved successfully' })
  async getMyShifts(
    @Request() req: any,
    @Query(ValidationPipe) queryDto: ShiftQueryDto,
  ): Promise<ShiftResponseDto[]> {
    return await this.supportService.getUserShifts(req.user.id, queryDto);
  }

  @Get('shifts/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get shift by ID' })
  @ApiResponse({ status: 200, description: 'Shift retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async getShiftById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShiftResponseDto> {
    const shift = await this.supportService.getShiftById(id);
    if (!shift) {
      throw new HttpException('Shift not found', HttpStatus.NOT_FOUND);
    }
    return shift;
  }

  @Put('shifts/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update shift' })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async updateShift(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateShiftDto: UpdateShiftDto,
    @Request() req: any,
  ): Promise<ShiftResponseDto> {
    try {
      return await this.supportService.updateShift(id, updateShiftDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update shift',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('shifts/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete shift' })
  @ApiResponse({ status: 200, description: 'Shift deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async deleteShift(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.supportService.deleteShift(id, req.user.id);
    return { message: 'Shift deleted successfully' };
  }

  @Post('shifts/:id/start')
  @Roles(UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Start a shift (check-in)' })
  @ApiResponse({ status: 200, description: 'Shift started successfully' })
  @ApiResponse({ status: 400, description: 'Cannot start shift' })
  async startShift(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    try {
      await this.supportService.startShift(id, req.user.id);
      return { message: 'Shift started successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to start shift',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('shifts/:id/end')
  @Roles(UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'End a shift (check-out)' })
  @ApiResponse({ status: 200, description: 'Shift ended successfully' })
  @ApiResponse({ status: 400, description: 'Cannot end shift' })
  async endShift(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    try {
      await this.supportService.endShift(id, req.user.id);
      return { message: 'Shift ended successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to end shift',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Support Request Management
  @Post('requests')
  @Roles(UserRole.USER, UserRole.THERAPIST, UserRole.ORGANIZATION_ADMIN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new support request' })
  @ApiResponse({ status: 201, description: 'Support request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createSupportRequest(
    @Body(ValidationPipe) createRequestDto: CreateSupportRequestDto,
    @Request() req: any,
  ): Promise<SupportRequestResponseDto> {
    try {
      return await this.supportService.createSupportRequest(createRequestDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create support request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('requests')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get support requests with optional filtering' })
  @ApiResponse({ status: 200, description: 'Support requests retrieved successfully' })
  async getSupportRequests(
    @Query(ValidationPipe) queryDto: SupportRequestQueryDto,
  ): Promise<SupportRequestResponseDto[]> {
    return await this.supportService.getSupportRequests(queryDto);
  }

  @Get('requests/my')
  @Roles(UserRole.USER, UserRole.THERAPIST, UserRole.ORGANIZATION_ADMIN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get current user\'s support requests' })
  @ApiResponse({ status: 200, description: 'User support requests retrieved successfully' })
  async getMySupportRequests(
    @Request() req: any,
    @Query(ValidationPipe) queryDto: SupportRequestQueryDto,
  ): Promise<SupportRequestResponseDto[]> {
    return await this.supportService.getUserSupportRequests(req.user.id, queryDto);
  }

  @Get('requests/assigned')
  @Roles(UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get support requests assigned to current user' })
  @ApiResponse({ status: 200, description: 'Assigned support requests retrieved successfully' })
  async getAssignedSupportRequests(
    @Request() req: any,
    @Query(ValidationPipe) queryDto: SupportRequestQueryDto,
  ): Promise<SupportRequestResponseDto[]> {
    return await this.supportService.getAssignedSupportRequests(req.user.id, queryDto);
  }

  @Get('requests/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM, UserRole.USER, UserRole.THERAPIST, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Get support request by ID' })
  @ApiResponse({ status: 200, description: 'Support request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async getSupportRequestById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<SupportRequestResponseDto> {
    const request = await this.supportService.getSupportRequestById(id, req.user.id, req.user.role);
    if (!request) {
      throw new HttpException('Support request not found', HttpStatus.NOT_FOUND);
    }
    return request;
  }

  @Put('requests/:id')
  @Roles(UserRole.SUPPORT_TEAM, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update support request' })
  @ApiResponse({ status: 200, description: 'Support request updated successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async updateSupportRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRequestDto: UpdateSupportRequestDto,
    @Request() req: any,
  ): Promise<SupportRequestResponseDto> {
    try {
      return await this.supportService.updateSupportRequest(id, updateRequestDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update support request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('requests/:id/assign')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Assign support request to a team member' })
  @ApiResponse({ status: 200, description: 'Support request assigned successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async assignSupportRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) assignDto: AssignSupportRequestDto,
    @Request() req: any,
  ): Promise<SupportRequestResponseDto> {
    try {
      return await this.supportService.assignSupportRequest(id, assignDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to assign support request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('requests/:id/take')
  @Roles(UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Take ownership of an unassigned support request' })
  @ApiResponse({ status: 200, description: 'Support request taken successfully' })
  @ApiResponse({ status: 400, description: 'Cannot take this request' })
  async takeSupportRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<SupportRequestResponseDto> {
    try {
      return await this.supportService.takeSupportRequest(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to take support request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('requests/:id/escalate')
  @Roles(UserRole.SUPPORT_TEAM, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Escalate support request to higher priority' })
  @ApiResponse({ status: 200, description: 'Support request escalated successfully' })
  @ApiResponse({ status: 404, description: 'Support request not found' })
  async escalateSupportRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ): Promise<SupportRequestResponseDto> {
    try {
      return await this.supportService.escalateSupportRequest(id, body.reason, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to escalate support request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Dashboard and Analytics
  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get support dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getSupportDashboard(
    @Request() req: any,
  ): Promise<SupportDashboardDto> {
    return await this.supportService.getSupportDashboard(req.user.id, req.user.role);
  }

  @Get('dashboard/my')
  @Roles(UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Get personal support dashboard for current user' })
  @ApiResponse({ status: 200, description: 'Personal dashboard data retrieved successfully' })
  async getPersonalDashboard(
    @Request() req: any,
  ): Promise<any> {
    return await this.supportService.getPersonalDashboard(req.user.id);
  }

  // Notification Management
  @Put('notifications/preferences')
  @Roles(UserRole.SUPPORT_TEAM)
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  async updateNotificationPreferences(
    @Body(ValidationPipe) preferencesDto: NotificationPreferencesDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.supportService.updateNotificationPreferences(req.user.id, preferencesDto);
    return { message: 'Notification preferences updated successfully' };
  }



  // Auto-routing and System Management
  @Get('routing/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get auto-routing system status' })
  @ApiResponse({ status: 200, description: 'Routing status retrieved successfully' })
  async getRoutingStatus(): Promise<any> {
    return await this.supportService.getRoutingStatus();
  }

  @Post('routing/toggle')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Toggle auto-routing system on/off' })
  @ApiResponse({ status: 200, description: 'Auto-routing toggled successfully' })
  async toggleAutoRouting(
    @Body() body: { enabled: boolean },
    @Request() req: any,
  ): Promise<{ message: string; enabled: boolean }> {
    const enabled = await this.supportService.toggleAutoRouting(body.enabled, req.user.id);
    return {
      message: `Auto-routing ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled,
    };
  }

  // Shift Templates (for recurring shifts)
  @Post('shifts/templates')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create shift template for recurring shifts' })
  @ApiResponse({ status: 201, description: 'Shift template created successfully' })
  async createShiftTemplate(
    @Body() templateData: any,
    @Request() req: any,
  ): Promise<any> {
    return await this.supportService.createShiftTemplate(templateData, req.user.id);
  }

  @Post('shifts/generate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate shifts from template for a date range' })
  @ApiResponse({ status: 201, description: 'Shifts generated successfully' })
  async generateShiftsFromTemplate(
    @Body() generateData: { templateId: string; startDate: string; endDate: string },
    @Request() req: any,
  ): Promise<{ message: string; shiftsCreated: number }> {
    const count = await this.supportService.generateShiftsFromTemplate(
      generateData.templateId,
      new Date(generateData.startDate),
      new Date(generateData.endDate),
      req.user.id,
    );
    return {
      message: 'Shifts generated successfully',
      shiftsCreated: count,
    };
  }
}
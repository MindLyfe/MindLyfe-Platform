import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { TherapistService } from './therapist.service';
import {
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  TherapistQueryDto,
} from './dto/therapist.dto';

@ApiTags('therapists')
@Controller('therapists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Get all pending therapist applications (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'List of pending therapist applications' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getPendingTherapists(
    @Query() query: TherapistQueryDto,
  ) {
    return this.therapistService.getPendingTherapists(query);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Get all therapists with filtering (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'List of all therapists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by therapist status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getAllTherapists(
    @Query() query: TherapistQueryDto,
  ) {
    return this.therapistService.getAllTherapists(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.THERAPIST)
  @ApiOperation({ summary: 'Get therapist details by ID' })
  @ApiResponse({ status: 200, description: 'Therapist details' })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  async getTherapistById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.therapistService.getTherapistById(id, req.user);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Approve a therapist application (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Therapist approved successfully' })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 400, description: 'Invalid therapist status for approval' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  @ApiBody({ type: ApproveTherapistDto })
  async approveTherapist(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveTherapistDto,
    @Request() req,
  ) {
    return this.therapistService.approveTherapist(id, approveDto, req.user.id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Reject a therapist application (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Therapist rejected successfully' })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 400, description: 'Invalid therapist status for rejection' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  @ApiBody({ type: RejectTherapistDto })
  async rejectTherapist(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectTherapistDto,
    @Request() req,
  ) {
    return this.therapistService.rejectTherapist(id, rejectDto, req.user.id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update therapist status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Therapist status updated successfully' })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  @ApiBody({ type: UpdateTherapistStatusDto })
  async updateTherapistStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTherapistStatusDto,
    @Request() req,
  ) {
    return this.therapistService.updateTherapistStatus(id, updateDto, req.user.id);
  }

  @Put(':id/suspend')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Suspend a therapist (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Therapist suspended successfully' })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  @ApiBody({ type: RejectTherapistDto })
  async suspendTherapist(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() suspendDto: RejectTherapistDto,
    @Request() req,
  ) {
    return this.therapistService.suspendTherapist(id, suspendDto, req.user.id);
  }

  @Put(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiOperation({ summary: 'Reactivate a suspended therapist (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Therapist reactivated successfully' })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  async reactivateTherapist(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.therapistService.reactivateTherapist(id, req.user.id);
  }

  @Get('profile/me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.THERAPIST)
  @ApiOperation({ summary: 'Get current therapist profile (Therapist only)' })
  @ApiResponse({ status: 200, description: 'Current therapist profile' })
  @ApiResponse({ status: 404, description: 'Therapist profile not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Therapist access required' })
  async getMyProfile(
    @Request() req,
  ) {
    return this.therapistService.getTherapistByUserId(req.user.id);
  }
}
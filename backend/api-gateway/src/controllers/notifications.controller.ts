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
import { NotificationsService } from '../services/notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification', description: 'Admin only - Create new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async create(@Body() createNotificationDto: any) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my notifications', description: 'Get notifications for current user' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type' })
  @ApiQuery({ name: 'read', required: false, type: Boolean, description: 'Filter by read status' })
  async findMy(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('read') read?: boolean,
  ) {
    return this.notificationsService.findAllForUser(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
      read: read !== undefined ? read === true : undefined,
    });
  }

  @Get('user/:userId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOperation({ summary: 'Get notifications for specific user', description: 'Admin only - Get notifications for any user' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type' })
  @ApiQuery({ name: 'read', required: false, type: Boolean, description: 'Filter by read status' })
  async findForUser(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('read') read?: boolean,
  ) {
    return this.notificationsService.findAllForUser(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
      read: read !== undefined ? read === true : undefined,
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiOperation({ summary: 'Get specific notification', description: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiOperation({ summary: 'Mark notification as read', description: 'Mark specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read', description: 'Mark all user notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification', description: 'Delete specific notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.remove(id, req.user.userId);
  }

  @Post('send/:id')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiOperation({ summary: 'Send notification by ID', description: 'Admin only - Send specific notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async sendNotification(@Param('id') id: string) {
    return this.notificationsService.sendNotification(id);
  }

  @Patch('user-status')
  @ApiOperation({ summary: 'Update user online status', description: 'Update online/offline status for notifications' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(@Req() req: any, @Body() updateUserStatusDto: { isOnline: boolean }) {
    return this.notificationsService.updateUserOnlineStatus(req.user.userId, updateUserStatusDto.isOnline);
  }
} 
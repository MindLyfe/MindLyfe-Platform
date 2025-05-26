import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationEntity, NotificationType } from './entities/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtUser } from '../auth/interfaces/user.interface';

class UpdateUserStatusDto {
  isOnline: boolean;
}

@ApiTags('notification')
@Controller('notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationEntity> {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get notifications for the current user' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'read', required: false, type: Boolean })
  async findMy(
    @CurrentUser() user: JwtUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: NotificationType,
    @Query('read') read?: boolean,
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    return this.notificationService.findAllForUser(user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
      read: read !== undefined ? read === true : undefined,
    });
  }

  @Get('user/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Get notifications for a specific user (admin only)' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'read', required: false, type: Boolean })
  async findForUser(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: NotificationType,
    @Query('read') read?: boolean,
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    return this.notificationService.findAllForUser(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
      read: read !== undefined ? read === true : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string): Promise<NotificationEntity> {
    return this.notificationService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<NotificationEntity> {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    return this.notificationService.remove(id, user.id);
  }

  @Post('send/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Send a notification by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async sendNotification(@Param('id') id: string): Promise<NotificationEntity> {
    return this.notificationService.sendNotification(id);
  }

  @Patch('user-status')
  @ApiOperation({ summary: 'Update user online status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @CurrentUser() user: JwtUser,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<{ success: boolean }> {
    await this.notificationService.updateUserOnlineStatus(user.id, updateUserStatusDto.isOnline);
    return { success: true };
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(
    @CurrentUser() user: JwtUser,
  ): Promise<{ success: boolean }> {
    const inAppAdapter = this.notificationService.getInAppAdapter();
    await inAppAdapter.markAllAsRead(user.id);
    return { success: true };
  }
} 
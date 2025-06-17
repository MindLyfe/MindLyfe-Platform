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
import { UserService } from '../services/user.service';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==================== PROFILE ENDPOINTS ====================

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile', description: 'Get the current user profile information' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getCurrentUserProfile(@Req() req: any) {
    return this.userService.getCurrentUserProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile', description: 'Update the current user profile information' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateCurrentUserProfile(@Body() updateDto: any, @Req() req: any) {
    return this.userService.updateCurrentUserProfile(req.user.userId, updateDto);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account', description: 'Soft delete user account (deactivate)' })
  @ApiResponse({ status: 204, description: 'User account deleted successfully' })
  async deleteUserAccount(@Req() req: any) {
    return this.userService.deleteUserAccount(req.user.userId);
  }

  // ==================== PREFERENCES ENDPOINTS ====================

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences', description: 'Get user notification and privacy preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved successfully' })
  async getUserPreferences(@Req() req: any) {
    return this.userService.getUserPreferences(req.user.userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user preferences', description: 'Update user notification and privacy preferences' })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  async updateUserPreferences(@Body() preferencesDto: any, @Req() req: any) {
    return this.userService.updateUserPreferences(req.user.userId, preferencesDto);
  }

  @Get('preferences/privacy')
  @ApiOperation({ summary: 'Get privacy settings', description: 'Get user privacy and data sharing settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings retrieved successfully' })
  async getPrivacySettings(@Req() req: any) {
    return this.userService.getPrivacySettings(req.user.userId);
  }

  @Patch('preferences/privacy')
  @ApiOperation({ summary: 'Update privacy settings', description: 'Update user privacy and data sharing settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings updated successfully' })
  async updatePrivacySettings(@Body() privacyDto: any, @Req() req: any) {
    return this.userService.updatePrivacySettings(req.user.userId, privacyDto);
  }

  @Get('preferences/notifications')
  @ApiOperation({ summary: 'Get notification preferences', description: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  async getNotificationPreferences(@Req() req: any) {
    return this.userService.getNotificationPreferences(req.user.userId);
  }

  @Patch('preferences/notifications')
  @ApiOperation({ summary: 'Update notification preferences', description: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  async updateNotificationPreferences(@Body() notificationDto: any, @Req() req: any) {
    return this.userService.updateNotificationPreferences(req.user.userId, notificationDto);
  }

  // ==================== PROFILE PICTURE ENDPOINTS ====================

  @Post('profile/picture')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload profile picture', description: 'Upload a new profile picture' })
  @ApiResponse({ status: 201, description: 'Profile picture uploaded successfully' })
  async uploadProfilePicture(@Body() uploadDto: any, @Req() req: any) {
    return this.userService.uploadProfilePicture(req.user.userId, uploadDto);
  }

  @Delete('profile/picture')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete profile picture', description: 'Remove the current profile picture' })
  @ApiResponse({ status: 204, description: 'Profile picture deleted successfully' })
  async deleteProfilePicture(@Req() req: any) {
    return this.userService.deleteProfilePicture(req.user.userId);
  }

  // ==================== ACTIVITY AND ANALYTICS ENDPOINTS ====================

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity history', description: 'Get user activity and usage history' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, description: 'Activity type filter' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  async getUserActivity(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.userService.getUserActivity(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
      startDate,
      endDate,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics', description: 'Get user usage statistics and insights' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Statistics timeframe (week, month, year)' })
  async getUserStatistics(
    @Req() req: any,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.userService.getUserStatistics(req.user.userId, { timeframe });
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get user achievements', description: 'Get user achievements and badges' })
  @ApiResponse({ status: 200, description: 'User achievements retrieved successfully' })
  async getUserAchievements(@Req() req: any) {
    return this.userService.getUserAchievements(req.user.userId);
  }

  @Get('streaks')
  @ApiOperation({ summary: 'Get user streaks', description: 'Get user streaks across different activities' })
  @ApiResponse({ status: 200, description: 'User streaks retrieved successfully' })
  async getUserStreaks(@Req() req: any) {
    return this.userService.getUserStreaks(req.user.userId);
  }

  // ==================== DATA EXPORT ENDPOINTS ====================

  @Post('export')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request data export', description: 'Request export of user data (GDPR compliance)' })
  @ApiResponse({ status: 201, description: 'Data export request submitted successfully' })
  async requestDataExport(@Body() exportDto: any, @Req() req: any) {
    return this.userService.requestDataExport(req.user.userId, exportDto);
  }

  @Get('export/status')
  @ApiOperation({ summary: 'Get data export status', description: 'Get status of data export requests' })
  @ApiResponse({ status: 200, description: 'Data export status retrieved successfully' })
  async getDataExportStatus(@Req() req: any) {
    return this.userService.getDataExportStatus(req.user.userId);
  }

  @Get('export/:exportId/download')
  @ApiParam({ name: 'exportId', description: 'Export request ID' })
  @ApiOperation({ summary: 'Download exported data', description: 'Download completed data export' })
  @ApiResponse({ status: 200, description: 'Data export downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Export request not found or not ready' })
  async downloadDataExport(@Param('exportId') exportId: string, @Req() req: any) {
    return this.userService.downloadDataExport(exportId, req.user.userId);
  }

  // ==================== CONNECTIONS AND INTEGRATIONS ENDPOINTS ====================

  @Get('connections')
  @ApiOperation({ summary: 'Get user connections', description: 'Get user external app connections and integrations' })
  @ApiResponse({ status: 200, description: 'User connections retrieved successfully' })
  async getUserConnections(@Req() req: any) {
    return this.userService.getUserConnections(req.user.userId);
  }

  @Post('connections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new connection', description: 'Connect to external app or service' })
  @ApiResponse({ status: 201, description: 'Connection created successfully' })
  async createConnection(@Body() connectionDto: any, @Req() req: any) {
    return this.userService.createConnection(req.user.userId, connectionDto);
  }

  @Delete('connections/:connectionId')
  @ApiParam({ name: 'connectionId', description: 'Connection ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove connection', description: 'Remove connection to external app or service' })
  @ApiResponse({ status: 204, description: 'Connection removed successfully' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  async removeConnection(@Param('connectionId') connectionId: string, @Req() req: any) {
    return this.userService.removeConnection(connectionId, req.user.userId);
  }

  // ==================== ACCOUNT MANAGEMENT ENDPOINTS ====================

  @Post('account/deactivate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deactivate account', description: 'Temporarily deactivate user account' })
  @ApiResponse({ status: 201, description: 'Account deactivated successfully' })
  async deactivateAccount(@Body() reasonDto: any, @Req() req: any) {
    return this.userService.deactivateAccount(req.user.userId, reasonDto);
  }

  @Post('account/reactivate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reactivate account', description: 'Reactivate previously deactivated account' })
  @ApiResponse({ status: 201, description: 'Account reactivated successfully' })
  async reactivateAccount(@Req() req: any) {
    return this.userService.reactivateAccount(req.user.userId);
  }

  @Get('account/security')
  @ApiOperation({ summary: 'Get account security info', description: 'Get account security information and login history' })
  @ApiResponse({ status: 200, description: 'Account security info retrieved successfully' })
  async getAccountSecurity(@Req() req: any) {
    return this.userService.getAccountSecurity(req.user.userId);
  }

  @Post('account/security/enable-2fa')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enable two-factor authentication', description: 'Enable 2FA for the user account' })
  @ApiResponse({ status: 201, description: 'Two-factor authentication enabled successfully' })
  async enableTwoFactorAuth(@Req() req: any) {
    return this.userService.enableTwoFactorAuth(req.user.userId);
  }

  @Post('account/security/disable-2fa')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Disable two-factor authentication', description: 'Disable 2FA for the user account' })
  @ApiResponse({ status: 201, description: 'Two-factor authentication disabled successfully' })
  async disableTwoFactorAuth(@Body() verificationDto: any, @Req() req: any) {
    return this.userService.disableTwoFactorAuth(req.user.userId, verificationDto);
  }

  // ==================== ADMIN USER MANAGEMENT ENDPOINTS ====================

  @Get('admin/users')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all users', description: 'Admin only - Get list of all users with filtering' })
  @ApiResponse({ status: 200, description: 'Users list retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, description: 'User status filter' })
  @ApiQuery({ name: 'role', required: false, description: 'User role filter' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    return this.userService.getAllUsers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
      role,
    });
  }

  @Get('admin/users/:userId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOperation({ summary: 'Get user details', description: 'Admin only - Get detailed information about a specific user' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getUserDetails(@Param('userId') userId: string) {
    return this.userService.getUserDetails(userId);
  }

  @Patch('admin/users/:userId')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOperation({ summary: 'Update user', description: 'Admin only - Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async updateUser(@Param('userId') userId: string, @Body() updateDto: any) {
    return this.userService.updateUser(userId, updateDto);
  }

  @Post('admin/users/:userId/suspend')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'userId', description: 'User ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Suspend user', description: 'Admin only - Suspend a user account' })
  @ApiResponse({ status: 201, description: 'User suspended successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async suspendUser(@Param('userId') userId: string, @Body() suspensionDto: any) {
    return this.userService.suspendUser(userId, suspensionDto);
  }

  @Post('admin/users/:userId/unsuspend')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'userId', description: 'User ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Unsuspend user', description: 'Admin only - Remove suspension from a user account' })
  @ApiResponse({ status: 201, description: 'User unsuspended successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async unsuspendUser(@Param('userId') userId: string) {
    return this.userService.unsuspendUser(userId);
  }

  @Get('admin/analytics/users')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get user analytics', description: 'Admin only - Get user-related analytics' })
  @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analytics timeframe' })
  async getUserAnalytics(@Query('timeframe') timeframe?: string) {
    return this.userService.getUserAnalytics({ timeframe });
  }

  // ==================== HEALTH CHECK ENDPOINTS ====================

  @Get('health')
  @ApiOperation({ summary: 'User service health check', description: 'Check user service health and availability' })
  @ApiResponse({ status: 200, description: 'User service is healthy' })
  async getHealth() {
    return this.userService.getHealth();
  }
} 
import { 
  Controller, 
  All, 
  Req, 
  Res, 
  UseGuards, 
  Logger, 
  HttpException, 
  HttpStatus,
  Get,
  Post,
  Body,
  Param
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ProxyService } from '../services/proxy.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly proxyService: ProxyService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getDashboard(@Req() req: Request): Promise<any> {
    try {
      // Aggregate data from multiple services
      const [userStats, paymentStats, systemHealth] = await Promise.allSettled([
        this.proxyService.forwardRequest('auth', '/admin/users/stats', 'GET'),
        this.proxyService.forwardRequest('payment', '/admin/payments/stats', 'GET'),
        this.proxyService.forwardRequest('health', '/detailed', 'GET'),
      ]);

      return {
        userStats: userStats.status === 'fulfilled' ? userStats.value : null,
        paymentStats: paymentStats.status === 'fulfilled' ? paymentStats.value : null,
        systemHealth: systemHealth.status === 'fulfilled' ? systemHealth.value : null,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Admin dashboard error:', error);
      throw new HttpException(
        'Failed to retrieve dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'users_list_access');
    const response = await this.proxyService.forwardRequest('auth', '/admin/users', 'GET');
    res.status(response.status).json(response.data);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get specific user details (admin only)' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  async getUserDetails(@Req() req: Request, @Res() res: Response, @Param('userId') userId: string): Promise<void> {
    await this.logAdminAction(req, 'user_details_access', { targetUserId: userId });
    const response = await this.proxyService.forwardRequest('auth', `/admin/users/${userId}`, 'GET');
    res.status(response.status).json(response.data);
  }

  @Post('users/:userId/suspend')
  @ApiOperation({ summary: 'Suspend user account (admin only)' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspendUser(@Req() req: Request, @Res() res: Response, @Param('userId') userId: string): Promise<void> {
    await this.logAdminAction(req, 'user_suspension', { targetUserId: userId });
    const response = await this.proxyService.forwardRequest('auth', `/admin/users/${userId}/suspend`, 'POST', req.body);
    res.status(response.status).json(response.data);
  }

  @Post('users/:userId/activate')
  @ApiOperation({ summary: 'Activate user account (admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activateUser(@Req() req: Request, @Res() res: Response, @Param('userId') userId: string): Promise<void> {
    await this.logAdminAction(req, 'user_activation', { targetUserId: userId });
    const response = await this.proxyService.forwardRequest('auth', `/admin/users/${userId}/activate`, 'POST', req.body);
    res.status(response.status).json(response.data);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments (admin only)' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPayments(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'payments_list_access');
    const response = await this.proxyService.forwardRequest('payment', '/admin/payments', 'GET');
    res.status(response.status).json(response.data);
  }

  @Get('payments/:paymentId')
  @ApiOperation({ summary: 'Get specific payment details (admin only)' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved successfully' })
  async getPaymentDetails(@Req() req: Request, @Res() res: Response, @Param('paymentId') paymentId: string): Promise<void> {
    await this.logAdminAction(req, 'payment_details_access', { paymentId });
    const response = await this.proxyService.forwardRequest('payment', `/admin/payments/${paymentId}`, 'GET');
    res.status(response.status).json(response.data);
  }

  @Post('payments/:paymentId/refund')
  @ApiOperation({ summary: 'Process payment refund (admin only)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async refundPayment(@Req() req: Request, @Res() res: Response, @Param('paymentId') paymentId: string): Promise<void> {
    await this.logAdminAction(req, 'payment_refund', { paymentId });
    const response = await this.proxyService.forwardRequest('payment', `/admin/payments/${paymentId}/refund`, 'POST', req.body);
    res.status(response.status).json(response.data);
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get all resources (admin only)' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async getResources(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'resources_list_access');
    const response = await this.proxyService.forwardRequest('resources', '/admin/resources', 'GET');
    res.status(response.status).json(response.data);
  }

  @Post('resources')
  @ApiOperation({ summary: 'Create new resource (admin only)' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  async createResource(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'resource_creation');
    const response = await this.proxyService.forwardRequest('resources', '/admin/resources', 'POST', req.body);
    res.status(response.status).json(response.data);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notification statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Notification stats retrieved successfully' })
  async getNotificationStats(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'notification_stats_access');
    const response = await this.proxyService.forwardRequest('notification', '/admin/notifications/stats', 'GET');
    res.status(response.status).json(response.data);
  }

  @Post('notifications/broadcast')
  @ApiOperation({ summary: 'Send broadcast notification (admin only)' })
  @ApiResponse({ status: 200, description: 'Broadcast sent successfully' })
  async sendBroadcast(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'broadcast_notification', { 
      recipients: req.body?.recipients || 'all',
      type: req.body?.type 
    });
    const response = await this.proxyService.forwardRequest('notification', '/admin/notifications/broadcast', 'POST', req.body);
    res.status(response.status).json(response.data);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics (admin only)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'analytics_access');
    
    // This would typically go to a dedicated analytics service
    // For now, we'll aggregate from multiple services
    try {
      const [userAnalytics, paymentAnalytics, usageAnalytics] = await Promise.allSettled([
        this.proxyService.forwardRequest('auth', '/admin/analytics/users', 'GET'),
        this.proxyService.forwardRequest('payment', '/admin/analytics/payments', 'GET'),
        this.proxyService.forwardRequest('ai', '/admin/analytics/usage', 'GET'),
      ]);

      const analytics = {
        users: userAnalytics.status === 'fulfilled' ? userAnalytics.value : null,
        payments: paymentAnalytics.status === 'fulfilled' ? paymentAnalytics.value : null,
        usage: usageAnalytics.status === 'fulfilled' ? usageAnalytics.value : null,
        timestamp: new Date().toISOString(),
      };

      res.json(analytics);
    } catch (error) {
      this.logger.error('Analytics aggregation error:', error);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('security/events')
  @ApiOperation({ summary: 'Get security events (admin only)' })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully' })
  async getSecurityEvents(@Req() req: Request): Promise<any> {
    await this.logAdminAction(req, 'security_events_access');
    
    try {
      // This would typically interface with a security logging system
      return {
        message: 'Security events would be retrieved from security logging system',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Security events retrieval error:', error);
      throw new HttpException(
        'Failed to retrieve security events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Get detailed system health (admin only)' })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  async getSystemHealth(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.logAdminAction(req, 'system_health_access');
    const response = await this.proxyService.forwardRequest('health', '/detailed', 'GET');
    res.status(response.status).json(response.data);
  }

  @Post('system/maintenance')
  @ApiOperation({ summary: 'Enable/disable maintenance mode (admin only)' })
  @ApiResponse({ status: 200, description: 'Maintenance mode updated successfully' })
  async setMaintenanceMode(@Req() req: Request, @Body() body: { enabled: boolean; message?: string }): Promise<any> {
    await this.logAdminAction(req, 'maintenance_mode_change', { 
      enabled: body.enabled,
      message: body.message 
    });

    // This would typically update a global configuration
    // For now, we'll just log the action
    this.logger.warn(`Maintenance mode ${body.enabled ? 'ENABLED' : 'DISABLED'} by admin ${(req as any).user?.id}`);

    return {
      success: true,
      maintenanceMode: {
        enabled: body.enabled,
        message: body.message || 'System maintenance in progress',
        setBy: (req as any).user?.id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get system logs (admin only)' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  async getLogs(@Req() req: Request): Promise<any> {
    await this.logAdminAction(req, 'system_logs_access');

    // This would typically interface with a log aggregation system
    // For now, return a placeholder response
    return {
      message: 'Log access would be implemented with log aggregation system',
      availableLogSources: [
        'api-gateway',
        'auth-service',
        'payment-service',
        'notification-service',
        'security-events'
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @All('*')
  @ApiOperation({ summary: 'Proxy admin requests to appropriate services' })
  async proxyAdminRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    const path = req.path.replace('/admin/', '');
    const segments = path.split('/');
    const serviceName = segments[0];

    // Log the admin action
    await this.logAdminAction(req, 'admin_proxy_request', { 
      service: serviceName,
      path: req.path,
      method: req.method 
    });

    // Validate service exists
    const validServices = ['auth', 'payment', 'notification', 'resources', 'ai', 'journal', 'recommender'];
    if (!validServices.includes(serviceName)) {
      throw new HttpException(
        `Invalid admin service: ${serviceName}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Forward to the appropriate service with admin prefix
    const servicePath = `/admin/${segments.slice(1).join('/')}`;
    const response = await this.proxyService.forwardRequest(serviceName, servicePath, req.method, req.body);
    res.status(response.status).json(response.data);
  }

  /**
   * Log admin actions for security auditing
   */
  private async logAdminAction(req: Request, action: string, details?: any): Promise<void> {
    this.logger.warn(`Admin action: ${action}`, {
      userId: (req as any).user?.id,
      ip: req.ip,
      endpoint: req.path,
      method: req.method,
      userRole: (req as any).user?.role,
      ...details,
    });
  }
} 
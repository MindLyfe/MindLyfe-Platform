import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CustomLoggerService } from '../common/services/logger.service';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';

interface HealthCheckResponse {
  status: 'ok' | 'error' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: string;
  memory: {
    used: string;
    free: string;
    total: string;
    percentage: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime?: number;
    error?: string;
  };
  services: {
    auth: ServiceHealth;
    teletherapy: ServiceHealth;
    notification: ServiceHealth;
    community: ServiceHealth;
  };
  features: {
    messaging: boolean;
    calling: boolean;
    fileUploads: boolean;
    moderation: boolean;
    websocket: boolean;
  };
  metrics: {
    requestsTotal: number;
    errorRate: number;
    averageResponseTime: number;
  };
}

interface ServiceHealth {
  status: 'available' | 'unavailable' | 'timeout';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: CustomLoggerService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.logger.setContext('HealthController');
  }

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health Check',
    description: 'Comprehensive health check endpoint providing detailed system status and service connectivity information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error', 'degraded'] },
        timestamp: { type: 'string', format: 'date-time' },
        service: { type: 'string', example: 'chat-service' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'production' },
        uptime: { type: 'string', example: '2h 34m 15s' },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'string', example: '128.5 MB' },
            free: { type: 'string', example: '512.3 MB' },
            total: { type: 'string', example: '640.8 MB' },
            percentage: { type: 'number', example: 20.05 }
          }
        },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
            responseTime: { type: 'number', example: 15 }
          }
        },
        services: {
          type: 'object',
          properties: {
            auth: { $ref: '#/components/schemas/ServiceHealth' },
            teletherapy: { $ref: '#/components/schemas/ServiceHealth' },
            notification: { $ref: '#/components/schemas/ServiceHealth' },
            community: { $ref: '#/components/schemas/ServiceHealth' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async getHealth(): Promise<HealthCheckResponse> {
    const startTime = Date.now();
    
    try {
      // Basic system information
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Database health check
      const databaseHealth = await this.checkDatabaseHealth();
      
      // External service health checks
      const serviceHealthChecks = await Promise.all([
        this.checkServiceHealth('auth', this.configService.get('services.auth.url')),
        this.checkServiceHealth('teletherapy', this.configService.get('services.teletherapy.url')),
        this.checkServiceHealth('notification', this.configService.get('services.notification.url')),
        this.checkServiceHealth('community', this.configService.get('services.community.url')),
      ]);

      // Determine overall status
      const hasDbIssues = databaseHealth.status !== 'connected';
      const hasServiceIssues = serviceHealthChecks.some(service => service.status !== 'available');
      
      let overallStatus: 'ok' | 'error' | 'degraded' = 'ok';
      if (hasDbIssues) {
        overallStatus = 'error';
      } else if (hasServiceIssues) {
        overallStatus = 'degraded';
      }

      const healthResponse: HealthCheckResponse = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        service: 'chat-service',
        version: '1.0.0',
        environment: this.configService.get('environment', 'development'),
        uptime: this.formatUptime(uptime),
        memory: {
          used: this.formatBytes(memoryUsage.heapUsed),
          free: this.formatBytes(memoryUsage.heapTotal - memoryUsage.heapUsed),
          total: this.formatBytes(memoryUsage.heapTotal),
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100 * 100) / 100
        },
        cpu: {
          usage: await this.getCpuUsage(),
          loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
        },
        database: databaseHealth,
        services: {
          auth: serviceHealthChecks[0],
          teletherapy: serviceHealthChecks[1],
          notification: serviceHealthChecks[2],
          community: serviceHealthChecks[3],
        },
        features: {
          messaging: true,
          calling: this.configService.get('ENABLE_VIDEO_CALLS', true),
          fileUploads: this.configService.get('ENABLE_FILE_UPLOADS', true),
          moderation: this.configService.get('ENABLE_MODERATION', true),
          websocket: true,
        },
        metrics: {
          requestsTotal: 0, // Would be populated from metrics service
          errorRate: 0,
          averageResponseTime: Date.now() - startTime,
        }
      };

      // Log health check
      this.logger.logWithContext('info', 'Health check completed', {
        status: overallStatus,
        responseTime: Date.now() - startTime,
        databaseStatus: databaseHealth.status,
        serviceIssues: hasServiceIssues
      });

      return healthResponse;
    } catch (error) {
      this.logger.error('Health check failed', error.stack);
      
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'chat-service',
        version: '1.0.0',
        environment: this.configService.get('environment', 'development'),
        uptime: this.formatUptime(process.uptime()),
        memory: {
          used: 'unknown',
          free: 'unknown',
          total: 'unknown',
          percentage: 0
        },
        cpu: {
          usage: 0,
          loadAverage: [0, 0, 0]
        },
        database: {
          status: 'error',
          error: error.message
        },
        services: {
          auth: { status: 'unavailable', lastChecked: new Date().toISOString() },
          teletherapy: { status: 'unavailable', lastChecked: new Date().toISOString() },
          notification: { status: 'unavailable', lastChecked: new Date().toISOString() },
          community: { status: 'unavailable', lastChecked: new Date().toISOString() },
        },
        features: {
          messaging: false,
          calling: false,
          fileUploads: false,
          moderation: false,
          websocket: false,
        },
        metrics: {
          requestsTotal: 0,
          errorRate: 100,
          averageResponseTime: Date.now() - startTime,
        }
      };
    }
  }

  @Public()
  @Get('metrics')
  @ApiOperation({
    summary: 'Service Metrics',
    description: 'Detailed service metrics for monitoring and observability.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service metrics',
    schema: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        service: { type: 'string', example: 'chat-service' },
        metrics: {
          type: 'object',
          properties: {
            uptime: { type: 'number', description: 'Uptime in seconds' },
            memory: { type: 'object' },
            requests: { type: 'object' },
            database: { type: 'object' },
            websocket: { type: 'object' }
          }
        }
      }
    }
  })
  async getMetrics() {
    const memoryUsage = process.memoryUsage();
    
    return {
      timestamp: new Date().toISOString(),
      service: 'chat-service',
      version: '1.0.0',
      metrics: {
        uptime: process.uptime(),
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers
        },
        requests: {
          total: 0, // Would be tracked by middleware
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        },
        database: {
          connections: this.dataSource.isInitialized ? 1 : 0,
          queries: 0, // Would be tracked
          averageQueryTime: 0
        },
        websocket: {
          connections: 0, // Would be tracked by Socket.IO
          messagesPerSecond: 0,
          rooms: 0
        }
      }
    };
  }

  private async checkDatabaseHealth(): Promise<{ status: 'connected' | 'disconnected' | 'error'; responseTime?: number; error?: string }> {
    try {
      const startTime = Date.now();
      
      if (!this.dataSource.isInitialized) {
        return { status: 'disconnected', error: 'Database not initialized' };
      }

      // Simple query to test connection
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'connected',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  private async checkServiceHealth(serviceName: string, serviceUrl: string): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      if (!serviceUrl) {
        return {
          status: 'unavailable',
          error: 'Service URL not configured',
          lastChecked: new Date().toISOString()
        };
      }

      // Try multiple potential health endpoints
      const healthEndpoints = [
        `${serviceUrl}/health`,
        `${serviceUrl}/api/v1/health`,
        `${serviceUrl}/api/health`,
        serviceUrl // Just test if service responds at all
      ];

      for (const endpoint of healthEndpoints) {
        try {
          const response: any = await firstValueFrom(
            this.httpService.get(endpoint).pipe(
              timeout(3000),
              catchError(error => of({ data: null, status: error?.response?.status || 0, error }))
            )
          );

          if (response?.status === 200) {
            return {
              status: 'available',
              responseTime: Date.now() - startTime,
              lastChecked: new Date().toISOString()
            };
          } else if (response?.status === 404 && endpoint !== serviceUrl) {
            // 404 means service is running but endpoint doesn't exist, try next endpoint
            continue;
          } else if (response?.status >= 200 && response?.status < 500) {
            // Service is responding, even if not with 200
            return {
              status: 'available',
              responseTime: Date.now() - startTime,
              lastChecked: new Date().toISOString()
            };
          }
        } catch (endpointError) {
          // Try next endpoint
          continue;
        }
      }

      return {
        status: 'unavailable',
        error: 'No health endpoint found',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'timeout',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const percentage = (totalUsage / 1000000) * 100; // Convert to percentage
        resolve(Math.round(percentage * 100) / 100);
      }, 100);
    });
  }
} 
import { Controller, Get, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: ServiceHealthStatus[];
  system: SystemHealth;
  summary: HealthSummary;
}

export interface ServiceHealthStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'timeout';
  url: string;
  responseTime: number;
  error?: string;
  lastChecked: string;
}

export interface SystemHealth {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface HealthSummary {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  degradedServices: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with service connectivity' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  @ApiResponse({ status: 503, description: 'One or more services are unhealthy' })
  async getDetailedHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check all services
      const services = await this.checkAllServices();
      
      // Get system health
      const systemHealth = this.getSystemHealth();
      
      // Calculate summary
      const summary = this.calculateHealthSummary(services);
      
      // Determine overall status
      const overallStatus = this.determineOverallStatus(summary);
      
      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: this.configService.get('environment'),
        services,
        system: systemHealth,
        summary,
      };

      // Log health check
      const duration = Date.now() - startTime;
      this.logger.log(`Health check completed in ${duration}ms - Status: ${overallStatus}`);

      // Return appropriate HTTP status
      if (overallStatus === 'unhealthy') {
        throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
      }

      return result;

    } catch (error) {
      this.logger.error('Health check failed:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async getReadiness(): Promise<{ status: string; timestamp: string }> {
    try {
      // Check critical services only
      const criticalServices = ['auth', 'payment'];
      const services = this.configService.get('services');
      
      for (const serviceName of criticalServices) {
        const serviceConfig = services[serviceName];
        if (serviceConfig) {
          await this.checkSingleService(serviceName, serviceConfig);
        }
      }

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Readiness check failed:', error);
      throw new HttpException(
        {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async getLiveness(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };
  }

  @Get('services')
  @ApiOperation({ summary: 'Check individual service health' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async getServicesHealth(): Promise<ServiceHealthStatus[]> {
    return this.checkAllServices();
  }

  @Get('services/:serviceName')
  @ApiOperation({ summary: 'Check specific service health' })
  @ApiResponse({ status: 200, description: 'Specific service health status' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceHealth(serviceName: string): Promise<ServiceHealthStatus> {
    const services = this.configService.get('services');
    const serviceConfig = services[serviceName];

    if (!serviceConfig) {
      throw new HttpException(
        { error: `Service '${serviceName}' not found` },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.checkSingleService(serviceName, serviceConfig);
  }

  /**
   * Check all configured services
   */
  private async checkAllServices(): Promise<ServiceHealthStatus[]> {
    const services = this.configService.get('services');
    const serviceChecks = Object.entries(services).map(([name, config]: [string, any]) =>
      this.checkSingleService(name, config)
    );

    return Promise.all(serviceChecks);
  }

  /**
   * Check a single service health
   */
  private async checkSingleService(name: string, config: any): Promise<ServiceHealthStatus> {
    const startTime = Date.now();
    const healthUrl = `${config.url}/health`;
    const serviceTimeout = config.timeout || 5000;

    try {
      const response = await firstValueFrom(
        this.httpService.get(healthUrl, {
          timeout: serviceTimeout,
          headers: {
            'User-Agent': 'MindLyf-Gateway-HealthCheck/1.0',
          },
        }).pipe(
          timeout(serviceTimeout),
          catchError((error) => {
            throw error;
          })
        )
      );

      const responseTime = Date.now() - startTime;

      return {
        name,
        status: (response && typeof response === 'object' && 'status' in response && response.status === 200) ? 'healthy' : 'unhealthy',
        url: healthUrl,
        responseTime,
        lastChecked: new Date().toISOString(),
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      let status: 'unhealthy' | 'timeout' = 'unhealthy';
      let errorMessage = error?.message || 'Unknown error';

      if (error?.name === 'TimeoutError' || responseTime >= serviceTimeout) {
        status = 'timeout';
        errorMessage = `Service timeout after ${serviceTimeout}ms`;
      }

      this.logger.warn(`Service ${name} health check failed: ${errorMessage}`);

      return {
        name,
        status,
        url: healthUrl,
        responseTime,
        error: errorMessage,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Get system health metrics
   */
  private getSystemHealth(): SystemHealth {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;

    // Get CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

    return {
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      cpu: {
        usage: Math.round(cpuPercent * 100) / 100,
      },
      disk: {
        used: 0, // Would need additional library to get disk usage
        total: 0,
        percentage: 0,
      },
    };
  }

  /**
   * Calculate health summary
   */
  private calculateHealthSummary(services: ServiceHealthStatus[]): HealthSummary {
    const totalServices = services.length;
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const unhealthyServices = services.filter(s => s.status === 'unhealthy').length;
    const degradedServices = services.filter(s => s.status === 'timeout').length;

    return {
      totalServices,
      healthyServices,
      unhealthyServices,
      degradedServices,
    };
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(summary: HealthSummary): 'healthy' | 'unhealthy' | 'degraded' {
    const { totalServices, healthyServices, unhealthyServices } = summary;

    // If more than 50% of services are unhealthy, system is unhealthy
    if (unhealthyServices > totalServices * 0.5) {
      return 'unhealthy';
    }

    // If all services are healthy, system is healthy
    if (healthyServices === totalServices) {
      return 'healthy';
    }

    // Otherwise, system is degraded
    return 'degraded';
  }
} 
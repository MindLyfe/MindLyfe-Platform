import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  HttpHealthIndicator,
  HealthCheckResult
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check health status of the API Gateway and all services' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Basic API Gateway health check
      () => this.http.pingCheck('api-gateway', 'http://localhost:3000/api/health/ping'),
    ]);
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint for the API Gateway' })
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  }
} 
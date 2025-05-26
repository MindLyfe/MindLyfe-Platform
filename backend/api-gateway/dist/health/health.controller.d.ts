import { HealthCheckService, HttpHealthIndicator, HealthCheckResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private health;
    private http;
    private configService;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, configService: ConfigService);
    check(): Promise<HealthCheckResult>;
    ping(): {
        status: string;
        timestamp: string;
        service: string;
    };
}

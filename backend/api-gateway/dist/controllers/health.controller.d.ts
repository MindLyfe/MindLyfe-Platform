import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
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
export declare class HealthController {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly startTime;
    constructor(configService: ConfigService, httpService: HttpService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
    }>;
    getDetailedHealth(): Promise<HealthCheckResult>;
    getReadiness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    getLiveness(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
    }>;
    getServicesHealth(): Promise<ServiceHealthStatus[]>;
    getServiceHealth(serviceName: string): Promise<ServiceHealthStatus>;
    private checkAllServices;
    private checkSingleService;
    private getSystemHealth;
    private calculateHealthSummary;
    private determineOverallStatus;
}

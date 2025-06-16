"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HealthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let HealthController = HealthController_1 = class HealthController {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(HealthController_1.name);
        this.startTime = Date.now();
    }
    async getHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    }
    async getDetailedHealth() {
        const startTime = Date.now();
        try {
            const services = await this.checkAllServices();
            const systemHealth = this.getSystemHealth();
            const summary = this.calculateHealthSummary(services);
            const overallStatus = this.determineOverallStatus(summary);
            const result = {
                status: overallStatus,
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime,
                version: process.env.npm_package_version || '1.0.0',
                environment: this.configService.get('environment'),
                services,
                system: systemHealth,
                summary,
            };
            const duration = Date.now() - startTime;
            this.logger.log(`Health check completed in ${duration}ms - Status: ${overallStatus}`);
            if (overallStatus === 'unhealthy') {
                throw new common_1.HttpException(result, common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Health check failed:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message,
            }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async getReadiness() {
        try {
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
        }
        catch (error) {
            this.logger.error('Readiness check failed:', error);
            throw new common_1.HttpException({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                error: error.message,
            }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async getLiveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
        };
    }
    async getServicesHealth() {
        return this.checkAllServices();
    }
    async getServiceHealth(serviceName) {
        const services = this.configService.get('services');
        const serviceConfig = services[serviceName];
        if (!serviceConfig) {
            throw new common_1.HttpException({ error: `Service '${serviceName}' not found` }, common_1.HttpStatus.NOT_FOUND);
        }
        return this.checkSingleService(serviceName, serviceConfig);
    }
    async checkAllServices() {
        const services = this.configService.get('services');
        const serviceChecks = Object.entries(services).map(([name, config]) => this.checkSingleService(name, config));
        return Promise.all(serviceChecks);
    }
    async checkSingleService(name, config) {
        const startTime = Date.now();
        const healthUrl = `${config.url}/health`;
        const serviceTimeout = config.timeout || 5000;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(healthUrl, {
                timeout: serviceTimeout,
                headers: {
                    'User-Agent': 'MindLyf-Gateway-HealthCheck/1.0',
                },
            }).pipe((0, rxjs_1.timeout)(serviceTimeout), (0, rxjs_1.catchError)((error) => {
                throw error;
            })));
            const responseTime = Date.now() - startTime;
            return {
                name,
                status: (response && typeof response === 'object' && 'status' in response && response.status === 200) ? 'healthy' : 'unhealthy',
                url: healthUrl,
                responseTime,
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            let status = 'unhealthy';
            let errorMessage = (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error';
            if ((error === null || error === void 0 ? void 0 : error.name) === 'TimeoutError' || responseTime >= serviceTimeout) {
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
    getSystemHealth() {
        const memoryUsage = process.memoryUsage();
        const totalMemory = require('os').totalmem();
        const freeMemory = require('os').freemem();
        const usedMemory = totalMemory - freeMemory;
        const cpuUsage = process.cpuUsage();
        const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000;
        return {
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(totalMemory / 1024 / 1024),
                percentage: Math.round((usedMemory / totalMemory) * 100),
            },
            cpu: {
                usage: Math.round(cpuPercent * 100) / 100,
            },
            disk: {
                used: 0,
                total: 0,
                percentage: 0,
            },
        };
    }
    calculateHealthSummary(services) {
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
    determineOverallStatus(summary) {
        const { totalServices, healthyServices, unhealthyServices } = summary;
        if (unhealthyServices > totalServices * 0.5) {
            return 'unhealthy';
        }
        if (healthyServices === totalServices) {
            return 'healthy';
        }
        return 'degraded';
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Basic health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'Detailed health check with service connectivity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detailed health information' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'One or more services are unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDetailedHealth", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe for Kubernetes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is ready to accept traffic' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is not ready' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReadiness", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe for Kubernetes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is alive' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getLiveness", null);
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'Check individual service health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getServicesHealth", null);
__decorate([
    (0, common_1.Get)('services/:serviceName'),
    (0, swagger_1.ApiOperation)({ summary: 'Check specific service health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Specific service health status' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getServiceHealth", null);
HealthController = HealthController_1 = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], HealthController);
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map
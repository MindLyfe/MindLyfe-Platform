import { ConfigService } from '@nestjs/config';
export declare class ProxyService {
    private configService;
    private readonly logger;
    private readonly httpClients;
    constructor(configService: ConfigService);
    private initializeHttpClients;
    forwardRequest(serviceName: string, path: string, method: string, data?: any, headers?: Record<string, string>, params?: Record<string, any>): Promise<{
        data: any;
        status: any;
        headers: any;
    }>;
    getServiceUrl(serviceName: string): string;
}

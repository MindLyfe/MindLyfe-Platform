import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class UserService {
    private httpService;
    private configService;
    private readonly logger;
    private readonly userServiceUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    findById(id: string, token: string): Promise<any>;
    findAll(token: string, query?: any): Promise<any>;
    update(id: string, updateDto: any, token: string): Promise<any>;
    delete(id: string, token: string): Promise<any>;
    updatePassword(id: string, passwordDto: any, token: string): Promise<any>;
}

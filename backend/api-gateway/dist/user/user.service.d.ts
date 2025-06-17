import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class UserService {
    private httpService;
    private configService;
    private readonly logger;
    private readonly authServiceUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getAllUsers(): Promise<any>;
    getUserById(id: string): Promise<any>;
    updateUser(id: string, updateDto: any): Promise<any>;
    deleteUser(id: string): Promise<any>;
    updateUserPassword(id: string, passwordDto: any): Promise<any>;
}

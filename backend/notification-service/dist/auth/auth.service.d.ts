import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtUser } from './interfaces/user.interface';
export declare class AuthService {
    private readonly httpService;
    private readonly jwtService;
    private readonly configService;
    private readonly authServiceUrl;
    constructor(httpService: HttpService, jwtService: JwtService, configService: ConfigService);
    validateToken(payload: any): Promise<JwtUser>;
    getUserById(userId: string, token: string): Promise<JwtUser>;
}

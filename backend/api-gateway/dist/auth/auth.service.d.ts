import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private jwtService;
    private httpService;
    private configService;
    private readonly logger;
    private readonly authServiceUrl;
    constructor(jwtService: JwtService, httpService: HttpService, configService: ConfigService);
    validateUserById(userId: string): Promise<any>;
    login(loginDto: any): Promise<any>;
    register(registerDto: any): Promise<any>;
    refreshToken(token: string): Promise<any>;
    forgotPassword(email: string): Promise<any>;
    resetPassword(resetDto: any): Promise<any>;
}

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
    registerTherapist(registerDto: any): Promise<any>;
    registerOrganizationUser(registerDto: any): Promise<any>;
    registerSupportTeam(registerDto: any): Promise<any>;
    refreshToken(refreshDto: any): Promise<any>;
    forgotPassword(forgotDto: any): Promise<any>;
    resetPassword(resetDto: any): Promise<any>;
    verifyEmail(verifyDto: any): Promise<any>;
    getProfile(userId: string): Promise<any>;
    changePassword(userId: string, changePasswordDto: any): Promise<any>;
    logout(userId: string): Promise<any>;
    revokeToken(revokeDto: any): Promise<any>;
    validateToken(user: any): Promise<any>;
    validateServiceToken(tokenDto: any): Promise<any>;
    validatePaymentAccess(userId: string, paymentDto: any): Promise<any>;
}

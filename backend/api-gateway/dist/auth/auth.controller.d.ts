import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: any): Promise<any>;
    register(registerDto: any): Promise<any>;
    registerTherapist(registerDto: any): Promise<any>;
    registerOrganizationUser(registerDto: any): Promise<any>;
    registerSupportTeam(registerDto: any): Promise<any>;
    refreshToken(refreshDto: any): Promise<any>;
    forgotPassword(forgotDto: any): Promise<any>;
    resetPassword(resetDto: any): Promise<any>;
    verifyEmail(verifyDto: any): Promise<any>;
    getProfile(req: any): Promise<any>;
    changePassword(req: any, changePasswordDto: any): Promise<any>;
    logout(req: any): Promise<any>;
    revokeToken(revokeDto: any): Promise<any>;
    validateToken(req: any): Promise<any>;
    validateServiceToken(tokenDto: any): Promise<any>;
    validatePaymentAccess(req: any, paymentDto: any): Promise<any>;
}

import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: any): Promise<any>;
    register(registerDto: any): Promise<any>;
    refreshToken(token: string): Promise<any>;
    forgotPassword(email: string): Promise<any>;
    resetPassword(resetDto: any): Promise<any>;
    getProfile(req: any): Promise<any>;
}

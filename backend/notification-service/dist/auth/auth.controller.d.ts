import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    health(): {
        status: string;
        service: string;
    };
    validateToken(body: {
        token: string;
    }): Promise<{
        valid: boolean;
        user: import("./interfaces/user.interface").JwtUser;
    }>;
    getProfile(user: any): any;
}

export declare class AppController {
    constructor();
    check(): {
        status: string;
        service: string;
    };
    ping(): {
        status: string;
        timestamp: string;
        service: string;
    };
    testLogin(credentials: {
        email: string;
        password: string;
    }): {
        success: boolean;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        token: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        user?: undefined;
        token?: undefined;
    };
}

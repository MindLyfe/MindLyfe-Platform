export declare const configuration: () => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        synchronize: boolean;
        logging: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    socketio: {
        cors: {
            origin: string;
            methods: string[];
            credentials: boolean;
        };
    };
    services: {
        auth: {
            url: string;
            serviceToken: string;
        };
        community: {
            url: string;
            serviceToken: string;
        };
        teletherapy: {
            url: string;
            serviceToken: string;
        };
        notification: {
            url: string;
            serviceToken: string;
        };
        communityServiceUrl: string;
        teletherapyServiceUrl: string;
        authServiceUrl: string;
        notificationServiceUrl: string;
    };
    SERVICE_NAME: string;
    upload: {
        maxFileSize: number;
        allowedTypes: string[];
        destination: string;
    };
    rateLimit: {
        max: number;
        windowMs: number;
    };
    cors: {
        origin: string[];
        credentials: boolean;
    };
    log: {
        level: string;
    };
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
};

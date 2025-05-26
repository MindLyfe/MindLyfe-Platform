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
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        ses: {
            sourceEmail: string;
        };
    };
    services: {
        authServiceUrl: string;
    };
};

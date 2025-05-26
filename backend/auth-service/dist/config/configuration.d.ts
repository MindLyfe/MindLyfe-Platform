declare const _default: () => {
    environment: string;
    port: number;
    database: {
        type: string;
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        synchronize: boolean;
        logging: boolean;
        ssl: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
        refreshSecret: string;
        serviceSecret: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        db: number;
    };
    session: {
        cleanupInterval: string;
        maxInactiveDays: number;
    };
    cognito: {
        userPoolId: string;
        clientId: string;
        region: string;
    };
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSymbols: boolean;
    };
    aws: {
        region: string;
        accessKey: string;
        secretKey: string;
    };
    email: {
        from: string;
        replyTo: string;
    };
    frontend: {
        url: string;
    };
    throttle: {
        ttl: number;
        limit: number;
        authTtl: number;
        authLimit: number;
    };
    mfa: {
        issuer: string;
        window: number;
    };
    cors: {
        origin: string;
        methods: string;
    };
    notificationServiceUrl: string;
};
export default _default;

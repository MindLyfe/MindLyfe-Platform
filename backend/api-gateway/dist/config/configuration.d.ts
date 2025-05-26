declare const _default: () => {
    port: number;
    environment: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    services: {
        auth: {
            url: string;
        };
        user: {
            url: string;
        };
        ai: {
            url: string;
        };
        journal: {
            url: string;
        };
        recommender: {
            url: string;
        };
        lyfbot: {
            url: string;
        };
        chat: {
            url: string;
        };
        teletherapy: {
            url: string;
        };
        community: {
            url: string;
        };
        notification: {
            url: string;
        };
    };
    redis: {
        host: string;
        port: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    cors: {
        origin: string | string[];
        methods: string;
        preflightContinue: boolean;
        optionsSuccessStatus: number;
    };
};
export default _default;

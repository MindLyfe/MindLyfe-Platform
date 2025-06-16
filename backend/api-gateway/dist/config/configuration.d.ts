declare const _default: () => {
    environment: string;
    port: number;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cors: {
        origin: string[];
        methods: string[];
        allowedHeaders: string[];
        exposedHeaders: string[];
        credentials: boolean;
        preflightContinue: boolean;
        optionsSuccessStatus: number;
        maxAge: number;
    };
    security: {
        maxRequestSize: string;
        maxFileSize: string;
        maxFieldSize: string;
        maxFields: number;
        requestTimeout: number;
        keepAliveTimeout: number;
        headersTimeout: number;
        rateLimit: {
            windowMs: number;
            max: number;
            message: string;
            standardHeaders: boolean;
            legacyHeaders: boolean;
        };
        authRateLimit: {
            windowMs: number;
            max: number;
            message: string;
            skipSuccessfulRequests: boolean;
        };
        paymentRateLimit: {
            windowMs: number;
            max: number;
            message: string;
        };
    };
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: string[];
                styleSrc: string[];
                fontSrc: string[];
                imgSrc: string[];
                scriptSrc: string[];
                connectSrc: string[];
                frameSrc: string[];
                objectSrc: string[];
                baseUri: string[];
                formAction: string[];
                upgradeInsecureRequests: any[];
            };
        };
        crossOriginEmbedderPolicy: boolean;
        crossOriginOpenerPolicy: {
            policy: string;
        };
        crossOriginResourcePolicy: {
            policy: string;
        };
        dnsPrefetchControl: {
            allow: boolean;
        };
        frameguard: {
            action: string;
        };
        hidePoweredBy: boolean;
        hsts: {
            maxAge: number;
            includeSubDomains: boolean;
            preload: boolean;
        };
        ieNoOpen: boolean;
        noSniff: boolean;
        originAgentCluster: boolean;
        permittedCrossDomainPolicies: boolean;
        referrerPolicy: {
            policy: string;
        };
        xssFilter: boolean;
    };
    services: {
        auth: {
            url: string;
            timeout: number;
            retries: number;
        };
        payment: {
            url: string;
            timeout: number;
            retries: number;
        };
        notification: {
            url: string;
            timeout: number;
            retries: number;
        };
        resources: {
            url: string;
            timeout: number;
            retries: number;
        };
        ai: {
            url: string;
            timeout: number;
            retries: number;
        };
        journal: {
            url: string;
            timeout: number;
            retries: number;
        };
        recommender: {
            url: string;
            timeout: number;
            retries: number;
        };
        lyfbot: {
            url: string;
            timeout: number;
            retries: number;
        };
        chat: {
            url: string;
            timeout: number;
            retries: number;
        };
        teletherapy: {
            url: string;
            timeout: number;
            retries: number;
        };
        community: {
            url: string;
            timeout: number;
            retries: number;
        };
    };
    health: {
        enabled: boolean;
        timeout: number;
        interval: number;
        retries: number;
    };
    monitoring: {
        enabled: boolean;
        webhook: string;
        metricsEnabled: boolean;
        tracingEnabled: boolean;
    };
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        db: number;
        keyPrefix: string;
    };
    logging: {
        level: string;
        format: string;
        enableRequestLogging: boolean;
        enableSecurityLogging: boolean;
    };
};
export default _default;

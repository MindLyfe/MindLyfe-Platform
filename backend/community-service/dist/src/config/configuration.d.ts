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
        ssl: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    encryption: {
        algorithm: string;
        key: string;
        ivLength: number;
        saltLength: number;
    };
    moderation: {
        autoModerationEnabled: boolean;
        sensitiveContentThreshold: number;
        maxReportsBeforeReview: number;
        maxPostsPerDay: number;
        maxCommentsPerDay: number;
        autoModerate: boolean;
        toxicityThreshold: number;
        enableContentFiltering: boolean;
    };
    privacy: {
        defaultPostRetentionDays: number;
        defaultCommentRetentionDays: number;
        defaultMessageRetentionDays: number;
        anonymizationEnabled: boolean;
    };
    rateLimiting: {
        posts: {
            windowMs: number;
            max: number;
        };
        comments: {
            windowMs: number;
            max: number;
        };
        reactions: {
            windowMs: number;
            max: number;
        };
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    anonymity: {
        enabled: boolean;
        requireAnonymousPosts: boolean;
        allowRealNamesInChat: boolean;
    };
    community: {
        allowAnonymousPosts: boolean;
        requireModeration: boolean;
        enableRealtimeEvents: boolean;
        maxPostLength: number;
        maxCommentLength: number;
    };
    fileUpload: {
        maxFileSize: string;
        allowedFileTypes: string[];
        uploadDir: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    services: {
        authServiceUrl: string;
        notificationServiceUrl: string;
    };
};

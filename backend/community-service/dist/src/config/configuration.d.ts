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
};

export declare abstract class BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    isActive: boolean;
    metadata: Record<string, any>;
}

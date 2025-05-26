import { User } from '../../users/entities/user.entity';
export declare class Follow {
    id: string;
    followerId: string;
    followedId: string;
    follower: User;
    followed: User;
    isAccepted: boolean;
    isHidden: boolean;
    isBlocked: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

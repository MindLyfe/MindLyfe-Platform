import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
export declare enum FollowStatus {
    ACTIVE = "active",
    MUTED = "muted",
    BLOCKED = "blocked"
}
export declare class Follow extends BaseEntity {
    followerId: string;
    follower: User;
    followingId: string;
    following: User;
    status: FollowStatus;
    isMutualFollow: boolean;
    mutualFollowEstablishedAt: Date;
    chatAccessGranted: boolean;
    chatAccessGrantedAt: Date;
    privacySettings: {
        allowChatInvitation: boolean;
        notifyOnFollow: boolean;
        notifyOnMutualFollow: boolean;
        allowRealNameInChat: boolean;
    };
    metadata: {
        followSource?: string;
        sourceContentId?: string;
        mutualInterests?: string[];
    };
}

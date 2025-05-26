import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { PrivacyService } from './privacy.service';
export declare class ModerationService {
    private readonly configService;
    private readonly privacyService;
    private readonly userRepository;
    private readonly postRepository;
    private readonly commentRepository;
    private readonly reactionRepository;
    private readonly logger;
    constructor(configService: ConfigService, privacyService: PrivacyService, userRepository: Repository<User>, postRepository: Repository<Post>, commentRepository: Repository<Comment>, reactionRepository: Repository<Reaction>);
    reportPost(postId: string, reporterId: string, reason: string): Promise<void>;
    reportComment(commentId: string, reporterId: string, reason: string): Promise<void>;
    reviewContent(contentId: string, contentType: 'post' | 'comment', moderatorId: string, action: 'approve' | 'remove' | 'warn', notes: string): Promise<void>;
    checkUserModeration(userId: string): Promise<void>;
    private notifyModerators;
    private notifyContentAuthor;
    checkContentSensitivity(content: string): Promise<{
        isSensitive: boolean;
        confidence: number;
        categories: string[];
    }>;
}

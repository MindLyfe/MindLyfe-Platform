import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AnonymityService } from '../common/services/anonymity.service';
import { PrivacyService } from '../common/services/privacy.service';
import { ModerationService } from '../common/services/moderation.service';
import { CommunityGateway } from '../community.gateway';
import { Comment } from '../comments/entities/comment.entity';
import { Reaction } from '../reactions/entities/reaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Comment, Reaction])
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    AnonymityService,
    PrivacyService,
    ModerationService,
    CommunityGateway
  ],
  exports: [PostsService],
})
export class PostsModule {} 
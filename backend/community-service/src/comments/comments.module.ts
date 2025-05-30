import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AnonymityService } from '../common/services/anonymity.service';
import { PrivacyService } from '../common/services/privacy.service';
import { ModerationService } from '../common/services/moderation.service';
import { CommunityGateway } from '../community.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User, Reaction])
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    AnonymityService,
    PrivacyService,
    ModerationService,
    CommunityGateway
  ],
  exports: [CommentsService],
})
export class CommentsModule {} 
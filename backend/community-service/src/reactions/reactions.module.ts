import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { AnonymityService } from '../common/services/anonymity.service';
import { CommunityGateway } from '../community.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction, Post, Comment, User])
  ],
  controllers: [ReactionsController],
  providers: [
    ReactionsService,
    AnonymityService,
    CommunityGateway
  ],
  exports: [ReactionsService],
})
export class ReactionsModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommunityGateway } from '../community.gateway';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User, Reaction]),
    CommonModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommunityGateway
  ],
  exports: [CommentsService],
})
export class CommentsModule {} 
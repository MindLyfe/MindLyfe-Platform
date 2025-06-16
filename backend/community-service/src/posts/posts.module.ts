import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CommunityGateway } from '../community.gateway';
import { Comment } from '../comments/entities/comment.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Comment, Reaction]),
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    CommunityGateway
  ],
  exports: [PostsService],
})
export class PostsModule {} 
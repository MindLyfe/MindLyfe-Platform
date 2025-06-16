import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { CommonModule } from '../common/common.module';
import { CommunityGateway } from '../community.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Comment]),
    CommonModule,
  ],
  controllers: [ModerationController],
  providers: [ModerationService, CommunityGateway],
  exports: [ModerationService],
})
export class ModerationModule {}

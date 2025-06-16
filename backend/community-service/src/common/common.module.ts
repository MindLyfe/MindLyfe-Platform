import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { PrivacyService } from './services/privacy.service';
import { ModerationService } from './services/moderation.service';
import { CommunityNotificationService } from './services/notification.service';
import { AnonymityService } from './services/anonymity.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([User, Post, Comment, Reaction]),
  ],
  providers: [PrivacyService, ModerationService, CommunityNotificationService, AnonymityService],
  exports: [PrivacyService, ModerationService, CommunityNotificationService, AnonymityService],
})
export class CommonModule {}

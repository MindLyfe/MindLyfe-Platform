import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { AnonymityService } from '../common/services/anonymity.service';
import { UserMappingService } from '../common/services/user-mapping.service';
import { CommunityGateway } from '../community.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User])
  ],
  controllers: [FollowsController],
  providers: [
    FollowsService,
    AnonymityService,
    UserMappingService,
    CommunityGateway
  ],
  exports: [FollowsService],
})
export class FollowsModule {} 
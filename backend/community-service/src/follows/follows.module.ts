import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { Follow } from './entities/follow.entity';
import { AuthClientModule } from '@mindlyf/shared/auth-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow]),
    AuthClientModule,
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {} 
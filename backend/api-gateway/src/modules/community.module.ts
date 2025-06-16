import { Module } from '@nestjs/common';
import { CommunityController } from '../controllers/community.controller';
import { ProxyService } from '../services/proxy.service';

@Module({
  imports: [],
  controllers: [CommunityController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class CommunityModule {}
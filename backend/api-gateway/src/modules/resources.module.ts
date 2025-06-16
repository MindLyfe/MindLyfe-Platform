import { Module } from '@nestjs/common';
import { ResourcesController } from '../controllers/resources.controller';
import { ProxyService } from '../services/proxy.service';

@Module({
  imports: [],
  controllers: [ResourcesController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ResourcesModule {} 